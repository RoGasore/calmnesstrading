from django.core.management.base import BaseCommand
from django.utils import timezone
from payments.models import Subscription
import os


class Command(BaseCommand):
    help = 'Gérer automatiquement l\'ajout/retrait des membres dans les canaux Telegram/Discord'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simuler l\'exécution sans apporter de modifications',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('🔍 Mode simulation activé - Aucune modification ne sera effectuée'))
        
        now = timezone.now()
        
        # 1. Traiter les nouveaux abonnements (ajouter aux canaux)
        self.stdout.write('\n' + '='*60)
        self.stdout.write('📥 AJOUT DE NOUVEAUX MEMBRES')
        self.stdout.write('='*60)
        
        new_subscriptions = Subscription.objects.filter(
            status='active',
            end_date__gt=now,
            telegram_added=False
        ).select_related('user', 'offer')
        
        added_count = 0
        for subscription in new_subscriptions:
            user = subscription.user
            offer = subscription.offer
            
            # Vérifier que l'utilisateur a un identifiant Telegram
            if user.telegram_username and offer.telegram_channel_id:
                if not dry_run:
                    # TODO: Implémenter l'ajout réel via l'API Telegram
                    # Exemple avec python-telegram-bot:
                    # bot.add_chat_member(chat_id=offer.telegram_channel_id, user_id=user.telegram_id)
                    
                    subscription.telegram_added = True
                    subscription.save(update_fields=['telegram_added'])
                
                added_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ {user.email} ({user.telegram_username}) '
                        f'→ Canal Telegram: {offer.name}'
                    )
                )
            
            # Vérifier Discord
            if user.discord_username and offer.discord_channel_id:
                if not dry_run:
                    # TODO: Implémenter l'ajout réel via l'API Discord
                    # Exemple avec discord.py:
                    # guild = bot.get_guild(guild_id)
                    # member = guild.get_member(user.discord_id)
                    # await member.add_roles(role)
                    
                    subscription.discord_added = True
                    subscription.save(update_fields=['discord_added'])
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ {user.email} ({user.discord_username}) '
                        f'→ Canal Discord: {offer.name}'
                    )
                )
        
        # 2. Traiter les abonnements expirés (retirer des canaux)
        self.stdout.write('\n' + '='*60)
        self.stdout.write('📤 RETRAIT DES MEMBRES EXPIRÉS')
        self.stdout.write('='*60)
        
        expired_subscriptions = Subscription.objects.filter(
            status='active',
            end_date__lte=now
        ).select_related('user', 'offer')
        
        removed_count = 0
        for subscription in expired_subscriptions:
            user = subscription.user
            offer = subscription.offer
            
            # Retirer de Telegram
            if subscription.telegram_added and offer.telegram_channel_id:
                if not dry_run:
                    # TODO: Implémenter le retrait réel via l'API Telegram
                    # bot.kick_chat_member(chat_id=offer.telegram_channel_id, user_id=user.telegram_id)
                    
                    subscription.telegram_added = False
                    subscription.status = 'expired'
                    subscription.save(update_fields=['telegram_added', 'status'])
                
                removed_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f'⚠️  {user.email} ({user.telegram_username}) '
                        f'← Retiré du canal Telegram: {offer.name}'
                    )
                )
            
            # Retirer de Discord
            if subscription.discord_added and offer.discord_channel_id:
                if not dry_run:
                    # TODO: Implémenter le retrait réel via l'API Discord
                    
                    subscription.discord_added = False
                    subscription.status = 'expired'
                    subscription.save(update_fields=['discord_added', 'status'])
                
                self.stdout.write(
                    self.style.WARNING(
                        f'⚠️  {user.email} ({user.discord_username}) '
                        f'← Retiré du canal Discord: {offer.name}'
                    )
                )
        
        # Résumé
        self.stdout.write('\n' + '='*60)
        self.stdout.write('📊 RÉSUMÉ')
        self.stdout.write('='*60)
        self.stdout.write(f'Membres ajoutés: {added_count}')
        self.stdout.write(f'Membres retirés: {removed_count}')
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    '\n⚠️  Mode simulation - Aucune modification effectuée'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    '\n✅ Traitement terminé avec succès'
                )
            )
        
        # Instructions pour l'administrateur
        self.stdout.write('\n' + '='*60)
        self.stdout.write('💡 INSTRUCTIONS')
        self.stdout.write('='*60)
        self.stdout.write(
            'Pour activer l\'intégration automatique:\n\n'
            '1. TELEGRAM:\n'
            '   - Créez un bot via @BotFather\n'
            '   - Ajoutez le bot comme admin de votre canal\n'
            '   - Configurez TELEGRAM_BOT_TOKEN dans .env\n'
            '   - Décommentez le code d\'intégration Telegram\n\n'
            '2. DISCORD:\n'
            '   - Créez une application Discord\n'
            '   - Créez un bot et copiez le token\n'
            '   - Configurez DISCORD_BOT_TOKEN dans .env\n'
            '   - Décommentez le code d\'intégration Discord\n\n'
            '3. Configurez un cron job pour exécuter cette commande:\n'
            '   */15 * * * * python manage.py manage_channel_members\n'
        )

