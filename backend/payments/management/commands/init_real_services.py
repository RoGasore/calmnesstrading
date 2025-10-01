from django.core.management.base import BaseCommand
from payments.models import Offer, ContactChannel


class Command(BaseCommand):
    help = 'Initialise les vraies donnees des services (Formations, Signaux, Gestion)'

    def handle(self, *args, **options):
        self.stdout.write('Initialisation des vraies donnees des services...')

        # Supprimer les anciennes offres pour repartir de zero
        Offer.objects.all().delete()
        self.stdout.write('   Anciennes offres supprimees')

        # ==================== FORMATIONS ====================
        self.stdout.write('\n1. Creation des formations...')
        
        formations = [
            {
                'name': 'Formation Debutant',
                'description': 'Apprenez les bases du trading avec des experts certifies. Formation complete pour debuter (10 heures de video).',
                'offer_type': 'formation',
                'price': 199.00,
                'currency': 'EUR',
                'duration_days': None,  # Acces a vie
            },
            {
                'name': 'Formation Intermediaire',
                'description': 'Ameliorez vos strategies avec nos formations avancees (15 heures de video + support).',
                'offer_type': 'formation',
                'price': 349.00,
                'currency': 'EUR',
                'duration_days': None,
            },
            {
                'name': 'Formation Elite',
                'description': 'Formation premium avec coaching personnalise (20 heures + 5h de coaching individuel).',
                'offer_type': 'formation',
                'price': 799.00,
                'currency': 'EUR',
                'duration_days': None,
            },
        ]
        
        for formation_data in formations:
            offer, created = Offer.objects.get_or_create(
                name=formation_data['name'],
                offer_type='formation',
                defaults=formation_data
            )
            if created:
                self.stdout.write(f'   [OK] Formation creee: {offer.name} - {offer.price} EUR')
            else:
                self.stdout.write(f'   [SKIP] Formation existante: {offer.name}')

        # ==================== SIGNAUX DE TRADING ====================
        self.stdout.write('\n2. Creation des abonnements signaux...')
        
        signaux = [
            {
                'name': 'Signaux - Plan Starter',
                'description': 'Acces aux signaux de trading 3 fois par semaine. Parfait pour debuter.',
                'offer_type': 'signal',
                'price': 29.00,
                'currency': 'EUR',
                'duration_days': 30,
            },
            {
                'name': 'Signaux - Plan Pro',
                'description': 'Signaux illimites en temps reel + analyses quotidiennes. Support prioritaire 24/7.',
                'offer_type': 'signal',
                'price': 79.00,
                'currency': 'EUR',
                'duration_days': 30,
            },
            {
                'name': 'Signaux - Plan Elite',
                'description': 'Tout du plan Pro + signaux personnalises + coaching mensuel + analyses institutionnelles.',
                'offer_type': 'signal',
                'price': 199.00,
                'currency': 'EUR',
                'duration_days': 30,
            },
            {
                'name': 'Signaux - Plan Annuel Pro',
                'description': 'Plan Pro sur 12 mois avec 2 mois offerts. Economies de 158 EUR.',
                'offer_type': 'signal',
                'price': 790.00,
                'currency': 'EUR',
                'duration_days': 365,
            },
            {
                'name': 'Signaux - Plan Annuel Elite',
                'description': 'Plan Elite sur 12 mois avec 2 mois offerts. Economies de 398 EUR.',
                'offer_type': 'signal',
                'price': 1990.00,
                'currency': 'EUR',
                'duration_days': 365,
            },
        ]
        
        for signal_data in signaux:
            offer, created = Offer.objects.get_or_create(
                name=signal_data['name'],
                offer_type='signal',
                defaults=signal_data
            )
            if created:
                self.stdout.write(f'   [OK] Signal cree: {offer.name} - {offer.price} EUR')
            else:
                self.stdout.write(f'   [SKIP] Signal existant: {offer.name}')

        # ==================== GESTION DE COMPTE ====================
        self.stdout.write('\n3. Creation des offres de gestion de compte...')
        
        gestion = [
            {
                'name': 'Gestion Bronze',
                'description': 'Gestion professionnelle pour comptes jusqu\'a 5 000 EUR. Rapport mensuel + strategie personnalisee.',
                'offer_type': 'account',
                'price': 199.00,
                'currency': 'EUR',
                'duration_days': 30,
            },
            {
                'name': 'Gestion Silver',
                'description': 'Gestion pro pour comptes jusqu\'a 15 000 EUR. Rapports hebdomadaires + ajustements strategiques.',
                'offer_type': 'account',
                'price': 399.00,
                'currency': 'EUR',
                'duration_days': 30,
            },
            {
                'name': 'Gestion Gold',
                'description': 'Gestion premium pour comptes jusqu\'a 50 000 EUR. Rapports quotidiens + gestionnaire dedie + support 24/7.',
                'offer_type': 'account',
                'price': 799.00,
                'currency': 'EUR',
                'duration_days': 30,
            },
            {
                'name': 'Gestion Platinum',
                'description': 'Service VIP pour comptes 50 000+ EUR. Gestionnaire dedie + strategies institutionnelles + acces prioritaire.',
                'offer_type': 'account',
                'price': 1499.00,
                'currency': 'EUR',
                'duration_days': 30,
            },
        ]
        
        for gestion_data in gestion:
            offer, created = Offer.objects.get_or_create(
                name=gestion_data['name'],
                offer_type='account',
                defaults=gestion_data
            )
            if created:
                self.stdout.write(f'   [OK] Gestion creee: {offer.name} - {offer.price} EUR')
            else:
                self.stdout.write(f'   [SKIP] Gestion existante: {offer.name}')

        # ==================== SERVICES ADDITIONNELS ====================
        self.stdout.write('\n4. Creation des services additionnels...')
        
        additionnels = [
            {
                'name': 'Formation VIP',
                'description': 'Formation intensive de 2 jours avec un expert trader. Sessions en petit groupe (max 5 personnes).',
                'offer_type': 'formation',
                'price': 199.00,
                'currency': 'EUR',
                'duration_days': None,
            },
            {
                'name': 'Analyse Personnalisee',
                'description': 'Analyse detaillee de votre portefeuille par nos experts. Rapport complet + recommandations.',
                'offer_type': 'signal',
                'price': 49.00,
                'currency': 'EUR',
                'duration_days': None,
            },
            {
                'name': 'Coaching 1-on-1',
                'description': 'Session de coaching individuelle (1h) avec un trader professionnel. Reponses a toutes vos questions.',
                'offer_type': 'formation',
                'price': 150.00,
                'currency': 'EUR',
                'duration_days': None,
            },
        ]
        
        for addon_data in additionnels:
            offer, created = Offer.objects.get_or_create(
                name=addon_data['name'],
                defaults=addon_data
            )
            if created:
                self.stdout.write(f'   [OK] Service additionnel cree: {offer.name} - {offer.price} EUR')
            else:
                self.stdout.write(f'   [SKIP] Service existant: {offer.name}')

        # ==================== VERIFIER LES CANAUX DE CONTACT ====================
        self.stdout.write('\n5. Verification des canaux de contact...')
        
        if ContactChannel.objects.count() == 0:
            contact_channels = [
                {
                    'channel_type': 'whatsapp',
                    'contact_info': '+33 6 XX XX XX XX',
                    'contact_link': 'https://wa.me/33XXXXXXXXX',
                    'instructions': 'Envoyez-nous un message WhatsApp avec votre ID utilisateur et l\'offre selectionnee.',
                    'display_order': 1
                },
                {
                    'channel_type': 'telegram',
                    'contact_info': '@CalmnessSupport',
                    'contact_link': 'https://t.me/CalmnessSupport',
                    'instructions': 'Contactez-nous sur Telegram avec votre ID utilisateur et l\'offre selectionnee.',
                    'display_order': 2
                },
                {
                    'channel_type': 'discord',
                    'contact_info': 'CALMNESS FI #support',
                    'contact_link': 'https://discord.gg/calmnessfi',
                    'instructions': 'Rejoignez notre serveur Discord et ouvrez un ticket dans #support.',
                    'display_order': 3
                },
            ]
            
            for channel_data in contact_channels:
                channel, created = ContactChannel.objects.get_or_create(
                    channel_type=channel_data['channel_type'],
                    defaults=channel_data
                )
                if created:
                    self.stdout.write(f'   [OK] Canal cree: {channel.channel_type}')

        # ==================== RESUME ====================
        total_formations = Offer.objects.filter(offer_type='formation').count()
        total_signaux = Offer.objects.filter(offer_type='signal').count()
        total_gestion = Offer.objects.filter(offer_type='account').count()
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('\n[SUCCESS] Initialisation terminee avec succes!\n'))
        self.stdout.write(f'   Formations: {total_formations} offres')
        self.stdout.write(f'   Signaux: {total_signaux} offres')
        self.stdout.write(f'   Gestion: {total_gestion} offres')
        self.stdout.write(f'   Total: {Offer.objects.count()} offres')
        self.stdout.write('='*60 + '\n')

