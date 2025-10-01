"""Vues pour les utilisateurs (paiements, abonnements, dashboard)"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum

from .models import PendingPayment, Payment, Subscription, PaymentHistory
from .serializers import (
    PendingPaymentSerializer, PendingPaymentCreateSerializer,
    PaymentSerializer, SubscriptionSerializer
)


# ==================== PAIEMENTS EN ATTENTE (UTILISATEUR) ====================

class UserPendingPaymentListView(generics.ListAPIView):
    """Liste les paiements en attente de l'utilisateur connecté"""
    serializer_class = PendingPaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PendingPayment.objects.filter(user=self.request.user)


class CreatePendingPaymentView(generics.CreateAPIView):
    """Créer un paiement en attente"""
    serializer_class = PendingPaymentCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        pending_payment = serializer.save(user=self.request.user)
        
        # Créer une entrée dans l'historique
        PaymentHistory.objects.create(
            pending_payment=pending_payment,
            action='created',
            description=f"Paiement en attente créé pour {pending_payment.offer.name}",
            created_by=self.request.user
        )
        
        return pending_payment


# ==================== PAIEMENTS ====================

class UserPaymentListView(generics.ListAPIView):
    """Liste les paiements de l'utilisateur connecté"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).select_related('offer')


# ==================== ABONNEMENTS ====================

class UserSubscriptionListView(generics.ListAPIView):
    """Liste les abonnements de l'utilisateur connecté"""
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user).select_related('offer', 'payment')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_active_subscriptions(request):
    """Récupérer les abonnements actifs de l'utilisateur"""
    
    subscriptions = Subscription.objects.filter(
        user=request.user,
        status='active',
        end_date__gt=timezone.now()
    ).select_related('offer', 'payment')
    
    serializer = SubscriptionSerializer(subscriptions, many=True)
    return Response(serializer.data)


# ==================== DASHBOARD UTILISATEUR ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    """Dashboard complet de l'utilisateur avec abonnements, paiements, etc."""
    
    user = request.user
    
    # Abonnements actifs
    active_subscriptions = Subscription.objects.filter(
        user=user,
        status='active',
        end_date__gt=timezone.now()
    ).select_related('offer', 'payment')
    
    # Historique des paiements
    payment_history = Payment.objects.filter(user=user).select_related('offer')
    
    # Paiements en attente
    pending_payments = PendingPayment.objects.filter(user=user).select_related('offer')
    
    # Total dépensé
    total_spent = Payment.objects.filter(user=user, status='completed').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    return Response({
        'active_subscriptions': SubscriptionSerializer(active_subscriptions, many=True).data,
        'payment_history': PaymentSerializer(payment_history, many=True).data,
        'pending_payments': PendingPaymentSerializer(pending_payments, many=True).data,
        'total_spent': total_spent
    })

