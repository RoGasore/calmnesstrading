from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinLengthValidator
import json

User = get_user_model()

class GlobalSettings(models.Model):
    """Paramètres globaux du site (nom, copyright, réseaux sociaux, etc.)"""
    
    # Informations de base
    site_name = models.CharField(max_length=200, default="CALMNESS FI", verbose_name="Nom du site")
    site_tagline = models.CharField(max_length=300, blank=True, verbose_name="Slogan du site")
    site_description = models.TextField(blank=True, verbose_name="Description du site")
    
    # Contact global
    email_contact = models.EmailField(blank=True, verbose_name="Email de contact")
    phone_contact = models.CharField(max_length=20, blank=True, verbose_name="Téléphone de contact")
    contact_email = models.EmailField(blank=True, verbose_name="Email de contact (alternatif)")
    contact_phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone de contact (alternatif)")
    address = models.TextField(blank=True, verbose_name="Adresse")
    
    # Informations de contact supplémentaires
    contact_title = models.CharField(max_length=200, default="Plusieurs façons de nous joindre", verbose_name="Titre de la section contact")
    business_hours = models.CharField(max_length=100, blank=True, verbose_name="Horaires d'ouverture")
    telegram_support = models.CharField(max_length=100, blank=True, verbose_name="Support Telegram")
    support_description = models.CharField(max_length=200, default="24/7 Support", verbose_name="Description du support")
    
    # Réseaux sociaux
    telegram_url = models.URLField(blank=True, verbose_name="URL Telegram")
    discord_url = models.URLField(blank=True, verbose_name="URL Discord")
    facebook_url = models.URLField(blank=True, verbose_name="URL Facebook")
    twitter_url = models.URLField(blank=True, verbose_name="URL Twitter")
    linkedin_url = models.URLField(blank=True, verbose_name="URL LinkedIn")
    social_networks = models.JSONField(default=dict, verbose_name="Réseaux sociaux", help_text="Format: {'facebook': 'url', 'twitter': 'url', 'instagram': 'url'}")
    
    # Copyright
    copyright_text = models.CharField(max_length=500, default="© 2024 CALMNESS FI. Tous droits réservés.", verbose_name="Texte de copyright")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Modifié par")
    
    class Meta:
        verbose_name = "Paramètres Globaux"
        verbose_name_plural = "Paramètres Globaux"
    
    def __str__(self):
        return f"Paramètres globaux - {self.site_name}"
    
    @classmethod
    def get_settings(cls):
        """Récupérer ou créer les paramètres globaux"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

class PageCategory(models.Model):
    """Catégories de pages pour organiser le contenu"""
    
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom de la catégorie")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    description = models.TextField(blank=True, verbose_name="Description")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Icône", help_text="Nom de l'icône Lucide")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    class Meta:
        verbose_name = "Catégorie de Page"
        verbose_name_plural = "Catégories de Pages"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name

class SitePage(models.Model):
    """Pages principales du site"""
    
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom de la page")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    title = models.CharField(max_length=200, verbose_name="Titre de la page")
    description = models.TextField(blank=True, verbose_name="Description")
    category = models.ForeignKey(PageCategory, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Catégorie")
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True, verbose_name="Meta titre")
    meta_description = models.TextField(blank=True, verbose_name="Meta description")
    meta_keywords = models.CharField(max_length=500, blank=True, verbose_name="Meta mots-clés")
    
    # État
    is_active = models.BooleanField(default=True, verbose_name="Active")
    is_public = models.BooleanField(default=True, verbose_name="Publique")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Modifié par")
    
    class Meta:
        verbose_name = "Page du Site"
        verbose_name_plural = "Pages du Site"
        ordering = ['name']
    
    def __str__(self):
        return self.title

class ContentBlock(models.Model):
    """Blocs de contenu flexibles pour les pages"""
    
    CONTENT_TYPES = [
        ('text', 'Texte'),
        ('heading', 'Titre'),
        ('paragraph', 'Paragraphe'),
        ('image', 'Image'),
        ('video', 'Vidéo'),
        ('button', 'Bouton'),
        ('card', 'Carte'),
        ('list', 'Liste'),
        ('quote', 'Citation'),
        ('hero', 'Section Hero'),
        ('features', 'Fonctionnalités'),
        ('testimonial', 'Témoignage'),
        ('stats', 'Statistiques'),
        ('pricing', 'Tarifs'),
        ('faq', 'FAQ'),
        ('contact_form', 'Formulaire de contact'),
        ('social_links', 'Liens sociaux'),
        ('custom_html', 'HTML personnalisé'),
    ]
    
    page = models.ForeignKey(SitePage, on_delete=models.CASCADE, related_name='content_blocks', verbose_name="Page")
    block_key = models.CharField(max_length=100, verbose_name="Clé du bloc", help_text="Identifiant unique du bloc")
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES, verbose_name="Type de contenu")
    title = models.CharField(max_length=200, blank=True, verbose_name="Titre")
    content = models.TextField(blank=True, verbose_name="Contenu")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Métadonnées", help_text="Données additionnelles selon le type de contenu")
    
    # Style et position
    css_classes = models.CharField(max_length=500, blank=True, verbose_name="Classes CSS")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")
    
    # État
    is_visible = models.BooleanField(default=True, verbose_name="Visible")
    is_editable = models.BooleanField(default=True, verbose_name="Éditable")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Modifié par")
    
    class Meta:
        verbose_name = "Bloc de Contenu"
        verbose_name_plural = "Blocs de Contenu"
        ordering = ['page', 'order', 'block_key']
        unique_together = ['page', 'block_key']
    
    def __str__(self):
        return f"{self.page.title} - {self.block_key}"

class ComprehensiveContentVersion(models.Model):
    """Historique des versions de contenu pour le versioning"""
    
    content_block = models.ForeignKey(ContentBlock, on_delete=models.CASCADE, related_name='comprehensive_versions', verbose_name="Bloc de contenu")
    title = models.CharField(max_length=200, blank=True, verbose_name="Titre")
    content = models.TextField(blank=True, verbose_name="Contenu")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Métadonnées")
    version_number = models.PositiveIntegerField(verbose_name="Numéro de version")
    change_summary = models.CharField(max_length=500, blank=True, verbose_name="Résumé des changements")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Créé par")
    
    class Meta:
        verbose_name = "Version de Contenu"
        verbose_name_plural = "Versions de Contenu"
        ordering = ['-created_at']
        unique_together = ['content_block', 'version_number']
    
    def __str__(self):
        return f"{self.content_block} - Version {self.version_number}"

class Testimonial(models.Model):
    """Témoignages/Avis clients"""
    
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('published', 'Publié'),
        ('archived', 'Archivé'),
    ]
    
    # Informations client
    client_name = models.CharField(max_length=100, verbose_name="Nom du client")
    client_initials = models.CharField(max_length=10, blank=True, verbose_name="Initiales")
    client_role = models.CharField(max_length=100, blank=True, verbose_name="Rôle/Fonction")
    client_avatar = models.URLField(blank=True, verbose_name="URL de l'avatar")
    
    # Contenu
    testimonial_text = models.TextField(verbose_name="Texte du témoignage")
    rating = models.PositiveIntegerField(default=5, verbose_name="Note", help_text="Note sur 5 étoiles")
    
    # Métadonnées
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Statut")
    is_featured = models.BooleanField(default=False, verbose_name="Mise en avant")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Créé par")
    
    class Meta:
        verbose_name = "Témoignage"
        verbose_name_plural = "Témoignages"
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return f"{self.client_name} - {self.rating}★"

class FAQItem(models.Model):
    """Questions fréquemment posées"""
    
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('published', 'Publié'),
        ('archived', 'Archivé'),
    ]
    
    CATEGORY_CHOICES = [
        ('general', 'Général'),
        ('trading', 'Trading'),
        ('formations', 'Formations'),
        ('signaux', 'Signaux'),
        ('comptes', 'Gestion de comptes'),
        ('paiements', 'Paiements'),
        ('technique', 'Technique'),
    ]
    
    # Contenu
    question = models.CharField(max_length=500, verbose_name="Question")
    answer = models.TextField(verbose_name="Réponse")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general', verbose_name="Catégorie")
    
    # SEO et recherche
    keywords = models.CharField(max_length=500, blank=True, verbose_name="Mots-clés", help_text="Mots-clés pour la recherche")
    search_tags = models.JSONField(default=list, blank=True, verbose_name="Tags de recherche")
    
    # Métadonnées
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Statut")
    is_featured = models.BooleanField(default=False, verbose_name="Mise en avant")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")
    views_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de vues")
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Créé par")
    
    class Meta:
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"
        ordering = ['category', 'order', '-is_featured', '-created_at']
    
    def __str__(self):
        return self.question[:100] + "..." if len(self.question) > 100 else self.question

class Offer(models.Model):
    """Offres/Produits (pour la section Nos Services)"""
    
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('published', 'Publié'),
        ('archived', 'Archivé'),
    ]
    
    TYPE_CHOICES = [
        ('formation', 'Formation'),
        ('signal', 'Signal'),
        ('gestion', 'Gestion de compte'),
        ('coaching', 'Coaching'),
        ('service', 'Service'),
    ]
    
    # Informations de base
    name = models.CharField(max_length=200, verbose_name="Nom de l'offre")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    description = models.TextField(verbose_name="Description")
    short_description = models.CharField(max_length=300, verbose_name="Description courte")
    offer_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Type d'offre")
    
    # Prix et conditions
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Prix")
    currency = models.CharField(max_length=3, default="EUR", verbose_name="Devise")
    is_free = models.BooleanField(default=False, verbose_name="Gratuit")
    discount_percentage = models.PositiveIntegerField(default=0, verbose_name="Remise (%)")
    
    # Contenu détaillé
    features = models.JSONField(default=list, verbose_name="Fonctionnalités", help_text="Liste des fonctionnalités")
    benefits = models.JSONField(default=list, verbose_name="Avantages", help_text="Liste des avantages")
    requirements = models.JSONField(default=list, verbose_name="Prérequis", help_text="Prérequis nécessaires")
    
    # Métadonnées
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Statut")
    is_featured = models.BooleanField(default=False, verbose_name="Mise en avant")
    is_popular = models.BooleanField(default=False, verbose_name="Populaire")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")
    
    # Visuel
    image_url = models.URLField(blank=True, verbose_name="URL de l'image")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Icône", help_text="Nom de l'icône Lucide")
    color_theme = models.CharField(max_length=20, default="primary", verbose_name="Thème de couleur")
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True, verbose_name="Meta titre")
    meta_description = models.TextField(blank=True, verbose_name="Meta description")
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Créé par")
    
    class Meta:
        verbose_name = "Offre"
        verbose_name_plural = "Offres"
        ordering = ['order', '-is_featured', '-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def final_price(self):
        """Prix final après remise"""
        if self.is_free:
            return 0
        if not self.price:
            return None
        return self.price * (1 - self.discount_percentage / 100)

class ComprehensiveEditSession(models.Model):
    """Sessions d'édition pour le mode aperçu"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comprehensive_edit_sessions', verbose_name="Utilisateur")
    page = models.ForeignKey(SitePage, on_delete=models.CASCADE, related_name='comprehensive_edit_sessions', verbose_name="Page")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    started_at = models.DateTimeField(auto_now_add=True, verbose_name="Démarrée le")
    last_activity = models.DateTimeField(auto_now=True, verbose_name="Dernière activité")
    
    class Meta:
        verbose_name = "Session d'Édition"
        verbose_name_plural = "Sessions d'Édition"
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"{self.user.email} - {self.page.title}"

