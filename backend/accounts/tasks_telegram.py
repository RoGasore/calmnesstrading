"""
Tasks Celery pour la gestion automatique des accès Telegram
"""
from celery import shared_task
from django.utils import timezone
from django.conf import settings
import logging
import telegram

from .models_telegram import TelegramBotToken, TelegramChannelInvite, TelegramChannelMember, TelegramNotification

logger = logging.getLogger(__name__)

@shared_task
def expire_old_tokens():
    """
    Marquer les tokens expirés comme 'expired'
    À exécuter toutes les heures
    """
    now = timezone.now()
    
    # Trouver tous les tokens pending et expirés
    expired_tokens = TelegramBotToken.objects.filter(
        status='pending',
        expires_at__lt=now
    )
    
    count = expired_tokens.count()
    expired_tokens.update(status='expired')
    
    logger.info(f"✅ {count} tokens expirés marqués comme 'expired'")
    return f"Expired {count} tokens"

@shared_task
def expire_old_invites():
    """
    Marquer les invitations expirées comme 'expired'
    À exécuter toutes les heures
    """
    now = timezone.now()
    
    # Trouver toutes les invitations pending/sent et expirées
    expired_invites = TelegramChannelInvite.objects.filter(
        status__in=['pending', 'sent'],
        expires_at__lt=now
    )
    
    count = expired_invites.count()
    expired_invites.update(status='expired')
    
    logger.info(f"✅ {count} invitations expirées marquées comme 'expired'")
    return f"Expired {count} invites"

@shared_task
def check_expired_subscriptions():
    """
    Vérifier et révoquer les abonnements expirés
    À exécuter tous les jours à 00:00
    """
    now = timezone.now()
    
    # Trouver tous les membres actifs avec abonnement expiré
    expired_members = TelegramChannelMember.objects.filter(
        status='active',
        subscription_end_date__lt=now
    )
    
    revoked_count = 0
    notified_count = 0
    
    for member in expired_members:
        try:
            # Révoquer l'accès
            member.revoke_access('expired')
            revoked_count += 1
            
            # Bannir du canal Telegram
            try:
                bot = telegram.Bot(token=settings.TELEGRAM_BOT_TOKEN)
                bot.ban_chat_member(
                    chat_id=member.channel_id,
                    user_id=member.telegram_user_id
                )
                logger.info(f"✅ {member.user.username} banni du canal {member.channel_name}")
            except Exception as e:
                logger.error(f"❌ Erreur bannissement {member.user.username}: {e}")
            
            # Créer une notification
            TelegramNotification.objects.create(
                user=member.user,
                notification_type='access_expired',
                title='Abonnement expiré',
                message=f'Votre abonnement au canal {member.channel_name} a expiré. Renouvelez votre abonnement pour continuer à avoir accès.',
                metadata={
                    'channel_id': member.channel_id,
                    'expired_at': member.subscription_end_date.isoformat()
                }
            ).mark_as_sent(via_site=True)
            notified_count += 1
            
        except Exception as e:
            logger.error(f"❌ Erreur révocation {member.user.username}: {e}")
    
    logger.info(f"✅ {revoked_count} abonnements révoqués, {notified_count} notifications envoyées")
    return f"Revoked {revoked_count} subscriptions, notified {notified_count} users"

@shared_task
def send_expiration_warnings():
    """
    Envoyer des notifications aux utilisateurs dont l'abonnement expire bientôt
    À exécuter tous les jours à 09:00
    """
    now = timezone.now()
    seven_days_later = now + timezone.timedelta(days=7)
    
    # Trouver tous les membres actifs avec abonnement expirant dans 7 jours
    expiring_soon = TelegramChannelMember.objects.filter(
        status='active',
        subscription_end_date__gte=now,
        subscription_end_date__lte=seven_days_later
    )
    
    notified_count = 0
    
    for member in expiring_soon:
        days_remaining = (member.subscription_end_date - now).days
        
        # Vérifier si une notification a déjà été envoyée récemment
        recent_notification = TelegramNotification.objects.filter(
            user=member.user,
            notification_type='access_expiring',
            created_at__gte=now - timezone.timedelta(days=1)
        ).exists()
        
        if not recent_notification:
            try:
                # Créer une notification
                TelegramNotification.objects.create(
                    user=member.user,
                    notification_type='access_expiring',
                    title='Abonnement bientôt expiré',
                    message=f'Votre abonnement au canal {member.channel_name} expire dans {days_remaining} jour(s). Renouvelez maintenant pour ne pas perdre l\'accès.',
                    action_url='https://calmnesstrading.vercel.app/services',
                    metadata={
                        'channel_id': member.channel_id,
                        'days_remaining': days_remaining,
                        'expires_at': member.subscription_end_date.isoformat()
                    }
                ).mark_as_sent(via_site=True)
                notified_count += 1
                
                logger.info(f"✅ Notification expiration envoyée à {member.user.username}")
                
            except Exception as e:
                logger.error(f"❌ Erreur notification {member.user.username}: {e}")
    
    logger.info(f"✅ {notified_count} notifications d'expiration envoyées")
    return f"Sent {notified_count} expiration warnings"

@shared_task
def cleanup_old_notifications():
    """
    Nettoyer les anciennes notifications (> 90 jours)
    À exécuter une fois par semaine
    """
    ninety_days_ago = timezone.now() - timezone.timedelta(days=90)
    
    old_notifications = TelegramNotification.objects.filter(
        created_at__lt=ninety_days_ago
    )
    
    count = old_notifications.count()
    old_notifications.delete()
    
    logger.info(f"✅ {count} anciennes notifications supprimées")
    return f"Deleted {count} old notifications"

@shared_task
def sync_telegram_members():
    """
    Synchroniser les membres du canal Telegram avec la base de données
    À exécuter tous les jours à 03:00
    """
    try:
        bot = telegram.Bot(token=settings.TELEGRAM_BOT_TOKEN)
        channel_id = settings.TELEGRAM_CHANNEL_ID
        
        # Récupérer le nombre de membres du canal
        chat = bot.get_chat(chat_id=channel_id)
        member_count = chat.member_count if hasattr(chat, 'member_count') else 0
        
        logger.info(f"✅ Synchronisation : {member_count} membres dans le canal Telegram")
        
        # TODO: Implémenter la logique de synchronisation complète si nécessaire
        # (nécessite des permissions admin sur le canal)
        
        return f"Synced: {member_count} members in channel"
        
    except Exception as e:
        logger.error(f"❌ Erreur synchronisation : {e}")
        return f"Sync failed: {str(e)}"

