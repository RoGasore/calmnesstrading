from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from content.models_cms import Page, ContentSection

User = get_user_model()

class Command(BaseCommand):
    help = 'Initialise toutes les pages CMS du site.'

    def handle(self, *args, **options):
        self.stdout.write('Initialisation de toutes les pages CMS...')

        # Pages à créer
        pages_data = [
            {
                'slug': 'tarifs',
                'name': 'Tarifs',
                'title': 'Tarifs',
                'description': 'Page des tarifs et abonnements'
            },
            {
                'slug': 'contact',
                'name': 'Contact',
                'title': 'Contact',
                'description': 'Page de contact'
            },
            {
                'slug': 'faq',
                'name': 'FAQ',
                'title': 'FAQ',
                'description': 'Page des questions fréquentes'
            },
            {
                'slug': 'reviews',
                'name': 'Avis',
                'title': 'Avis',
                'description': 'Page des avis clients'
            },
            {
                'slug': 'formations',
                'name': 'Formations',
                'title': 'Formations',
                'description': 'Page des formations'
            },
            {
                'slug': 'signaux',
                'name': 'Signaux',
                'title': 'Signaux',
                'description': 'Page des signaux de trading'
            },
            {
                'slug': 'login',
                'name': 'Connexion',
                'title': 'Connexion',
                'description': 'Page de connexion'
            },
            {
                'slug': 'register',
                'name': 'Inscription',
                'title': 'Inscription',
                'description': 'Page d\'inscription'
            },
        ]

        # Créer les pages
        for page_data in pages_data:
            page, created = Page.objects.get_or_create(
                slug=page_data['slug'],
                defaults={
                    'name': page_data['name'],
                    'title': page_data['title'],
                    'description': page_data['description'],
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(f'Page créée: {page.name}')
            else:
                self.stdout.write(f'Page existante: {page.name}')

        self.stdout.write(self.style.SUCCESS('Initialisation de toutes les pages terminée avec succès!'))
