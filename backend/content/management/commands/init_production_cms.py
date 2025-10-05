from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import SitePage, ContentBlock, GlobalSettings, ContactField

class Command(BaseCommand):
    help = 'Initialise les données CMS pour la production'

    def handle(self, *args, **options):
        self.stdout.write("🚀 Initialisation des données CMS pour la production...")
        
        try:
            self.create_pages()
            self.create_basic_content_blocks()
            self.create_global_settings()
            self.create_contact_fields()
            
            self.stdout.write(self.style.SUCCESS("\n✅ Initialisation terminée avec succès!"))
            
            # Vérification
            pages_count = SitePage.objects.count()
            blocks_count = ContentBlock.objects.count()
            settings_count = GlobalSettings.objects.count()
            fields_count = ContactField.objects.count()
            
            self.stdout.write(f"\nVérification des données créées:")
            self.stdout.write(f"- Pages: {pages_count}")
            self.stdout.write(f"- Blocs de contenu: {blocks_count}")
            self.stdout.write(f"- Paramètres globaux: {settings_count}")
            self.stdout.write(f"- Champs de contact: {fields_count}")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Erreur lors de l'initialisation: {str(e)}"))

    def create_pages(self):
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
                self.stdout.write(f"✅ Page créée: {page.name}")
            else:
                self.stdout.write(f"ℹ️  Page existante: {page.name}")

    def create_basic_content_blocks(self):
        """Créer des blocs de contenu de base"""
        
        # Header content
        try:
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
                    self.stdout.write(f"✅ Bloc header créé: {block.block_key}")
        except SitePage.DoesNotExist:
            self.stdout.write(self.style.WARNING("⚠️  Page 'header' non trouvée, création des blocs ignorée"))
        
        # Footer content
        try:
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
                    self.stdout.write(f"✅ Bloc footer créé: {block.block_key}")
        except SitePage.DoesNotExist:
            self.stdout.write(self.style.WARNING("⚠️  Page 'footer' non trouvée, création des blocs ignorée"))
        
        # Home page content
        try:
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
                    self.stdout.write(f"✅ Bloc home créé: {block.block_key}")
        except SitePage.DoesNotExist:
            self.stdout.write(self.style.WARNING("⚠️  Page 'home' non trouvée, création des blocs ignorée"))

    def create_global_settings(self):
        """Créer les paramètres globaux"""
        settings_data = {
            'site_name': 'Calmness Trading',
            'site_tagline': 'Votre partenaire trading professionnel',
            'site_description': 'Formation et services trading professionnel',
            'email_contact': 'contact@calmnesstrading.com',
            'phone_contact': '+33 1 23 45 67 89',
            'contact_email': 'contact@calmnesstrading.com',
            'contact_phone': '+33 1 23 45 67 89',
            'address': '123 Rue du Trading, 75001 Paris, France',
            'contact_title': 'Plusieurs façons de nous joindre',
            'business_hours': 'Lun-Ven: 9h-18h',
            'telegram_support': '@calmness_trading',
            'support_description': 'Support 24/7',
            'copyright_text': '© 2024 Calmness Trading. Tous droits réservés.',
            'social_networks': {
                'facebook': 'https://facebook.com/calmnesstrading',
                'twitter': 'https://twitter.com/calmnesstrading',
                'linkedin': 'https://linkedin.com/company/calmnesstrading'
            }
        }
        
        # Créer ou mettre à jour l'objet GlobalSettings
        setting, created = GlobalSettings.objects.get_or_create(
            defaults=settings_data
        )
        
        if created:
            self.stdout.write("✅ Paramètres globaux créés")
        else:
            # Mettre à jour les champs vides
            updated_fields = []
            for field, value in settings_data.items():
                if not getattr(setting, field, None):
                    setattr(setting, field, value)
                    updated_fields.append(field)
            
            if updated_fields:
                setting.save()
                self.stdout.write(f"✅ Paramètres globaux mis à jour: {', '.join(updated_fields)}")
            else:
                self.stdout.write("ℹ️  Paramètres globaux déjà configurés")

    def create_contact_fields(self):
        """Créer les champs de contact par défaut"""
        contact_fields = [
            {
                'field_name': 'name',
                'field_type': 'text',
                'field_label': 'Nom complet',
                'field_placeholder': 'Votre nom complet',
                'is_required': True,
                'is_visible': True,
                'order': 1
            },
            {
                'field_name': 'email',
                'field_type': 'email',
                'field_label': 'Adresse email',
                'field_placeholder': 'votre@email.com',
                'is_required': True,
                'is_visible': True,
                'order': 2
            },
            {
                'field_name': 'phone',
                'field_type': 'tel',
                'field_label': 'Téléphone (optionnel)',
                'field_placeholder': '+33 1 23 45 67 89',
                'is_required': False,
                'is_visible': True,
                'order': 3
            },
            {
                'field_name': 'subject',
                'field_type': 'text',
                'field_label': 'Sujet',
                'field_placeholder': 'Objet de votre message',
                'is_required': True,
                'is_visible': True,
                'order': 4
            },
            {
                'field_name': 'message',
                'field_type': 'textarea',
                'field_label': 'Message',
                'field_placeholder': 'Votre message...',
                'is_required': True,
                'is_visible': True,
                'order': 5
            }
        ]
        
        for field_data in contact_fields:
            field, created = ContactField.objects.get_or_create(
                field_name=field_data['field_name'],
                defaults=field_data
            )
            
            if created:
                self.stdout.write(f"✅ Champ de contact créé: {field_data['field_name']}")
            else:
                self.stdout.write(f"ℹ️  Champ de contact existant: {field_data['field_name']}")
