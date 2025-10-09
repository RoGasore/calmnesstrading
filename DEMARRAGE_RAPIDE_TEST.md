# 🚀 Démarrage Rapide - Test Complet Système

## ⚡ Lancer TOUS les Services en 1 Commande

### Windows

```bash
cd backend
start_all_services.bat
```

### Linux/Mac

```bash
cd backend
chmod +x start_all_services.sh
./start_all_services.sh
```

---

## 📋 Ce Que Le Script Fait

### 1. Vérification (5 sec)
- ✅ Variables d'environnement Telegram
- ✅ Variables d'environnement Redis

### 2. Installation (30 sec)
- ✅ requirements.txt
- ✅ requirements_telegram.txt (Celery, Bot)

### 3. Base de Données (10 sec)
- ✅ Migrations
- ✅ Admin user
- ✅ Service Client user
- ✅ Test user

### 4. Offre de Test (5 sec)
- ✅ **Signal Demo 10min** (1€, 10 minutes d'accès)

### 5. Lancement Services (10 sec)
- ✅ **Django API** → http://localhost:8000
- ✅ **Celery Worker** → Traite les tâches
- ✅ **Celery Beat** → Vérifie expirations chaque minute
- ✅ **Bot Telegram** → Gère les accès canal

---

## 🧪 Scénario de Test (10 minutes)

### Préparation (si pas déjà fait)

1. **Créer le bot Telegram**
   - @BotFather → /newbot
   - Copier le token

2. **Créer le canal privé**
   - Nouveau canal → Privé
   - Ajouter bot comme admin
   - Permissions: Inviter + Bannir

3. **Configurer `.env`**
   ```env
   TELEGRAM_BOT_TOKEN=...
   TELEGRAM_BOT_USERNAME=...
   TELEGRAM_CHANNEL_ID=...
   UPSTASH_REDIS_REST_URL=https://legible-goblin-35329.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AYoBAAInc...
   ```

---

### Test Complet

#### **Minute 00:00 - User achète**

```
1. Ouvrir https://calmnesstrading.vercel.app
2. Se connecter en tant que testuser
   Email: test@example.com
   Password: testpass123

3. Aller dans Services → Signaux
4. Sélectionner "Signal Demo 10min" (1€)
5. Remplir le formulaire:
   - Nom complet: Test User
   - Email: test@example.com
   - Telegram: @VOTRE_USERNAME  ← IMPORTANT !
   - ID Transaction: DEMO-001

6. Soumettre
7. Voir: "Merci ! En attente de vérification..."
```

#### **Minute 01:00 - Service Client valide**

```
1. Se déconnecter
2. Se connecter en tant que Service Client
   Email: serviceclient@calmnesstrading.com
   Password: ServiceClient2024!

3. Aller sur /support/payments
4. Trouver le paiement "DEMO-001"
5. Cliquer "Vérifier & Valider"
6. Confirmer

✅ AUTOMATIQUE:
   - Token Telegram généré
   - Notification créée
   - Lien bot généré
```

#### **Minute 02:00 - User accède au bot**

```
1. Se déconnecter
2. Se reconnecter en tant que testuser
3. Voir la notification "🎉 Paiement validé !"
4. Cliquer sur le lien du bot
5. Telegram s'ouvre
6. Cliquer "START"
7. Bot envoie: "Votre lien d'accès privé est prêt!"
8. Cliquer "Rejoindre le Canal"
9. Accepter l'invitation

✅ SUCCÈS: Vous êtes maintenant membre du canal privé
```

#### **Minutes 03:00 - 11:00 - Accès au canal**

```
✅ Vous voyez les messages du canal
✅ Vous recevez les signaux
✅ Membership actif dans la BDD
```

#### **Minute 12:00 - Révocation automatique**

```
⏰ Celery vérifie (chaque minute)
❌ Détecte expiration (now >= subscription_end_date)
🚫 Bannit l'utilisateur du canal
📧 Envoie notification "Abonnement expiré"

RÉSULTAT:
   ❌ Vous n'êtes plus membre du canal
   ❌ Le canal n'apparaît plus dans votre liste
   📧 Notification reçue sur le site
```

---

## 📊 Monitoring en Temps Réel

### Terminal 1 - Django

```bash
tail -f logs/django.log
```

**Messages attendus :**
```
✅ Token Telegram généré pour testuser
🔗 Lien: https://t.me/VotreBotUsername?start=ABC123...
```

### Terminal 2 - Celery Worker

```bash
tail -f logs/celery_worker.log
```

**Messages attendus :**
```
[tasks]
  . accounts.tasks_telegram.check_expired_subscriptions
[INFO] Task check_expired_subscriptions started
```

### Terminal 3 - Celery Beat

```bash
tail -f logs/celery_beat.log
```

**Messages attendus :**
```
Scheduler: Sending due task check-expired-subscriptions-every-minute
```

### Terminal 4 - Bot Telegram

```bash
tail -f logs/telegram_bot.log
```

**Messages attendus :**
```
🚀 /start reçu de votreusername (ID: 123456789)
✅ Token vérifié pour votreusername
✅ Lien d'invitation envoyé à votreusername
👤 votreusername a rejoint le canal
✅ Membership créé pour votreusername
```

---

## 🔍 Vérification BDD Pendant le Test

```bash
# Ouvrir un shell Django
python manage.py shell
```

```python
from accounts.models_telegram import *
from django.utils import timezone

# Voir le token
token = TelegramBotToken.objects.latest('id')
print(f"Token: {token.token[:8]}...")
print(f"Status: {token.status}")
print(f"Valid: {token.is_valid()}")
print(f"Expires: {token.expires_at}")

# Voir le membership
member = TelegramChannelMember.objects.latest('id')
print(f"\nUser: {member.user.username}")
print(f"Channel: {member.channel_name}")
print(f"Type: {member.subscription_type}")
print(f"Status: {member.status}")
print(f"Joined: {member.joined_at}")
print(f"Expires: {member.subscription_end_date}")

# Temps restant
remaining = member.subscription_end_date - timezone.now()
print(f"Remaining: {remaining}")
print(f"Active: {member.is_active()}")

# Notifications
notifs = TelegramNotification.objects.filter(user=member.user).order_by('-created_at')
for n in notifs[:3]:
    print(f"\nNotif: {n.notification_type}")
    print(f"Title: {n.title}")
    print(f"Status: {n.status}")
```

---

## ✅ Checklist Avant le Test

**Configuration :**
- [ ] .env créé avec toutes les variables
- [ ] Bot Telegram créé (@BotFather)
- [ ] Canal privé créé
- [ ] Bot ajouté comme admin du canal
- [ ] Permissions bot: Inviter + Bannir

**Démarrage :**
- [ ] `start_all_services.sh` lancé
- [ ] 4 services "Live" (Django, Worker, Beat, Bot)
- [ ] Logs visibles et sans erreurs
- [ ] Offre "Signal Demo 10min" créée

**Comptes :**
- [ ] Admin: admin@calmnesstrading.com
- [ ] Service Client: serviceclient@calmnesstrading.com
- [ ] Test User: test@example.com

**URLs :**
- [ ] Backend: http://localhost:8000
- [ ] Frontend: http://localhost:5173
- [ ] Bot: https://t.me/VotreBotUsername

---

## 🐛 Dépannage Rapide

### Django ne démarre pas

```bash
# Vérifier les migrations
python manage.py showmigrations

# Appliquer les migrations manquantes
python manage.py migrate
```

### Celery ne se connecte pas à Redis

```bash
# Tester la connexion Redis
python manage.py shell

from django.conf import settings
import redis

r = redis.from_url(settings.CELERY_BROKER_URL)
print(r.ping())  # Devrait afficher True
```

### Bot ne répond pas

```bash
# Vérifier le token
python manage.py shell

from django.conf import settings
print(f"Token: {settings.TELEGRAM_BOT_TOKEN[:10]}...")
print(f"Username: {settings.TELEGRAM_BOT_USERNAME}")

# Tester le bot
from telegram import Bot
bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
print(bot.get_me())
```

### Offre non visible

```bash
# Vérifier les offres
python manage.py shell

from payments.models import Offer

offers = Offer.objects.all()
for o in offers:
    print(f"{o.id}: {o.name} - {o.duration_minutes}min - Active: {o.is_active}")
```

---

## 📈 Après le Test

### Résultats à Vérifier

- [ ] Token généré et utilisé
- [ ] Invitation créée et acceptée
- [ ] Membership créé avec bonne durée (10min)
- [ ] Accès au canal fonctionnel
- [ ] Révocation exacte après 10 minutes
- [ ] Notifications envoyées
- [ ] Logs complets et sans erreurs

### Nettoyer les Données de Test

```python
# Django shell
from accounts.models_telegram import *
from payments.models import *

# Supprimer les données de test
TelegramBotToken.objects.filter(user__email='test@example.com').delete()
TelegramChannelMember.objects.filter(user__email='test@example.com').delete()
PendingPayment.objects.filter(user__email='test@example.com').delete()
Payment.objects.filter(user__email='test@example.com').delete()

print("✅ Données de test nettoyées")
```

---

## 🎯 Prêt Pour Production

Si le test réussit, vous pouvez :

1. **Créer des offres réelles**
   ```python
   Offer.objects.create(
       name="Signaux Premium Mensuel",
       price=297.00,
       duration_days=30  # ← 30 jours au lieu de 10 min
   )
   ```

2. **Déployer sur Render**
   - Utiliser `render.yaml`
   - 4 services déployés automatiquement
   - Variables d'environnement configurées

3. **Lancer en production** 🚀

---

**⏱️ Temps total du test : ~12 minutes**  
**🎯 Résultat : Système 100% fonctionnel validé**

