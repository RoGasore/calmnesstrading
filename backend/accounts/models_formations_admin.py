from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid

User = get_user_model()

class FormationSchedule(models.Model):
    """
    Modèle pour programmer les sessions de formation
    """
    DAYS_OF_WEEK = [
        (0, 'Lundi'),
        (1, 'Mardi'),
        (2, 'Mercredi'),
        (3, 'Jeudi'),
        (4, 'Vendredi'),
        (5, 'Samedi'),
        (6, 'Dimanche'),
    ]
    
    PLATFORM_CHOICES = [
        ('zoom', 'Zoom'),
        ('google_meet', 'Google Meet'),
        ('teams', 'Microsoft Teams'),
        ('other', 'Autre'),
    ]
    
    # Formation associée
    formation = models.ForeignKey(
        'accounts.Formation', 
        on_delete=models.CASCADE, 
        related_name='schedules',
        help_text="Formation concernée"
    )
    
    # Programmation récurrente
    day_of_week = models.IntegerField(
        choices=DAYS_OF_WEEK,
        help_text="Jour de la semaine"
    )
    start_time = models.TimeField(
        help_text="Heure de début (HH:MM)"
    )
    end_time = models.TimeField(
        help_text="Heure de fin (HH:MM)"
    )
    
    # Plateforme
    platform = models.CharField(
        max_length=20,
        choices=PLATFORM_CHOICES,
        default='zoom',
        help_text="Plateforme utilisée"
    )
    meeting_link = models.URLField(
        blank=True,
        help_text="Lien de la réunion"
    )
    meeting_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="ID de la réunion"
    )
    meeting_password = models.CharField(
        max_length=50,
        blank=True,
        help_text="Mot de passe de la réunion"
    )
    
    # Formateur
    instructor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='taught_schedules',
        help_text="Formateur assigné"
    )
    
    # Statut
    is_active = models.BooleanField(
        default=True,
        help_text="Programmation active"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_schedules',
        help_text="Créé par"
    )

    class Meta:
        ordering = ['day_of_week', 'start_time']
        verbose_name = "Programmation de formation"
        verbose_name_plural = "Programmations de formations"
        unique_together = ['formation', 'day_of_week', 'start_time']

    def __str__(self):
        return f"{self.formation.name} - {self.get_day_of_week_display()} {self.start_time}"

    @property
    def duration_minutes(self):
        """Durée de la session en minutes"""
        start = self.start_time
        end = self.end_time
        return (end.hour - start.hour) * 60 + (end.minute - start.minute)


class AdminFormationSession(models.Model):
    """
    Modèle pour les sessions individuelles de formation
    """
    SESSION_STATUS_CHOICES = [
        ('scheduled', 'Programmée'),
        ('ongoing', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
        ('postponed', 'Reportée'),
    ]
    
    # Référence unique
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Formation et programmation
    formation = models.ForeignKey(
        'accounts.Formation',
        on_delete=models.CASCADE,
        related_name='admin_sessions',
        help_text="Formation concernée"
    )
    schedule = models.ForeignKey(
        FormationSchedule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admin_sessions',
        help_text="Programmation de base"
    )
    
    # Date et heure
    scheduled_date = models.DateTimeField(
        help_text="Date et heure programmée"
    )
    actual_start_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Heure de début réelle"
    )
    actual_end_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Heure de fin réelle"
    )
    
    # Détails de la session
    title = models.CharField(
        max_length=200,
        help_text="Titre de la session"
    )
    description = models.TextField(
        blank=True,
        help_text="Description de la session"
    )
    objectives = models.TextField(
        blank=True,
        help_text="Objectifs de la session"
    )
    
    # Plateforme et accès
    platform = models.CharField(
        max_length=20,
        choices=FormationSchedule.PLATFORM_CHOICES,
        default='zoom',
        help_text="Plateforme utilisée"
    )
    meeting_link = models.URLField(
        blank=True,
        help_text="Lien de la réunion"
    )
    meeting_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="ID de la réunion"
    )
    meeting_password = models.CharField(
        max_length=50,
        blank=True,
        help_text="Mot de passe de la réunion"
    )
    
    # Formateur
    instructor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='taught_sessions',
        help_text="Formateur assigné"
    )
    
    # Statut
    status = models.CharField(
        max_length=20,
        choices=SESSION_STATUS_CHOICES,
        default='scheduled',
        help_text="Statut de la session"
    )
    
    # Participants
    max_participants = models.PositiveIntegerField(
        default=50,
        help_text="Nombre maximum de participants"
    )
    current_participants = models.PositiveIntegerField(
        default=0,
        help_text="Nombre actuel de participants"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_sessions',
        help_text="Créé par"
    )

    class Meta:
        ordering = ['scheduled_date']
        verbose_name = "Session de formation (Admin)"
        verbose_name_plural = "Sessions de formations (Admin)"

    def __str__(self):
        return f"{self.title} - {self.scheduled_date.strftime('%d/%m/%Y %H:%M')}"

    @property
    def is_upcoming(self):
        """Vérifie si la session est à venir"""
        return self.scheduled_date > timezone.now() and self.status == 'scheduled'

    @property
    def is_ongoing(self):
        """Vérifie si la session est en cours"""
        now = timezone.now()
        return (
            self.status == 'ongoing' or
            (self.scheduled_date <= now and 
             (not self.actual_end_time or self.actual_end_time > now))
        )

    @property
    def is_completed(self):
        """Vérifie si la session est terminée"""
        return self.status == 'completed' or (
            self.actual_end_time and self.actual_end_time < timezone.now()
        )

    def start_session(self):
        """Démarre la session"""
        self.status = 'ongoing'
        self.actual_start_time = timezone.now()
        self.save(update_fields=['status', 'actual_start_time'])

    def end_session(self):
        """Termine la session"""
        self.status = 'completed'
        self.actual_end_time = timezone.now()
        self.save(update_fields=['status', 'actual_end_time'])


