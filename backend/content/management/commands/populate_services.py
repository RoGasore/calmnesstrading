from django.core.management.base import BaseCommand
from payments.models import Offer

class Command(BaseCommand):
    help = 'Populate services for reviews'

    def handle(self, *args, **options):
        # Services par défaut pour les avis
        default_services = [
            {
                'name': 'Formation Trading Complète',
                'offer_type': 'formation',
                'price': 299.00,
                'description': 'Formation complète au trading avec support personnalisé'
            },
            {
                'name': 'Signaux Trading Premium',
                'offer_type': 'signal',
                'price': 99.00,
                'description': 'Signaux de trading en temps réel avec analyses'
            },
            {
                'name': 'Gestion de Compte Pro',
                'offer_type': 'account',
                'price': 499.00,
                'description': 'Gestion professionnelle de votre compte de trading'
            },
            {
                'name': 'Coaching Personnel',
                'offer_type': 'coaching',
                'price': 199.00,
                'description': 'Sessions de coaching personnalisées'
            },
            {
                'name': 'Analyse de Marché',
                'offer_type': 'service',
                'price': 149.00,
                'description': 'Analyses détaillées des marchés financiers'
            }
        ]

        created_count = 0
        for service_data in default_services:
            offer, created = Offer.objects.get_or_create(
                name=service_data['name'],
                defaults={
                    'offer_type': service_data['offer_type'],
                    'price': service_data['price'],
                    'description': service_data['description'],
                    'is_active': True
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Service créé: {service_data["name"]}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Service existe déjà: {service_data["name"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'{created_count} nouveaux services créés sur {len(default_services)}')
        )



