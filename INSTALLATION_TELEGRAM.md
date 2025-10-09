# 🚀 Installation Rapide - Système Telegram

## ⚡ Installation en 5 Minutes

### 1️⃣ Créer le Bot Telegram

```bash
# 1. Ouvrir Telegram et chercher @BotFather
# 2. Envoyer /newbot
# 3. Suivre les instructions
# 4. Copier le TOKEN
```

### 2️⃣ Créer le Canal Privé

```bash
# 1. Créer un nouveau canal Telegram
# 2. Le mettre en PRIVÉ
# 3. Ajouter le bot comme ADMINISTRATEUR
# 4. Donner les permissions:
#    ✅ Inviter des utilisateurs
#    ✅ Bannir des utilisateurs
```

### 3️⃣ Récupérer l'ID du Canal

**Méthode 1 : Avec @userinfobot**
```
1. Ajouter @userinfobot au canal
2. Lire le message (ID du canal commence par -100)
3. Noter l'ID (ex: -1001234567890)
4. Retirer le bot du canal
```

**Méthode 2 : Avec du code Python**
```python
from telegram import Bot

bot = Bot(token='VOTRE_TOKEN')
updates = bot.get_updates()
print(updates)  # Chercher chat_id dans les updates
```

### 4️⃣ Configuration Backend

**Créer `.env` dans `backend/`** :

```env
# Telegram (OBLIGATOIRE)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=VotreBotUsername
TELEGRAM_CHANNEL_ID=-1001234567890
TELEGRAM_CHANNEL_NAME=Calmness Trading Signals

# Redis Upstash (DÉJÀ CONFIGURÉ)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### 5️⃣ Installation Dépendances

```bash
cd backend
pip install -r requirements.txt
```

### 6️⃣ Migrations Base de Données

```bash
python manage.py makemigrations accounts
python manage.py migrate
```

### 7️⃣ Démarrage du Système

**Windows :**
```bash
start_telegram_system.bat
```

**Linux/Mac :**
```bash
chmod +x start_telegram_system.sh
./start_telegram_system.sh
```

**Ou manuellement (3 terminaux) :**
```bash
# Terminal 1 - Celery Worker
celery -A backend worker -l info

# Terminal 2 - Celery Beat
celery -A backend beat -l info

# Terminal 3 - Bot Telegram
python telegram_bot/bot.py
```

---

## ✅ Vérification

### Tester le Bot

```bash
# 1. Ouvrir Telegram
# 2. Chercher votre bot (@VotreBotUsername)
# 3. Envoyer /start
# 4. Vous devriez recevoir un message de bienvenue
```

### Logs à Vérifier

**Bot Telegram :**
```
🤖 Démarrage du bot Calmness Trading...
INFO - Bot started successfully
```

**Celery Worker :**
```
celery@hostname ready.
[tasks]
  . accounts.tasks_telegram.expire_old_tokens
  . accounts.tasks_telegram.check_expired_subscriptions
  ...
```

**Celery Beat :**
```
beat: Starting...
Scheduler: Sending due task expire-telegram-tokens-hourly
```

---

## 🧪 Test Complet

### 1. Créer un paiement test

```bash
# Dans le backend Django
python manage.py shell
```

```python
from accounts.models import User
from payments.models import Payment
from django.utils import timezone

# Créer un utilisateur test
user = User.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='testpass123'
)

# Créer un paiement test
payment = Payment.objects.create(
    user=user,
    amount=297.00,
    currency='EUR',
    status='confirmed',
    transaction_id='TEST-001'
)

print(f"✅ Paiement créé : ID {payment.id}")
```

### 2. Générer un token

```bash
curl -X POST http://localhost:8000/api/telegram/generate-token/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_id": 1}'
```

**Réponse attendue :**
```json
{
  "success": true,
  "bot_link": "https://t.me/VotreBotUsername?start=ABC123...",
  "token": "ABC123...",
  "expires_at": "2024-01-16T12:00:00Z"
}
```

### 3. Tester le lien

```
1. Copier le bot_link
2. L'ouvrir dans Telegram
3. Cliquer "START"
4. Le bot devrait:
   ✅ Vérifier le token
   ✅ Envoyer un lien d'invitation unique
   ✅ Le lien devrait fonctionner 1 seule fois
```

---

## 🔧 Dépannage

### Le bot ne répond pas

```bash
# Vérifier que le bot est lancé
ps aux | grep telegram_bot

# Vérifier les logs
tail -f logs/telegram_bot.log

# Relancer le bot
python telegram_bot/bot.py
```

### Celery ne fonctionne pas

```bash
# Tester la connexion Redis
python -c "import redis; r=redis.from_url('VOTRE_REDIS_URL'); print(r.ping())"

# Vérifier les workers actifs
celery -A backend inspect active

# Vérifier les tâches planifiées
celery -A backend inspect scheduled
```

### Token expiré immédiatement

```python
# Vérifier dans Django shell
from accounts.models_telegram import TelegramBotToken

tokens = TelegramBotToken.objects.all()
for t in tokens:
    print(f"{t.token[:8]}... - Status: {t.status} - Valid: {t.is_valid()}")
```

---

## 📊 Monitoring Production

### Statistiques Admin

```bash
curl http://localhost:8000/api/telegram/admin/stats/ \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Logs Importants

```bash
# Backend Django
tail -f logs/django.log

# Bot Telegram
tail -f logs/telegram_bot.log

# Celery Worker
tail -f logs/celery_worker.log

# Celery Beat
tail -f logs/celery_beat.log
```

---

## 🚀 Déploiement Render

### Variables d'Environnement

Ajouter dans Render Dashboard :

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_BOT_USERNAME=...
TELEGRAM_CHANNEL_ID=...
TELEGRAM_CHANNEL_NAME=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### Services à Créer

1. **Web Service** (Django)
   - Build: `pip install -r requirements.txt && python manage.py migrate`
   - Start: `gunicorn backend.wsgi:application`

2. **Background Worker** (Celery Worker)
   - Build: `pip install -r requirements.txt`
   - Start: `celery -A backend worker -l info`

3. **Background Worker** (Celery Beat)
   - Build: `pip install -r requirements.txt`
   - Start: `celery -A backend beat -l info`

4. **Background Worker** (Telegram Bot)
   - Build: `pip install -r requirements.txt`
   - Start: `python telegram_bot/bot.py`

---

## 📱 Intégration Frontend (À venir)

Le frontend affichera :
- ✅ Notifications avec lien bot après validation paiement
- ✅ Statut d'abonnement Telegram
- ✅ Jours restants avant expiration
- ✅ Bouton "Renouveler"

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifier la documentation : `TELEGRAM_BOT_GUIDE.md`
2. Vérifier les logs
3. Tester avec un utilisateur de test
4. Vérifier les permissions du bot sur le canal

---

**🎉 Votre système Telegram est prêt !**

