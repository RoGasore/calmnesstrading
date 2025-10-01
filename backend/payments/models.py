from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class Offer(models.Model):
    """Modèle pour les offres disponibles (abonnements, formations, etc.)"""
    
    OFFER_TYPE_CHOICES = [
        ('subscription', 'Abonnement'),
        ('formation', 'Formation'),
        ('signal', 'Signal'),
        ('account', 'Gestion de compte'),
    ]
    
    COLOR_CHOICES = [
        ('gold', 'Gold'),
        ('black', 'Black'),
        ('white', 'White'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nom de l'offre")
    description = models.TextField(verbose_name="Description", blank=True)
    offer_type = models.CharField(max_length=50, choices=OFFER_TYPE_CHOICES, verbose_name="Type d'offre")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix")
    currency = models.CharField(max_length=3, default='EUR', verbose_name="Devise")
    color_theme = models.CharField(max_length=20, choices=COLOR_CHOICES, default='gold', verbose_name="Couleur")
    
    # Pour les abonnements
    duration_days = models.IntegerField(null=True, blank=True, verbose_name="Durée (jours)")
    
    # Canaux privés associés
    telegram_channel_id = models.CharField(max_length=255, blank=True, verbose_name="ID canal Telegram")
    discord_channel_id = models.CharField(max_length=255, blank=True, verbose_name="ID canal Discord")
    
    # Métadonnées supplémentaires (JSON pour infos additionnelles)
    metadata = models.JSONField(null=True, blank=True, verbose_name="Métadonnées")
    
    # Métadonnées système
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    class Meta:
        verbose_name = "Offre"
        verbose_name_plural = "Offres"
        ordering = ['offer_type', 'price']
    
    def __str__(self):
        return f"{self.name} - {self.price} {self.currency}"


class PendingPayment(models.Model):
    """Modèle pour les paiements en attente de validation"""
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('contacted', 'Client contacté'),
        ('confirmed', 'Confirmé'),
        ('cancelled', 'Annulé'),
    ]
    
    CONTACT_METHOD_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('telegram', 'Telegram'),
        ('discord', 'Discord'),
        ('email', 'Email'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pending_payments', verbose_name="Utilisateur")
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, verbose_name="Offre")
    
    # Informations de contact
    contact_method = models.CharField(max_length=50, choices=CONTACT_METHOD_CHOICES, verbose_name="Méthode de contact")
    contact_info = models.CharField(max_length=255, verbose_name="Info de contact", help_text="Pseudo Telegram/Discord, numéro WhatsApp, etc.")
    
    # Montant et devise
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant")
    currency = models.CharField(max_length=3, default='EUR', verbose_name="Devise")
    
    # Statut et dates
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    # Notes admin
    admin_notes = models.TextField(blank=True, verbose_name="Notes admin")
    validated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_payments', verbose_name="Validé par")
    validated_at = models.DateTimeField(null=True, blank=True, verbose_name="Validé le")
    
    class Meta:
        verbose_name = "Paiement en attente"
        verbose_name_plural = "Paiements en attente"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.offer.name} - {self.status}"


class Payment(models.Model):
    """Modèle pour les paiements validés"""
    
    PAYMENT_STATUS_CHOICES = [
        ('completed', 'Complété'),
        ('refunded', 'Remboursé'),
        ('expired', 'Expiré'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('manual', 'Manuel (Service client)'),
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
        ('crypto', 'Crypto'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments', verbose_name="Utilisateur")
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, verbose_name="Offre")
    pending_payment = models.OneToOneField(PendingPayment, on_delete=models.SET_NULL, null=True, blank=True, related_name='completed_payment', verbose_name="Paiement en attente")
    
    # Informations de paiement
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant")
    currency = models.CharField(max_length=3, default='EUR', verbose_name="Devise")
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, verbose_name="Méthode de paiement")
    
    # Statut et dates
    status = models.CharField(max_length=50, choices=PAYMENT_STATUS_CHOICES, default='completed', verbose_name="Statut")
    paid_at = models.DateTimeField(auto_now_add=True, verbose_name="Payé le")
    
    # Métadonnées
    transaction_id = models.CharField(max_length=255, blank=True, verbose_name="ID de transaction")
    validated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_completed_payments', verbose_name="Validé par")
    admin_notes = models.TextField(blank=True, verbose_name="Notes admin")
    
    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ['-paid_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.offer.name} - {self.amount} {self.currency}"


class Subscription(models.Model):
    """Modèle pour les abonnements actifs"""
    
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('expired', 'Expiré'),
        ('cancelled', 'Annulé'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions', verbose_name="Utilisateur")
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, verbose_name="Offre")
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, verbose_name="Paiement")
    
    # Dates
    start_date = models.DateTimeField(verbose_name="Date de début")
    end_date = models.DateTimeField(verbose_name="Date de fin")
    
    # Statut
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active', verbose_name="Statut")
    
    # Canaux privés
    telegram_added = models.BooleanField(default=False, verbose_name="Ajouté sur Telegram")
    discord_added = models.BooleanField(default=False, verbose_name="Ajouté sur Discord")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    class Meta:
        verbose_name = "Abonnement"
        verbose_name_plural = "Abonnements"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.offer.name} - {self.status}"
    
    def is_active(self):
        """Vérifie si l'abonnement est actif"""
        return self.status == 'active' and self.end_date > timezone.now()
    
    def days_remaining(self):
        """Calcule le nombre de jours restants"""
        if not self.is_active():
            return 0
        delta = self.end_date - timezone.now()
        return max(0, delta.days)
    
    def hours_remaining(self):
        """Calcule le nombre d'heures restantes"""
        if not self.is_active():
            return 0
        delta = self.end_date - timezone.now()
        return max(0, int(delta.total_seconds() / 3600))


class PaymentHistory(models.Model):
    """Modèle pour l'historique des actions sur les paiements"""
    
    ACTION_CHOICES = [
        ('created', 'Créé'),
        ('contacted', 'Client contacté'),
        ('validated', 'Validé'),
        ('cancelled', 'Annulé'),
        ('refunded', 'Remboursé'),
        ('expired', 'Expiré'),
    ]
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='history', verbose_name="Paiement", null=True, blank=True)
    pending_payment = models.ForeignKey(PendingPayment, on_delete=models.CASCADE, related_name='history', verbose_name="Paiement en attente", null=True, blank=True)
    
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, verbose_name="Action")
    description = models.TextField(verbose_name="Description")
    
    # Métadonnées
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Créé par")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    
    class Meta:
        verbose_name = "Historique de paiement"
        verbose_name_plural = "Historique des paiements"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.action} - {self.created_at}"


class ContactChannel(models.Model):
    """Modèle pour les informations de contact du service client"""
    
    CHANNEL_TYPE_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('telegram', 'Telegram'),
        ('discord', 'Discord'),
        ('email', 'Email'),
    ]
    
    channel_type = models.CharField(max_length=50, choices=CHANNEL_TYPE_CHOICES, unique=True, verbose_name="Type de canal")
    contact_info = models.CharField(max_length=255, verbose_name="Info de contact")
    contact_link = models.URLField(verbose_name="Lien de contact")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    display_order = models.IntegerField(default=0, verbose_name="Ordre d'affichage")
    
    # Instructions personnalisées
    instructions = models.TextField(blank=True, verbose_name="Instructions")
    
    class Meta:
        verbose_name = "Canal de contact"
        verbose_name_plural = "Canaux de contact"
        ordering = ['display_order', 'channel_type']
    
    def __str__(self):
        return f"{self.channel_type} - {self.contact_info}"
