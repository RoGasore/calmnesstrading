#!/usr/bin/env python
"""
Script pour initialiser les données CMS en production
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models_comprehensive_cms import SitePage, ContentBlock, GlobalSettings

def create_pages():
    """Créer les pages de base"""
    pages_data = [
        {
            'name': 'Accueil',
            'slug': 'home',
            'title': 'Calmness Trading - Formation et Services Trading',
            'description': 'Services de formation et accompagnement trading',
            'is_active': True,
            'is_public': True
        },
        {
            'name': 'Services',
            'slug': 'services',
            'title': 'Nos Services - Calmness Trading',
            'description': 'Découvrez nos services de trading',
            'is_active': True,
            'is_public': True
        },
        {
            'name': 'FAQ',
            'slug': 'faq',
            'title': 'Questions Fréquentes - Calmness Trading',
            'description': 'Réponses aux questions les plus fréquentes',
            'is_active': True,
            'is_public': True
        },
        {
            'name': 'Contact',
            'slug': 'contact',
            'title': 'Contact - Calmness Trading',
            'description': 'Contactez-nous pour plus d\'informations',
            'is_active': True,
            'is_public': True
        },
        {
            'name': 'Header',
            'slug': 'header',
            'title': 'En-tête du site',
            'description': 'Navigation principale',
            'is_active': True,
            'is_public': True
        },
        {
            'name': 'Footer',
            'slug': 'footer',
            'title': 'Pied de page',
            'description': 'Informations du footer',
            'is_active': True,
            'is_public': True
        }
    ]
    
    for page_data in pages_data:
        page, created = SitePage.objects.get_or_create(
            slug=page_data['slug'],
            defaults=page_data
        )
        if created:
            print(f"✅ Page créée: {page.name}")
        else:
            print(f"ℹ️  Page existante: {page.name}")

def create_basic_content_blocks():
    """Créer des blocs de contenu de base"""
    
    # Header content
    header_page = SitePage.objects.get(slug='header')
    header_blocks = [
        {'block_key': 'header_logo', 'content': 'Calmness Trading', 'order': 1},
        {'block_key': 'nav_home', 'content': 'Accueil', 'order': 2},
        {'block_key': 'nav_services', 'content': 'Services', 'order': 3},
        {'block_key': 'nav_reviews', 'content': 'Avis', 'order': 4},
        {'block_key': 'nav_faq', 'content': 'FAQ', 'order': 5},
        {'block_key': 'nav_contact', 'content': 'Contact', 'order': 6},
        {'block_key': 'nav_connexion', 'content': 'Connexion', 'order': 7},
        {'block_key': 'nav_commencer', 'content': 'Commencer', 'order': 8},
        {'block_key': 'nav_logo_text', 'content': 'Trading Professionnel', 'order': 9}
    ]
    
    for block_data in header_blocks:
        block, created = ContentBlock.objects.get_or_create(
            page=header_page,
            block_key=block_data['block_key'],
            defaults={
                'content': block_data['content'],
                'order': block_data['order'],
                'is_visible': True
            }
        )
        if created:
            print(f"✅ Bloc header créé: {block.block_key}")
    
    # Footer content
    footer_page = SitePage.objects.get(slug='footer')
    footer_blocks = [
        {'block_key': 'footer_logo', 'content': 'Calmness Trading', 'order': 1},
        {'block_key': 'footer_tagline', 'content': 'Votre partenaire trading professionnel', 'order': 2},
        {'block_key': 'footer_services_title', 'content': 'Nos Services', 'order': 3},
        {'block_key': 'footer_support_title', 'content': 'Support', 'order': 4},
        {'block_key': 'footer_legal_title', 'content': 'Légal', 'order': 5},
        {'block_key': 'footer_copyright', 'content': '© 2024 Calmness Trading. Tous droits réservés.', 'order': 6}
    ]
    
    for block_data in footer_blocks:
        block, created = ContentBlock.objects.get_or_create(
            page=footer_page,
            block_key=block_data['block_key'],
            defaults={
                'content': block_data['content'],
                'order': block_data['order'],
                'is_visible': True
            }
        )
        if created:
            print(f"✅ Bloc footer créé: {block.block_key}")
    
    # Home page content
    home_page = SitePage.objects.get(slug='home')
    home_blocks = [
        {'block_key': 'hero_main_title', 'content': 'Formation Trading Professionnelle', 'order': 1},
        {'block_key': 'hero_subtitle', 'content': 'Maîtrisez le trading avec nos experts', 'order': 2},
        {'block_key': 'hero_description', 'content': 'Rejoignez notre communauté de traders et développez vos compétences avec des formations de qualité.', 'order': 3},
        {'block_key': 'hero_cta1', 'content': 'Commencer maintenant', 'order': 4},
        {'block_key': 'hero_cta2', 'content': 'En savoir plus', 'order': 5}
    ]
    
    for block_data in home_blocks:
        block, created = ContentBlock.objects.get_or_create(
            page=home_page,
            block_key=block_data['block_key'],
            defaults={
                'content': block_data['content'],
                'order': block_data['order'],
                'is_visible': True
            }
        )
        if created:
            print(f"✅ Bloc home créé: {block.block_key}")

def create_global_settings():
    """Créer les paramètres globaux"""
    settings_data = [
        {
            'key': 'site_title',
            'value': 'Calmness Trading',
            'description': 'Titre du site'
        },
        {
            'key': 'site_description',
            'value': 'Formation et services trading professionnel',
            'description': 'Description du site'
        },
        {
            'key': 'contact_email',
            'value': 'contact@calmnesstrading.com',
            'description': 'Email de contact'
        },
        {
            'key': 'contact_phone',
            'value': '+33 1 23 45 67 89',
            'description': 'Téléphone de contact'
        },
        {
            'key': 'business_hours',
            'value': 'Lun-Ven: 9h-18h',
            'description': 'Heures d\'ouverture'
        },
        {
            'key': 'company_address',
            'value': '123 Rue du Trading, 75001 Paris, France',
            'description': 'Adresse de l\'entreprise'
        }
    ]
    
    for setting_data in settings_data:
        setting, created = GlobalSettings.objects.get_or_create(
            key=setting_data['key'],
            defaults={
                'value': setting_data['value'],
                'description': setting_data['description'],
                'is_active': True
            }
        )
        if created:
            print(f"✅ Paramètre global créé: {setting.key}")
        else:
            print(f"ℹ️  Paramètre global existant: {setting.key}")

def main():
    print("🚀 Initialisation des données CMS pour la production...")
    
    try:
        create_pages()
        create_basic_content_blocks()
        create_global_settings()
        
        print("\n✅ Initialisation terminée avec succès!")
        print("\nVérification des données créées:")
        
        pages_count = SitePage.objects.count()
        blocks_count = ContentBlock.objects.count()
        settings_count = GlobalSettings.objects.count()
        
        print(f"- Pages: {pages_count}")
        print(f"- Blocs de contenu: {blocks_count}")
        print(f"- Paramètres globaux: {settings_count}")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
