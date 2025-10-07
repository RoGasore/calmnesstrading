from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Sum
from datetime import timedelta
from payments.models import Subscription, Payment
from .models import UserNotification
from .serializers import UserSerializer

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    """
    Vue d'ensemble du dashboard utilisateur avec toutes les statistiques
    """
    user = request.user
    
    # Récupérer les abonnements actifs
    active_subscriptions = Subscription.objects.filter(
        user=user,
        status='active',
        end_date__gt=timezone.now()
    ).select_related('offer')
    
    # Récupérer les paiements
    payments = Payment.objects.filter(user=user).order_by('-paid_at')
    total_spent = payments.filter(status='completed').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Statistiques des notifications
    unread_notifications = UserNotification.objects.filter(
        user=user,
        status='sent'
    ).count()
    
    # Préparer les données des abonnements
    subscriptions_data = []
    for sub in active_subscriptions:
        time_remaining = sub.end_date - timezone.now()
        days = time_remaining.days
        hours = int(time_remaining.seconds / 3600)
        minutes = int((time_remaining.seconds % 3600) / 60)
        
        subscriptions_data.append({
            'id': sub.id,
            'service_name': sub.offer.name,
            'service_type': sub.offer.offer_type,
            'start_date': sub.start_date,
            'end_date': sub.end_date,
            'status': sub.status,
            'days_remaining': days,
            'hours_remaining': hours,
            'minutes_remaining': minutes,
            'total_seconds_remaining': int(time_remaining.total_seconds()),
            'telegram_added': sub.telegram_added,
            'discord_added': sub.discord_added,
        })
    
    # Historique récent des paiements
    recent_payments = []
    for payment in payments[:5]:
        recent_payments.append({
            'id': payment.id,
            'service_name': payment.offer.name,
            'amount': float(payment.amount),
            'currency': payment.currency,
            'payment_method': payment.payment_method,
            'status': payment.status,
            'paid_at': payment.paid_at,
        })
    
    # Vérifier si le profil est complet
    profile_complete = user.has_complete_profile()
    missing_fields = []
    if not user.first_name:
        missing_fields.append('first_name')
    if not user.last_name:
        missing_fields.append('last_name')
    if not user.is_verified:
        missing_fields.append('email_verification')
    if not user.telegram_username and not user.discord_username:
        missing_fields.append('contact_method')
    
    return Response({
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.full_name,
            'telegram_username': user.telegram_username,
            'discord_username': user.discord_username,
            'whatsapp_number': user.whatsapp_number,
            'is_verified': user.is_verified,
            'can_make_payment': user.can_make_payment,
            'profile_complete': profile_complete,
            'missing_fields': missing_fields,
        },
        'stats': {
            'active_subscriptions': len(subscriptions_data),
            'total_spent': float(total_spent),
            'total_payments': payments.count(),
            'unread_notifications': unread_notifications,
        },
        'active_subscriptions': subscriptions_data,
        'recent_payments': recent_payments,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_notifications(request):
    """
    Récupérer les notifications de l'utilisateur
    """
    user = request.user
    status_filter = request.GET.get('status', None)
    
    notifications = UserNotification.objects.filter(user=user)
    
    if status_filter:
        notifications = notifications.filter(status=status_filter)
    
    notifications = notifications.order_by('-created_at')[:50]
    
    notifications_data = []
    for notif in notifications:
        notifications_data.append({
            'id': notif.id,
            'type': notif.notification_type,
            'title': notif.title,
            'message': notif.message,
            'status': notif.status,
            'created_at': notif.created_at,
            'sent_at': notif.sent_at,
            'read_at': notif.read_at,
        })
    
    return Response({
        'notifications': notifications_data,
        'total': notifications.count()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Marquer une notification comme lue
    """
    try:
        notification = UserNotification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.mark_as_read()
        return Response({'success': True})
    except UserNotification.DoesNotExist:
        return Response(
            {'error': 'Notification non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """
    Marquer toutes les notifications comme lues
    """
    UserNotification.objects.filter(
        user=request.user,
        status='sent'
    ).update(
        status='read',
        read_at=timezone.now()
    )
    return Response({'success': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_subscriptions(request):
    """
    Récupérer tous les abonnements de l'utilisateur (actifs et expirés)
    """
    user = request.user
    subscriptions = Subscription.objects.filter(user=user).order_by('-created_at')
    
    subscriptions_data = []
    for sub in subscriptions:
        is_active = sub.is_active()
        time_remaining = None
        
        if is_active:
            delta = sub.end_date - timezone.now()
            time_remaining = {
                'days': delta.days,
                'hours': int(delta.seconds / 3600),
                'minutes': int((delta.seconds % 3600) / 60),
                'total_seconds': int(delta.total_seconds()),
            }
        
        subscriptions_data.append({
            'id': sub.id,
            'service_name': sub.offer.name,
            'service_type': sub.offer.offer_type,
            'start_date': sub.start_date,
            'end_date': sub.end_date,
            'status': sub.status,
            'is_active': is_active,
            'time_remaining': time_remaining,
            'telegram_added': sub.telegram_added,
            'discord_added': sub.discord_added,
            'payment_id': sub.payment.id if sub.payment else None,
        })
    
    return Response({
        'subscriptions': subscriptions_data,
        'total': subscriptions.count(),
        'active_count': subscriptions.filter(status='active', end_date__gt=timezone.now()).count()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_payments_history(request):
    """
    Récupérer l'historique complet des paiements
    """
    user = request.user
    payments = Payment.objects.filter(user=user).order_by('-paid_at')
    
    payments_data = []
    for payment in payments:
        payments_data.append({
            'id': payment.id,
            'service_name': payment.offer.name,
            'service_type': payment.offer.offer_type,
            'amount': float(payment.amount),
            'currency': payment.currency,
            'payment_method': payment.payment_method,
            'status': payment.status,
            'paid_at': payment.paid_at,
            'transaction_id': payment.transaction_id,
        })
    
    # Statistiques
    total_spent = payments.filter(status='completed').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    return Response({
        'payments': payments_data,
        'total': payments.count(),
        'total_spent': float(total_spent),
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Mettre à jour le profil utilisateur
    """
    user = request.user
    data = request.data
    
    # Champs modifiables
    allowed_fields = [
        'first_name', 'last_name', 'phone',
        'telegram_username', 'discord_username', 'whatsapp_number'
    ]
    
    updated = False
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
            updated = True
    
    if updated:
        user.save()
        # Mettre à jour la permission de paiement
        user.update_payment_permission()
    
    # Mettre à jour le profil étendu
    if hasattr(user, 'profile'):
        profile = user.profile
        profile_fields = ['bio', 'trading_experience', 'country', 'city', 'risk_tolerance']
        
        for field in profile_fields:
            if field in data:
                setattr(profile, field, data[field])
        
        if 'preferred_assets' in data:
            profile.preferred_assets = data['preferred_assets']
        
        profile.save()
    
    return Response({
        'success': True,
        'user': UserSerializer(user).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment_eligibility(request):
    """
    Vérifier si l'utilisateur peut effectuer un paiement
    """
    user = request.user
    can_pay = user.has_complete_profile()
    
    missing_fields = []
    if not user.first_name:
        missing_fields.append({
            'field': 'first_name',
            'label': 'Prénom',
            'message': 'Votre prénom est requis'
        })
    if not user.last_name:
        missing_fields.append({
            'field': 'last_name',
            'label': 'Nom',
            'message': 'Votre nom est requis'
        })
    if not user.is_verified:
        missing_fields.append({
            'field': 'email',
            'label': 'Email vérifié',
            'message': 'Vous devez vérifier votre adresse email'
        })
    if not user.telegram_username and not user.discord_username:
        missing_fields.append({
            'field': 'contact',
            'label': 'Méthode de contact',
            'message': 'Vous devez fournir au moins un identifiant Telegram ou Discord'
        })
    
    return Response({
        'can_make_payment': can_pay,
        'missing_fields': missing_fields,
        'profile_completion': {
            'has_full_name': bool(user.first_name and user.last_name),
            'email_verified': user.is_verified,
            'has_contact_method': bool(user.telegram_username or user.discord_username),
            'has_telegram': bool(user.telegram_username),
            'has_discord': bool(user.discord_username),
            'has_whatsapp': bool(user.whatsapp_number),
        }
    })

