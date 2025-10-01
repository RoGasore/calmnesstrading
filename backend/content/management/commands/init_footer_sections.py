from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from content.models_cms import Page, ContentSection

User = get_user_model()

class Command(BaseCommand):
    help = 'Initialise les sections de contenu pour le Footer.'

    def handle(self, *args, **options):
        self.stdout.write('Initialisation des sections du Footer...')

        # Créer ou récupérer la page Footer
        page, created = Page.objects.get_or_create(
            slug='footer',
            defaults={
                'name': 'Footer',
                'title': 'Footer',
                'description': 'Pied de page du site avec liens et informations',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('Page Footer créée')
        else:
            self.stdout.write('Page Footer existante')

        # Sections du Footer
        sections_data = [
            {
                'section_key': 'footer_logo',
                'title': 'Logo du footer',
                'content': 'CALMNESS FI',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'footer_tagline',
                'title': 'Description du footer',
                'content': 'Votre partenaire de confiance pour le trading professionnel. Formations expertes, signaux premium et accompagnement personnalisé.',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'footer_services_title',
                'title': 'Titre section Services',
                'content': 'Services',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'footer_support_title',
                'title': 'Titre section Support',
                'content': 'Support',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'footer_legal_title',
                'title': 'Titre section Légal',
                'content': 'Légal',
                'content_type': 'text',
                'metadata': {}
            },
            {
                'section_key': 'footer_copyright',
                'title': 'Copyright',
                'content': '© 2025 CALMNESS FI. Tous droits réservés.',
                'content_type': 'text',
                'metadata': {}
            },
        ]

        # Créer les sections
        for i, section_data in enumerate(sections_data, start=200):
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

        self.stdout.write(self.style.SUCCESS('Initialisation des sections du Footer terminée avec succès!'))
