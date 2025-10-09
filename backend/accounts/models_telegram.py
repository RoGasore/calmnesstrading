from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.crypto import get_random_string
from datetime import timedelta

User = get_user_model()

class TelegramBotToken(models.Model):
    """Modèle pour les tokens uniques du bot Telegram"""
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('used', 'Utilisé'),
        ('expired', 'Expiré'),
        ('revoked', 'Révoqué'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='telegram_tokens', verbose_name="Utilisateur")
    token = models.CharField(max_length=64, unique=True, verbose_name="Token unique")
    
    # Informations de paiement liées
    payment_id = models.IntegerField(null=True, blank=True, verbose_name="ID Paiement")
    transaction_id = models.CharField(max_length=255, blank=True, verbose_name="ID Transaction")
    
    # Statut et dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    used_at = models.DateTimeField(null=True, blank=True, verbose_name="Utilisé le")
    expires_at = models.DateTimeField(verbose_name="Expire le")
    
    # Informations Telegram
    telegram_user_id = models.BigIntegerField(null=True, blank=True, verbose_name="Telegram User ID")
    telegram_username = models.CharField(max_length=255, blank=True, verbose_name="Telegram Username")
    
    class Meta:
        verbose_name = "Token Bot Telegram"
        verbose_name_plural = "Tokens Bot Telegram"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"Token {self.token[:8]}... - {self.user.username}"
    
    @classmethod
    def generate_token(cls, user, payment_id=None, transaction_id=None, expiry_hours=24):
        """Générer un nouveau token unique"""
        token = get_random_string(64)
        expires_at = timezone.now() + timedelta(hours=expiry_hours)
        
        return cls.objects.create(
            user=user,
            token=token,
            payment_id=payment_id,
            transaction_id=transaction_id,
            expires_at=expires_at
        )
    
    def is_valid(self):
        """Vérifier si le token est toujours valide"""
        return (
            self.status == 'pending' and
            self.expires_at > timezone.now()
        )
    
    def mark_as_used(self, telegram_user_id, telegram_username=None):
        """Marquer le token comme utilisé"""
        self.status = 'used'
        self.used_at = timezone.now()
        self.telegram_user_id = telegram_user_id
        self.telegram_username = telegram_username
        self.save()

class TelegramChannelInvite(models.Model):
    """Modèle pour les invitations au canal Telegram"""
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('sent', 'Envoyé'),
        ('accepted', 'Accepté'),
        ('expired', 'Expiré'),
        ('revoked', 'Révoqué'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='telegram_invites', verbose_name="Utilisateur")
    bot_token = models.ForeignKey(TelegramBotToken, on_delete=models.CASCADE, related_name='invites', verbose_name="Token Bot")
    
    # Informations du canal
    channel_id = models.BigIntegerField(verbose_name="ID du canal")
    channel_name = models.CharField(max_length=255, verbose_name="Nom du canal")
    
    # Lien d'invitation
    invite_link = models.URLField(max_length=500, verbose_name="Lien d'invitation")
    
    # Statut et dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Envoyé le")
    accepted_at = models.DateTimeField(null=True, blank=True, verbose_name="Accepté le")
    expires_at = models.DateTimeField(verbose_name="Expire le")
    
    # Informations Telegram
    telegram_user_id = models.BigIntegerField(verbose_name="Telegram User ID")
    
    class Meta:
        verbose_name = "Invitation Canal Telegram"
        verbose_name_plural = "Invitations Canal Telegram"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['telegram_user_id']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"Invitation {self.channel_name} - {self.user.username}"
    
    def is_valid(self):
        """Vérifier si l'invitation est toujours valide"""
        return (
            self.status in ['pending', 'sent'] and
            self.expires_at > timezone.now()
        )
    
    def mark_as_sent(self):
        """Marquer l'invitation comme envoyée"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save()
    
    def mark_as_accepted(self):
        """Marquer l'invitation comme acceptée"""
        self.status = 'accepted'
        self.accepted_at = timezone.now()
        self.save()

