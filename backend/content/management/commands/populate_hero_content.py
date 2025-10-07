from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import SitePage, ContentBlock
from accounts.models import User

class Command(BaseCommand):
    help = 'Populate hero content blocks for homepage'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting hero content population...'))

        # Get or create the 'home' page
        home_page, created = SitePage.objects.get_or_create(
            slug='home',
            defaults={
                'name': 'Accueil',
                'title': 'Page d\'Accueil',
                'description': 'Page principale du site',
                'is_published': True,
                'template_name': 'home_page_template.html'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Page d\'accueil créée: {home_page.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Page d\'accueil trouvée: {home_page.name}'))

        # Get an admin user for content creation
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('No admin user found. Please create an admin user first.'))
            return

        # Hero content blocks
        hero_blocks_data = [
            {
                'block_key': 'hero_main_title',
                'content': 'Mange. Dors. Trade. Répète.',
                'content_type': 'text',
                'title': 'Titre principal',
                'order': 10,
                'is_visible': True,
                'is_editable': True
            },
            {
                'block_key': 'hero_subtitle',
                'content': 'La routine qui peut transformer votre vie.',
                'content_type': 'text',
                'title': 'Sous-titre',
                'order': 20,
                'is_visible': True,
                'is_editable': True
            },
            {
                'block_key': 'hero_description',
                'content': 'Formez-vous. Copiez nos signaux. Confiez-nous votre compte.',
                'content_type': 'text',
                'title': 'Description',
                'order': 30,
                'is_visible': True,
                'is_editable': True
            },
            {
                'block_key': 'hero_cta1',
                'content': 'Rejoindre notre communauté',
                'content_type': 'text',
                'title': 'Bouton 1',
                'order': 40,
                'is_visible': True,
                'is_editable': True
            },
            {
                'block_key': 'hero_cta2',
                'content': 'Voir nos services',
                'content_type': 'text',
                'title': 'Bouton 2',
                'order': 50,
                'is_visible': True,
                'is_editable': True
            }
        ]

        created_count = 0
        updated_count = 0

        for block_data in hero_blocks_data:
            block, created = ContentBlock.objects.update_or_create(
                page=home_page,
                block_key=block_data['block_key'],
                defaults={
                    'content': block_data['content'],
                    'content_type': block_data['content_type'],
                    'title': block_data['title'],
                    'order': block_data['order'],
                    'is_visible': block_data['is_visible'],
                    'is_editable': block_data['is_editable'],
                    'updated_by': admin_user,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f'  Created: {block.title} ({block.block_key})')
            else:
                updated_count += 1
                self.stdout.write(f'  Updated: {block.title} ({block.block_key})')

        self.stdout.write(
            self.style.SUCCESS(
                f'Hero content population completed! {created_count} blocks created, {updated_count} blocks updated.'
            )
        )



