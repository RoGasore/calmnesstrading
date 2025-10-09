# 🎯 CONFIGURATION RENDER - EXACTE

## 📋 Configuration de Votre Service Backend Actuel

### Dans Render Dashboard → Votre Backend Service → Settings

---

## 1️⃣ BUILD COMMAND

**Remplacer par :**

```bash
pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput && python manage.py sync_admin_user && python manage.py create_customer_service && python manage.py create_test_user && python manage.py create_test_offer_10min
```

**OU utiliser le script (plus propre) :**

```bash
chmod +x start.sh && ./start.sh
```

**⚠️ MAIS** : `start.sh` utilise `runserver` à la fin, donc il faut le modifier.

---

## 2️⃣ START COMMAND

**Remplacer par :**

```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

---

## 🔧 SOLUTION RECOMMANDÉE

### Modifier start.sh pour Render

Changez la dernière ligne de `start.sh` :

**AVANT :**
```bash
python manage.py runserver 0.0.0.0:$PORT
```

**APRÈS :**
```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

### Configuration Finale Render

**Build Command :**
```bash
chmod +x start.sh && pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput && python manage.py sync_admin_user && python manage.py create_customer_service && python manage.py create_test_user && python manage.py create_test_offer_10min
```

**Start Command :**
```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

---

## 3️⃣ VARIABLES D'ENVIRONNEMENT

**Ajouter dans Environment :**

```env
TELEGRAM_BOT_TOKEN=VOTRE_TOKEN
TELEGRAM_BOT_USERNAME=VotreBotUsername
TELEGRAM_CHANNEL_ID=-1001234567890
TELEGRAM_CHANNEL_NAME=Calmness Trading Signals
```

**Déjà existantes (vérifier) :**
```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
DATABASE_URL=postgresql://...
DJANGO_SECRET_KEY=...
FRONTEND_URL=https://calmnesstrading.vercel.app
```

---

## 4️⃣ CRÉER LES 3 BACKGROUND WORKERS

### Worker 1 : Celery Worker

```
Type: Background Worker
Name: calmnesstrading-celery-worker
Environment: Python 3
Root Directory: backend

Build Command:
pip install -r requirements.txt

Start Command:
celery -A backend worker -l info --concurrency=2
```

### Worker 2 : Celery Beat

```
Type: Background Worker
Name: calmnesstrading-celery-beat
Environment: Python 3
Root Directory: backend

Build Command:
pip install -r requirements.txt

Start Command:
celery -A backend beat -l info
```

### Worker 3 : Telegram Bot

```
Type: Background Worker
Name: calmnesstrading-telegram-bot
Environment: Python 3
Root Directory: backend

Build Command:
pip install -r requirements.txt

Start Command:
python telegram_bot/bot.py
```

**Pour chaque worker :**
- ☑️ Copier TOUTES les variables d'environnement du backend
- ☑️ Même région que le backend
- ☑️ Auto-Deploy: Yes

---

## 🔄 APRÈS CONFIGURATION

1. **Sauvegarder** les changements
2. **Redéployer** le backend : Manual Deploy → Deploy Latest Commit
3. **Vérifier** que les 4 services sont "Live"
4. **Tester** le bot : Telegram → @VotreBotUsername → /start

---

## ✅ VÉRIFICATION

### Services Live (4/4)

- [ ] calmnesstrading-backend → Live
- [ ] calmnesstrading-celery-worker → Live  
- [ ] calmnesstrading-celery-beat → Live
- [ ] calmnesstrading-telegram-bot → Live

### Logs Sans Erreurs

**Backend :**
```
Booting worker with pid: 123
Server started
```

**Celery Worker :**
```
celery@worker ready.
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

## 🎬 LANCER LE TEST

Une fois que les 4 services sont "Live" :

1. **Créer l'offre** (si pas auto-créée) :
   - Render Shell → `python manage.py create_test_offer_10min`
   
2. **Suivre** `PRET_POUR_TEST_COMPLET.md`

3. **Monitorer** les logs en temps réel

---

**🚀 VOTRE CONFIGURATION EXACTE POUR RENDER EST PRÊTE !**

