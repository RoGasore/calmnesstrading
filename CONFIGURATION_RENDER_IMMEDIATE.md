# 🚀 CONFIGURATION RENDER - IMMÉDIATE

## ⚡ Vous êtes sur RENDER - Actions Immédiates

---

## 1️⃣ AJOUTER LES VARIABLES D'ENVIRONNEMENT (2 min)

### Dans Render Dashboard → Backend Service → Environment

**Ajouter ces 4 variables :**

```env
TELEGRAM_BOT_TOKEN=VOTRE_TOKEN_ICI
TELEGRAM_BOT_USERNAME=VotreBotUsername
TELEGRAM_CHANNEL_ID=-1001234567890
TELEGRAM_CHANNEL_NAME=Calmness Trading Signals
```

**Les 2 Redis sont DÉJÀ là :**
```env
UPSTASH_REDIS_REST_URL=https://legible-goblin-35329.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYoBAAInc...
```

---

## 2️⃣ CRÉER 3 BACKGROUND WORKERS SUR RENDER (5 min)

### Worker 1 : Celery Worker

```
New → Background Worker
Name: calmnesstrading-celery-worker
Environment: Python 3
Branch: main
Root Directory: backend

Build Command:
pip install -r requirements.txt

Start Command:
celery -A backend worker -l info --concurrency=2

Environment:
☑️ Copier toutes les variables du web service
```

### Worker 2 : Celery Beat

```
New → Background Worker
Name: calmnesstrading-celery-beat
Environment: Python 3
Branch: main
Root Directory: backend

Build Command:
pip install -r requirements.txt

Start Command:
celery -A backend beat -l info

Environment:
☑️ Copier toutes les variables du web service
```

### Worker 3 : Telegram Bot

```
New → Background Worker
Name: calmnesstrading-telegram-bot
Environment: Python 3
Branch: main
Root Directory: backend

Build Command:
pip install -r requirements.txt

Start Command:
python telegram_bot/bot.py

Environment:
☑️ Copier toutes les variables du web service
```

---

## 3️⃣ CRÉER L'OFFRE DE TEST (30 sec)

### Via Render Shell

```bash
# Dans Render Dashboard → Backend Service → Shell
python manage.py create_test_offer_10min
```

**OU via l'Admin Django :**

```
1. Aller sur: https://calmnesstrading.onrender.com/admin
2. Login admin
3. Payments → Offers → Add Offer
4. Remplir:
   - Name: Signal Demo 10min
   - Description: Test 10 minutes
   - Type: Signal
   - Price: 1.00
   - Currency: EUR
   - Duration minutes: 10
   - Is active: ✅
5. Save
```

---

## 4️⃣ VÉRIFIER QUE TOUT FONCTIONNE (1 min)

### Vérifier les 4 Services

Dans Render Dashboard, vous devez voir **4 services "Live"** :

1. ✅ **calmnesstrading-backend** (Web Service)
2. ✅ **calmnesstrading-celery-worker** (Background Worker)
3. ✅ **calmnesstrading-celery-beat** (Background Worker)
4. ✅ **calmnesstrading-telegram-bot** (Background Worker)

### Vérifier les Logs

**Backend :**
```
✅ Server started
✅ Migrations applied
```

**Celery Worker :**
```
celery@worker ready.
[tasks]
  . accounts.tasks_telegram.check_expired_subscriptions
  . accounts.tasks_telegram.expire_old_tokens
```

**Celery Beat :**
```
Scheduler: Sending task check-expired-subscriptions-every-minute
```

**Telegram Bot :**
```
🤖 Démarrage du bot Calmness Trading...
Bot started successfully
```

---

## 5️⃣ TESTER LE BOT (30 sec)

```
1. Ouvrir Telegram
2. Chercher @VotreBotUsername
3. Envoyer: /start
4. ✅ Le bot doit répondre immédiatement
```

**Si le bot ne répond pas :**
- Vérifier que le service telegram-bot est "Live"
- Vérifier TELEGRAM_BOT_TOKEN dans les variables
- Redémarrer le service

---

## 🎬 SCÉNARIO DE TEST SUR RENDER

### User Achète (Minute 0)

```
1. https://calmnesstrading.vercel.app
2. Login: test@example.com / testpass123
3. Services → Signaux
4. Sélectionner "Signal Demo 10min"
5. Formulaire:
   - Telegram: @VOTRE_USERNAME_REEL
   - ID Transaction: RENDER-TEST-001
6. Soumettre
```

### Service Client Valide (Minute 1)

```
1. Login: serviceclient@calmnesstrading.com / ServiceClient2024!
2. https://calmnesstrading.vercel.app/support/payments
3. Cliquer "Vérifier & Valider"
4. Confirmer

BACKEND AUTOMATIQUE:
   ✅ Token généré
   ✅ Notification créée
   ✅ Lien bot généré
```

### User Accède (Minute 2)

```
1. Voir notification "Paiement validé"
2. Cliquer sur le lien bot
3. Telegram /start
4. Bot: "Lien d'accès prêt !"
5. Rejoindre le canal
```

### Révocation (Minute 12)

```
⏰ Celery Beat détecte expiration
🚫 Celery Worker ban l'utilisateur
📧 Notification envoyée
❌ Accès révoqué
```

---

## 📊 MONITORING SUR RENDER

### Logs en Temps Réel

```
Dashboard → Service → Logs → Live Logs
```

**Surveiller :**
- **Backend** : Token généré
- **Celery Beat** : Tasks scheduled
- **Celery Worker** : Expiration détectée
- **Telegram Bot** : User interactions

---

## 🐛 DÉPANNAGE RAPIDE

### Service ne démarre pas

```
1. Vérifier les logs du service
2. Vérifier Build Command a réussi
3. Manual Deploy → Clear build cache
```

### Celery ne fonctionne pas

```
1. Vérifier variables UPSTASH_REDIS_REST_*
2. Vérifier que requirements.txt inclut celery
3. Redémarrer les workers
```

### Bot ne répond pas

```
1. Vérifier TELEGRAM_BOT_TOKEN
2. Vérifier logs du bot
3. Tester: https://api.telegram.org/bot{TOKEN}/getMe
```

---

## ✅ CHECKLIST AVANT TEST

Configuration Render:
- [ ] Variables Telegram ajoutées au backend
- [ ] 3 Background Workers créés
- [ ] 4 services "Live"
- [ ] Offre "Signal Demo 10min" créée
- [ ] Bot répond à /start

Telegram:
- [ ] Bot créé (@BotFather)
- [ ] Canal privé créé
- [ ] Bot = admin du canal
- [ ] Permissions: Inviter + Bannir

Frontend:
- [ ] Vercel déployé (automatique)
- [ ] Site accessible
- [ ] Login fonctionne

---

## 🎯 PRÊT !

**Frontend :** https://calmnesstrading.vercel.app ✅  
**Backend :** https://calmnesstrading.onrender.com ✅  
**Bot :** @VotreBotUsername ✅  

**Tout est déployé, suivez le scénario dans `PRET_POUR_TEST_COMPLET.md` !**

**⏱️ Test complet : 14 minutes**

