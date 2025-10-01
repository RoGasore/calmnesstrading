from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinLengthValidator
import json

User = get_user_model()

class Page(models.Model):
    """Modèle pour les pages du site"""
    
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom de la page")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    title = models.CharField(max_length=200, verbose_name="Titre de la page")
    description = models.TextField(blank=True, verbose_name="Description")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    class Meta:
        verbose_name = "Page"
        verbose_name_plural = "Pages"
        ordering = ['name']
    
    def __str__(self):
        return self.title

class ContentSection(models.Model):
    """Modèle pour les sections de contenu d'une page"""
    
    CONTENT_TYPES = [
        ('text', 'Texte'),
        ('heading', 'Titre'),
        ('image', 'Image'),
        ('button', 'Bouton'),
        ('card', 'Carte'),
        ('list', 'Liste'),
        ('hero', 'Section Hero'),
        ('pricing', 'Tarifs'),
        ('testimonial', 'Témoignage'),
        ('feature', 'Fonctionnalité'),
        ('stats', 'Statistiques'),
    ]
    
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='sections', verbose_name="Page")
    section_key = models.CharField(max_length=100, verbose_name="Clé de section")
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES, verbose_name="Type de contenu")
    title = models.CharField(max_length=200, blank=True, verbose_name="Titre")
    content = models.TextField(blank=True, verbose_name="Contenu")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Métadonnées")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre")
    is_editable = models.BooleanField(default=True, verbose_name="Éditable")
    is_visible = models.BooleanField(default=True, verbose_name="Visible")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    class Meta:
        verbose_name = "Section de Contenu"
        verbose_name_plural = "Sections de Contenu"
        ordering = ['page', 'order', 'section_key']
        unique_together = ['page', 'section_key']
    
    def __str__(self):
        return f"{self.page.title} - {self.section_key}"

class ContentVersion(models.Model):
    """Modèle pour l'historique des versions de contenu"""
    
    section = models.ForeignKey(ContentSection, on_delete=models.CASCADE, related_name='versions', verbose_name="Section")
    title = models.CharField(max_length=200, blank=True, verbose_name="Titre")
    content = models.TextField(blank=True, verbose_name="Contenu")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Métadonnées")
    version_number = models.PositiveIntegerField(verbose_name="Numéro de version")
    change_summary = models.CharField(max_length=500, blank=True, verbose_name="Résumé des changements")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='content_versions', verbose_name="Créé par")
    
    class Meta:
        verbose_name = "Version de Contenu"
        verbose_name_plural = "Versions de Contenu"
        ordering = ['-created_at']
        unique_together = ['section', 'version_number']
    
    def __str__(self):
        return f"{self.section} - Version {self.version_number}"

class AdminPassword(models.Model):
    """Modèle pour stocker le mot de passe admin pour l'édition"""
    
    password_hash = models.CharField(max_length=255, verbose_name="Hash du mot de passe")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_passwords', verbose_name="Mis à jour par")
    
    class Meta:
        verbose_name = "Mot de Passe Admin"
        verbose_name_plural = "Mots de Passe Admin"
    
    def __str__(self):
        return f"Mot de passe admin - {self.updated_at.strftime('%d/%m/%Y %H:%M')}"

class ContentEditSession(models.Model):
    """Modèle pour suivre les sessions d'édition"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='edit_sessions', verbose_name="Utilisateur")
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='edit_sessions', verbose_name="Page")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    started_at = models.DateTimeField(auto_now_add=True, verbose_name="Démarrée le")
    last_activity = models.DateTimeField(auto_now=True, verbose_name="Dernière activité")
    
    class Meta:
        verbose_name = "Session d'Édition"
        verbose_name_plural = "Sessions d'Édition"
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"{self.user.email} - {self.page.title}"

class ContentChange(models.Model):
    """Modèle pour suivre les changements en cours d'édition"""
    
    session = models.ForeignKey(ContentEditSession, on_delete=models.CASCADE, related_name='changes', verbose_name="Session")
    section = models.ForeignKey(ContentSection, on_delete=models.CASCADE, related_name='pending_changes', verbose_name="Section")
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
        verbose_name = "Changement de Contenu"
        verbose_name_plural = "Changements de Contenu"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.section} - {self.field_name} ({self.change_type})"


class Translation(models.Model):
    """Modèle pour stocker les traductions des contenus"""
    
    LANGUAGE_CHOICES = [
        ('fr', 'Français'),
        ('en', 'English'),
        ('es', 'Español'),
    ]
    
    section = models.ForeignKey(ContentSection, on_delete=models.CASCADE, related_name='translations', verbose_name="Section")
    field_name = models.CharField(max_length=50, verbose_name="Nom du champ")
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, verbose_name="Langue")
    translated_content = models.TextField(verbose_name="Contenu traduit")
    is_auto_generated = models.BooleanField(default=True, verbose_name="Généré automatiquement")
    is_manual_override = models.BooleanField(default=False, verbose_name="Modification manuelle")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Créé par")
    
    class Meta:
        verbose_name = "Traduction"
        verbose_name_plural = "Traductions"
        ordering = ['section', 'language', 'field_name']
        unique_together = ['section', 'field_name', 'language']
    
    def __str__(self):
        return f"{self.section.section_key} - {self.field_name} ({self.language})"
