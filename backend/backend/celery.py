"""
Configuration Celery pour Calmness Trading
"""
import os
from celery import Celery
from celery.schedules import crontab

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Création de l'app Celery
app = Celery('calmnesstrading')

# Configuration depuis Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-découverte des tâches dans les apps Django
app.autodiscover_tasks()

# Configuration du scheduler (Celery Beat)
app.conf.beat_schedule = {
    # ==================== TELEGRAM TASKS ====================
    
    # Expirer les tokens toutes les heures
    'expire-telegram-tokens-hourly': {
        'task': 'accounts.tasks_telegram.expire_old_tokens',
        'schedule': crontab(minute=0),  # Toutes les heures à :00
    },
    
    # Expirer les invitations toutes les heures
    'expire-telegram-invites-hourly': {
        'task': 'accounts.tasks_telegram.expire_old_invites',
        'schedule': crontab(minute=15),  # Toutes les heures à :15
    },
    
    # Vérifier les abonnements expirés tous les jours à 00:00
    'check-expired-subscriptions-daily': {
        'task': 'accounts.tasks_telegram.check_expired_subscriptions',
        'schedule': crontab(hour=0, minute=0),  # Tous les jours à 00:00
    },
    
    # Envoyer les notifications d'expiration tous les jours à 09:00
    'send-expiration-warnings-daily': {
        'task': 'accounts.tasks_telegram.send_expiration_warnings',
        'schedule': crontab(hour=9, minute=0),  # Tous les jours à 09:00
    },
    
    # Nettoyer les anciennes notifications toutes les semaines (lundi à 03:00)
    'cleanup-old-notifications-weekly': {
        'task': 'accounts.tasks_telegram.cleanup_old_notifications',
        'schedule': crontab(day_of_week=1, hour=3, minute=0),  # Lundi à 03:00
    },
    
    # Synchroniser les membres du canal tous les jours à 03:00
    'sync-telegram-members-daily': {
        'task': 'accounts.tasks_telegram.sync_telegram_members',
        'schedule': crontab(hour=3, minute=0),  # Tous les jours à 03:00
    },
    
    # ==================== ANALYTICS TASKS ====================
    
    # Mettre à jour les analytics tous les jours à 04:00
    # 'update-analytics-daily': {
    #     'task': 'analytics.tasks.update_analytics',
    #     'schedule': crontab(hour=4, minute=0),
    # },
}

# Configuration timezone
app.conf.timezone = 'Europe/Paris'

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Tâche de debug"""
    print(f'Request: {self.request!r}')

