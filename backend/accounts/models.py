from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

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


class Formation(models.Model):
    """Modèle pour les formations disponibles (sessions externes Zoom/Meet)"""
    
    PLATFORM_CHOICES = [
        ('zoom', 'Zoom'),
        ('google_meet', 'Google Meet'),
        ('teams', 'Microsoft Teams'),
        ('other', 'Autre'),
    ]
    
    LEVEL_CHOICES = [
        ('beginner', 'Débutant'),
        ('intermediate', 'Intermédiaire'),
        ('advanced', 'Avancé'),
        ('expert', 'Expert'),
    ]
    
    # Informations de base
    name = models.CharField(max_length=200, verbose_name="Nom de la formation")
    description = models.TextField(verbose_name="Description")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, verbose_name="Niveau")
    
    # Liens d'accès (Zoom/Meet)
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES, verbose_name="Plateforme")
    meeting_link = models.URLField(verbose_name="Lien de session", help_text="Lien Zoom ou Google Meet")
    meeting_id = models.CharField(max_length=100, blank=True, verbose_name="ID de réunion")
    meeting_password = models.CharField(max_length=100, blank=True, verbose_name="Mot de passe")
    
    # Formateur
    instructor_name = models.CharField(max_length=200, verbose_name="Nom du formateur")
    instructor_bio = models.TextField(blank=True, verbose_name="Bio du formateur")
    
    # Planning
    schedule_description = models.CharField(
        max_length=200, 
        verbose_name="Description du planning",
        help_text="Ex: Lun-Ven, 18h-20h"
    )
    
    # Métadonnées
    is_active = models.BooleanField(default=True, verbose_name="Active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Formation"
        verbose_name_plural = "Formations"
        ordering = ['level', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.level})"


class UserFormationEnrollment(models.Model):
    """Inscription d'un utilisateur à une formation"""
    
    STATUS_CHOICES = [
        ('upcoming', 'À venir'),
        ('active', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ]
    
    # Relations
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='formation_enrollments')
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE, related_name='enrollments')
    
    # Dates
    enrolled_at = models.DateTimeField(auto_now_add=True, verbose_name="Inscrit le")
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(verbose_name="Date de fin")
    
    # Statut
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    
    # Sessions
    next_session_date = models.DateTimeField(null=True, blank=True, verbose_name="Prochaine session")
    total_sessions = models.IntegerField(default=0, verbose_name="Total de sessions")
    attended_sessions = models.IntegerField(default=0, verbose_name="Sessions suivies")
    
    # Notes et feedback
    user_notes = models.TextField(blank=True, verbose_name="Notes personnelles")
    completion_certificate = models.FileField(
        upload_to='certificates/', 
        null=True, 
        blank=True,
        verbose_name="Certificat de complétion"
    )
    
    # Métadonnées
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Inscription Formation"
        verbose_name_plural = "Inscriptions Formations"
        ordering = ['-enrolled_at']
        unique_together = ['user', 'formation', 'start_date']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['next_session_date']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.formation.name}"
    
    def is_active(self):
        """Vérifie si la formation est active"""
        now = timezone.now().date()
        return (
            self.status == 'active' and 
            self.start_date <= now <= self.end_date
        )
    
    def days_until_start(self):
        """Calcule le nombre de jours avant le début"""
        if self.status != 'upcoming':
            return 0
        delta = self.start_date - timezone.now().date()
        return max(0, delta.days)
    
    def days_until_end(self):
        """Calcule le nombre de jours avant la fin"""
        if self.status not in ['active', 'upcoming']:
            return 0
        delta = self.end_date - timezone.now().date()
        return max(0, delta.days)
    
    def attendance_rate(self):
        """Calcule le taux de présence"""
        if self.total_sessions == 0:
            return 0
        return round((self.attended_sessions / self.total_sessions) * 100, 2)


