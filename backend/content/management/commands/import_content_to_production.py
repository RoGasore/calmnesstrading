from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import SitePage, ContentBlock, GlobalSettings, FAQItem, Testimonial, ContactField
from accounts.models import User

class Command(BaseCommand):
    help = 'Importe le contenu local vers la production'

    def handle(self, *args, **options):
        self.stdout.write("📥 Importation du contenu vers la production...")
        
        # Récupérer un utilisateur admin
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('❌ Aucun utilisateur admin trouvé'))
            return
        
        try:
            # Données complètes du contenu local
            content_data = {
                'pages': [
                    {'name': 'Accueil', 'slug': 'home', 'title': 'Calmness Trading - Formation et Services Trading', 'description': 'Services de formation et accompagnement trading', 'is_active': True, 'is_public': True, 'order': 1},
                    {'name': 'Services', 'slug': 'services', 'title': 'Nos Services - Calmness Trading', 'description': 'Découvrez nos services de trading', 'is_active': True, 'is_public': True, 'order': 2},
                    {'name': 'FAQ', 'slug': 'faq', 'title': 'Questions Fréquentes - Calmness Trading', 'description': 'Réponses aux questions les plus fréquentes', 'is_active': True, 'is_public': True, 'order': 3},
                    {'name': 'Contact', 'slug': 'contact', 'title': 'Contact - Calmness Trading', 'description': 'Contactez-nous pour plus d\'informations', 'is_active': True, 'is_public': True, 'order': 4},
                    {'name': 'Header', 'slug': 'header', 'title': 'En-tête du site', 'description': 'Navigation principale', 'is_active': True, 'is_public': True, 'order': 5},
                    {'name': 'Footer', 'slug': 'footer', 'title': 'Pied de page', 'description': 'Informations du footer', 'is_active': True, 'is_public': True, 'order': 6},
                ],
                'content_blocks': [
                    # Home page blocks
                    {'page_slug': 'home', 'block_key': 'hero_main_title', 'content': 'Mange. Dors. Trade. Répète.', 'order': 1, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'hero_subtitle', 'content': 'La routine qui peut transformer votre vie.', 'order': 2, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'hero_description', 'content': 'Rejoignez notre communauté de traders et développez vos compétences avec des formations de qualité.', 'order': 3, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'hero_cta1', 'content': 'Commencer maintenant', 'order': 4, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'hero_cta2', 'content': 'En savoir plus', 'order': 5, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'solutions_title', 'content': 'Nos 3 solutions — Choisissez ce qui vous correspond', 'order': 6, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'solution_formation_title', 'content': 'Formation Trading', 'order': 7, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'solution_formation_description', 'content': 'Vous voulez comprendre les marchés et trader par vous-même ? Notre formation complète vous donne toutes les clés.', 'order': 8, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'solution_signaux_title', 'content': 'Signaux Premium', 'order': 9, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'solution_signaux_description', 'content': 'Pas le temps ou l\'envie de suivre une formation complète ? Recevez nos signaux de trading directement.', 'order': 10, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'solution_gestion_title', 'content': 'Gestion de compte', 'order': 11, 'is_visible': True},
                    {'page_slug': 'home', 'block_key': 'solution_gestion_description', 'content': 'Vous n\'avez ni le temps de vous former, ni de copier des signaux ? Nous gérons votre compte pour vous.', 'order': 12, 'is_visible': True},
                    
                    # Header blocks
                    {'page_slug': 'header', 'block_key': 'header_logo', 'content': 'Calmness Trading', 'order': 1, 'is_visible': True},
                    {'page_slug': 'header', 'block_key': 'nav_home', 'content': 'Accueil', 'order': 2, 'is_visible': True},
                    {'page_slug': 'header', 'block_key': 'nav_services', 'content': 'Services', 'order': 3, 'is_visible': True},
                    {'page_slug': 'header', 'block_key': 'nav_reviews', 'content': 'Avis', 'order': 4, 'is_visible': True},
                    {'page_slug': 'header', 'block_key': 'nav_faq', 'content': 'FAQ', 'order': 5, 'is_visible': True},
                    {'page_slug': 'header', 'block_key': 'nav_contact', 'content': 'Contact', 'order': 6, 'is_visible': True},
                    {'page_slug': 'header', 'block_key': 'nav_connexion', 'content': 'Connexion', 'order': 7, 'is_visible': True},
                    {'page_slug': 'header', 'block_key': 'nav_commencer', 'content': 'Commencer', 'order': 8, 'is_visible': True},
                    
                    # Footer blocks
                    {'page_slug': 'footer', 'block_key': 'footer_logo', 'content': 'Calmness Trading', 'order': 1, 'is_visible': True},
                    {'page_slug': 'footer', 'block_key': 'footer_tagline', 'content': 'Votre partenaire trading professionnel', 'order': 2, 'is_visible': True},
                    {'page_slug': 'footer', 'block_key': 'footer_copyright', 'content': '© 2024 Calmness Trading. Tous droits réservés.', 'order': 3, 'is_visible': True},
                ],
                'contact_fields': [
                    {'field_type': 'text', 'field_name': 'name', 'field_label': 'Nom complet', 'field_placeholder': 'Votre nom complet', 'is_required': True, 'is_visible': True, 'order': 1, 'validation_rules': {}},
                    {'field_type': 'email', 'field_name': 'email', 'field_label': 'Email', 'field_placeholder': 'votre@email.com', 'is_required': True, 'is_visible': True, 'order': 2, 'validation_rules': {}},
                    {'field_type': 'text', 'field_name': 'subject', 'field_label': 'Sujet', 'field_placeholder': 'Sujet de votre message', 'is_required': True, 'is_visible': True, 'order': 3, 'validation_rules': {}},
                    {'field_type': 'textarea', 'field_name': 'message', 'field_label': 'Message', 'field_placeholder': 'Votre message...', 'is_required': True, 'is_visible': True, 'order': 4, 'validation_rules': {}},
                ]
            }
            
            # Créer/mettre à jour les pages
            for page_data in content_data['pages']:
                page, created = SitePage.objects.get_or_create(
                    slug=page_data['slug'],
                    defaults=page_data
                )
                if created:
                    self.stdout.write(f"✅ Page créée: {page.name}")
                else:
                    self.stdout.write(f"ℹ️  Page existante: {page.name}")
            
            # Créer/mettre à jour les blocs de contenu
            for block_data in content_data['content_blocks']:
                try:
                    page = SitePage.objects.get(slug=block_data['page_slug'])
                    block, created = ContentBlock.objects.get_or_create(
                        page=page,
                        block_key=block_data['block_key'],
                        defaults={
                            'content': block_data['content'],
                            'order': block_data['order'],
                            'is_visible': block_data['is_visible'],
                            'updated_by': admin_user
                        }
                    )
                    if created:
                        self.stdout.write(f"✅ Bloc créé: {block_data['page_slug']}.{block_data['block_key']}")
                    else:
                        # Mettre à jour le contenu
                        block.content = block_data['content']
                        block.updated_by = admin_user
                        block.save()
                        self.stdout.write(f"🔄 Bloc mis à jour: {block_data['page_slug']}.{block_data['block_key']}")
                except SitePage.DoesNotExist:
                    self.stdout.write(f"⚠️  Page '{block_data['page_slug']}' non trouvée")
            
            # Créer/mettre à jour les champs de contact
            for field_data in content_data['contact_fields']:
                field, created = ContactField.objects.get_or_create(
                    field_name=field_data['field_name'],
                    defaults={
                        'field_type': field_data['field_type'],
                        'field_label': field_data['field_label'],
                        'field_placeholder': field_data['field_placeholder'],
                        'is_required': field_data['is_required'],
                        'is_visible': field_data['is_visible'],
                        'order': field_data['order'],
                        'validation_rules': field_data['validation_rules']
                    }
                )
                if created:
                    self.stdout.write(f"✅ Champ de contact créé: {field_data['field_name']}")
                else:
                    self.stdout.write(f"ℹ️  Champ de contact existant: {field_data['field_name']}")
            
            self.stdout.write(self.style.SUCCESS("\n✅ Import terminé avec succès!"))
            
            # Statistiques finales
            self.stdout.write(f"\n📊 Statistiques:")
            self.stdout.write(f"- Pages: {SitePage.objects.count()}")
            self.stdout.write(f"- Blocs de contenu: {ContentBlock.objects.count()}")
            self.stdout.write(f"- Champs de contact: {ContactField.objects.count()}")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Erreur lors de l'import: {str(e)}"))
