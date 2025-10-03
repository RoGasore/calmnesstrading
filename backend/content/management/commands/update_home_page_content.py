from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import SitePage, ContentBlock


class Command(BaseCommand):
    help = 'Update home page with new content structure'

    def handle(self, *args, **options):
        self.stdout.write('🔄 Updating home page content...')
        
        # Récupérer la page d'accueil
        try:
            home_page = SitePage.objects.get(slug='home')
        except SitePage.DoesNotExist:
            self.stdout.write(self.style.ERROR('❌ Home page not found'))
            return
        
        # Supprimer les anciens blocs
        home_page.content_blocks.all().delete()
        self.stdout.write('🗑️  Old blocks deleted')
        
        # Nouveaux blocs de contenu pour la page d'accueil
        new_blocks = [
            # === HERO SECTION ===
            {
                'block_key': 'hero_main_title',
                'title': 'Titre principal Hero',
                'content': 'Mange. Dors. Trade. Répète.',
                'order': 1,
                'content_type': 'heading'
            },
            {
                'block_key': 'hero_subtitle',
                'title': 'Sous-titre Hero',
                'content': 'La routine qui peut transformer votre vie.',
                'order': 2,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'hero_description',
                'title': 'Description Hero',
                'content': 'Formez-vous. Copiez nos signaux. Confiez-nous votre compte.\nQuel que soit votre niveau ou votre emploi du temps, nous avons la solution pour vous faire réussir sur les marchés.',
                'order': 3,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'hero_cta1',
                'title': 'Bouton CTA 1 Hero',
                'content': 'Rejoindre notre communauté',
                'order': 4,
                'content_type': 'button'
            },
            {
                'block_key': 'hero_cta2',
                'title': 'Bouton CTA 2 Hero',
                'content': 'Voir nos services',
                'order': 5,
                'content_type': 'button'
            },
            
            # === SOLUTIONS SECTION ===
            {
                'block_key': 'solutions_title',
                'title': 'Titre section Solutions',
                'content': 'Nos 3 solutions — Choisissez ce qui vous correspond',
                'order': 10,
                'content_type': 'heading'
            },
            {
                'block_key': 'solution_formation_title',
                'title': 'Titre Formation',
                'content': '📚 Formation Trading — Devenez autonome',
                'order': 11,
                'content_type': 'heading'
            },
            {
                'block_key': 'solution_formation_description',
                'title': 'Description Formation',
                'content': 'Vous voulez comprendre les marchés et trader par vous-même ?\nNos formations pas à pas vous enseignent l\'analyse technique, la stratégie et la gestion du risque.\nRésultat : vous devenez un trader indépendant capable de gérer votre argent avec confiance.',
                'order': 12,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'solution_signaux_title',
                'title': 'Titre Signaux',
                'content': '📈 Signaux Premium — Copiez et gagnez',
                'order': 13,
                'content_type': 'heading'
            },
            {
                'block_key': 'solution_signaux_description',
                'title': 'Description Signaux',
                'content': 'Pas le temps ou l\'envie de suivre une formation complète ?\nNous analysons les marchés pour vous et vous envoyons des signaux clairs et exploitables.\nRésultat : vous profitez des meilleures opportunités en quelques clics.',
                'order': 14,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'solution_gestion_title',
                'title': 'Titre Gestion',
                'content': '💼 Gestion de compte — Vos gains, sans effort',
                'order': 15,
                'content_type': 'heading'
            },
            {
                'block_key': 'solution_gestion_description',
                'title': 'Description Gestion',
                'content': 'Vous n\'avez ni le temps de vous former, ni de copier nos signaux ?\nConfiez-nous la gestion de votre compte. Nous tradons pour vous avec discipline et transparence.\nRésultat : vos profits travaillent pour vous, pendant que vous profitez de votre vie.',
                'order': 16,
                'content_type': 'paragraph'
            },
            
            # === HOW IT WORKS ===
            {
                'block_key': 'how_it_works_title',
                'title': 'Titre Comment ça marche',
                'content': 'Comment ça marche — 3 étapes simples',
                'order': 20,
                'content_type': 'heading'
            },
            {
                'block_key': 'step_1',
                'title': 'Étape 1',
                'content': 'Choisissez votre solution : Formation, Signaux, ou Gestion.',
                'order': 21,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'step_2',
                'title': 'Étape 2',
                'content': 'Accédez à nos services : suivez, copiez, ou laissez-nous gérer pour vous.',
                'order': 22,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'step_3',
                'title': 'Étape 3',
                'content': 'Profitez des résultats : compétences, gains, sérénité.',
                'order': 23,
                'content_type': 'paragraph'
            },
            
            # === BENEFITS ===
            {
                'block_key': 'benefits_title',
                'title': 'Titre Bénéfices',
                'content': 'Les bénéfices pour vous',
                'order': 30,
                'content_type': 'heading'
            },
            {
                'block_key': 'benefit_1',
                'title': 'Bénéfice 1',
                'content': '🔹 Gagnez du temps, réduisez le stress',
                'order': 31,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'benefit_2',
                'title': 'Bénéfice 2',
                'content': '🔹 Acquérez des compétences solides et durables',
                'order': 32,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'benefit_3',
                'title': 'Bénéfice 3',
                'content': '🔹 Profitez de signaux précis ou de gains réguliers',
                'order': 33,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'benefit_4',
                'title': 'Bénéfice 4',
                'content': '🔹 Liberté de choisir la solution adaptée à votre vie',
                'order': 34,
                'content_type': 'paragraph'
            },
            
            # === WHY CHOOSE ===
            {
                'block_key': 'why_choose_title',
                'title': 'Titre Pourquoi choisir',
                'content': 'Pourquoi choisir Calmness Trading ?',
                'order': 40,
                'content_type': 'heading'
            },
            {
                'block_key': 'advantage_1',
                'title': 'Avantage 1',
                'content': '✅ Expertise éprouvée : analyses précises, méthodes fiables',
                'order': 41,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'advantage_2',
                'title': 'Avantage 2',
                'content': '✅ Flexibilité totale : apprenez, copiez ou déléguez',
                'order': 42,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'advantage_3',
                'title': 'Avantage 3',
                'content': '✅ Transparence et rigueur : pas de promesses irréalistes',
                'order': 43,
                'content_type': 'paragraph'
            },
            {
                'block_key': 'advantage_4',
                'title': 'Avantage 4',
                'content': '✅ Vision long terme : profits durables plutôt que coups de chance',
                'order': 44,
                'content_type': 'paragraph'
            },
            
            # === DISCLAIMER ===
            {
                'block_key': 'disclaimer_title',
                'title': 'Titre Avertissement',
                'content': 'Avertissement / Disclaimer',
                'order': 50,
                'content_type': 'heading'
            },
            {
                'block_key': 'disclaimer_text',
                'title': 'Texte Avertissement',
                'content': '⚠️ Le trading comporte des risques. Les performances passées ne garantissent pas les résultats futurs.\nLes formations, signaux et services de gestion de compte proposés par Calmness Trading sont destinés à des fins éducatives et/ou d\'investissement.',
                'order': 51,
                'content_type': 'paragraph'
            },
            
            # === CTA FINAL ===
            {
                'block_key': 'final_cta_title',
                'title': 'Titre CTA Final',
                'content': 'Prêt à transformer votre façon de trader ?',
                'order': 60,
                'content_type': 'heading'
            },
            {
                'block_key': 'final_cta1',
                'title': 'Bouton CTA Final 1',
                'content': 'Commencer maintenant',
                'order': 61,
                'content_type': 'button'
            },
            {
                'block_key': 'final_cta2',
                'title': 'Bouton CTA Final 2',
                'content': 'Découvrir nos offres',
                'order': 62,
                'content_type': 'button'
            }
        ]
        
        # Créer les nouveaux blocs
        created_count = 0
        for block_data in new_blocks:
            ContentBlock.objects.create(
                page=home_page,
                block_key=block_data['block_key'],
                title=block_data['title'],
                content=block_data['content'],
                order=block_data['order'],
                content_type=block_data['content_type'],
                is_visible=True
            )
            created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ {created_count} new content blocks created for home page')
        )
        
        # Mettre à jour les paramètres globaux pour inclure Telegram et Discord
        from content.models_comprehensive_cms import GlobalSettings
        
        settings = GlobalSettings.get_settings()
        if settings:
            # Ajouter les réseaux sociaux manquants
            social_networks = settings.social_networks or {}
            social_networks.update({
                'telegram': social_networks.get('telegram', 'https://t.me/calmnesstrading'),
                'discord': social_networks.get('discord', 'https://discord.gg/calmnesstrading')
            })
            settings.social_networks = social_networks
            settings.save()
            self.stdout.write('✅ Global settings updated with Telegram and Discord')
        
        self.stdout.write(
            self.style.SUCCESS('✅ Home page content updated successfully!')
        )
