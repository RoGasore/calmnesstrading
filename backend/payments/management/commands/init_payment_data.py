from django.core.management.base import BaseCommand
from payments.models import Offer, ContactChannel


class Command(BaseCommand):
    help = 'Initialise les données de paiement (offres, canaux de contact)'

    def handle(self, *args, **options):
        self.stdout.write('Initialisation des données de paiement...')

        # ==================== CANAUX DE CONTACT ====================
        self.stdout.write('\n1. Création des canaux de contact...')
        
        contact_channels = [
            {
                'channel_type': 'whatsapp',
                'contact_info': '+33 6 XX XX XX XX',
                'contact_link': 'https://wa.me/33XXXXXXXXX',
                'instructions': 'Envoyez-nous un message WhatsApp avec votre ID utilisateur et l\'offre sélectionnée.',
                'display_order': 1
            },
            {
                'channel_type': 'telegram',
                'contact_info': '@CalmnessSupport',
                'contact_link': 'https://t.me/CalmnessSupport',
                'instructions': 'Contactez-nous sur Telegram avec votre ID utilisateur et l\'offre sélectionnée.',
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
            else:
                self.stdout.write(f'   [SKIP] Canal existant: {channel.channel_type}')

        # ==================== OFFRES - ABONNEMENTS ====================
        self.stdout.write('\n2. Création des offres d\'abonnement...')
        
        subscriptions = [
            {
                'name': 'Abonnement 7 jours',
                'description': 'Accès complet aux signaux de trading pendant 7 jours',
                'offer_type': 'subscription',
                'price': 49.99,
                'duration_days': 7,
            },
            {
                'name': 'Abonnement 15 jours',
                'description': 'Accès complet aux signaux de trading pendant 15 jours',
                'offer_type': 'subscription',
                'price': 89.99,
                'duration_days': 15,
            },
            {
                'name': 'Abonnement 30 jours',
                'description': 'Accès complet aux signaux de trading pendant 30 jours',
                'offer_type': 'subscription',
                'price': 149.99,
                'duration_days': 30,
            },
            {
                'name': 'Abonnement 90 jours',
                'description': 'Accès complet aux signaux de trading pendant 90 jours avec réduction',
                'offer_type': 'subscription',
                'price': 399.99,
                'duration_days': 90,
            },
        ]
        
        for sub_data in subscriptions:
            offer, created = Offer.objects.get_or_create(
                name=sub_data['name'],
                offer_type='subscription',
                defaults=sub_data
            )
            if created:
                self.stdout.write(f'   [OK] Offre creee: {offer.name} - {offer.price} EUR')
            else:
                self.stdout.write(f'   [SKIP] Offre existante: {offer.name}')

        # ==================== OFFRES - FORMATIONS ====================
        self.stdout.write('\n3. Création des offres de formation...')
        
        formations = [
            {
                'name': 'Formation Débutant',
                'description': 'Formation complète pour débuter le trading (10 heures de vidéo)',
                'offer_type': 'formation',
                'price': 199.99,
            },
            {
                'name': 'Formation Intermédiaire',
                'description': 'Formation avancée pour améliorer vos stratégies (15 heures de vidéo)',
                'offer_type': 'formation',
                'price': 349.99,
            },
            {
                'name': 'Formation Élite',
                'description': 'Formation premium avec coaching personnalisé (20 heures + 5h de coaching)',
                'offer_type': 'formation',
                'price': 799.99,
            },
        ]
        
        for formation_data in formations:
            offer, created = Offer.objects.get_or_create(
                name=formation_data['name'],
                offer_type='formation',
                defaults=formation_data
            )
            if created:
                self.stdout.write(f'   [OK] Offre creee: {offer.name} - {offer.price} EUR')
            else:
                self.stdout.write(f'   [SKIP] Offre existante: {offer.name}')

        # ==================== OFFRES - GESTION DE COMPTE ====================
        self.stdout.write('\n4. Création des offres de gestion de compte...')
        
        account_management = [
            {
                'name': 'Gestion de compte - Bronze',
                'description': 'Gestion professionnelle de votre compte de trading (jusqu\'à 5000€)',
                'offer_type': 'account',
                'price': 499.99,
                'duration_days': 30,
            },
            {
                'name': 'Gestion de compte - Silver',
                'description': 'Gestion professionnelle de votre compte de trading (jusqu\'à 10000€)',
                'offer_type': 'account',
                'price': 899.99,
                'duration_days': 30,
            },
            {
                'name': 'Gestion de compte - Gold',
                'description': 'Gestion professionnelle de votre compte de trading (jusqu\'à 25000€)',
                'offer_type': 'account',
                'price': 1999.99,
                'duration_days': 30,
            },
        ]
        
        for account_data in account_management:
            offer, created = Offer.objects.get_or_create(
                name=account_data['name'],
                offer_type='account',
                defaults=account_data
            )
            if created:
                self.stdout.write(f'   [OK] Offre creee: {offer.name} - {offer.price} EUR')
            else:
                self.stdout.write(f'   [SKIP] Offre existante: {offer.name}')

        self.stdout.write('\n' + self.style.SUCCESS('[SUCCESS] Initialisation des donnees de paiement terminee avec succes!'))

