"""
Bot Telegram pour gérer l'accès aux canaux privés
"""
import os
import logging
import django
from datetime import timedelta

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, ChatMemberHandler
from django.utils import timezone
from django.conf import settings

from accounts.models_telegram import TelegramBotToken, TelegramChannelInvite, TelegramChannelMember, TelegramNotification

# Configuration du logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Configuration
BOT_TOKEN = settings.TELEGRAM_BOT_TOKEN
CHANNEL_ID = settings.TELEGRAM_CHANNEL_ID
CHANNEL_NAME = settings.TELEGRAM_CHANNEL_NAME

class CalmnessTradingBot:
    """Bot Telegram pour Calmness Trading"""
    
    def __init__(self):
        self.application = Application.builder().token(BOT_TOKEN).build()
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Configurer les handlers du bot"""
        # Commande /start avec token
        self.application.add_handler(CommandHandler("start", self.start_command))
        
        # Commande /help
        self.application.add_handler(CommandHandler("help", self.help_command))
        
        # Commande /status
        self.application.add_handler(CommandHandler("status", self.status_command))
        
        # Handler pour les nouveaux membres du canal
        self.application.add_handler(ChatMemberHandler(self.track_member_update, ChatMemberHandler.CHAT_MEMBER))
        
        # Handler pour les messages non reconnus
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.unknown_message))
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """
        Commande /start - Point d'entrée principal
        Format: /start TOKEN_UNIQUE
        """
        user = update.effective_user
        chat_id = update.effective_chat.id
        
        logger.info(f"🚀 /start reçu de {user.username} (ID: {user.id})")
        
        # Vérifier si un token est fourni
        if not context.args:
            await self.send_welcome_message(update, context)
            return
        
        # Récupérer le token
        token = context.args[0]
        
        try:
            # Vérifier le token dans la base de données
            bot_token = TelegramBotToken.objects.get(token=token)
            
            # Vérifier si le token est valide
            if not bot_token.is_valid():
                if bot_token.status == 'used':
                    await update.message.reply_text(
                        "❌ Ce token a déjà été utilisé.\n\n"
                        "Si vous avez déjà accès au canal, vous devriez le retrouver dans vos canaux Telegram."
                    )
                elif bot_token.status == 'expired':
                    await update.message.reply_text(
                        "❌ Ce token a expiré.\n\n"
                        "Veuillez contacter notre support pour obtenir un nouveau lien d'accès."
                    )
                else:
                    await update.message.reply_text(
                        "❌ Ce token n'est plus valide.\n\n"
                        "Veuillez contacter notre support pour obtenir un nouveau lien d'accès."
                    )
                return
            
            # Marquer le token comme utilisé
            bot_token.mark_as_used(user.id, user.username)
            
            # Mettre à jour le telegram_username de l'utilisateur si nécessaire
            if user.username and bot_token.user.telegram_username != f"@{user.username}":
                bot_token.user.telegram_username = f"@{user.username}"
                bot_token.user.save()
            
            # Envoyer un message de bienvenue
            await update.message.reply_text(
                f"✅ **Bienvenue {user.first_name}!**\n\n"
                f"Votre paiement a été vérifié avec succès.\n\n"
                f"🎉 Génération de votre lien d'accès privé au canal **{CHANNEL_NAME}**...",
                parse_mode='Markdown'
            )
            
            # Générer le lien d'invitation unique
            invite_link = await self.create_channel_invite(bot_token, user)
            
            if invite_link:
                # Créer l'entrée dans la base de données
                channel_invite = TelegramChannelInvite.objects.create(
                    user=bot_token.user,
                    bot_token=bot_token,
                    channel_id=CHANNEL_ID,
                    channel_name=CHANNEL_NAME,
                    invite_link=invite_link,
                    telegram_user_id=user.id,
                    expires_at=timezone.now() + timedelta(minutes=5)
                )
                channel_invite.mark_as_sent()
                
                # Envoyer le lien d'invitation
                keyboard = [[InlineKeyboardButton("🔗 Rejoindre le Canal", url=invite_link)]]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await update.message.reply_text(
                    f"🎯 **Votre lien d'accès privé est prêt!**\n\n"
                    f"🔒 Ce lien est **unique** et **expire dans 5 minutes**.\n"
                    f"⚠️ Il ne peut être utilisé qu'**une seule fois**.\n\n"
                    f"👇 Cliquez sur le bouton ci-dessous pour rejoindre le canal :",
                    reply_markup=reply_markup,
                    parse_mode='Markdown'
                )
                
                # Créer une notification
                TelegramNotification.objects.create(
                    user=bot_token.user,
                    notification_type='invite_sent',
                    title='Lien d\'accès envoyé',
                    message=f'Lien d\'accès au canal {CHANNEL_NAME} envoyé avec succès',
                    action_url=invite_link,
                    metadata={'channel_id': CHANNEL_ID, 'telegram_user_id': user.id}
                ).mark_as_sent(via_telegram=True)
                
                logger.info(f"✅ Lien d'invitation envoyé à {user.username}")
            else:
                await update.message.reply_text(
                    "❌ Erreur lors de la génération du lien d'invitation.\n\n"
                    "Veuillez contacter notre support."
                )
                logger.error(f"❌ Échec de génération du lien pour {user.username}")
        
        except TelegramBotToken.DoesNotExist:
            await update.message.reply_text(
                "❌ Token invalide.\n\n"
                "Veuillez vérifier que vous avez cliqué sur le bon lien."
            )
            logger.warning(f"⚠️ Token invalide reçu : {token}")
    
    async def create_channel_invite(self, bot_token, telegram_user):
        """
        Créer un lien d'invitation unique pour le canal
        """
        try:
            # Créer le lien d'invitation
            invite_link = await self.application.bot.create_chat_invite_link(
                chat_id=CHANNEL_ID,
                member_limit=1,  # Une seule personne peut utiliser ce lien
                expire_date=int((timezone.now() + timedelta(minutes=5)).timestamp())  # Expire dans 5 minutes
            )
            
            return invite_link.invite_link
        except Exception as e:
            logger.error(f"❌ Erreur création lien d'invitation : {e}")
            return None
    
    async def send_welcome_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Envoyer un message de bienvenue"""
        user = update.effective_user
        
        await update.message.reply_text(
            f"👋 **Bienvenue sur le bot Calmness Trading!**\n\n"
            f"🔐 Pour accéder à nos canaux privés, vous devez :\n\n"
            f"1️⃣ Effectuer un paiement sur notre site\n"
            f"2️⃣ Attendre la validation par notre équipe\n"
            f"3️⃣ Cliquer sur le lien unique que vous recevrez\n\n"
            f"💡 **Besoin d'aide?**\n"
            f"Utilisez la commande /help pour plus d'informations.",
            parse_mode='Markdown'
        )
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Commande /help"""
        await update.message.reply_text(
            "🆘 **Aide - Bot Calmness Trading**\n\n"
            "**Commandes disponibles:**\n"
            "• /start - Démarrer le bot\n"
            "• /help - Afficher cette aide\n"
            "• /status - Vérifier votre statut d'abonnement\n\n"
            "**Questions fréquentes:**\n\n"
            "❓ *Comment accéder au canal?*\n"
            "Effectuez un paiement sur notre site et attendez la validation.\n\n"
            "❓ *Mon lien ne fonctionne pas?*\n"
            "Les liens expirent après 5 minutes. Contactez le support pour un nouveau lien.\n\n"
            "❓ *Comment contacter le support?*\n"
            "Rendez-vous sur notre site : https://calmnesstrading.vercel.app",
            parse_mode='Markdown'
        )
    
    async def status_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Commande /status - Vérifier le statut d'abonnement"""
        user = update.effective_user
        
        try:
            # Chercher les memberships de l'utilisateur
            memberships = TelegramChannelMember.objects.filter(
                telegram_user_id=user.id,
                status='active'
            )
            
            if memberships.exists():
                membership = memberships.first()
                days_remaining = (membership.subscription_end_date - timezone.now()).days
                
                status_emoji = "✅" if days_remaining > 7 else "⚠️" if days_remaining > 0 else "❌"
                
                await update.message.reply_text(
                    f"{status_emoji} **Statut de votre abonnement**\n\n"
                    f"📊 Type: {membership.subscription_type}\n"
                    f"📅 Fin: {membership.subscription_end_date.strftime('%d/%m/%Y')}\n"
                    f"⏳ Jours restants: {days_remaining}\n\n"
                    f"{'⚠️ Votre abonnement expire bientôt! Pensez à le renouveler.' if days_remaining <= 7 else ''}",
                    parse_mode='Markdown'
                )
            else:
                await update.message.reply_text(
                    "❌ **Aucun abonnement actif trouvé**\n\n"
                    "Veuillez effectuer un paiement sur notre site pour accéder aux canaux privés.\n\n"
                    "🌐 Site: https://calmnesstrading.vercel.app",
                    parse_mode='Markdown'
                )
        except Exception as e:
            logger.error(f"❌ Erreur status_command : {e}")
            await update.message.reply_text(
                "❌ Erreur lors de la vérification de votre statut.\n\n"
                "Veuillez réessayer plus tard."
            )
    
    async def track_member_update(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """
        Suivre les entrées/sorties des membres du canal
        """
        chat_member_update = update.chat_member
        user = chat_member_update.new_chat_member.user
        old_status = chat_member_update.old_chat_member.status
        new_status = chat_member_update.new_chat_member.status
        
        logger.info(f"👤 Mise à jour membre : {user.username} ({old_status} → {new_status})")
        
        # Si l'utilisateur rejoint le canal
        if old_status in ['left', 'kicked'] and new_status in ['member', 'administrator', 'creator']:
            logger.info(f"✅ {user.username} a rejoint le canal")
            
            try:
                # Trouver l'invitation correspondante
                invite = TelegramChannelInvite.objects.filter(
                    telegram_user_id=user.id,
                    channel_id=chat_member_update.chat.id,
                    status='sent'
                ).order_by('-created_at').first()
                
                if invite:
                    invite.mark_as_accepted()
                    
                    # Récupérer les informations de l'offre depuis le bot_token
                    bot_token = invite.bot_token
                    
                    # Récupérer la durée de l'abonnement depuis l'offre
                    from payments.models import Payment
                    try:
                        payment = Payment.objects.filter(id=bot_token.payment_id).first()
                        if payment and payment.offer:
                            # Utiliser la durée de l'offre (en jours, heures ou minutes)
                            offer = payment.offer
                            subscription_type = offer.name
                            
                            # Calculer la date de fin selon la durée de l'offre
                            if hasattr(offer, 'duration_days') and offer.duration_days:
                                subscription_end_date = timezone.now() + timedelta(days=offer.duration_days)
                            elif hasattr(offer, 'duration_hours') and offer.duration_hours:
                                subscription_end_date = timezone.now() + timedelta(hours=offer.duration_hours)
                            elif hasattr(offer, 'duration_minutes') and offer.duration_minutes:
                                subscription_end_date = timezone.now() + timedelta(minutes=offer.duration_minutes)
                            else:
                                # Par défaut 30 jours si pas de durée spécifiée
                                subscription_end_date = timezone.now() + timedelta(days=30)
                        else:
                            subscription_type = 'Abonnement'
                            subscription_end_date = timezone.now() + timedelta(days=30)
                    except Exception as e:
                        logger.error(f"❌ Erreur récupération offre : {e}")
                        subscription_type = 'Abonnement'
                        subscription_end_date = timezone.now() + timedelta(days=30)
                    
                    # Utiliser le username Telegram validé lors du paiement
                    telegram_username = user.username or ''
                    if not telegram_username and invite.user.telegram_username:
                        telegram_username = invite.user.telegram_username.replace('@', '')
                    
                    # Créer ou mettre à jour le membership
                    membership, created = TelegramChannelMember.objects.update_or_create(
                        user=invite.user,
                        channel_id=chat_member_update.chat.id,
                        defaults={
                            'telegram_user_id': user.id,
                            'telegram_username': telegram_username,
                            'channel_name': CHANNEL_NAME,
                            'status': 'active',
                            'subscription_type': subscription_type,
                            'subscription_end_date': subscription_end_date,
                            'expires_at': subscription_end_date,
                            'invite': invite
                        }
                    )
                    
                    # Créer une notification
                    TelegramNotification.objects.create(
                        user=invite.user,
                        notification_type='access_granted',
                        title='Accès accordé',
                        message=f'Accès au canal {CHANNEL_NAME} accordé avec succès',
                        metadata={'channel_id': chat_member_update.chat.id, 'telegram_user_id': user.id}
                    ).mark_as_sent(via_telegram=True)
                    
                    logger.info(f"✅ Membership créé pour {user.username}")
            except Exception as e:
                logger.error(f"❌ Erreur track_member_update (join) : {e}")
        
        # Si l'utilisateur quitte le canal
        elif old_status in ['member', 'administrator'] and new_status in ['left', 'kicked']:
            logger.info(f"❌ {user.username} a quitté le canal")
            
            try:
                membership = TelegramChannelMember.objects.filter(
                    telegram_user_id=user.id,
                    channel_id=chat_member_update.chat.id,
                    status='active'
                ).first()
                
                if membership:
                    membership.revoke_access('left')
                    logger.info(f"✅ Membership révoqué pour {user.username}")
            except Exception as e:
                logger.error(f"❌ Erreur track_member_update (leave) : {e}")
    
    async def unknown_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Gérer les messages non reconnus"""
        await update.message.reply_text(
            "❓ Je n'ai pas compris votre message.\n\n"
            "Utilisez /help pour voir les commandes disponibles."
        )
    
    def run(self):
        """Lancer le bot"""
        logger.info("🤖 Démarrage du bot Calmness Trading...")
        self.application.run_polling()

def main():
    """Point d'entrée principal"""
    bot = CalmnessTradingBot()
    bot.run()

if __name__ == '__main__':
    main()

