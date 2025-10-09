from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings

from .models_telegram import TelegramBotToken, TelegramChannelInvite, TelegramChannelMember, TelegramNotification
from payments.models import Payment, PendingPayment

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_telegram_token(request):
    """
    Générer un token Telegram après validation de paiement
    Appelé automatiquement après qu'un paiement est validé par le service client
    """
    user = request.user
    payment_id = request.data.get('payment_id')
    transaction_id = request.data.get('transaction_id')
    
    if not payment_id:
        return Response(
            {'error': 'payment_id requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Vérifier que le paiement existe et appartient à l'utilisateur
        payment = Payment.objects.get(id=payment_id, user=user)
        
        # Générer le token (valide 24h)
        bot_token = TelegramBotToken.generate_token(
            user=user,
            payment_id=payment_id,
            transaction_id=transaction_id or payment.transaction_id,
            expiry_hours=24
        )
        
        # Générer le lien vers le bot
        bot_username = settings.TELEGRAM_BOT_USERNAME
        bot_link = f"https://t.me/{bot_username}?start={bot_token.token}"
        
        # Créer une notification
        notification = TelegramNotification.objects.create(
            user=user,
            notification_type='payment_verified',
            title='Paiement validé !',
            message=f'Votre paiement a été validé avec succès. Cliquez sur le lien ci-dessous pour accéder à votre canal Telegram privé.',
            action_url=bot_link,
            metadata={
                'payment_id': payment_id,
                'token': bot_token.token,
                'expires_at': bot_token.expires_at.isoformat()
            }
        )
        notification.mark_as_sent(via_site=True)
        
        return Response({
            'success': True,
            'message': 'Token généré avec succès',
            'bot_link': bot_link,
            'token': bot_token.token,
            'expires_at': bot_token.expires_at,
            'notification_id': notification.id
        })
    
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Paiement non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_telegram_notifications(request):
    """
    Récupérer les notifications Telegram de l'utilisateur
    """
    user = request.user
    
    notifications = TelegramNotification.objects.filter(
        user=user,
        status='sent'
    ).order_by('-created_at')[:10]
    
    data = [{
        'id': n.id,
        'type': n.notification_type,
        'title': n.title,
        'message': n.message,
        'action_url': n.action_url,
        'created_at': n.created_at,
        'sent_at': n.sent_at
    } for n in notifications]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_telegram_status(request):
    """
    Récupérer le statut Telegram de l'utilisateur (memberships actifs)
    """
    user = request.user
    
    # Récupérer les memberships actifs
    memberships = TelegramChannelMember.objects.filter(
        user=user,
        status='active'
    ).order_by('-joined_at')
    
    data = [{
        'id': m.id,
        'channel_name': m.channel_name,
        'subscription_type': m.subscription_type,
        'joined_at': m.joined_at,
        'expires_at': m.expires_at,
        'subscription_end_date': m.subscription_end_date,
        'is_active': m.is_active(),
        'days_remaining': (m.subscription_end_date - timezone.now()).days
    } for m in memberships]
    
    return Response({
        'memberships': data,
        'telegram_username': user.telegram_username,
        'has_active_subscription': any(m.is_active() for m in memberships)
    })

@api_view(['POST'])
def revoke_telegram_access(request):
    """
    Révoquer l'accès Telegram d'un utilisateur (Admin/Support uniquement)
    """
    if not request.user.is_staff and request.user.role not in ['admin', 'customer_service']:
        return Response(
            {'error': 'Permission refusée'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    user_id = request.data.get('user_id')
    reason = request.data.get('reason', 'revoked')
    
    if not user_id:
        return Response(
            {'error': 'user_id requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=user_id)
        
        # Révoquer tous les memberships actifs
        memberships = TelegramChannelMember.objects.filter(
            user=user,
            status='active'
        )
        
        revoked_count = 0
        for membership in memberships:
            membership.revoke_access(reason)
            revoked_count += 1
            
            # Créer une notification
            TelegramNotification.objects.create(
                user=user,
                notification_type='access_revoked',
                title='Accès révoqué',
                message=f'Votre accès au canal {membership.channel_name} a été révoqué.',
                metadata={
                    'reason': reason,
                    'channel_id': membership.channel_id
                }
            ).mark_as_sent(via_site=True)
        
        return Response({
            'success': True,
            'message': f'{revoked_count} accès révoqué(s)',
            'revoked_count': revoked_count
        })
    
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_admin_telegram_stats(request):
    """
    Statistiques Telegram pour les admins
    """
    if not request.user.is_staff and request.user.role not in ['admin', 'customer_service']:
        return Response(
            {'error': 'Permission refusée'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Statistiques générales
    total_tokens = TelegramBotToken.objects.count()
    pending_tokens = TelegramBotToken.objects.filter(status='pending').count()
    used_tokens = TelegramBotToken.objects.filter(status='used').count()
    
    total_invites = TelegramChannelInvite.objects.count()
    accepted_invites = TelegramChannelInvite.objects.filter(status='accepted').count()
    
    total_members = TelegramChannelMember.objects.count()
    active_members = TelegramChannelMember.objects.filter(status='active').count()
    
    # Statistiques récentes (7 derniers jours)
    seven_days_ago = timezone.now() - timezone.timedelta(days=7)
    recent_tokens = TelegramBotToken.objects.filter(created_at__gte=seven_days_ago).count()
    recent_joins = TelegramChannelMember.objects.filter(joined_at__gte=seven_days_ago).count()
    
    return Response({
        'tokens': {
            'total': total_tokens,
            'pending': pending_tokens,
            'used': used_tokens,
            'recent': recent_tokens
        },
        'invites': {
            'total': total_invites,
            'accepted': accepted_invites,
            'acceptance_rate': round((accepted_invites / total_invites * 100) if total_invites > 0 else 0, 2)
        },
        'members': {
            'total': total_members,
            'active': active_members,
            'recent_joins': recent_joins
        }
    })

