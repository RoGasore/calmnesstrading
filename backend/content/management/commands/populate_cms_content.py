from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import (
    GlobalSettings, PageCategory, SitePage, ContentBlock, 
    Testimonial, FAQItem, Offer
)
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Populate CMS with existing frontend content'

    def handle(self, *args, **options):
        self.stdout.write('🔄 Populating CMS with existing content...')
        
        # 1. Créer les paramètres globaux
        self.create_global_settings()
        
        # 2. Créer les pages et blocs de contenu
        self.create_pages_and_blocks()
        
        # 3. Créer des témoignages d'exemple
        self.create_testimonials()
        
        # 4. Créer des FAQ d'exemple
        self.create_faq_items()
        
        self.stdout.write(
            self.style.SUCCESS('✅ CMS content populated successfully!')
        )

    def create_global_settings(self):
        """Créer les paramètres globaux du site"""
        settings, created = GlobalSettings.objects.get_or_create(
            id=1,
            defaults={
                'site_name': 'CALMNESS FI',
                'site_tagline': 'Votre partenaire de confiance pour le trading',
                'site_description': 'CALMNESS FI propose des formations de trading, des signaux premium et une gestion de comptes professionnelle pour vous accompagner dans vos investissements.',
                'email_contact': 'contact@calmnessfi.com',
                'phone_contact': '+33 1 23 45 67 89',
                'address': '123 Avenue des Champs-Élysées, 75008 Paris, France',
                'social_networks': {
                    'facebook': 'https://facebook.com/calmnessfi',
                    'twitter': 'https://twitter.com/calmnessfi',
                    'instagram': 'https://instagram.com/calmnessfi',
                    'linkedin': 'https://linkedin.com/company/calmnessfi',
                    'telegram': 'https://t.me/calmnessfi'
                },
                'copyright_text': '© 2024 CALMNESS FI. Tous droits réservés.'
            }
        )
        
        if created:
            self.stdout.write('✅ Global settings created')
        else:
            self.stdout.write('ℹ️  Global settings already exist')

    def create_pages_and_blocks(self):
        """Créer les pages et blocs de contenu"""
        
        # Page d'accueil
        home_page, created = SitePage.objects.get_or_create(
            slug='home',
            defaults={
                'title': 'Page d\'Accueil',
                'description': 'Contenu principal de la page d\'accueil',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('✅ Home page created')
        
        # Blocs pour la page d'accueil
        home_blocks = [
            {
                'block_key': 'hero_title_part1',
                'title': 'Titre Hero - Partie 1',
                'content': 'Maîtrisez les',
                'order_index': 1
            },
            {
                'block_key': 'hero_title_part2', 
                'title': 'Titre Hero - Partie 2',
                'content': 'Marchés Financiers',
                'order_index': 2
            },
            {
                'block_key': 'hero_subtitle',
                'title': 'Sous-titre Hero',
                'content': 'Formations d\'experts, signaux en temps réel et analyses techniques approfondies pour transformer votre approche du trading.',
                'order_index': 3
            },
            {
                'block_key': 'hero_feature1',
                'title': 'Fonctionnalité 1',
                'content': 'Signaux Premium',
                'order_index': 4
            },
            {
                'block_key': 'hero_feature2',
                'title': 'Fonctionnalité 2', 
                'content': 'Analyses Techniques',
                'order_index': 5
            },
            {
                'block_key': 'hero_feature3',
                'title': 'Fonctionnalité 3',
                'content': 'Formation Complète',
                'order_index': 6
            },
            {
                'block_key': 'hero_cta1',
                'title': 'Bouton CTA 1',
                'content': 'Voir les Tarifs',
                'order_index': 7
            },
            {
                'block_key': 'hero_cta2',
                'title': 'Bouton CTA 2',
                'content': 'Essai Gratuit',
                'order_index': 8
            },
            {
                'block_key': 'hero_social_text',
                'title': 'Texte Social Proof',
                'content': 'Rejoignez plus de 5,000+ traders qui nous font confiance',
                'order_index': 9
            },
            {
                'block_key': 'hero_stats_traders',
                'title': 'Statistique Traders',
                'content': 'Traders Actifs',
                'order_index': 10
            },
            {
                'block_key': 'hero_stats_satisfaction',
                'title': 'Statistique Satisfaction',
                'content': 'Satisfaction',
                'order_index': 11
            },
            {
                'block_key': 'hero_stats_support',
                'title': 'Statistique Support',
                'content': 'Support',
                'order_index': 12
            }
        ]
        
        for block_data in home_blocks:
            ContentBlock.objects.get_or_create(
                page=home_page,
                block_key=block_data['block_key'],
                defaults={
                    'title': block_data['title'],
                    'content': block_data['content'],
                    'order': block_data['order_index'],
                    'content_type': 'text',
                    'is_visible': True
                }
            )
        
        self.stdout.write('✅ Home page blocks created')
        
        # Page Services
        services_page, created = SitePage.objects.get_or_create(
            slug='services',
            defaults={
                'title': 'Services',
                'description': 'Présentation des services',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('✅ Services page created')
        
        # Blocs pour les services
        services_blocks = [
            {
                'block_key': 'services_title_part1',
                'title': 'Titre Services - Partie 1',
                'content': 'Nos Services de',
                'order_index': 1
            },
            {
                'block_key': 'services_title_part2',
                'title': 'Titre Services - Partie 2', 
                'content': 'Trading',
                'order_index': 2
            },
            {
                'block_key': 'services_subtitle',
                'title': 'Sous-titre Services',
                'content': 'Découvrez notre gamme complète de services conçus pour faire de vous un trader profitable',
                'order_index': 3
            },
            {
                'block_key': 'service_formation_title',
                'title': 'Service Formation - Titre',
                'content': 'Formations Complètes',
                'order_index': 4
            },
            {
                'block_key': 'service_formation_desc',
                'title': 'Service Formation - Description',
                'content': 'Apprenez les stratégies de trading avancées avec nos experts certifiés',
                'order_index': 5
            },
            {
                'block_key': 'service_signals_title',
                'title': 'Service Signaux - Titre',
                'content': 'Signaux en Temps Réel',
                'order_index': 6
            },
            {
                'block_key': 'service_signals_desc',
                'title': 'Service Signaux - Description',
                'content': 'Recevez des signaux de trading précis directement sur Telegram',
                'order_index': 7
            },
            {
                'block_key': 'service_analysis_title',
                'title': 'Service Analyse - Titre',
                'content': 'Analyses Techniques',
                'order_index': 8
            },
            {
                'block_key': 'service_analysis_desc',
                'title': 'Service Analyse - Description',
                'content': 'Analyses approfondies des marchés avec des prévisions précises',
                'order_index': 9
            }
        ]
        
        for block_data in services_blocks:
            ContentBlock.objects.get_or_create(
                page=services_page,
                block_key=block_data['block_key'],
                defaults={
                    'title': block_data['title'],
                    'content': block_data['content'],
                    'order': block_data['order_index'],
                    'content_type': 'text',
                    'is_visible': True
                }
            )
        
        self.stdout.write('✅ Services page blocks created')
        
        # Page Header
        header_page, created = SitePage.objects.get_or_create(
            slug='header',
            defaults={
                'title': 'En-tête',
                'description': 'Menu de navigation',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('✅ Header page created')
        
        # Blocs pour le header
        header_blocks = [
            {
                'block_key': 'nav_home',
                'title': 'Navigation Accueil',
                'content': 'Accueil',
                'order_index': 1
            },
            {
                'block_key': 'nav_services',
                'title': 'Navigation Services',
                'content': 'Services',
                'order_index': 2
            },
            {
                'block_key': 'nav_reviews',
                'title': 'Navigation Avis',
                'content': 'Avis',
                'order_index': 3
            },
            {
                'block_key': 'nav_faq',
                'title': 'Navigation FAQ',
                'content': 'FAQ',
                'order_index': 4
            },
            {
                'block_key': 'nav_contact',
                'title': 'Navigation Contact',
                'content': 'Contact',
                'order_index': 5
            },
            {
                'block_key': 'nav_connexion',
                'title': 'Navigation Connexion',
                'content': 'Connexion',
                'order_index': 6
            },
            {
                'block_key': 'nav_commencer',
                'title': 'Navigation Commencer',
                'content': 'Commencer',
                'order_index': 7
            }
        ]
        
        for block_data in header_blocks:
            ContentBlock.objects.get_or_create(
                page=header_page,
                block_key=block_data['block_key'],
                defaults={
                    'title': block_data['title'],
                    'content': block_data['content'],
                    'order': block_data['order_index'],
                    'content_type': 'text',
                    'is_visible': True
                }
            )
        
        self.stdout.write('✅ Header page blocks created')
        
        # Page Footer
        footer_page, created = SitePage.objects.get_or_create(
            slug='footer',
            defaults={
                'title': 'Pied de Page',
                'description': 'Liens et informations',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('✅ Footer page created')
        
        # Blocs pour le footer
        footer_blocks = [
            {
                'block_key': 'footer_tagline',
                'title': 'Tagline Footer',
                'content': 'Votre partenaire de confiance pour maîtriser les marchés financiers. Formations d\'experts, signaux précis et analyses approfondies.',
                'order_index': 1
            },
            {
                'block_key': 'footer_services_title',
                'title': 'Titre Services Footer',
                'content': 'Services',
                'order_index': 2
            },
            {
                'block_key': 'footer_support_title',
                'title': 'Titre Support Footer',
                'content': 'Support',
                'order_index': 3
            },
            {
                'block_key': 'footer_legal_title',
                'title': 'Titre Légal Footer',
                'content': 'Légal',
                'order_index': 4
            }
        ]
        
        for block_data in footer_blocks:
            ContentBlock.objects.get_or_create(
                page=footer_page,
                block_key=block_data['block_key'],
                defaults={
                    'title': block_data['title'],
                    'content': block_data['content'],
                    'order': block_data['order_index'],
                    'content_type': 'text',
                    'is_visible': True
                }
            )
        
        self.stdout.write('✅ Footer page blocks created')

    def create_testimonials(self):
        """Créer des témoignages d'exemple"""
        testimonials_data = [
            {
                'author_name': 'Marie Dubois',
                'author_title': 'Trader Indépendante',
                'rating': 5,
                'content': 'Les formations de CALMNESS FI ont complètement transformé ma façon de trader. Je recommande vivement !',
                'is_featured': True,
                'order_index': 1
            },
            {
                'author_name': 'Jean Martin',
                'author_title': 'Investisseur Professionnel',
                'rating': 5,
                'content': 'Signaux très précis et analyses de qualité. Un service de première classe.',
                'is_featured': True,
                'order_index': 2
            },
            {
                'author_name': 'Sophie Leroy',
                'author_title': 'Débutante en Trading',
                'rating': 5,
                'content': 'Grâce aux formations, j\'ai pu apprendre les bases du trading en toute sécurité.',
                'is_featured': False,
                'order_index': 3
            }
        ]
        
        for testimonial_data in testimonials_data:
            Testimonial.objects.get_or_create(
                client_name=testimonial_data['author_name'],
                defaults={
                    'client_role': testimonial_data['author_title'],
                    'rating': testimonial_data['rating'],
                    'testimonial_text': testimonial_data['content'],
                    'is_featured': testimonial_data['is_featured'],
                    'status': 'published',
                    'order': testimonial_data['order_index']
                }
            )
        
        self.stdout.write('✅ Testimonials created')

    def create_faq_items(self):
        """Créer des FAQ d'exemple"""
        faq_data = [
            {
                'question': 'Comment puis-je m\'inscrire aux formations ?',
                'answer': 'Vous pouvez vous inscrire directement depuis notre page tarifs en choisissant la formule qui vous convient le mieux.',
                'category': 'Formations',
                'order_index': 1
            },
            {
                'question': 'Les signaux sont-ils garantis ?',
                'answer': 'Aucun signal de trading n\'est garanti à 100%. Nous fournissons des signaux basés sur notre analyse technique approfondie.',
                'category': 'Signaux',
                'order_index': 2
            },
            {
                'question': 'Quels sont les moyens de paiement acceptés ?',
                'answer': 'Nous acceptons les cartes bancaires, PayPal et les virements bancaires.',
                'category': 'Paiements',
                'order_index': 3
            },
            {
                'question': 'Y a-t-il une garantie de remboursement ?',
                'answer': 'Oui, nous offrons une garantie de remboursement de 30 jours pour tous nos services.',
                'category': 'Garanties',
                'order_index': 4
            }
        ]
        
        for faq_item_data in faq_data:
            FAQItem.objects.get_or_create(
                question=faq_item_data['question'],
                defaults={
                    'answer': faq_item_data['answer'],
                    'category': faq_item_data['category'].lower(),
                    'status': 'published',
                    'order': faq_item_data['order_index']
                }
            )
        
        self.stdout.write('✅ FAQ items created')
