from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from payments.models import Subscription
from accounts.models import UserNotification


class Command(BaseCommand):
    help = 'Créer les notifications automatiques pour les abonnements qui expirent'

    def handle(self, *args, **options):
        """
        Crée des notifications pour les abonnements:
        - 7 jours avant expiration
        - 3 jours avant
        - 2 jours avant
        - 1 jour avant
        - 1 jour après
        - 2 jours après
        - 3 jours après
        """
        now = timezone.now()
        
        # Délais de notification
        notification_timings = [
            (-7, 'warning_7_days', 'Renouvellement recommandé', 
             'Votre abonnement à {service} expire dans 7 jours. Pensez à le renouveler pour continuer à profiter de nos services ! 🔄'),
            
            (-3, 'warning_3_days', 'Expiration dans 3 jours', 
             'Plus que 3 jours avant l\'expiration de votre abonnement {service}. N\'oubliez pas de renouveler ! ⚠️'),
            
            (-2, 'warning_2_days', 'Expiration dans 2 jours', 
             'Attention ! Votre abonnement {service} expire dans 2 jours. Renouvelez dès maintenant pour ne pas perdre l\'accès. ⏰'),
            
            (-1, 'warning_1_day', 'Dernière chance !', 
             'Dernier jour ! Votre abonnement {service} expire demain. Renouvelez maintenant pour continuer sans interruption ! 🚨'),
            
            (1, 'expired_1_day', 'Abonnement expiré', 
             'Votre abonnement {service} a expiré hier. Renouvelez-le pour retrouver l\'accès à nos services premium. 💔'),
            
            (2, 'expired_2_days', 'On vous attend !', 
             'Cela fait 2 jours que votre abonnement {service} a expiré. Nous serions ravis de vous revoir ! Renouvelez maintenant. 🎯'),
            
            (3, 'expired_3_days', 'Dernière notification', 
             'Dernière relance : Votre abonnement {service} a expiré il y a 3 jours. Rejoignez-nous à nouveau ! C\'est votre dernière notification. 👋'),
        ]
        
        notifications_created = 0
        
        # Récupérer tous les abonnements actifs
        active_subscriptions = Subscription.objects.filter(
            status='active'
        ).select_related('user', 'offer')
        
        for subscription in active_subscriptions:
            for days_offset, notif_key, title_template, message_template in notification_timings:
                # Calculer la date cible
                if days_offset < 0:  # Avant expiration
                    target_date = subscription.end_date + timedelta(days=days_offset)
                else:  # Après expiration
                    target_date = subscription.end_date + timedelta(days=days_offset)
                
                # Vérifier si on doit créer la notification
                # (le jour même de la date cible)
                if target_date.date() == now.date():
                    # Vérifier qu'elle n'existe pas déjà
                    existing = UserNotification.objects.filter(
                        user=subscription.user,
                        subscription=subscription,
                        notification_type='subscription_expiring' if days_offset < 0 else 'subscription_expired',
                        title=title_template
                    ).exists()
                    
                    if not existing:
                        # Créer la notification
                        service_name = subscription.offer.name
                        
                        notification = UserNotification.objects.create(
                            user=subscription.user,
                            subscription=subscription,
                            notification_type='subscription_expiring' if days_offset < 0 else 'subscription_expired',
                            title=title_template,
                            message=message_template.format(service=service_name),
                            status='sent',  # Envoyée immédiatement
                            sent_at=now,
                        )
                        
                        notifications_created += 1
                        
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✅ Notification créée pour {subscription.user.email} - {title_template}'
                            )
                        )
        
        # Marquer les abonnements expirés
        expired_count = Subscription.objects.filter(
            status='active',
            end_date__lt=now
        ).update(status='expired')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n📊 Résumé:\n'
                f'   - {notifications_created} notifications créées\n'
                f'   - {expired_count} abonnements marqués comme expirés'
            )
        )

