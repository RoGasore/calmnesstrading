# 🎯 CONFIGURATION RENDER - CE QU'IL FAUT FAIRE MAINTENANT

## ✅ VOTRE SERVICE BACKEND ACTUEL

### Configuration Actuelle à Garder

**Dans Render Dashboard → Backend Service :**

**Build Command :**
```bash
chmod +x start.sh && ./start.sh
```

**Start Command :**
```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

**Root Directory :**
```
backend
```

**⚠️ IMPORTANT :**
Le fichier **`start.sh`** est maintenant configuré pour :
- ✅ Installer requirements.txt (Django, etc.)
- ✅ Installer requirements_telegram.txt (Celery, Bot)
- ✅ Faire les migrations
- ✅ Créer admin/service client/test user
- ✅ **Créer l'offre test 10min automatiquement**
- ✅ Lancer gunicorn (pas runserver)

**Donc le Build Command peut rester comme avant !**

---

## 🆕 CE QU'IL FAUT AJOUTER

### 1️⃣ Variables d'Environnement (OBLIGATOIRE)

**Dans Backend Service → Environment → Add Environment Variable :**

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=VotreBotUsername
TELEGRAM_CHANNEL_ID=-1001234567890
TELEGRAM_CHANNEL_NAME=Calmness Trading Signals
```

**Vérifier que ces variables existent déjà :**
```env
UPSTASH_REDIS_REST_URL=https://legible-goblin-35329.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYoBAAInc...
DATABASE_URL=postgresql://...
DJANGO_SECRET_KEY=...
```

---

### 2️⃣ Créer 3 Background Workers (OBLIGATOIRE)

Ces workers sont nécessaires pour :
- ✅ Traiter les tâches (Celery Worker)
- ✅ Vérifier expirations chaque minute (Celery Beat)
- ✅ Gérer le bot Telegram (Telegram Bot)

---

## 🔧 WORKER 1 : Celery Worker

**Dashboard Render → New → Background Worker**

```
Name: calmnesstrading-celery-worker

Environment: Python 3

Branch: main

Root Directory: backend

Build Command:
pip install -r requirements.txt

Start Command:
celery -A backend worker -l info --concurrency=2
```

**Environment Variables :**
```
☑️ Sync from: calmnesstrading-backend
(Copie automatiquement toutes les variables)
```

---

## 🔧 WORKER 2 : Celery Beat

**Dashboard Render → New → Background Worker**

```
Name: calmnesstrading-celery-beat

Environment: Python 3

Branch: main

Root Directory: backend

Build Command:
pip install -r requirements.txt

Start Command:
celery -A backend beat -l info
```

**Environment Variables :**
```
☑️ Sync from: calmnesstrading-backend
```

---

## 🔧 WORKER 3 : Telegram Bot

**Dashboard Render → New → Background Worker**

```
Name: calmnesstrading-telegram-bot

Environment: Python 3

Branch: main

Root Directory: backend

Build Command:
pip install -r requirements.txt

Start Command:
python telegram_bot/bot.py
```

**Environment Variables :**
```
☑️ Sync from: calmnesstrading-backend
```

---

## 📋 RÉCAPITULATIF - VOS 4 SERVICES

| Service | Type | Start Command | Statut |
|---------|------|---------------|--------|
| **backend** | Web | `gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT` | Déjà existe |
| **celery-worker** | Worker | `celery -A backend worker -l info --concurrency=2` | À créer |
| **celery-beat** | Worker | `celery -A backend beat -l info` | À créer |
| **telegram-bot** | Worker | `python telegram_bot/bot.py` | À créer |

---

## 🚀 ORDRE DE DÉPLOIEMENT

1. **Backend** → Ajouter variables Telegram → Redéployer
2. **Celery Worker** → Créer → Attendre "Live"
3. **Celery Beat** → Créer → Attendre "Live"
4. **Telegram Bot** → Créer → Attendre "Live"

---

## ✅ VÉRIFICATION POST-DÉPLOIEMENT

### Test Rapide du Bot

```
1. Telegram → Chercher @VotreBotUsername
2. Envoyer: /start
3. ✅ Bot doit répondre: "Bienvenue..."
```

### Test API

```bash
# Tester l'API Support
curl https://calmnesstrading.onrender.com/api/support/dashboard/ \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

### Vérifier Offre Créée

```
1. https://calmnesstrading.onrender.com/admin
2. Login admin
3. Payments → Offers
4. ✅ "Signal Demo 10min" doit exister
```

---

## 🎯 FICHIER RENDER À UTILISER

**Fichier :** `backend/start.sh`

**Ce fichier fait TOUT :**
- ✅ Installe dépendances (Django + Celery + Telegram)
- ✅ Migrations
- ✅ Collectstatic
- ✅ Crée admin/service client/test user
- ✅ **Crée offre test 10min**
- ✅ Lance gunicorn

**Donc dans Render :**

**Build Command :**
```bash
chmod +x start.sh && pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput
```

**Start Command :**
```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

**OU plus simple :**

**Build Command :**
```bash
pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput && python manage.py sync_admin_user && python manage.py create_customer_service && python manage.py create_test_user && python manage.py create_test_offer_10min
```

**Start Command :**
```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

---

**🎉 CONFIGURATION CLAIRE ET PRÊTE POUR RENDER !**

