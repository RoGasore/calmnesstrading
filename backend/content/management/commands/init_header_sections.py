from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from content.models_cms import Page, ContentSection

User = get_user_model()

class Command(BaseCommand):
    help = 'Initialise les sections de contenu pour le Header.'

    def handle(self, *args, **options):
        self.stdout.write('Initialisation des sections du Header...')

        # Créer ou récupérer la page Header
        page, created = Page.objects.get_or_create(
            slug='header',
            defaults={
                'name': 'Header',
                'title': 'Header',
                'description': 'En-tête du site avec navigation et logo',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('Page Header créée')
        else:
            self.stdout.write('Page Header existante')

        # Sections du Header
        sections_data = [
            {
                'section_key': 'header_logo',
                'title': 'Logo du site',
                'content': 'CALMNESS FI',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'nav_home',
                'title': 'Navigation - Accueil',
                'content': 'Accueil',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'nav_reviews',
                'title': 'Navigation - Avis',
                'content': 'Avis',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'nav_faq',
                'title': 'Navigation - FAQ',
                'content': 'FAQ',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'nav_contact',
                'title': 'Navigation - Contact',
                'content': 'Contact',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'nav_connexion',
                'title': 'Bouton - Connexion',
                'content': 'Connexion',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'nav_commencer',
                'title': 'Bouton - Commencer',
                'content': 'Commencer',
                'content_type': 'text',
                'metadata': {}
            },
        ]

        # Créer les sections
        for i, section_data in enumerate(sections_data, start=100):
            section, created = ContentSection.objects.get_or_create(
                page=page,
                section_key=section_data['section_key'],
                defaults={
                    'title': section_data['title'],
                    'content': section_data['content'],
                    'content_type': section_data['content_type'],
                    'metadata': section_data['metadata'],
                    'is_visible': True,
                    'order': i
                }
            )
            
            if created:
                self.stdout.write(f'Section créée: {section.section_key}')
            else:
                self.stdout.write(f'Section existante: {section.section_key}')

        self.stdout.write(self.style.SUCCESS('Initialisation des sections du Header terminée avec succès!'))
