from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """Modèle utilisateur personnalisé avec champs supplémentaires"""
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True, unique=True)
    
    # Comptes de contact (obligatoires pour les paiements)
    telegram_username = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="@username Telegram (obligatoire pour recevoir les signaux)"
    )
    discord_username = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="Username#1234 Discord (obligatoire pour recevoir les signaux)"
    )
    whatsapp_number = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        help_text="Numéro WhatsApp (facultatif, format: +33612345678)"
    )
    
    # Autres champs
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    can_make_payment = models.BooleanField(default=False, help_text="L'utilisateur peut effectuer un paiement")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Utiliser email comme champ de connexion au lieu de username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        """Retourne le nom complet de l'utilisateur"""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def has_complete_profile(self):
        """Vérifie si le profil est complet pour effectuer un paiement"""
        return bool(
            self.first_name and 
            self.last_name and 
            self.is_verified and
            (self.telegram_username or self.discord_username)
        )
    
    def update_payment_permission(self):
        """Met à jour la permission de paiement basée sur le profil"""
        self.can_make_payment = self.has_complete_profile()
        self.save(update_fields=['can_make_payment'])

class UserProfile(models.Model):
    """Profil étendu de l'utilisateur"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, max_length=500)
    trading_experience = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Débutant'),
            ('intermediate', 'Intermédiaire'),
            ('advanced', 'Avancé'),
            ('expert', 'Expert')
        ],
        default='beginner'
    )
    preferred_language = models.CharField(max_length=5, default='fr')
    timezone = models.CharField(max_length=50, default='UTC')
    date_of_birth = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Préférences de trading
    preferred_assets = models.JSONField(default=list, blank=True)  # ['forex', 'crypto', 'stocks']
    risk_tolerance = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Faible'),
            ('medium', 'Moyen'),
            ('high', 'Élevé')
        ],
        default='medium'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Profil utilisateur'
        verbose_name_plural = 'Profils utilisateurs'
    
    def __str__(self):
        return f"Profil de {self.user.email}"

class EmailVerificationToken(models.Model):
    """Token de vérification d'email"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_tokens')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Token de vérification'
        verbose_name_plural = 'Tokens de vérification'
    
    def __str__(self):
        return f"Token pour {self.user.email}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        return not self.is_used and not self.is_expired()


class UserNotification(models.Model):
    """Notifications pour les utilisateurs"""
    
    NOTIFICATION_TYPE_CHOICES = [
        ('subscription_expiring', 'Abonnement expirant'),
        ('subscription_expired', 'Abonnement expiré'),
        ('payment_received', 'Paiement reçu'),
        ('payment_pending', 'Paiement en attente'),
        ('profile_incomplete', 'Profil incomplet'),
        ('welcome', 'Bienvenue'),
        ('general', 'Général'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('sent', 'Envoyé'),
        ('read', 'Lu'),
        ('dismissed', 'Ignoré'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Pour les notifications liées à un abonnement
    subscription = models.ForeignKey(
        'payments.Subscription', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='notifications'
    )
    
    # Métadonnées
    scheduled_for = models.DateTimeField(null=True, blank=True, help_text="Quand envoyer la notification")
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Notification utilisateur'
        verbose_name_plural = 'Notifications utilisateurs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['scheduled_for']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def mark_as_sent(self):
        """Marquer la notification comme envoyée"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at'])
    
    def mark_as_read(self):
        """Marquer la notification comme lue"""
        self.status = 'read'
        self.read_at = timezone.now()
        self.save(update_fields=['status', 'read_at'])


