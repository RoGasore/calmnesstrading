from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import SitePage, ContentBlock, GlobalSettings

class Command(BaseCommand):
    help = 'Vérifier les données CMS existantes'

    def handle(self, *args, **options):
        self.stdout.write("🔍 Vérification des données CMS...")
        
        # Vérifier les pages
        pages = SitePage.objects.all()
        self.stdout.write(f"\n📄 Pages ({pages.count()}):")
        for page in pages:
            self.stdout.write(f"  - {page.slug}: {page.name} (active: {page.is_active}, public: {page.is_public})")
        
        # Vérifier les blocs de contenu
        blocks = ContentBlock.objects.all()
        self.stdout.write(f"\n🧱 Blocs de contenu ({blocks.count()}):")
        for block in blocks[:10]:  # Limiter à 10 pour éviter trop de sortie
            self.stdout.write(f"  - {block.page.slug}.{block.block_key}: {block.content[:50]}...")
        if blocks.count() > 10:
            self.stdout.write(f"  ... et {blocks.count() - 10} autres")
        
        # Vérifier les paramètres globaux
        settings = GlobalSettings.objects.all()
        self.stdout.write(f"\n⚙️  Paramètres globaux ({settings.count()}):")
        for setting in settings:
            self.stdout.write(f"  - ID: {setting.id}")
            self.stdout.write(f"  - Site: {setting.site_name}")
            self.stdout.write(f"  - Email: {setting.email_contact}")
            self.stdout.write(f"  - Téléphone: {setting.phone_contact}")
        
        # Vérifier les pages critiques
        critical_pages = ['header', 'footer', 'home', 'faq']
        self.stdout.write(f"\n🎯 Vérification des pages critiques:")
        for slug in critical_pages:
            try:
                page = SitePage.objects.get(slug=slug)
                blocks_count = page.content_blocks.count()
                self.stdout.write(f"  ✅ {slug}: {blocks_count} blocs")
            except SitePage.DoesNotExist:
                self.stdout.write(f"  ❌ {slug}: Page manquante")
        
        self.stdout.write("\n✅ Vérification terminée!")