class FormationSession(models.Model):
    """Session individuelle d'une formation"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifiée'),
        ('ongoing', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ]
    
    # Relations
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE, related_name='sessions')
    enrollment = models.ForeignKey(
        UserFormationEnrollment, 
        on_delete=models.CASCADE, 
        related_name='sessions',
        null=True,
        blank=True
    )
    
    # Informations de session
    session_number = models.IntegerField(verbose_name="Numéro de session")
    title = models.CharField(max_length=200, verbose_name="Titre de la session")
    description = models.TextField(blank=True, verbose_name="Description")
    
    # Date et heure
    scheduled_date = models.DateTimeField(verbose_name="Date et heure")
    duration_minutes = models.IntegerField(default=120, verbose_name="Durée (minutes)")
    
    # Lien (peut être différent du lien principal)
    meeting_link = models.URLField(blank=True, verbose_name="Lien de cette session")
    
    # Enregistrement
    recording_link = models.URLField(blank=True, verbose_name="Lien d'enregistrement")
    
    # Statut
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Présence
    user_attended = models.BooleanField(default=False, verbose_name="Utilisateur présent")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Session de Formation"
        verbose_name_plural = "Sessions de Formation"
        ordering = ['scheduled_date']
        indexes = [
            models.Index(fields=['scheduled_date', 'status']),
        ]
    
    def __str__(self):
        return f"{self.formation.name} - Session {self.session_number}"
    
    def is_upcoming(self):
        """Vérifie si la session est à venir"""
        return self.scheduled_date > timezone.now() and self.status == 'scheduled'
    
    def is_past(self):
        """Vérifie si la session est passée"""
        return self.scheduled_date < timezone.now()


class TradingAccount(models.Model):
    """Compte de trading MetaTrader de l'utilisateur"""
    
    PLATFORM_CHOICES = [
        ('mt4', 'MetaTrader 4'),
        ('mt5', 'MetaTrader 5'),
    ]
    
    ACCOUNT_TYPE_CHOICES = [
        ('demo', 'Compte Démo'),
        ('real', 'Compte Réel'),
    ]
    
    # Relations
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trading_accounts')
    
    # Identifiant unique pour l'API
    api_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    
    # Informations du compte
    account_number = models.CharField(max_length=50, verbose_name="Numéro de compte")
    platform = models.CharField(max_length=10, choices=PLATFORM_CHOICES, verbose_name="Plateforme")
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES, verbose_name="Type de compte")
    broker_name = models.CharField(max_length=100, verbose_name="Nom du broker")
    
    # Informations de connexion
    account_name = models.CharField(max_length=100, verbose_name="Nom du compte")
    currency = models.CharField(max_length=3, default='USD', verbose_name="Devise")
    leverage = models.IntegerField(default=100, verbose_name="Effet de levier")
    
    # État du compte
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Solde")
    equity = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Équité")
    margin = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Marge")
    free_margin = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Marge libre")
    
    # Synchronisation
    last_sync_at = models.DateTimeField(null=True, blank=True, verbose_name="Dernière synchro")
    ea_installed = models.BooleanField(default=False, verbose_name="EA installé")
    ea_version = models.CharField(max_length=20, blank=True, verbose_name="Version EA")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Compte de Trading"
        verbose_name_plural = "Comptes de Trading"
        ordering = ['-created_at']
        unique_together = ['user', 'account_number', 'broker_name']
    
    def __str__(self):
        return f"{self.user.email} - {self.account_number} ({self.broker_name})"
    
    def regenerate_api_key(self):
        """Régénérer l'API key pour la sécurité"""
        self.api_key = uuid.uuid4()
        self.save(update_fields=['api_key'])
        return self.api_key