class TelegramChannelMember(models.Model):
    """Modèle pour suivre les membres des canaux Telegram"""
    
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('expired', 'Expiré'),
        ('banned', 'Banni'),
        ('left', 'Parti'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='telegram_memberships', verbose_name="Utilisateur")
    invite = models.ForeignKey(TelegramChannelInvite, on_delete=models.SET_NULL, null=True, blank=True, related_name='memberships', verbose_name="Invitation")
    
    # Informations du canal
    channel_id = models.BigIntegerField(verbose_name="ID du canal")
    channel_name = models.CharField(max_length=255, verbose_name="Nom du canal")
    
    # Informations Telegram
    telegram_user_id = models.BigIntegerField(verbose_name="Telegram User ID")
    telegram_username = models.CharField(max_length=255, blank=True, verbose_name="Telegram Username")
    
    # Statut et dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Statut")
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name="Rejoint le")
    expires_at = models.DateTimeField(verbose_name="Expire le")
    left_at = models.DateTimeField(null=True, blank=True, verbose_name="Parti le")
    banned_at = models.DateTimeField(null=True, blank=True, verbose_name="Banni le")
    
    # Informations d'abonnement
    subscription_type = models.CharField(max_length=100, verbose_name="Type d'abonnement")
    subscription_end_date = models.DateTimeField(verbose_name="Fin d'abonnement")
    
    class Meta:
        verbose_name = "Membre Canal Telegram"
        verbose_name_plural = "Membres Canal Telegram"
        ordering = ['-joined_at']
        unique_together = ['user', 'channel_id']
        indexes = [
            models.Index(fields=['telegram_user_id', 'channel_id']),
            models.Index(fields=['status', 'expires_at']),
            models.Index(fields=['subscription_end_date']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.channel_name}"
    
    def is_active(self):
        """Vérifier si le membre est toujours actif"""
        return (
            self.status == 'active' and
            self.subscription_end_date > timezone.now()
        )
    
    def revoke_access(self, reason='expired'):
        """Révoquer l'accès du membre"""
        if reason == 'expired':
            self.status = 'expired'
        elif reason == 'banned':
            self.status = 'banned'
            self.banned_at = timezone.now()
        else:
            self.status = 'left'
            self.left_at = timezone.now()
        
        self.save()

class TelegramNotification(models.Model):
    """Modèle pour les notifications Telegram"""
    
    TYPE_CHOICES = [
        ('payment_pending', 'Paiement en attente'),
        ('payment_verified', 'Paiement vérifié'),
        ('invite_sent', 'Invitation envoyée'),
        ('access_granted', 'Accès accordé'),
        ('access_expiring', 'Accès bientôt expiré'),
        ('access_expired', 'Accès expiré'),
        ('access_revoked', 'Accès révoqué'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('sent', 'Envoyé'),
        ('failed', 'Échec'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='telegram_notifications', verbose_name="Utilisateur")
    
    # Type et contenu
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES, verbose_name="Type")
    title = models.CharField(max_length=255, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    
    # Lien optionnel (ex: lien vers le bot)
    action_url = models.URLField(max_length=500, blank=True, verbose_name="Lien d'action")
    
    # Statut et dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Envoyé le")
    
    # Informations d'envoi
    sent_via_site = models.BooleanField(default=True, verbose_name="Envoyé via site")
    sent_via_email = models.BooleanField(default=False, verbose_name="Envoyé via email")
    sent_via_telegram = models.BooleanField(default=False, verbose_name="Envoyé via Telegram")
    
    # Métadonnées
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Métadonnées")
    
    class Meta:
        verbose_name = "Notification Telegram"
        verbose_name_plural = "Notifications Telegram"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['notification_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.user.username}"
    
    def mark_as_sent(self, via_site=True, via_email=False, via_telegram=False):
        """Marquer la notification comme envoyée"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.sent_via_site = via_site
        self.sent_via_email = via_email
        self.sent_via_telegram = via_telegram
        self.save()
    
    def mark_as_failed(self):
        """Marquer la notification comme échouée"""
        self.status = 'failed'
        self.save()

