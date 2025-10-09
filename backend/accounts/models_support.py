from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class SupportMessage(models.Model):
    """Modèle pour les messages de support"""
    
    PRIORITY_CHOICES = [
        ('low', 'Faible'),
        ('medium', 'Moyen'),
        ('high', 'Élevé'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('unread', 'Non lu'),
        ('read', 'Lu'),
        ('replied', 'Répondu'),
        ('closed', 'Fermé'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_messages', verbose_name="Utilisateur")
    subject = models.CharField(max_length=200, verbose_name="Sujet")
    message = models.TextField(verbose_name="Message")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', verbose_name="Priorité")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unread', verbose_name="Statut")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    class Meta:
        verbose_name = "Message Support"
        verbose_name_plural = "Messages Support"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.subject}"

class SupportReply(models.Model):
    """Modèle pour les réponses aux messages de support"""
    
    message = models.ForeignKey(SupportMessage, on_delete=models.CASCADE, related_name='replies', verbose_name="Message")
    reply_text = models.TextField(verbose_name="Réponse")
    is_from_support = models.BooleanField(default=True, verbose_name="De la part du support")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Créé par")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    
    class Meta:
        verbose_name = "Réponse Support"
        verbose_name_plural = "Réponses Support"
        ordering = ['created_at']
    
    def __str__(self):
        return f"Réponse à {self.message.subject}"

class SupportTicket(models.Model):
    """Modèle pour les tickets de support"""
    
    STATUS_CHOICES = [
        ('open', 'Ouvert'),
        ('in_progress', 'En cours'),
        ('resolved', 'Résolu'),
        ('closed', 'Fermé'),
    ]
    
    CATEGORY_CHOICES = [
        ('technical', 'Technique'),
        ('billing', 'Facturation'),
        ('general', 'Général'),
        ('feature_request', 'Demande de fonctionnalité'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets', verbose_name="Utilisateur")
    subject = models.CharField(max_length=200, verbose_name="Sujet")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general', verbose_name="Catégorie")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='open', verbose_name="Statut")
    priority = models.CharField(max_length=10, choices=SupportMessage.PRIORITY_CHOICES, default='medium', verbose_name="Priorité")
    
    description = models.TextField(verbose_name="Description")
    resolution = models.TextField(blank=True, verbose_name="Résolution")
    
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets', verbose_name="Assigné à")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name="Résolu le")
    
    class Meta:
        verbose_name = "Ticket Support"
        verbose_name_plural = "Tickets Support"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Ticket #{self.id} - {self.subject}"

class SupportOrder(models.Model):
    """Modèle pour les commandes support"""
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('processing', 'En cours'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('paid', 'Payé'),
        ('failed', 'Échec'),
        ('refunded', 'Remboursé'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_orders', verbose_name="Utilisateur")
    offer_name = models.CharField(max_length=200, verbose_name="Nom de l'offre")
    offer_description = models.TextField(verbose_name="Description de l'offre")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix")
    currency = models.CharField(max_length=3, default='EUR', verbose_name="Devise")
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default='pending', verbose_name="Statut de paiement")
    
    notes = models.TextField(blank=True, verbose_name="Notes")
    tracking_info = models.JSONField(default=dict, blank=True, verbose_name="Informations de suivi")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    class Meta:
        verbose_name = "Commande Support"
        verbose_name_plural = "Commandes Support"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Commande #{self.id} - {self.offer_name}"

class SupportInvoice(models.Model):
    """Modèle pour les factures support"""
    
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('sent', 'Envoyée'),
        ('paid', 'Payée'),
        ('overdue', 'En retard'),
        ('cancelled', 'Annulée'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_invoices', verbose_name="Utilisateur")
    invoice_number = models.CharField(max_length=20, unique=True, verbose_name="Numéro de facture")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant total")
    currency = models.CharField(max_length=3, default='EUR', verbose_name="Devise")
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='draft', verbose_name="Statut")
    
    due_date = models.DateField(null=True, blank=True, verbose_name="Date d'échéance")
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="Payé le")
    payment_method = models.CharField(max_length=50, blank=True, verbose_name="Méthode de paiement")
    
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    class Meta:
        verbose_name = "Facture Support"
        verbose_name_plural = "Factures Support"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Facture {self.invoice_number}"

class SupportInvoiceItem(models.Model):
    """Modèle pour les articles de facture"""
    
    invoice = models.ForeignKey(SupportInvoice, on_delete=models.CASCADE, related_name='items', verbose_name="Facture")
    description = models.CharField(max_length=200, verbose_name="Description")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Quantité")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix unitaire")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix total")
    
    class Meta:
        verbose_name = "Article Facture"
        verbose_name_plural = "Articles Facture"
    
    def __str__(self):
        return f"{self.description} - {self.total_price}€"
