from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import SitePage, ContentBlock
from accounts.models import User


class Command(BaseCommand):
    help = 'Populate the Services page with initial content'

    def handle(self, *args, **options):
        # Créer ou récupérer la page Services
        services_page, created = SitePage.objects.get_or_create(
            slug='services',
            defaults={
                'name': 'Services',
                'title': 'Nos Services de Trading',
                'description': 'Page des services de trading',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Page Services créée'))
        else:
            self.stdout.write(self.style.SUCCESS('Page Services trouvée'))

        # Récupérer un utilisateur admin pour updated_by
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('Aucun utilisateur admin trouvé'))
            return

        # Définir les blocs de contenu pour la page Services
        content_blocks = [
            # Hero Section
            ('hero_title', 'Nos Services de Trading', 'text'),
            ('hero_subtitle', 'Des solutions complètes pour votre réussite en trading', 'text'),
            ('hero_description', 'Vous souhaitez enfin comprendre le marché et prendre des décisions éclairées sans stress ? Nous sommes là pour vous guider : profitez de nos signaux professionnels, formations et analyses intégrées pour reprendre le contrôle de votre trading.', 'text'),
            ('hero_stat_1', '2000+ Traders formés', 'text'),
            ('hero_stat_2', '87% Taux de réussite', 'text'),
            ('hero_stat_3', '+25% ROI moyen', 'text'),
            
            # Services Grid
            ('services_grid_title', 'Nos Solutions', 'text'),
            ('features_title', 'Ce que vous obtenez', 'text'),
            ('learn_more_button', 'En savoir plus', 'text'),
            
            # Service Général
            ('services_title', 'Nos Services', 'text'),
            ('services_description', 'Découvrez notre gamme complète de services de trading professionnels', 'text'),
            ('services_price', 'Complet', 'text'),
            ('services_badge', 'Complet', 'text'),
            ('services_stat_1', '3+', 'text'),
            ('services_stat_2', '2000+', 'text'),
            ('services_stat_3', '4.9/5', 'text'),
            ('services_feature_1', 'Signaux en temps réel', 'text'),
            ('services_feature_2', 'Formations structurées', 'text'),
            ('services_feature_3', 'Gestion de comptes', 'text'),
            ('services_feature_4', 'Analyses intégrées', 'text'),
            
            # Service Formations
            ('formations_title', 'Formations Trading', 'text'),
            ('formations_description', 'Devenez autonome avec nos formations structurées', 'text'),
            ('formations_price', '150$ - 1500$', 'text'),
            ('formations_badge', 'Populaire', 'text'),
            ('formations_stat_1', '+2000', 'text'),
            ('formations_stat_2', '4.8/5', 'text'),
            ('formations_stat_3', '12+', 'text'),
            ('formations_feature_1', 'Analyse technique', 'text'),
            ('formations_feature_2', 'Gestion du risque', 'text'),
            ('formations_feature_3', 'Psychologie du trading', 'text'),
            ('formations_feature_4', 'Stratégies rentables', 'text'),
            
            # Service Signaux
            ('signaux_title', 'Signaux Premium', 'text'),
            ('signaux_description', 'Copiez nos signaux et gagnez sans effort', 'text'),
            ('signaux_price', '87% Réussite', 'text'),
            ('signaux_badge', 'Recommandé', 'text'),
            ('signaux_stat_1', '87%', 'text'),
            ('signaux_stat_2', '5-8/jour', 'text'),
            ('signaux_stat_3', '+65 pips', 'text'),
            ('signaux_feature_1', 'Signaux quotidiens', 'text'),
            ('signaux_feature_2', 'Points d\'entrée/sortie', 'text'),
            ('signaux_feature_3', 'Ratio risque/récompense', 'text'),
            ('signaux_feature_4', 'Performance suivie', 'text'),
            
            # Service Gestion
            ('gestion_title', 'Gestion de Comptes', 'text'),
            ('gestion_description', 'Confiez votre trading à nos experts', 'text'),
            ('gestion_price', 'Sur mesure', 'text'),
            ('gestion_badge', 'Premium', 'text'),
            ('gestion_stat_1', '+25%', 'text'),
            ('gestion_stat_2', 'Sécurisé', 'text'),
            ('gestion_stat_3', '10+ ans', 'text'),
            ('gestion_feature_1', 'Stratégies éprouvées', 'text'),
            ('gestion_feature_2', 'Gestion des risques', 'text'),
            ('gestion_feature_3', 'Performance suivie', 'text'),
            ('gestion_feature_4', 'Équipe d\'experts', 'text'),
            
            # Pourquoi nous choisir
            ('why_choose_title', 'Pourquoi nous choisir ?', 'text'),
            ('why_choose_1_title', 'Expertise éprouvée', 'text'),
            ('why_choose_1_description', 'Plus de 10 ans d\'expérience', 'text'),
            ('why_choose_2_title', 'Communauté active', 'text'),
            ('why_choose_2_description', 'Plus de 2000 traders', 'text'),
            ('why_choose_3_title', 'Résultats prouvés', 'text'),
            ('why_choose_3_description', '87% de réussite', 'text'),
            
            # CTA Final
            ('cta_title', 'Prêt à commencer ?', 'text'),
            ('cta_subtitle', 'Choisissez votre solution et commencez dès aujourd\'hui', 'text'),
            ('cta_formations_button', 'Commencer les formations', 'text'),
            ('cta_signaux_button', 'Voir les signaux', 'text'),
        ]

        # Créer les blocs de contenu
        created_count = 0
        updated_count = 0
        
        for order, (block_key, content, content_type) in enumerate(content_blocks, 1):
            content_block, created = ContentBlock.objects.get_or_create(
                page=services_page,
                block_key=block_key,
                defaults={
                    'content_type': content_type,
                    'content': content,
                    'title': block_key.replace('_', ' ').title(),
                    'order': order,
                    'is_visible': True,
                    'is_editable': True,
                    'updated_by': admin_user
                }
            )
            
            if created:
                created_count += 1
            else:
                # Mettre à jour le contenu si le bloc existe déjà
                content_block.content = content
                content_block.updated_by = admin_user
                content_block.save()
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Page Services peuplée avec succès ! '
                f'{created_count} blocs créés, {updated_count} blocs mis à jour.'
            )
        )