class Trade(models.Model):
    """Trade individuel depuis MetaTrader"""
    
    TRADE_TYPE_CHOICES = [
        ('buy', 'BUY'),
        ('sell', 'SELL'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Ouvert'),
        ('closed', 'Fermé'),
        ('cancelled', 'Annulé'),
    ]
    
    # Relations
    trading_account = models.ForeignKey(TradingAccount, on_delete=models.CASCADE, related_name='trades')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trades')
    
    # Identifiants
    ticket = models.CharField(max_length=50, verbose_name="Ticket MT")
    magic_number = models.IntegerField(null=True, blank=True, verbose_name="Magic Number")
    
    # Informations du trade
    symbol = models.CharField(max_length=20, verbose_name="Symbole")
    trade_type = models.CharField(max_length=10, choices=TRADE_TYPE_CHOICES, verbose_name="Type")
    volume = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Volume (lots)")
    
    # Prix
    open_price = models.DecimalField(max_digits=15, decimal_places=5, verbose_name="Prix d'ouverture")
    close_price = models.DecimalField(max_digits=15, decimal_places=5, null=True, blank=True, verbose_name="Prix de clôture")
    stop_loss = models.DecimalField(max_digits=15, decimal_places=5, null=True, blank=True, verbose_name="Stop Loss")
    take_profit = models.DecimalField(max_digits=15, decimal_places=5, null=True, blank=True, verbose_name="Take Profit")
    current_price = models.DecimalField(max_digits=15, decimal_places=5, null=True, blank=True, verbose_name="Prix actuel")
    
    # Résultats
    profit = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Profit/Perte")
    swap = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Swap")
    commission = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Commission")
    
    # Dates et heures
    open_time = models.DateTimeField(verbose_name="Heure d'ouverture")
    close_time = models.DateTimeField(null=True, blank=True, verbose_name="Heure de clôture")
    
    # Statut
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # Commentaire et tags
    comment = models.TextField(blank=True, verbose_name="Commentaire")
    user_notes = models.TextField(blank=True, verbose_name="Notes personnelles")
    tags = models.JSONField(default=list, blank=True, verbose_name="Tags")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Trade"
        verbose_name_plural = "Trades"
        ordering = ['-open_time']
        unique_together = ['trading_account', 'ticket']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['open_time']),
            models.Index(fields=['symbol']),
        ]
    
    def __str__(self):
        return f"{self.ticket} - {self.symbol} {self.trade_type} - {self.profit}"
    
    def duration(self):
        """Calcule la durée du trade"""
        if not self.close_time:
            return timezone.now() - self.open_time
        return self.close_time - self.open_time
    
    def duration_minutes(self):
        """Durée en minutes"""
        return int(self.duration().total_seconds() / 60)
    
    def is_profitable(self):
        """Vérifie si le trade est profitable"""
        return self.profit > 0
    
    def total_cost(self):
        """Coût total (profit - swap - commission)"""
        return float(self.profit) + float(self.swap) + float(self.commission)


class TradingStatistics(models.Model):
    """Statistiques de trading calculées périodiquement"""
    
    PERIOD_CHOICES = [
        ('daily', 'Quotidien'),
        ('weekly', 'Hebdomadaire'),
        ('monthly', 'Mensuel'),
        ('yearly', 'Annuel'),
        ('all_time', 'Tout le temps'),
    ]
    
    # Relations
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trading_stats')
    trading_account = models.ForeignKey(TradingAccount, on_delete=models.CASCADE, related_name='statistics', null=True, blank=True)
    
    # Période
    period_type = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    period_start = models.DateField(verbose_name="Début de période")
    period_end = models.DateField(verbose_name="Fin de période")
    
    # Statistiques de base
    total_trades = models.IntegerField(default=0, verbose_name="Total trades")
    winning_trades = models.IntegerField(default=0, verbose_name="Trades gagnants")
    losing_trades = models.IntegerField(default=0, verbose_name="Trades perdants")
    
    # Performance
    total_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Profit total")
    total_loss = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Perte totale")
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Profit net")
    
    # Ratios
    win_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Win rate (%)")
    profit_factor = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Profit factor")
    average_win = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Gain moyen")
    average_loss = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Perte moyenne")
    
    # Métadonnées
    calculated_at = models.DateTimeField(auto_now_add=True, verbose_name="Calculé le")
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Statistiques de Trading"
        verbose_name_plural = "Statistiques de Trading"
        ordering = ['-period_start']
        unique_together = ['user', 'trading_account', 'period_type', 'period_start']
    
    def __str__(self):
        return f"{self.user.email} - {self.period_type} ({self.period_start})"


# Import des modèles de formations admin
from .models_formations_admin import (
    FormationSchedule, AdminFormationSession, AdminSessionNotification, AdminSessionAttendance
)