class ComprehensivePendingChange(models.Model):
    """Changements en attente pour le mode aperçu"""
    
    session = models.ForeignKey(ComprehensiveEditSession, on_delete=models.CASCADE, related_name='comprehensive_pending_changes', verbose_name="Session")
    content_block = models.ForeignKey(ContentBlock, on_delete=models.CASCADE, related_name='comprehensive_pending_changes', verbose_name="Bloc de contenu")
    field_name = models.CharField(max_length=50, verbose_name="Nom du champ")
    old_value = models.TextField(blank=True, verbose_name="Ancienne valeur")
    new_value = models.TextField(blank=True, verbose_name="Nouvelle valeur")
    change_type = models.CharField(max_length=20, choices=[
        ('update', 'Mise à jour'),
        ('create', 'Création'),
        ('delete', 'Suppression'),
    ], verbose_name="Type de changement")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    
    class Meta:
        verbose_name = "Changement en Attente"
        verbose_name_plural = "Changements en Attente"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.content_block} - {self.field_name} ({self.change_type})"

class ContactField(models.Model):
    """Champs personnalisés pour le formulaire de contact"""
    
    FIELD_TYPE_CHOICES = [
        ('text', 'Texte'),
        ('email', 'Email'),
        ('textarea', 'Zone de texte'),
        ('select', 'Liste déroulante'),
        ('checkbox', 'Case à cocher'),
        ('radio', 'Boutons radio'),
        ('number', 'Nombre'),
        ('phone', 'Téléphone'),
        ('url', 'URL'),
        ('date', 'Date'),
    ]
    
    # Identification du champ
    field_name = models.CharField(max_length=100, unique=True, verbose_name="Nom du champ", help_text="Nom technique du champ (ex: name, email)")
    field_label = models.CharField(max_length=200, verbose_name="Label affiché", help_text="Label affiché à l'utilisateur")
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES, default='text', verbose_name="Type de champ")
    
    # Configuration du champ
    field_placeholder = models.CharField(max_length=200, blank=True, verbose_name="Placeholder", help_text="Texte d'aide dans le champ")
    is_required = models.BooleanField(default=False, verbose_name="Champ obligatoire")
    is_visible = models.BooleanField(default=True, verbose_name="Visible")
    
    # Options pour les champs select/checkbox/radio
    options = models.JSONField(default=list, blank=True, verbose_name="Options", help_text="Liste des options pour select/checkbox/radio")
    
    # Validation
    validation_pattern = models.CharField(max_length=200, blank=True, verbose_name="Pattern de validation", help_text="Expression régulière pour validation")
    validation_message = models.CharField(max_length=200, blank=True, verbose_name="Message de validation")
    
    # Configuration avancée
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre d'affichage")
    css_classes = models.CharField(max_length=200, blank=True, verbose_name="Classes CSS")
    
    # Métadonnées
    help_text = models.TextField(blank=True, verbose_name="Texte d'aide", help_text="Texte d'aide sous le champ")
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Créé par")
    
    class Meta:
        verbose_name = "Champ de contact"
        verbose_name_plural = "Champs de contact"
        ordering = ['order', 'field_label']
    
    def __str__(self):
        return f"{self.field_label} ({self.field_type})"
    
    def get_options_list(self):
        """Retourne la liste des options pour les champs select/checkbox/radio"""
        if isinstance(self.options, list):
            return self.options
        elif isinstance(self.options, str):
            try:
                import json
                return json.loads(self.options)
            except:
                return self.options.split('\n') if self.options else []
        return []

