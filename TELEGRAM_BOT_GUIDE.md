# 🤖 Guide Complet - Système d'Accès Telegram

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Workflow](#workflow)
6. [API Endpoints](#api-endpoints)
7. [Bot Telegram](#bot-telegram)
8. [Tâches Automatiques](#tâches-automatiques)
9. [Sécurité](#sécurité)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

Ce système gère automatiquement l'accès aux canaux Telegram privés pour les abonnés payants de Calmness Trading.

### Fonctionnalités Principales

- ✅ **Génération automatique de tokens uniques** après validation de paiement
- ✅ **Liens d'invitation uniques** (1 usage, expiration 5 min)
- ✅ **Tracking des membres** (entrées/sorties)
- ✅ **Expiration automatique** des abonnements
- ✅ **Notifications** in-app et email
- ✅ **Révocation d'accès** manuelle ou automatique

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Utilisateur   │
│  Paie & Attend  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Service Client  │
│ Valide Paiement │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Generate   │
│   Token Unique  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Notification   │
│  Lien Bot→User  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Clique Bot │
│  /start TOKEN   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Bot Vérifie    │
│  Crée Invite    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Rejoint   │
│  Canal Privé    │
└─────────────────┘
```

---

## 📦 Installation

### 1. Dépendances Python

```bash
cd backend
pip install -r requirements_telegram.txt
```

### 2. Migrations Base de Données

```bash
python manage.py makemigrations accounts
python manage.py migrate
```

### 3. Variables d'Environnement

Créer un fichier `.env` dans `backend/` :

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=CalmnessTradingBot
TELEGRAM_CHANNEL_ID=-1001234567890
TELEGRAM_CHANNEL_NAME=Calmness Trading Signals

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

---

## ⚙️ Configuration

### 1. Créer le Bot Telegram

1. Parler à [@BotFather](https://t.me/BotFather)
2. `/newbot` → Suivre les instructions
3. Copier le **token**
4. `/setuserpic` → Ajouter une photo
5. `/setdescription` → Ajouter une description

### 2. Créer le Canal Privé

1. Créer un nouveau canal Telegram
2. Le mettre en **privé**
3. Ajouter le bot comme **administrateur**
4. Lui donner les permissions :
   - ✅ Inviter des utilisateurs
   - ✅ Bannir des utilisateurs
   - ✅ Gérer les liens d'invitation

### 3. Récupérer l'ID du Canal

```python
# Méthode 1 : Utiliser un bot de test
# Ajouter @userinfobot au canal et lire l'ID

# Méthode 2 : Via code Python
from telegram import Bot
bot = Bot(token='VOTRE_TOKEN')
updates = bot.get_updates()
# Chercher chat_id dans les updates
```

---

## 🔄 Workflow Complet

### Étape 1️⃣ : Soumission du Paiement

**Frontend** → `CheckoutNew.tsx`
```typescript
// L'utilisateur soumet l'ID de transaction
const response = await fetchWithAuth('/api/payments/pending-payments/create/', {
  method: 'POST',
  body: JSON.stringify({
    offer_id: selectedOffer.id,
    user_info: { /* ... */ },
    transaction_id: userTransactionId
  })
});
```

**Backend** → `payments/views_user.py`
```python
# Créer un PendingPayment avec statut "transaction_submitted"
pending_payment = PendingPayment.objects.create(
    user=request.user,
    offer=offer,
    status='transaction_submitted',
    transaction_id=transaction_id,
    # ...
)
```

**Message Utilisateur** :
> ✅ Merci pour votre paiement ! Veuillez patienter pendant que notre service client vérifie la transaction.

---

### Étape 2️⃣ : Validation par le Service Client

**Frontend** → `SupportPayments.tsx`
```typescript
// Service client clique "Valider"
const handleValidatePayment = async () => {
  await validatePendingPayment(
    selectedPayment.id,
    adminNotes,
    transactionId
  );
};
```

**Backend** → `payments/views_admin.py`
```python
@api_view(['POST'])
def validate_pending_payment(request):
    # 1. Valider le paiement
    payment = Payment.objects.create(/* ... */)
    
    # 2. Générer le token Telegram
    token_response = requests.post(
        'http://localhost:8000/api/telegram/generate-token/',
        json={'payment_id': payment.id}
    )
    
    # 3. Envoyer notification avec lien bot
    # ...
```

**Backend** → `accounts/views_telegram.py`
```python
@api_view(['POST'])
def generate_telegram_token(request):
    # Générer token unique
    bot_token = TelegramBotToken.generate_token(
        user=user,
        payment_id=payment_id,
        expiry_hours=24
    )
    
    # Créer lien bot
    bot_link = f"https://t.me/{BOT_USERNAME}?start={bot_token.token}"
    
    # Créer notification
    TelegramNotification.objects.create(
        user=user,
        notification_type='payment_verified',
        message='Votre paiement a été validé !',
        action_url=bot_link
    )
    
    return {'bot_link': bot_link}
```

**Message Utilisateur** :
> 🎉 Votre paiement a été validé ! Cliquez sur le lien ci-dessous pour accéder à votre canal Telegram privé :  
> 🔗 https://t.me/CalmnessTradingBot?start=ABC123...

---

### Étape 3️⃣ : Utilisateur Clique sur le Bot

**Bot Telegram** → `telegram_bot/bot.py`
```python
async def start_command(self, update, context):
    user = update.effective_user
    token = context.args[0]
    
    # 1. Vérifier le token
    bot_token = TelegramBotToken.objects.get(token=token)
    if not bot_token.is_valid():
        # Token expiré ou déjà utilisé
        return
    
    # 2. Marquer comme utilisé
    bot_token.mark_as_used(user.id, user.username)
    
    # 3. Créer lien d'invitation unique
    invite_link = await bot.create_chat_invite_link(
        chat_id=CHANNEL_ID,
        member_limit=1,  # 1 seule personne
        expire_date=now + 5 minutes
    )
    
    # 4. Envoyer le lien à l'utilisateur
    await update.message.reply_text(
        "🎯 Votre lien d'accès privé est prêt!",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("🔗 Rejoindre", url=invite_link)
        ]])
    )
```

**Message Bot** :
> 🎯 Votre lien d'accès privé est prêt!  
> 🔒 Ce lien est unique et expire dans 5 minutes.  
> ⚠️ Il ne peut être utilisé qu'une seule fois.  
> 👇 Cliquez pour rejoindre :  
> [🔗 Rejoindre le Canal]

---

### Étape 4️⃣ : Tracking de l'Accès

**Bot Telegram** → `track_member_update()`
```python
async def track_member_update(self, update, context):
    user = update.new_chat_member.user
    
    if user_joined:
        # Créer membership
        TelegramChannelMember.objects.create(
            user=invite.user,
            telegram_user_id=user.id,
            channel_id=CHANNEL_ID,
            subscription_end_date=now + 30 days,
            status='active'
        )
        
        # Notification
        TelegramNotification.objects.create(
            type='access_granted',
            message='Accès au canal accordé !'
        )
```

---

### Étape 5️⃣ : Expiration & Révocation

**Celery Task** → `tasks_telegram.py`
```python
@shared_task
def check_expired_subscriptions():
    # Exécuté tous les jours à 00:00
    
    expired_members = TelegramChannelMember.objects.filter(
        status='active',
        subscription_end_date__lt=now
    )
    
    for member in expired_members:
        # 1. Révoquer dans la BDD
        member.revoke_access('expired')
        
        # 2. Bannir du canal Telegram
        bot.ban_chat_member(
            chat_id=CHANNEL_ID,
            user_id=member.telegram_user_id
        )
        
        # 3. Notifier l'utilisateur
        TelegramNotification.objects.create(
            type='access_expired',
            message='Votre abonnement a expiré'
        )
```

---

## 🔌 API Endpoints

### Génération de Token

```http
POST /api/telegram/generate-token/
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "payment_id": 123,
  "transaction_id": "TXN-12345"
}

Response:
{
  "success": true,
  "bot_link": "https://t.me/Bot?start=ABC123...",
  "token": "ABC123...",
  "expires_at": "2024-01-15T12:00:00Z",
  "notification_id": 456
}
```

### Notifications Utilisateur

```http
GET /api/telegram/notifications/
Authorization: Bearer {JWT_TOKEN}

Response:
[
  {
    "id": 1,
    "type": "payment_verified",
    "title": "Paiement validé !",
    "message": "...",
    "action_url": "https://t.me/Bot?start=...",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

### Statut Telegram

```http
GET /api/telegram/status/
Authorization: Bearer {JWT_TOKEN}

Response:
{
  "memberships": [
    {
      "channel_name": "Calmness Trading Signals",
      "subscription_type": "Premium",
      "joined_at": "2024-01-01T00:00:00Z",
      "expires_at": "2024-02-01T00:00:00Z",
      "is_active": true,
      "days_remaining": 15
    }
  ],
  "telegram_username": "@username",
  "has_active_subscription": true
}
```

### Révoquer Accès (Admin)

```http
POST /api/telegram/revoke-access/
Authorization: Bearer {ADMIN_JWT_TOKEN}
Content-Type: application/json

{
  "user_id": 123,
  "reason": "violation_terms"
}

Response:
{
  "success": true,
  "revoked_count": 1
}
```

---

## 🤖 Bot Telegram - Commandes

### /start [TOKEN]

Point d'entrée principal. Vérifie le token et envoie le lien d'invitation.

### /status

Affiche le statut d'abonnement de l'utilisateur.

### /help

Affiche l'aide et les commandes disponibles.

---

## ⏰ Tâches Automatiques (Celery)

### Configuration Celery

```python
# backend/celery.py
from celery import Celery
from celery.schedules import crontab

app = Celery('calmnesstrading')
app.config_from_object('django.conf:settings', namespace='CELERY')

app.conf.beat_schedule = {
    'expire-tokens-hourly': {
        'task': 'accounts.tasks_telegram.expire_old_tokens',
        'schedule': crontab(minute=0),  # Toutes les heures
    },
    'check-expired-subscriptions-daily': {
        'task': 'accounts.tasks_telegram.check_expired_subscriptions',
        'schedule': crontab(hour=0, minute=0),  # Tous les jours à 00:00
    },
    'send-expiration-warnings-daily': {
        'task': 'accounts.tasks_telegram.send_expiration_warnings',
        'schedule': crontab(hour=9, minute=0),  # Tous les jours à 09:00
    },
    'cleanup-old-notifications-weekly': {
        'task': 'accounts.tasks_telegram.cleanup_old_notifications',
        'schedule': crontab(day_of_week=1, hour=3),  # Lundis à 03:00
    }
}
```

### Lancement

```bash
# Worker Celery
celery -A backend worker -l info

# Beat Scheduler
celery -A backend beat -l info
```

---

## 🔒 Sécurité

### ✅ Bonnes Pratiques Implémentées

1. **Tokens uniques cryptographiques** (64 caractères)
2. **Expiration automatique** (24h pour tokens, 5min pour invitations)
3. **Limite d'usage** (1 seule personne par lien d'invitation)
4. **Vérification paiement** avant génération de token
5. **Révocation automatique** des abonnements expirés
6. **Logs complets** de toutes les actions
7. **Permissions strictes** (Admin/Support uniquement pour révocation)

### ⚠️ Points d'Attention

- **Ne JAMAIS exposer** `TELEGRAM_BOT_TOKEN` publiquement
- **Valider** tous les inputs utilisateur
- **Rate-limiting** sur les APIs publiques
- **Monitoring** des tentatives d'accès frauduleuses

---

## 🐛 Troubleshooting

### Problème : Le bot ne répond pas

**Solution** :
```bash
# Vérifier que le bot est lancé
ps aux | grep telegram_bot

# Relancer le bot
cd backend
python telegram_bot/bot.py
```

### Problème : Token expiré trop vite

**Solution** :
```python
# Augmenter l'expiration dans views_telegram.py
bot_token = TelegramBotToken.generate_token(
    user=user,
    expiry_hours=48  # Au lieu de 24
)
```

### Problème : L'utilisateur ne peut pas rejoindre le canal

**Vérifications** :
1. Le bot est-il admin du canal ?
2. Le bot a-t-il la permission "Inviter des utilisateurs" ?
3. Le lien d'invitation a-t-il expiré ?
4. L'utilisateur a-t-il été banni auparavant ?

### Problème : Les tâches Celery ne s'exécutent pas

**Solution** :
```bash
# Vérifier Redis
redis-cli ping  # Doit répondre PONG

# Vérifier Celery Worker
celery -A backend inspect active

# Vérifier Celery Beat
celery -A backend inspect scheduled
```

---

## 📊 Monitoring

### Statistiques Admin

```http
GET /api/telegram/admin/stats/
Authorization: Bearer {ADMIN_JWT_TOKEN}

Response:
{
  "tokens": {
    "total": 250,
    "pending": 5,
    "used": 230,
    "recent": 15
  },
  "invites": {
    "total": 230,
    "accepted": 220,
    "acceptance_rate": 95.65
  },
  "members": {
    "total": 220,
    "active": 200,
    "recent_joins": 10
  }
}
```

---

## 🚀 Déploiement Production

### 1. Render.com

```yaml
# render.yaml
services:
  - type: web
    name: calmness-backend
    env: python
    buildCommand: pip install -r requirements.txt && python manage.py migrate
    startCommand: gunicorn backend.wsgi:application
    
  - type: worker
    name: celery-worker
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: celery -A backend worker -l info
    
  - type: worker
    name: celery-beat
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: celery -A backend beat -l info
    
  - type: worker
    name: telegram-bot
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python telegram_bot/bot.py
```

### 2. Variables d'Environnement

Ajouter dans Render Dashboard :
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_CHANNEL_ID`
- `TELEGRAM_CHANNEL_NAME`
- `CELERY_BROKER_URL` (Redis URL)

---

## 📚 Ressources

- [Documentation python-telegram-bot](https://python-telegram-bot.readthedocs.io/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Celery Documentation](https://docs.celeryproject.org/)

---

## ✅ Checklist de Déploiement

- [ ] Bot Telegram créé via @BotFather
- [ ] Canal privé créé
- [ ] Bot ajouté comme admin du canal
- [ ] Variables d'environnement configurées
- [ ] Migrations exécutées
- [ ] Redis installé et lancé
- [ ] Celery Worker lancé
- [ ] Celery Beat lancé
- [ ] Bot Telegram lancé
- [ ] Tests end-to-end effectués

---

**🎉 Votre système d'accès Telegram est prêt !**

