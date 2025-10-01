from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from payments.models import Offer, PendingPayment, Payment, Subscription
from decimal import Decimal
from datetime import datetime, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Initialise des donnees de test pour les paiements (dev uniquement)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n=== Initialisation des donnees de paiements de test ===\n'))

        # 1. Obtenir ou creer un utilisateur de test
        user, created = User.objects.get_or_create(
            email='user@test.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True,
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
            self.stdout.write(self.style.SUCCESS('[OK] Utilisateur de test cree'))
        else:
            self.stdout.write('[SKIP] Utilisateur de test existe deja')

        # 2. Obtenir quelques offres
        offers = list(Offer.objects.filter(is_active=True)[:5])
        if not offers:
            self.stdout.write(self.style.ERROR('[ERROR] Aucune offre active trouvee. Lancez sync_real_data d\'abord.'))
            return

        # 3. Creer des paiements en attente
        self.stdout.write('\n1. Creation de paiements en attente...')
        pending_payments_data = [
            {
                'user': user,
                'offer': offers[0],
                'amount': Decimal(offers[0].price),
                'currency': offers[0].currency,
                'contact_method': 'whatsapp',
                'contact_info': '+1234567890',
                'status': 'pending'
            },
            {
                'user': user,
                'offer': offers[1],
                'amount': Decimal(offers[1].price),
                'currency': offers[1].currency,
                'contact_method': 'telegram',
                'contact_info': '@testuser',
                'status': 'pending'
            },
        ]

        for data in pending_payments_data:
            pending, created = PendingPayment.objects.get_or_create(
                user=data['user'],
                offer=data['offer'],
                status='pending',
                defaults=data
            )
            if created:
                self.stdout.write(f'  [OK] Paiement en attente cree: {pending.offer.name}')
            else:
                self.stdout.write(f'  [SKIP] Paiement en attente existe: {pending.offer.name}')

        # 4. Creer des paiements valides (historique)
        self.stdout.write('\n2. Creation de paiements valides (historique)...')
        payments_data = [
            {
                'user': user,
                'offer': offers[2],
                'amount': Decimal(offers[2].price),
                'currency': offers[2].currency,
                'payment_method': 'manual',
                'status': 'completed',
                'admin_notes': 'Paiement valide via WhatsApp'
            },
            {
                'user': user,
                'offer': offers[3],
                'amount': Decimal(offers[3].price),
                'currency': offers[3].currency,
                'payment_method': 'manual',
                'status': 'completed',
                'admin_notes': 'Paiement valide via Telegram'
            },
        ]

        for data in payments_data:
            payment, created = Payment.objects.get_or_create(
                user=data['user'],
                offer=data['offer'],
                defaults=data
            )
            if created:
                self.stdout.write(f'  [OK] Paiement valide cree: {payment.offer.name}')
                
                # Creer une souscription si c'est un abonnement
                if payment.offer.duration_days:
                    Subscription.objects.get_or_create(
                        user=user,
                        offer=payment.offer,
                        payment=payment,
                        defaults={
                            'start_date': datetime.now(),
                            'end_date': datetime.now() + timedelta(days=payment.offer.duration_days),
                            'status': 'active'
                        }
                    )
                    self.stdout.write(f'  [OK] Souscription creee pour: {payment.offer.name}')
            else:
                self.stdout.write(f'  [SKIP] Paiement existe: {payment.offer.name}')

        self.stdout.write(self.style.SUCCESS('\n=== Donnees de test creees avec succes ===\n'))
        self.stdout.write(self.style.WARNING('Note: Ces donnees sont pour le dev seulement. Ne pas utiliser en production.\n'))