class Review(models.Model):
    """Avis clients liés aux services"""
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
        ('archived', 'Archivé'),
    ]
    
    # Informations client
    author_name = models.CharField(max_length=100, verbose_name="Nom de l'auteur")
    author_email = models.EmailField(verbose_name="Email de l'auteur")
    author_phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone de l'auteur")
    
    # Service concerné
    service_name = models.CharField(max_length=200, verbose_name="Nom du service")
    service_type = models.CharField(max_length=50, verbose_name="Type de service", help_text="Formation, Signal, Gestion de compte, etc.")
    
    # Contenu de l'avis
    title = models.CharField(max_length=200, verbose_name="Titre de l'avis")
    content = models.TextField(verbose_name="Contenu de l'avis")
    rating = models.PositiveIntegerField(default=5, verbose_name="Note", help_text="Note sur 5 étoiles")
    
    # Métadonnées
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")
    is_featured = models.BooleanField(default=False, verbose_name="Mise en avant")
    is_public = models.BooleanField(default=False, verbose_name="Public")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre d'affichage")
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name="Approuvé le")
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Approuvé par")
    
    class Meta:
        verbose_name = "Avis Client"
        verbose_name_plural = "Avis Clients"
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return f"{self.author_name} - {self.service_name} ({self.rating}★)"
