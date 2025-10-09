from django.core.management.base import BaseCommand
from payments.models import Offer

class Command(BaseCommand):
    help = 'Créer une offre de test 10 minutes pour démonstration complète du système Telegram'

    def handle(self, *args, **options):
        self.stdout.write('🧪 Création offre de test 10 minutes...')
        
        # Créer ou mettre à jour l'offre de test
        offer, created = Offer.objects.update_or_create(
            name="Signal Demo 10min",
            defaults={
                'description': 'Abonnement de démonstration 10 minutes - Accès aux signaux de trading premium pour tester le système complet (révocation automatique après 10 minutes)',
                'offer_type': 'signal',
                'price': 1.00,  # 1€ pour test
                'currency': 'EUR',
                'duration_minutes': 10,  # 10 minutes d'accès
                'is_active': True,
                'color_theme': 'gold',
                'metadata': {
                    'is_test': True,
                    'auto_revoke': True,
                    'test_duration': '10 minutes',
                    'description_details': 'Offre de démonstration pour validation du workflow complet : paiement → validation → bot Telegram → accès canal → révocation automatique'
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
        self.stdout.write(f'   Description     : {offer.description[:80]}...')
        self.stdout.write(f'   Prix            : {offer.price} {offer.currency}')
        self.stdout.write(f'   Type            : {offer.get_offer_type_display()}')
        self.stdout.write(f'   Durée           : {offer.duration_minutes} minutes')
        self.stdout.write(f'   Statut          : {"Actif ✅" if offer.is_active else "Inactif ❌"}')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('⚠️  ATTENTION - DÉMONSTRATION:'))
        self.stdout.write('   Cette offre donne accès au canal Telegram pour 10 minutes SEULEMENT.')
        self.stdout.write('   L\'accès sera révoqué automatiquement après 10 minutes.')
        self.stdout.write('   Parfait pour démontrer tout le workflow !')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🎯 Scénario de test complet:'))
        self.stdout.write('')
        self.stdout.write('   📱 UTILISATEUR:')
        self.stdout.write('   1. Se connecter sur le site')
        self.stdout.write('   2. Aller dans Services → Signaux')
        self.stdout.write(f'   3. Sélectionner "{offer.name}"')
        self.stdout.write('   4. Remplir le formulaire avec son @username Telegram')
        self.stdout.write('   5. Soumettre un ID de transaction (ex: DEMO-001)')
        self.stdout.write('   6. Message: "Merci ! En attente de vérification..."')
        self.stdout.write('')
        self.stdout.write('   🛟 SERVICE CLIENT:')
        self.stdout.write('   7. Se connecter sur /support')
        self.stdout.write('   8. Aller dans Paiements')
        self.stdout.write('   9. Cliquer sur "Vérifier & Valider"')
        self.stdout.write('   10. Confirmer la validation')
        self.stdout.write('')
        self.stdout.write('   🤖 AUTOMATIQUE:')
        self.stdout.write('   11. Token Telegram généré automatiquement')
        self.stdout.write('   12. Notification créée avec lien bot')
        self.stdout.write('')
        self.stdout.write('   👤 UTILISATEUR (suite):')
        self.stdout.write('   13. Voir la notification "Paiement validé !"')
        self.stdout.write('   14. Cliquer sur le lien du bot Telegram')
        self.stdout.write('   15. /start TOKEN dans le bot')
        self.stdout.write('   16. Recevoir lien invitation unique (expire 5min)')
        self.stdout.write('   17. Rejoindre le canal privé')
        self.stdout.write('   18. Voir les signaux pendant 10 minutes ✅')
        self.stdout.write('')
        self.stdout.write('   ⏰ APRÈS 10 MINUTES:')
        self.stdout.write('   19. Celery détecte expiration (vérif chaque minute)')
        self.stdout.write('   20. User banni automatiquement du canal')
        self.stdout.write('   21. Notification "Abonnement expiré"')
        self.stdout.write('   22. User ne voit plus le canal ❌')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✅ RÉSULTAT:'))
        self.stdout.write('   Workflow complet validé en 10 minutes !')
        self.stdout.write('   Révocation automatique précise à la minute')
        self.stdout.write('   Système prêt pour production')

