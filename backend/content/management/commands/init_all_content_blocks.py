from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import SitePage, ContentBlock
from accounts.models import User

class Command(BaseCommand):
    help = 'Initialise tous les blocs de contenu nécessaires'

    def handle(self, *args, **options):
        self.stdout.write("🏗️  Initialisation de tous les blocs de contenu...")
        
        # Récupérer un utilisateur admin
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('❌ Aucun utilisateur admin trouvé'))
            return
        
        # Définir tous les blocs de contenu nécessaires
        content_blocks = {
            'home': [
                {'block_key': 'hero_main_title', 'content': 'Mange. Dors. Trade. Répète.', 'order': 1},
                {'block_key': 'hero_subtitle', 'content': 'La routine qui peut transformer votre vie.', 'order': 2},
                {'block_key': 'hero_description', 'content': 'Rejoignez notre communauté de traders et développez vos compétences avec des formations de qualité.', 'order': 3},
                {'block_key': 'hero_cta1', 'content': 'Commencer maintenant', 'order': 4},
                {'block_key': 'hero_cta2', 'content': 'En savoir plus', 'order': 5},
                {'block_key': 'solutions_title', 'content': 'Nos 3 solutions — Choisissez ce qui vous correspond', 'order': 6},
                {'block_key': 'solution_formation_title', 'content': 'Formation Trading', 'order': 7},
                {'block_key': 'solution_formation_description', 'content': 'Vous voulez comprendre les marchés et trader par vous-même ? Notre formation complète vous donne toutes les clés.', 'order': 8},
                {'block_key': 'solution_signaux_title', 'content': 'Signaux Premium', 'order': 9},
                {'block_key': 'solution_signaux_description', 'content': 'Pas le temps ou l\'envie de suivre une formation complète ? Recevez nos signaux de trading directement.', 'order': 10},
                {'block_key': 'solution_gestion_title', 'content': 'Gestion de compte', 'order': 11},
                {'block_key': 'solution_gestion_description', 'content': 'Vous n\'avez ni le temps de vous former, ni de copier des signaux ? Nous gérons votre compte pour vous.', 'order': 12},
                {'block_key': 'how_it_works_title', 'content': 'Comment ça marche — 3 étapes simples', 'order': 13},
                {'block_key': 'step_1', 'content': 'Inscrivez-vous', 'order': 14},
                {'block_key': 'step_2', 'content': 'Choisissez votre solution', 'order': 15},
                {'block_key': 'step_3', 'content': 'Commencez à trader', 'order': 16},
                {'block_key': 'benefits_title', 'content': 'Pourquoi nous choisir ?', 'order': 17},
                {'block_key': 'benefit_1', 'content': 'Formation complète', 'order': 18},
                {'block_key': 'benefit_2', 'content': 'Support 24/7', 'order': 19},
                {'block_key': 'benefit_3', 'content': 'Résultats prouvés', 'order': 20},
                {'block_key': 'benefit_4', 'content': 'Communauté active', 'order': 21},
                {'block_key': 'why_choose_title', 'content': 'Pourquoi nous choisir ?', 'order': 22},
                {'block_key': 'advantage_1', 'content': 'Expertise reconnue', 'order': 23},
                {'block_key': 'advantage_2', 'content': 'Méthode éprouvée', 'order': 24},
                {'block_key': 'advantage_3', 'content': 'Accompagnement personnel', 'order': 25},
                {'block_key': 'advantage_4', 'content': 'Résultats durables', 'order': 26},
                {'block_key': 'disclaimer_title', 'content': 'Avertissement', 'order': 27},
                {'block_key': 'disclaimer_text', 'content': 'Le trading comporte des risques. Les performances passées ne préjugent pas des résultats futurs.', 'order': 28},
                {'block_key': 'final_cta_title', 'content': 'Prêt à commencer ?', 'order': 29},
                {'block_key': 'final_cta1', 'content': 'Commencer la formation', 'order': 30},
                {'block_key': 'final_cta2', 'content': 'Voir nos signaux', 'order': 31},
            ],
            'header': [
                {'block_key': 'header_logo', 'content': 'Calmness Trading', 'order': 1},
                {'block_key': 'nav_home', 'content': 'Accueil', 'order': 2},
                {'block_key': 'nav_services', 'content': 'Services', 'order': 3},
                {'block_key': 'nav_reviews', 'content': 'Avis', 'order': 4},
                {'block_key': 'nav_faq', 'content': 'FAQ', 'order': 5},
                {'block_key': 'nav_contact', 'content': 'Contact', 'order': 6},
                {'block_key': 'nav_connexion', 'content': 'Connexion', 'order': 7},
                {'block_key': 'nav_commencer', 'content': 'Commencer', 'order': 8},
                {'block_key': 'nav_logo_text', 'content': 'Trading Professionnel', 'order': 9},
            ],
            'footer': [
                {'block_key': 'footer_logo', 'content': 'Calmness Trading', 'order': 1},
                {'block_key': 'footer_tagline', 'content': 'Votre partenaire trading professionnel', 'order': 2},
                {'block_key': 'footer_services_title', 'content': 'Nos Services', 'order': 3},
                {'block_key': 'footer_support_title', 'content': 'Support', 'order': 4},
                {'block_key': 'footer_legal_title', 'content': 'Légal', 'order': 5},
                {'block_key': 'footer_copyright', 'content': '© 2024 Calmness Trading. Tous droits réservés.', 'order': 6},
            ],
            'services': [
                {'block_key': 'hero_title', 'content': 'Nos Services', 'order': 1},
                {'block_key': 'hero_subtitle', 'content': 'Découvrez nos solutions de trading', 'order': 2},
                {'block_key': 'hero_description', 'content': 'Choisissez la solution qui correspond à vos besoins et objectifs.', 'order': 3},
                {'block_key': 'services_title', 'content': 'Nos Services', 'order': 4},
                {'block_key': 'services_description', 'content': 'Des solutions adaptées à tous les profils', 'order': 5},
                {'block_key': 'service_formation_title', 'content': 'Formation Trading', 'order': 6},
                {'block_key': 'service_formation_desc', 'content': 'Apprenez les bases du trading avec nos experts', 'order': 7},
                {'block_key': 'service_signals_title', 'content': 'Signaux Premium', 'order': 8},
                {'block_key': 'service_signals_desc', 'content': 'Recevez nos signaux de trading en temps réel', 'order': 9},
                {'block_key': 'service_analysis_title', 'content': 'Analyse de Marché', 'order': 10},
                {'block_key': 'service_analysis_desc', 'content': 'Analyses approfondies des marchés financiers', 'order': 11},
            ]
        }
        
        total_created = 0
        
        for page_slug, blocks_data in content_blocks.items():
            try:
                page = SitePage.objects.get(slug=page_slug)
                self.stdout.write(f"\n📄 Traitement de la page: {page.name}")
                
                for block_data in blocks_data:
                    block, created = ContentBlock.objects.get_or_create(
                        page=page,
                        block_key=block_data['block_key'],
                        defaults={
                            'content': block_data['content'],
                            'order': block_data['order'],
                            'is_visible': True,
                            'updated_by': admin_user
                        }
                    )
                    
                    if created:
                        self.stdout.write(f"  ✅ Créé: {block.block_key}")
                        total_created += 1
                    else:
                        # Mettre à jour le contenu si nécessaire
                        if block.content != block_data['content']:
                            block.content = block_data['content']
                            block.updated_by = admin_user
                            block.save()
                            self.stdout.write(f"  🔄 Mis à jour: {block.block_key}")
                        
            except SitePage.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"⚠️  Page '{page_slug}' non trouvée"))
        
        self.stdout.write(f"\n✅ Initialisation terminée! {total_created} blocs créés.")
        
        # Vérification finale
        total_blocks = ContentBlock.objects.count()
        self.stdout.write(f"📊 Total des blocs de contenu: {total_blocks}")
