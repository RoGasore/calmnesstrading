"""Vues pour les administrateurs (validation, gestion des paiements)"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from django.db.models import Sum
from datetime import timedelta

from .models import PendingPayment, Payment, Subscription, PaymentHistory
from .serializers import (
    PendingPaymentSerializer, PendingPaymentUpdateSerializer,
    PaymentSerializer, SubscriptionSerializer, ValidatePaymentSerializer
)


# ==================== PAIEMENTS EN ATTENTE (ADMIN) ====================

class AdminPendingPaymentListView(generics.ListAPIView):
    """Liste tous les paiements en attente (admin uniquement)"""
    serializer_class = PendingPaymentSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status', None)
        queryset = PendingPayment.objects.select_related('user', 'offer', 'validated_by').all()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


class AdminPendingPaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, mise à jour et suppression d'un paiement en attente (admin)"""
    serializer_class = PendingPaymentSerializer
    permission_classes = [IsAdminUser]
    queryset = PendingPayment.objects.select_related('user', 'offer', 'validated_by').all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PendingPaymentUpdateSerializer
        return PendingPaymentSerializer
    
    def perform_update(self, serializer):
        instance = serializer.save()
        
        # Créer une entrée dans l'historique
        PaymentHistory.objects.create(
            pending_payment=instance,
            action='contacted' if instance.status == 'contacted' else 'cancelled',
            description=f"Statut mis à jour: {instance.get_status_display()}",
            created_by=self.request.user
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def validate_pending_payment(request):
    """Valider un paiement en attente et créer un paiement validé + abonnement si applicable"""
    
    serializer = ValidatePaymentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    pending_payment_id = serializer.validated_data['pending_payment_id']
    transaction_id = serializer.validated_data.get('transaction_id', '') or pending_payment.transaction_id
    admin_notes = serializer.validated_data.get('admin_notes', '')
    
    try:
        pending_payment = PendingPayment.objects.select_related('user', 'offer').get(id=pending_payment_id)
        
        # Vérifier que le paiement est en attente ou transaction soumise
        if pending_payment.status not in ['pending', 'transaction_submitted', 'contacted']:
            return Response(
                {'error': 'Ce paiement a déjà été traité'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer le paiement validé
        payment = Payment.objects.create(
            user=pending_payment.user,
            offer=pending_payment.offer,
            pending_payment=pending_payment,
            amount=pending_payment.amount,
            currency=pending_payment.currency,
            payment_method='manual',
            status='completed',
            transaction_id=transaction_id,
            validated_by=request.user,
            admin_notes=admin_notes
        )
        
        # Mettre à jour le paiement en attente
        pending_payment.status = 'confirmed'
        pending_payment.transaction_id = transaction_id
        pending_payment.validated_by = request.user
        pending_payment.validated_at = timezone.now()
        pending_payment.admin_notes = admin_notes
        pending_payment.save()
        
        # Si c'est un abonnement, créer l'abonnement
        subscription = None
        if pending_payment.offer.offer_type == 'subscription' and pending_payment.offer.duration_days:
            start_date = timezone.now()
            end_date = start_date + timedelta(days=pending_payment.offer.duration_days)
            
            subscription = Subscription.objects.create(
                user=pending_payment.user,
                offer=pending_payment.offer,
                payment=payment,
                start_date=start_date,
                end_date=end_date,
                status='active'
            )
        
        # Créer une entrée dans l'historique
        PaymentHistory.objects.create(
            payment=payment,
            pending_payment=pending_payment,
            action='validated',
            description=f"Paiement validé pour {pending_payment.offer.name}",
            created_by=request.user
        )
        
        # Générer et envoyer la facture automatiquement
        try:
            from .models_invoice import Invoice, InvoiceItem
            from .utils import send_invoice_email, send_invoice_telegram
            
            # Créer la facture
            invoice = Invoice.objects.create(
                user=pending_payment.user,
                total_amount=pending_payment.amount,
                currency=pending_payment.currency,
                transaction_id=transaction_id,
                status='paid',
                created_by=request.user
            )
            
            # Créer l'article de facture
            InvoiceItem.objects.create(
                invoice=invoice,
                description=f"{pending_payment.offer.name} - {pending_payment.offer.description}",
                quantity=1,
                unit_price=pending_payment.amount,
                total_price=pending_payment.amount
            )
            
            # Lier la facture au paiement
            payment.invoice = invoice
            payment.save()
            
            # Envoyer la facture par email
            user_email = pending_payment.user_info.get('email') or pending_payment.user.email
            if user_email:
                send_invoice_email(invoice, user_email)
            
            # Envoyer par Telegram si disponible
            telegram_username = pending_payment.user_info.get('telegram_username')
            if telegram_username:
                send_invoice_telegram(invoice, telegram_username)
                
        except Exception as e:
            # Ne pas bloquer si l'envoi échoue, juste logger
            print(f"Erreur envoi facture: {e}")
        
        # Préparer la réponse
        response_data = {
            'message': 'Paiement validé avec succès. Facture envoyée au client.',
            'payment': PaymentSerializer(payment).data,
            'pending_payment': PendingPaymentSerializer(pending_payment).data
        }
        
        if subscription:
            response_data['subscription'] = SubscriptionSerializer(subscription).data
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except PendingPayment.DoesNotExist:
        return Response(
            {'error': 'Paiement en attente non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la validation: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def cancel_pending_payment(request, pk):
    """Annuler un paiement en attente"""
    
    try:
        pending_payment = PendingPayment.objects.get(id=pk)
        
        if pending_payment.status == 'confirmed':
            return Response(
                {'error': 'Impossible d\'annuler un paiement déjà confirmé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pending_payment.status = 'cancelled'
        pending_payment.validated_by = request.user
        pending_payment.validated_at = timezone.now()
        pending_payment.save()
        
        # Créer une entrée dans l'historique
        PaymentHistory.objects.create(
            pending_payment=pending_payment,
            action='cancelled',
            description=f"Paiement annulé par l'admin",
            created_by=request.user
        )
        
        return Response({
            'message': 'Paiement annulé avec succès',
            'pending_payment': PendingPaymentSerializer(pending_payment).data
        })
        
    except PendingPayment.DoesNotExist:
        return Response(
            {'error': 'Paiement en attente non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )


# ==================== PAIEMENTS ====================

class PaymentListView(generics.ListAPIView):
    """Liste tous les paiements (admin uniquement)"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Payment.objects.select_related('user', 'offer', 'validated_by').all()


# ==================== ABONNEMENTS ====================

class SubscriptionListView(generics.ListAPIView):
    """Liste tous les abonnements (admin uniquement)"""
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status', None)
        queryset = Subscription.objects.select_related('user', 'offer', 'payment').all()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


# ==================== DASHBOARD ADMIN ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    """Dashboard admin avec statistiques des paiements"""
    
    # Paiements en attente
    pending_count = PendingPayment.objects.filter(status='pending').count()
    contacted_count = PendingPayment.objects.filter(status='contacted').count()
    
    # Paiements validés
    completed_payments = Payment.objects.filter(status='completed')
    total_revenue = completed_payments.aggregate(total=Sum('amount'))['total'] or 0
    
    # Abonnements actifs
    active_subscriptions = Subscription.objects.filter(
        status='active',
        end_date__gt=timezone.now()
    ).count()
    
    # Abonnements expirant dans les 7 prochains jours
    expiring_soon = Subscription.objects.filter(
        status='active',
        end_date__lte=timezone.now() + timedelta(days=7),
        end_date__gt=timezone.now()
    ).count()
    
    # Derniers paiements en attente
    recent_pending = PendingPayment.objects.filter(
        status='pending'
    ).select_related('user', 'offer').order_by('-created_at')[:10]
    
    return Response({
        'pending_payments_count': pending_count,
        'contacted_payments_count': contacted_count,
        'total_revenue': total_revenue,
        'active_subscriptions_count': active_subscriptions,
        'expiring_soon_count': expiring_soon,
        'recent_pending_payments': PendingPaymentSerializer(recent_pending, many=True).data
    })

