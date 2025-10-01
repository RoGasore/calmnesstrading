from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Formation(models.Model):
    """Modèle pour les formations"""
    
    LEVEL_CHOICES = [
        ('initiation', 'Initiation'),
        ('basic', 'Basique'),
        ('advanced', 'Avancé'),
        ('elite', 'Élite'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('published', 'Publié'),
        ('archived', 'Archivé'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Titre")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    description = models.TextField(verbose_name="Description")
    short_description = models.CharField(max_length=300, verbose_name="Description courte")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix")
    badge = models.CharField(max_length=50, verbose_name="Badge")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, verbose_name="Niveau")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Statut")
    
    # Contenu
    features = models.JSONField(default=list, verbose_name="Fonctionnalités")
    learnings = models.JSONField(default=list, verbose_name="Objectifs d'apprentissage")
    
    # Statistiques
    duration = models.CharField(max_length=50, verbose_name="Durée")
    lessons_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de leçons")
    students_count = models.PositiveIntegerField(default=0, verbose_name="Nombre d'étudiants")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0, verbose_name="Note")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_formations', verbose_name="Créé par")
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True, verbose_name="Meta titre")
    meta_description = models.TextField(blank=True, verbose_name="Meta description")
    
    class Meta:
        verbose_name = "Formation"
        verbose_name_plural = "Formations"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class Signal(models.Model):
    """Modèle pour les signaux de trading"""
    
    TYPE_CHOICES = [
        ('buy', 'Achat'),
        ('sell', 'Vente'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('pending', 'En attente'),
    ]
    
    RISK_CHOICES = [
        ('low', 'Faible'),
        ('medium', 'Moyen'),
        ('high', 'Élevé'),
    ]
    
    TIMEFRAME_CHOICES = [
        ('M1', '1 Minute'),
        ('M5', '5 Minutes'),
        ('M15', '15 Minutes'),
        ('M30', '30 Minutes'),
        ('H1', '1 Heure'),
        ('H4', '4 Heures'),
        ('D1', '1 Jour'),
        ('W1', '1 Semaine'),
    ]
    
    # Informations de base
    pair = models.CharField(max_length=20, verbose_name="Paire de devises")
    signal_type = models.CharField(max_length=10, choices=TYPE_CHOICES, verbose_name="Type de signal")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")
    
    # Niveaux de prix
    entry_price = models.DecimalField(max_digits=10, decimal_places=5, verbose_name="Prix d'entrée")
    target_price = models.DecimalField(max_digits=10, decimal_places=5, verbose_name="Prix cible")
    stop_loss = models.DecimalField(max_digits=10, decimal_places=5, verbose_name="Stop Loss")
    
    # Paramètres
    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES, verbose_name="Niveau de risque")
    timeframe = models.CharField(max_length=10, choices=TIMEFRAME_CHOICES, verbose_name="Timeframe")
    
    # Résultats
    actual_profit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Profit réel")
    actual_loss = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Perte réelle")
    pips_result = models.CharField(max_length=20, blank=True, verbose_name="Résultat en pips")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_signals', verbose_name="Créé par")
    
    # Analyse
    analysis = models.TextField(blank=True, verbose_name="Analyse technique")
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    class Meta:
        verbose_name = "Signal"
        verbose_name_plural = "Signaux"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.pair} {self.signal_type.upper()} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"

class GestionCompte(models.Model):
    """Modèle pour la gestion de comptes"""
    
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('paused', 'En pause'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
    ]
    
    RISK_PROFILE_CHOICES = [
        ('conservative', 'Conservateur'),
        ('moderate', 'Modéré'),
        ('aggressive', 'Agressif'),
    ]
    
    # Informations client
    client_name = models.CharField(max_length=200, verbose_name="Nom du client")
    client_email = models.EmailField(verbose_name="Email du client")
    client_phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    
    # Paramètres du compte
    account_balance = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Solde du compte")
    risk_profile = models.CharField(max_length=20, choices=RISK_PROFILE_CHOICES, verbose_name="Profil de risque")
    max_drawdown = models.DecimalField(max_digits=5, decimal_places=2, default=10.0, verbose_name="Drawdown maximum (%)")
    
    # Performance
    initial_balance = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Solde initial")
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Solde actuel")
    total_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Profit total")
    total_loss = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Perte totale")
    profit_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Profit (%)")
    
    # Statut et dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Statut")
    start_date = models.DateTimeField(default=timezone.now, verbose_name="Date de début")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="Date de fin")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    managed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_accounts', verbose_name="Géré par")
    
    # Notes
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    class Meta:
        verbose_name = "Gestion de Compte"
        verbose_name_plural = "Gestion de Comptes"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.client_name} - {self.account_balance}€"

class ServiceContent(models.Model):
    """Modèle pour le contenu des services (textes, descriptions, etc.)"""
    
    SERVICE_CHOICES = [
        ('formations', 'Formations'),
        ('signaux', 'Signaux'),
        ('gestion', 'Gestion de Comptes'),
        ('general', 'Général'),
    ]
    
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES, verbose_name="Type de service")
    section = models.CharField(max_length=100, verbose_name="Section")
    title = models.CharField(max_length=200, verbose_name="Titre")
    content = models.TextField(verbose_name="Contenu")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='updated_content', verbose_name="Modifié par")
    
    class Meta:
        verbose_name = "Contenu de Service"
        verbose_name_plural = "Contenus de Services"
        ordering = ['service_type', 'order']
        unique_together = ['service_type', 'section']
    
    def __str__(self):
        return f"{self.get_service_type_display()} - {self.section}"


# Import des modèles CMS
from .models_cms import Page, ContentSection, ContentVersion, AdminPassword, ContentEditSession, ContentChange