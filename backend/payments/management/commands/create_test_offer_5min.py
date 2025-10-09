from django.core.management.base import BaseCommand
from payments.models import Offer

class Command(BaseCommand):
    help = 'Créer une offre de test 5 minutes pour tester le système Telegram'

    def handle(self, *args, **options):
        self.stdout.write('🧪 Création offre de test 5 minutes...')
        
        # Créer ou mettre à jour l'offre de test
        offer, created = Offer.objects.update_or_create(
            name="Test Telegram 5min",
            defaults={
                'description': 'Abonnement de test 5 minutes pour vérifier le système Telegram (accès canal révoqué automatiquement après 5min)',
                'offer_type': 'signal',
                'price': 1.00,
                'currency': 'EUR',
                'duration_minutes': 5,  # 5 minutes seulement
                'is_active': True,
                'color_theme': 'gold',
                'metadata': {
                    'is_test': True,
                    'auto_revoke': True,
                    'description_details': 'Offre de test pour validation du workflow Telegram'
                }
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Offre de test créée !'))
        else:
            self.stdout.write(self.style.SUCCESS('✅ Offre de test mise à jour !'))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('📋 Détails de l\'offre:'))
        self.stdout.write(f'   ID              : {offer.id}')
        self.stdout.write(f'   Nom             : {offer.name}')
        self.stdout.write(f'   Prix            : {offer.price} {offer.currency}')
        self.stdout.write(f'   Type            : {offer.get_offer_type_display()}')
        self.stdout.write(f'   Durée           : {offer.duration_minutes} minutes')
        self.stdout.write(f'   Statut          : {"Actif" if offer.is_active else "Inactif"}')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('⚠️  ATTENTION:'))
        self.stdout.write('   Cette offre donne accès au canal Telegram pour 5 minutes SEULEMENT.')
        self.stdout.write('   L\'accès sera révoqué automatiquement après 5 minutes.')
        self.stdout.write('   Parfait pour tester le workflow complet !')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🔗 Utilisation:'))
        self.stdout.write('   1. Aller sur le site → Services → Signaux')
        self.stdout.write(f'   2. Sélectionner "{offer.name}"')
        self.stdout.write('   3. Effectuer le paiement de test (1€)')
        self.stdout.write('   4. Service Client valide')
        self.stdout.write('   5. Token Telegram généré automatiquement')
        self.stdout.write('   6. User clique sur le bot → Accès canal')
        self.stdout.write('   7. Attendre 5 minutes → Révocation automatique')

