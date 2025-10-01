from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from content.models_cms import Page, ContentSection, AdminPassword
from django.contrib.auth.hashers import make_password

User = get_user_model()

class Command(BaseCommand):
    help = 'Initialise le contenu CMS avec des données de base'

    def add_arguments(self, parser):
        parser.add_argument(
            '--admin-password',
            type=str,
            default='admin123',
            help='Mot de passe admin pour l\'édition (défaut: admin123)'
        )

    def handle(self, *args, **options):
        self.stdout.write('Initialisation du contenu CMS...')

        # Créer les pages de base
        pages_data = [
            {
                'name': 'home',
                'slug': 'home',
                'title': 'Accueil',
                'description': 'Page d\'accueil du site'
            },
            {
                'name': 'services',
                'slug': 'services',
                'title': 'Services',
                'description': 'Page des services'
            },
            {
                'name': 'formations',
                'slug': 'services/formations',
                'title': 'Formations',
                'description': 'Page des formations'
            },
            {
                'name': 'signaux',
                'slug': 'services/signaux',
                'title': 'Signaux',
                'description': 'Page des signaux'
            },
            {
                'name': 'gestion',
                'slug': 'services/gestion',
                'title': 'Gestion de Comptes',
                'description': 'Page de gestion de comptes'
            }
        ]

        for page_data in pages_data:
            page, created = Page.objects.get_or_create(
                slug=page_data['slug'],
                defaults=page_data
            )
            if created:
                self.stdout.write(f'Page créée: {page.title}')
            else:
                self.stdout.write(f'Page existante: {page.title}')

        # Créer des sections de contenu pour la page d'accueil
        home_page = Page.objects.get(slug='home')
        
        home_sections = [
            {
                'section_key': 'hero_title',
                'content_type': 'heading',
                'title': 'Maîtrisez le Trading avec Chart Guru Prime',
                'content': 'Maîtrisez le Trading avec Chart Guru Prime',
                'order': 1
            },
            {
                'section_key': 'hero_subtitle',
                'content_type': 'text',
                'title': 'Sous-titre Hero',
                'content': 'Découvrez nos formations professionnelles, signaux en temps réel et services de gestion de comptes pour réussir en trading.',
                'order': 2
            },
            {
                'section_key': 'hero_image',
                'content_type': 'image',
                'title': 'Image Hero',
                'content': '/assets/hero-trading.jpg',
                'metadata': {'alt': 'Trading professionnel'},
                'order': 3
            },
            {
                'section_key': 'services_title',
                'content_type': 'heading',
                'title': 'Nos Services',
                'content': 'Nos Services',
                'order': 4
            },
            {
                'section_key': 'services_description',
                'content_type': 'text',
                'title': 'Description Services',
                'content': 'Découvrez notre gamme complète de services de trading professionnels conçus pour vous accompagner dans votre réussite.',
                'order': 5
            }
        ]

        for section_data in home_sections:
            section, created = ContentSection.objects.get_or_create(
                page=home_page,
                section_key=section_data['section_key'],
                defaults=section_data
            )
            if created:
                self.stdout.write(f'Section créée: {section.section_key}')
            else:
                self.stdout.write(f'Section existante: {section.section_key}')

        # Créer le mot de passe admin
        admin_password = options['admin_password']
        password_obj, created = AdminPassword.objects.get_or_create(
            is_active=True,
            defaults={
                'password_hash': make_password(admin_password),
                'updated_by': User.objects.filter(is_staff=True).first() or User.objects.first()
            }
        )
        
        if created:
            self.stdout.write(f'Mot de passe admin créé: {admin_password}')
        else:
            # Mettre à jour le mot de passe existant
            password_obj.password_hash = make_password(admin_password)
            password_obj.save()
            self.stdout.write(f'Mot de passe admin mis à jour: {admin_password}')

        self.stdout.write(
            self.style.SUCCESS('Initialisation du CMS terminée avec succès!')
        )
        self.stdout.write(
            self.style.WARNING(f'Mot de passe admin: {admin_password}')
        )
