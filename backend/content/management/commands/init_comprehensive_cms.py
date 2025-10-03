from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from content.models_comprehensive_cms import (
    GlobalSettings, PageCategory, SitePage, ContentBlock
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Initialise le système CMS complet avec les données de base'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force la réinitialisation même si des données existent',
        )

    def handle(self, *args, **options):
        force = options['force']
        
        self.stdout.write(
            self.style.SUCCESS('🚀 Initialisation du système CMS complet...')
        )

        with transaction.atomic():
            # 1. Créer les paramètres globaux
            self.create_global_settings(force)
            
            # 2. Créer les catégories de pages
            self.create_page_categories(force)
            
            # 3. Créer les pages principales
            self.create_main_pages(force)
            
            # 4. Créer le contenu de base pour chaque page
            self.create_base_content(force)

        self.stdout.write(
            self.style.SUCCESS('✅ Initialisation terminée avec succès!')
        )

    def create_global_settings(self, force=False):
        """Créer les paramètres globaux"""
        if GlobalSettings.objects.exists() and not force:
            self.stdout.write(
                self.style.WARNING('⚠️  Paramètres globaux déjà existants, ignorés')
            )
            return

        if force:
            GlobalSettings.objects.all().delete()

        settings = GlobalSettings.objects.create(
            site_name="CALMNESS FI",
            site_tagline="Votre partenaire de confiance pour le trading",
            site_description="CALMNESS FI propose des formations de trading, des signaux premium et une gestion de comptes professionnelle pour vous accompagner dans vos investissements.",
            email_contact="contact@calmnessfi.com",
            phone_contact="+33 1 23 45 67 89",
            address="123 Avenue des Champs-Élysées, 75008 Paris, France",
            social_networks={
                "facebook": "https://facebook.com/calmnessfi",
                "twitter": "https://twitter.com/calmnessfi",
                "instagram": "https://instagram.com/calmnessfi",
                "linkedin": "https://linkedin.com/company/calmnessfi",
                "telegram": "https://t.me/calmnessfi"
            },
            copyright_text="© 2024 CALMNESS FI. Tous droits réservés."
        )

        self.stdout.write(
            self.style.SUCCESS(f'✅ Paramètres globaux créés: {settings.site_name}')
        )

    def create_page_categories(self, force=False):
        """Créer les catégories de pages"""
        if PageCategory.objects.exists() and not force:
            self.stdout.write(
                self.style.WARNING('⚠️  Catégories déjà existantes, ignorées')
            )
            return

        if force:
            PageCategory.objects.all().delete()

        categories = [
            {
                'name': 'Navigation',
                'slug': 'navigation',
                'description': 'Pages de navigation principales',
                'icon': 'Navigation',
                'order': 1
            },
            {
                'name': 'Contenu',
                'slug': 'content',
                'description': 'Pages de contenu informatif',
                'icon': 'FileText',
                'order': 2
            },
            {
                'name': 'Services',
                'slug': 'services',
                'description': 'Pages liées aux services',
                'icon': 'Package',
                'order': 3
            },
            {
                'name': 'Support',
                'slug': 'support',
                'description': 'Pages d\'aide et support',
                'icon': 'HelpCircle',
                'order': 4
            }
        ]

        for cat_data in categories:
            category = PageCategory.objects.create(**cat_data)
            self.stdout.write(
                self.style.SUCCESS(f'✅ Catégorie créée: {category.name}')
            )

    def create_main_pages(self, force=False):
        """Créer les pages principales"""
        if SitePage.objects.exists() and not force:
            self.stdout.write(
                self.style.WARNING('⚠️  Pages déjà existantes, ignorées')
            )
            return

        if force:
            SitePage.objects.all().delete()

        # Récupérer les catégories
        nav_category = PageCategory.objects.get(slug='navigation')
        content_category = PageCategory.objects.get(slug='content')
        services_category = PageCategory.objects.get(slug='services')
        support_category = PageCategory.objects.get(slug='support')

        pages = [
            {
                'name': 'Header',
                'slug': 'header',
                'title': 'En-tête du site',
                'description': 'Contenu de l\'en-tête (logo, navigation, etc.)',
                'category': nav_category,
                'meta_title': 'CALMNESS FI - Trading Professionnel',
                'meta_description': 'CALMNESS FI, votre partenaire de confiance pour le trading professionnel',
                'is_active': True,
                'is_public': True
            },
            {
                'name': 'Footer',
                'slug': 'footer',
                'title': 'Pied de page',
                'description': 'Contenu du pied de page (liens, copyright, etc.)',
                'category': nav_category,
                'is_active': True,
                'is_public': True
            },
            {
                'name': 'Accueil',
                'slug': 'home',
                'title': 'Page d\'accueil',
                'description': 'Page principale du site',
                'category': content_category,
                'meta_title': 'CALMNESS FI - Accueil',
                'meta_description': 'Découvrez CALMNESS FI et nos services de trading professionnel',
                'is_active': True,
                'is_public': True
            },
            {
                'name': 'Services',
                'slug': 'services',
                'title': 'Nos Services',
                'description': 'Présentation des services proposés',
                'category': services_category,
                'meta_title': 'Nos Services - CALMNESS FI',
                'meta_description': 'Découvrez nos formations, signaux et gestion de comptes',
                'is_active': True,
                'is_public': True
            },
            {
                'name': 'Formations',
                'slug': 'formations',
                'title': 'Formations Trading',
                'description': 'Page dédiée aux formations',
                'category': services_category,
                'meta_title': 'Formations Trading - CALMNESS FI',
                'meta_description': 'Apprenez le trading avec nos formations professionnelles',
                'is_active': True,
                'is_public': True
            },
            {
                'name': 'Signaux',
                'slug': 'signaux',
                'title': 'Signaux de Trading',
                'description': 'Page dédiée aux signaux premium',
                'category': services_category,
                'meta_title': 'Signaux Trading - CALMNESS FI',
                'meta_description': 'Recevez nos signaux de trading premium',
                'is_active': True,
                'is_public': True
            },
            {
                'name': 'FAQ',
                'slug': 'faq',
                'title': 'Questions Fréquentes',
                'description': 'Page des questions fréquemment posées',
                'category': support_category,
                'meta_title': 'FAQ - CALMNESS FI',
                'meta_description': 'Trouvez les réponses à vos questions',
                'is_active': True,
                'is_public': True
            },
            {
                'name': 'Contact',
                'slug': 'contact',
                'title': 'Contact',
                'description': 'Page de contact',
                'category': support_category,
                'meta_title': 'Contact - CALMNESS FI',
                'meta_description': 'Contactez notre équipe',
                'is_active': True,
                'is_public': True
            }
        ]

        for page_data in pages:
            page = SitePage.objects.create(**page_data)
            self.stdout.write(
                self.style.SUCCESS(f'✅ Page créée: {page.title}')
            )

    def create_base_content(self, force=False):
        """Créer le contenu de base pour chaque page"""
        if ContentBlock.objects.exists() and not force:
            self.stdout.write(
                self.style.WARNING('⚠️  Contenu déjà existant, ignoré')
            )
            return

        if force:
            ContentBlock.objects.all().delete()

        # Récupérer les pages
        header_page = SitePage.objects.get(slug='header')
        footer_page = SitePage.objects.get(slug='footer')
        home_page = SitePage.objects.get(slug='home')
        services_page = SitePage.objects.get(slug='services')

        # Contenu pour l'en-tête
        header_blocks = [
            {
                'page': header_page,
                'block_key': 'header_logo',
                'content_type': 'text',
                'title': 'Nom du site',
                'content': 'CALMNESS FI',
                'css_classes': 'text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent',
                'order': 1
            },
            {
                'page': header_page,
                'block_key': 'nav_home',
                'content_type': 'text',
                'title': 'Lien Accueil',
                'content': 'Accueil',
                'order': 2
            },
            {
                'page': header_page,
                'block_key': 'nav_services',
                'content_type': 'text',
                'title': 'Lien Services',
                'content': 'Services',
                'order': 3
            },
            {
                'page': header_page,
                'block_key': 'nav_reviews',
                'content_type': 'text',
                'title': 'Lien Avis',
                'content': 'Avis',
                'order': 4
            },
            {
                'page': header_page,
                'block_key': 'nav_faq',
                'content_type': 'text',
                'title': 'Lien FAQ',
                'content': 'FAQ',
                'order': 5
            },
            {
                'page': header_page,
                'block_key': 'nav_contact',
                'content_type': 'text',
                'title': 'Lien Contact',
                'content': 'Contact',
                'order': 6
            },
            {
                'page': header_page,
                'block_key': 'nav_connexion',
                'content_type': 'text',
                'title': 'Bouton Connexion',
                'content': 'Connexion',
                'order': 7
            },
            {
                'page': header_page,
                'block_key': 'nav_commencer',
                'content_type': 'text',
                'title': 'Bouton Commencer',
                'content': 'Commencer',
                'order': 8
            }
        ]

        # Contenu pour le pied de page
        footer_blocks = [
            {
                'page': footer_page,
                'block_key': 'footer_logo',
                'content_type': 'text',
                'title': 'Logo du pied de page',
                'content': 'CALMNESS FI',
                'css_classes': 'text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent',
                'order': 1
            },
            {
                'page': footer_page,
                'block_key': 'footer_tagline',
                'content_type': 'text',
                'title': 'Slogan du pied de page',
                'content': 'Votre partenaire de confiance pour le trading',
                'css_classes': 'text-sm text-muted-foreground',
                'order': 2
            },
            {
                'page': footer_page,
                'block_key': 'footer_services_title',
                'content_type': 'text',
                'title': 'Titre section Services',
                'content': 'Services',
                'css_classes': 'font-semibold',
                'order': 3
            },
            {
                'page': footer_page,
                'block_key': 'footer_support_title',
                'content_type': 'text',
                'title': 'Titre section Support',
                'content': 'Support',
                'css_classes': 'font-semibold',
                'order': 4
            },
            {
                'page': footer_page,
                'block_key': 'footer_legal_title',
                'content_type': 'text',
                'title': 'Titre section Légal',
                'content': 'Légal',
                'css_classes': 'font-semibold',
                'order': 5
            },
            {
                'page': footer_page,
                'block_key': 'footer_copyright',
                'content_type': 'text',
                'title': 'Copyright',
                'content': '© 2024 CALMNESS FI. Tous droits réservés.',
                'css_classes': 'text-sm text-muted-foreground',
                'order': 6
            }
        ]

        # Contenu pour la page d'accueil
        home_blocks = [
            {
                'page': home_page,
                'block_key': 'hero_title',
                'content_type': 'heading',
                'title': 'Titre principal',
                'content': 'CALMNESS FI',
                'css_classes': 'text-4xl md:text-6xl font-bold text-center mb-6',
                'order': 1
            },
            {
                'page': home_page,
                'block_key': 'hero_subtitle',
                'content_type': 'text',
                'title': 'Sous-titre',
                'content': 'Votre partenaire de confiance pour le trading',
                'css_classes': 'text-xl text-center mb-8 text-muted-foreground',
                'order': 2
            },
            {
                'page': home_page,
                'block_key': 'hero_description',
                'content_type': 'paragraph',
                'title': 'Description',
                'content': 'Découvrez nos formations de trading, signaux premium et services de gestion de comptes. Rejoignez des milliers de traders qui nous font confiance.',
                'css_classes': 'text-lg text-center mb-10 max-w-2xl mx-auto',
                'order': 3
            },
            {
                'page': home_page,
                'block_key': 'services_title',
                'content_type': 'heading',
                'title': 'Titre section Services',
                'content': 'Nos Services',
                'css_classes': 'text-3xl font-bold text-center mb-12',
                'order': 4
            },
            {
                'page': home_page,
                'block_key': 'services_description',
                'content_type': 'paragraph',
                'title': 'Description des services',
                'content': 'Nous proposons une gamme complète de services pour vous accompagner dans votre parcours de trading.',
                'css_classes': 'text-center mb-12 text-muted-foreground max-w-2xl mx-auto',
                'order': 5
            }
        ]

        # Contenu pour la page services
        services_blocks = [
            {
                'page': services_page,
                'block_key': 'services_page_title',
                'content_type': 'heading',
                'title': 'Titre de la page',
                'content': 'Nos Services',
                'css_classes': 'text-4xl font-bold text-center mb-6',
                'order': 1
            },
            {
                'page': services_page,
                'block_key': 'services_page_description',
                'content_type': 'paragraph',
                'title': 'Description de la page',
                'content': 'Découvrez notre gamme complète de services conçus pour vous accompagner dans votre parcours de trading professionnel.',
                'css_classes': 'text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto',
                'order': 2
            }
        ]

        # Créer tous les blocs
        all_blocks = header_blocks + footer_blocks + home_blocks + services_blocks

        for block_data in all_blocks:
            block = ContentBlock.objects.create(**block_data)
            self.stdout.write(
                self.style.SUCCESS(f'✅ Bloc créé: {block.page.title} - {block.block_key}')
            )

        self.stdout.write(
            self.style.SUCCESS(f'✅ {len(all_blocks)} blocs de contenu créés')
        )