class AdminSessionNotification(models.Model):
    """
    Modèle pour programmer les notifications de sessions
    """
    NOTIFICATION_TYPE_CHOICES = [
        ('session_reminder', 'Rappel de session'),
        ('session_starting', 'Session qui commence'),
        ('session_cancelled', 'Session annulée'),
        ('session_postponed', 'Session reportée'),
        ('homework_reminder', 'Rappel de devoir'),
        ('material_available', 'Matériel disponible'),
    ]
    
    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('telegram', 'Telegram'),
        ('discord', 'Discord'),
        ('whatsapp', 'WhatsApp'),
        ('all', 'Tous les canaux'),
    ]
    
    # Session associée
    session = models.ForeignKey(
        AdminFormationSession,
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="Session concernée"
    )
    
    # Type et timing
    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPE_CHOICES,
        help_text="Type de notification"
    )
    send_before_minutes = models.PositiveIntegerField(
        default=60,
        help_text="Envoyer X minutes avant la session"
    )
    
    # Canaux de communication
    channels = models.JSONField(
        default=list,
        help_text="Canaux de communication (email, telegram, discord, whatsapp)"
    )
    
    # Contenu du message
    subject = models.CharField(
        max_length=200,
        help_text="Sujet du message"
    )
    message_template = models.TextField(
        help_text="Template du message (variables: {user_name}, {session_title}, {session_date}, {meeting_link})"
    )
    
    # Statut
    is_active = models.BooleanField(
        default=True,
        help_text="Notification active"
    )
    is_sent = models.BooleanField(
        default=False,
        help_text="Notification envoyée"
    )
    sent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date d'envoi"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_notifications',
        help_text="Créé par"
    )

    class Meta:
        ordering = ['send_before_minutes']
        verbose_name = "Notification de session (Admin)"
        verbose_name_plural = "Notifications de sessions (Admin)"

    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.session.title}"

    def get_send_time(self):
        """Calcule l'heure d'envoi de la notification"""
        return self.session.scheduled_date - timezone.timedelta(minutes=self.send_before_minutes)

    def should_send_now(self):
        """Vérifie si la notification doit être envoyée maintenant"""
        if self.is_sent or not self.is_active:
            return False
        
        send_time = self.get_send_time()
        now = timezone.now()
        
        # Envoyer si on est dans les 5 minutes de l'heure prévue
        return abs((send_time - now).total_seconds()) <= 300  # 5 minutes


class AdminSessionAttendance(models.Model):
    """
    Modèle pour suivre la présence aux sessions
    """
    ATTENDANCE_STATUS_CHOICES = [
        ('present', 'Présent'),
        ('absent', 'Absent'),
        ('late', 'En retard'),
        ('excused', 'Excusé'),
    ]
    
    # Session et utilisateur
    session = models.ForeignKey(
        AdminFormationSession,
        on_delete=models.CASCADE,
        related_name='attendances',
        help_text="Session concernée"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='session_attendances',
        help_text="Utilisateur"
    )
    
    # Statut de présence
    status = models.CharField(
        max_length=20,
        choices=ATTENDANCE_STATUS_CHOICES,
        default='absent',
        help_text="Statut de présence"
    )
    
    # Horaires
    joined_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Heure de connexion"
    )
    left_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Heure de déconnexion"
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        help_text="Notes sur la participation"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['session', 'user']
        verbose_name = "Présence à la session (Admin)"
        verbose_name_plural = "Présences aux sessions (Admin)"

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.session.title}"

    @property
    def duration_minutes(self):
        """Durée de présence en minutes"""
        if self.joined_at and self.left_at:
            delta = self.left_at - self.joined_at
            return int(delta.total_seconds() / 60)
        return 0
