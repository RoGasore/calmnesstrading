from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from accounts.models_support import SupportMessage, SupportReply, SupportOrder, SupportInvoice, SupportInvoiceItem

User = get_user_model()

class Command(BaseCommand):
    help = 'Créer des données de test pour le système support'

    def handle(self, *args, **options):
        self.stdout.write('Création des données de test support...')
        
        # Récupérer ou créer des utilisateurs de test
        try:
            test_user1 = User.objects.get(email='test@example.com')
        except User.DoesNotExist:
            test_user1 = User.objects.create_user(
                username='testuser1',
                email='test@example.com',
                password='testpass123',
                first_name='Jean',
                last_name='Dupont',
                phone='+33123456789',
                telegram_username='@jeandupont'
            )
            self.stdout.write(f'Utilisateur test créé: {test_user1.email}')
        
        try:
            test_user2 = User.objects.get(email='test2@example.com')
        except User.DoesNotExist:
            test_user2 = User.objects.create_user(
                username='testuser2',
                email='test2@example.com',
                password='testpass123',
                first_name='Marie',
                last_name='Martin',
                phone='+33987654321',
                discord_username='marie_martin#1234'
            )
            self.stdout.write(f'Utilisateur test créé: {test_user2.email}')
        
        try:
            test_user3 = User.objects.get(email='test3@example.com')
        except User.DoesNotExist:
            test_user3 = User.objects.create_user(
                username='testuser3',
                email='test3@example.com',
                password='testpass123',
                first_name='Pierre',
                last_name='Durand',
                telegram_username='@pierredurand',
                whatsapp_number='+33111222333'
            )
            self.stdout.write(f'Utilisateur test créé: {test_user3.email}')
        
        # Créer des messages de support
        messages_data = [
            {
                'user': test_user1,
                'subject': 'Problème avec mon abonnement',
                'message': 'Bonjour, j\'ai un problème avec mon abonnement aux signaux. Je ne reçois plus les notifications Telegram.',
                'priority': 'high',
                'status': 'unread',
                'created_at': timezone.now() - timedelta(hours=2)
            },
            {
                'user': test_user2,
                'subject': 'Question sur la formation',
                'message': 'Salut ! J\'aimerais savoir quand aura lieu la prochaine session de formation sur l\'analyse technique.',
                'priority': 'medium',
                'status': 'read',
                'created_at': timezone.now() - timedelta(hours=5)
            },
            {
                'user': test_user3,
                'subject': 'Demande de remboursement',
                'message': 'Je souhaite annuler mon abonnement et obtenir un remboursement. Le service ne correspond pas à mes attentes.',
                'priority': 'urgent',
                'status': 'replied',
                'created_at': timezone.now() - timedelta(days=1)
            }
        ]
        
        for msg_data in messages_data:
            message, created = SupportMessage.objects.get_or_create(
                user=msg_data['user'],
                subject=msg_data['subject'],
                defaults={
                    'message': msg_data['message'],
                    'priority': msg_data['priority'],
                    'status': msg_data['status'],
                    'created_at': msg_data['created_at']
                }
            )
            if created:
                self.stdout.write(f'Message créé: {message.subject}')
        
        # Créer des réponses
        try:
            message_with_reply = SupportMessage.objects.get(subject='Question sur la formation')
            reply, created = SupportReply.objects.get_or_create(
                message=message_with_reply,
                reply_text='Bonjour Marie, la prochaine session aura lieu mercredi prochain à 19h. Je vous envoie le lien par email.',
                defaults={
                    'is_from_support': True,
                    'created_by': User.objects.filter(role='customer_service').first() or test_user1
                }
            )
            if created:
                self.stdout.write(f'Réponse créée pour: {message_with_reply.subject}')
        except SupportMessage.DoesNotExist:
            pass
        
        # Créer des commandes support
        orders_data = [
            {
                'user': test_user1,
                'offer_name': 'Signaux Premium',
                'offer_description': 'Accès aux signaux de trading premium',
                'price': 297.00,
                'status': 'completed',
                'payment_status': 'paid',
                'tracking_info': {'method': 'email', 'details': 'Accès envoyé par email'}
            },
            {
                'user': test_user2,
                'offer_name': 'Formation Complète',
                'offer_description': 'Formation complète au trading',
                'price': 497.00,
                'status': 'processing',
                'payment_status': 'paid',
                'notes': 'Formation en cours de préparation'
            },
            {
                'user': test_user3,
                'offer_name': 'Signaux Basic',
                'offer_description': 'Accès aux signaux de trading basique',
                'price': 97.00,
                'status': 'pending',
                'payment_status': 'pending',
                'notes': 'En attente de paiement'
            }
        ]
        
        for order_data in orders_data:
            order, created = SupportOrder.objects.get_or_create(
                user=order_data['user'],
                offer_name=order_data['offer_name'],
                defaults=order_data
            )
            if created:
                self.stdout.write(f'Commande créée: {order.offer_name}')
        
        # Créer des factures support
        invoices_data = [
            {
                'user': test_user1,
                'invoice_number': 'CT-00001',
                'total_amount': 297.00,
                'status': 'paid',
                'due_date': timezone.now().date() - timedelta(days=5),
                'paid_at': timezone.now() - timedelta(days=8),
                'payment_method': 'Virement bancaire'
            },
            {
                'user': test_user2,
                'invoice_number': 'CT-00002',
                'total_amount': 497.00,
                'status': 'sent',
                'due_date': timezone.now().date() + timedelta(days=25)
            },
            {
                'user': test_user3,
                'invoice_number': 'CT-00003',
                'total_amount': 97.00,
                'status': 'overdue',
                'due_date': timezone.now().date() - timedelta(days=5),
                'notes': 'Relance envoyée le 15/12/2024'
            }
        ]
        
        for invoice_data in invoices_data:
            invoice, created = SupportInvoice.objects.get_or_create(
                invoice_number=invoice_data['invoice_number'],
                defaults=invoice_data
            )
            if created:
                self.stdout.write(f'Facture créée: {invoice.invoice_number}')
                
                # Créer les articles de facture
                SupportInvoiceItem.objects.create(
                    invoice=invoice,
                    description=f"{invoice_data['offer_name']} - Abonnement mensuel" if 'offer_name' in invoice_data else "Service",
                    quantity=1,
                    unit_price=invoice_data['total_amount'],
                    total_price=invoice_data['total_amount']
                )
        
        self.stdout.write(
            self.style.SUCCESS('✅ Données de test support créées avec succès!')
        )
        self.stdout.write('📊 Données créées:')
        self.stdout.write(f'   • {SupportMessage.objects.count()} messages de support')
        self.stdout.write(f'   • {SupportReply.objects.count()} réponses')
        self.stdout.write(f'   • {SupportOrder.objects.count()} commandes')
        self.stdout.write(f'   • {SupportInvoice.objects.count()} factures')
