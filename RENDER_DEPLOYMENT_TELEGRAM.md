# 🚀 Déploiement Complet - Render avec Telegram

## 📋 Vue d'ensemble

Ce guide explique comment déployer **4 services** sur Render :
1. **Web Service** - Django API
2. **Celery Worker** - Traitement des tâches
3. **Celery Beat** - Scheduler automatique
4. **Telegram Bot** - Gestion des accès canal

---

## 🏗️ Architecture sur Render

```
┌─────────────────────────────────────────────────┐
│                  RENDER.COM                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐             │
│  │  Web Service │  │  PostgreSQL  │             │
│  │   (Django)   │──│   Database   │             │
│  └──────────────┘  └──────────────┘             │
│         │                                        │
│         │          ┌──────────────┐             │
│         └──────────│ Upstash Redis│             │
│                    │  (External)  │             │
│                    └──────┬───────┘             │
│                           │                      │
│  ┌──────────────┐  ┌─────┴──────┐              │
│  │Celery Worker │  │Celery Beat │              │
│  │  (Background)│  │(Background)│              │
│  └──────────────┘  └────────────┘              │
│                                                  │
│  ┌──────────────┐                               │
│  │Telegram Bot  │                               │
│  │ (Background) │                               │
│  └──────────────┘                               │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 📦 Méthode 1 : Déploiement Automatique (render.yaml)

### 1. Utiliser le fichier render.yaml

Le fichier `backend/render.yaml` est déjà configuré !

```bash
# Depuis le dashboard Render
1. New → Blueprint
2. Connecter votre repo GitHub
3. Sélectionner backend/render.yaml
4. Render créera automatiquement les 4 services
```

### 2. Configurer les Variables d'Environnement

Dans le dashboard Render, ajouter un **Environment Group** :

```
Nom: calmnesstrading-backend
```

**Variables à ajouter :**

```env
# Django
DJANGO_SECRET_KEY=votre-secret-key-genere-automatiquement
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=calmnesstrading.onrender.com

# Base de données (auto-générée par Render)
DATABASE_URL=postgresql://...

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=VotreBotUsername
TELEGRAM_CHANNEL_ID=-1001234567890
TELEGRAM_CHANNEL_NAME=Calmness Trading Signals

# Redis Upstash
UPSTASH_REDIS_REST_URL=https://legible-goblin-35329.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYoBAAIncDFjOTI0NjQ2OThhOWM0MGVlOTcwNzViNTExNWJhYjBmMXAxMzUzMjk

# Email
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-app-password

# Frontend
FRONTEND_URL=https://calmnesstrading.vercel.app
```

---

## 🔧 Méthode 2 : Déploiement Manuel

### Service 1 : Web Service (Django)

```
Type: Web Service
Name: calmnesstrading-backend
Environment: Python 3
Region: Frankfurt
Branch: main
Root Directory: backend

Build Command:
pip install -r requirements.txt && pip install -r requirements_telegram.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput

Start Command:
gunicorn backend.wsgi:application
```

### Service 2 : Celery Worker

```
Type: Background Worker
Name: calmnesstrading-celery-worker
Environment: Python 3
Region: Frankfurt
Branch: main
Root Directory: backend

Build Command:
pip install -r requirements.txt && pip install -r requirements_telegram.txt

Start Command:
celery -A backend worker -l info --concurrency=2
```

### Service 3 : Celery Beat

```
Type: Background Worker
Name: calmnesstrading-celery-beat
Environment: Python 3
Region: Frankfurt
Branch: main
Root Directory: backend

Build Command:
pip install -r requirements.txt && pip install -r requirements_telegram.txt

Start Command:
celery -A backend beat -l info
```

### Service 4 : Telegram Bot

```
Type: Background Worker
Name: calmnesstrading-telegram-bot
Environment: Python 3
Region: Frankfurt
Branch: main
Root Directory: backend

Build Command:
pip install -r requirements.txt && pip install -r requirements_telegram.txt

Start Command:
python telegram_bot/bot.py
```

---

## 📊 Base de Données PostgreSQL

### Créer la Base de Données

```
1. Dashboard Render → New → PostgreSQL
2. Name: calmnesstrading-db
3. Database: calmnesstrading
4. User: calmnesstrading
5. Region: Frankfurt (même que les services)
6. Plan: Free
```

### Connecter aux Services

```
1. Copier l'Internal Database URL
2. Ajouter comme variable DATABASE_URL dans tous les services
```

---

## 🔴 Redis Upstash (Déjà Configuré)

Vous utilisez déjà Upstash Redis :

```env
UPSTASH_REDIS_REST_URL=https://legible-goblin-35329.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYoBAAIncDFjOTI0NjQ2OThhOWM0MGVlOTcwNzViNTExNWJhYjBmMXAxMzUzMjk
```

✅ **Aucune action requise** - Le système est déjà configuré pour l'utiliser !

---

## ✅ Vérification du Déploiement

### 1. Vérifier les Services

**Dans Render Dashboard, tous les services doivent être "Live" :**
- ✅ calmnesstrading-backend (Web Service)
- ✅ calmnesstrading-celery-worker (Background Worker)
- ✅ calmnesstrading-celery-beat (Background Worker)
- ✅ calmnesstrading-telegram-bot (Background Worker)

### 2. Vérifier les Logs

**Web Service :**
```
Starting gunicorn
Listening at: http://0.0.0.0:10000
✅ Server started successfully
```

**Celery Worker :**
```
celery@worker ready.
[tasks]
  . accounts.tasks_telegram.expire_old_tokens
  . accounts.tasks_telegram.check_expired_subscriptions
  ...
```

**Celery Beat :**
```
celery beat v5.3.4 is starting.
Scheduler: Sending due task check-expired-subscriptions-every-minute
```

**Telegram Bot :**
```
🤖 Démarrage du bot Calmness Trading...
INFO - Bot started successfully
INFO - Application initialized successfully
```

### 3. Tester l'API

```bash
# Tester que l'API répond
curl https://calmnesstrading.onrender.com/api/auth/health/

# Tester une requête Telegram (avec JWT)
curl https://calmnesstrading.onrender.com/api/telegram/admin/stats/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Tester le Bot Telegram

```
1. Ouvrir Telegram
2. Chercher @VotreBotUsername
3. Envoyer /start
4. Le bot devrait répondre immédiatement
```

---

## 🔐 Variables d'Environnement Essentielles

### Obligatoires pour Telegram

```env
TELEGRAM_BOT_TOKEN=           # Token de @BotFather
TELEGRAM_BOT_USERNAME=        # Username du bot (sans @)
TELEGRAM_CHANNEL_ID=          # ID du canal privé
TELEGRAM_CHANNEL_NAME=        # Nom du canal
```

### Obligatoires pour Celery

```env
UPSTASH_REDIS_REST_URL=       # URL Upstash (DÉJÀ BON)
UPSTASH_REDIS_REST_TOKEN=     # Token Upstash (DÉJÀ BON)
```

### Optionnelles

```env
CELERY_BROKER_URL=            # Auto-généré depuis Upstash
CELERY_RESULT_BACKEND=        # Auto-généré depuis Upstash
```

---

## 📈 Monitoring Production

### Health Checks Render

Ajouter dans chaque service :

**Web Service :**
```
Health Check Path: /api/auth/health/
```

**Background Workers :**
```
Pas de health check (workers continus)
```

### Logs en Temps Réel

```bash
# Via CLI Render
render logs -s calmnesstrading-backend --tail
render logs -s calmnesstrading-celery-worker --tail
render logs -s calmnesstrading-celery-beat --tail
render logs -s calmnesstrading-telegram-bot --tail
```

### Alertes

Configurer dans Render Dashboard :
- ✅ Service Down
- ✅ Deploy Failed
- ✅ High Memory Usage

---

## 🐛 Dépannage

### Service ne démarre pas

**Vérifier** :
1. Les logs du service
2. Les variables d'environnement
3. Le build command a réussi
4. Les dépendances sont installées

**Solution** :
```bash
# Redéployer manuellement
1. Dashboard → Service → Manual Deploy → Deploy Latest Commit
```

### Celery ne se connecte pas à Redis

**Vérifier** :
1. UPSTASH_REDIS_REST_URL est correcte
2. UPSTASH_REDIS_REST_TOKEN est correcte
3. Le format de l'URL est bon

**Tester** :
```python
import redis
from django.conf import settings

r = redis.from_url(settings.CELERY_BROKER_URL)
print(r.ping())  # Devrait afficher True
```

### Bot Telegram ne répond pas

**Vérifier** :
1. Le service telegram-bot est "Live"
2. TELEGRAM_BOT_TOKEN est correct
3. Les logs du bot

**Tester** :
```python
from telegram import Bot
from django.conf import settings

bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
print(bot.get_me())  # Devrait afficher les infos du bot
```

---

## 💰 Coûts Render

### Plan Free

**Limitations :**
- 750 heures/mois par service (suffisant pour 1 service 24/7)
- 4 services = 4 × 750h/mois
- Services dorment après 15 min d'inactivité
- Se réveillent automatiquement à la première requête

**⚠️ Pour Telegram :**
Les Background Workers (Celery + Bot) **ne dorment pas** avec le plan Free, donc ils consomment 750h/mois chacun.

### Plan Starter ($7/mois par service)

**Avantages :**
- Pas de mise en veille
- Plus de CPU/RAM
- Support prioritaire

**Total pour 4 services :**
- Web: $7/mois
- Celery Worker: $7/mois
- Celery Beat: $7/mois
- Telegram Bot: $7/mois
- **Total: $28/mois**

### Optimisation des Coûts

**Option 1 : Combiner Celery Worker + Beat**
```bash
# Lancer worker avec beat intégré
celery -A backend worker -B -l info
```
Économie : $7/mois

**Option 2 : Utiliser un seul Background Worker**
```bash
# start_all_background.sh
celery -A backend worker -B -l info &
python telegram_bot/bot.py
```
Économie : $14/mois (2 services au lieu de 3)

---

## 🔄 Mise à Jour Automatique

### Auto-Deploy depuis GitHub

```
1. Render Dashboard → Service → Settings
2. Auto-Deploy: Yes
3. Branch: main
```

À chaque push sur `main` :
- ✅ Build automatique
- ✅ Migration automatique
- ✅ Déploiement automatique
- ✅ Services redémarrés

---

## 📊 Monitoring des Tâches Celery

### Dashboard Flower (Optionnel)

```bash
# Ajouter dans requirements.txt
flower==2.0.1

# Nouveau service Render
Type: Web Service
Start Command: celery -A backend flower --port=$PORT
```

**Accès :** `https://calmnesstrading-flower.onrender.com`

---

## 🔒 Sécurité Production

### Variables Sensibles

**Ne JAMAIS commit dans Git :**
- ❌ TELEGRAM_BOT_TOKEN
- ❌ UPSTASH_REDIS_REST_TOKEN
- ❌ DJANGO_SECRET_KEY
- ❌ EMAIL_HOST_PASSWORD
- ❌ DATABASE_URL

**Utiliser** :
- ✅ Environment Groups dans Render
- ✅ Fichier .env en local (gitignored)

### Permissions Bot

**Minimales requises :**
- ✅ Inviter des utilisateurs
- ✅ Bannir des utilisateurs
- ✅ Gérer les liens d'invitation

**À éviter :**
- ❌ Supprimer des messages
- ❌ Épingler des messages
- ❌ Changer les infos du canal

---

## 📝 Checklist de Déploiement

### Avant le Déploiement

- [ ] Bot Telegram créé (@BotFather)
- [ ] Canal privé créé
- [ ] Bot ajouté comme admin du canal
- [ ] Variables d'environnement notées
- [ ] Upstash Redis configuré
- [ ] Code poussé sur GitHub

### Déploiement Render

- [ ] 4 services créés (Web + 3 Workers)
- [ ] Environment Group configuré
- [ ] Variables d'environnement ajoutées
- [ ] PostgreSQL database créée
- [ ] Database connectée aux services
- [ ] Auto-deploy activé

### Vérification Post-Déploiement

- [ ] Web Service "Live"
- [ ] Celery Worker "Live"
- [ ] Celery Beat "Live"
- [ ] Telegram Bot "Live"
- [ ] Migrations exécutées
- [ ] Admin/Service Client créés
- [ ] Bot répond à /start
- [ ] Test abonnement 5min réussi

---

## 🧪 Test en Production

### 1. Créer l'Offre de Test

```bash
# Via Render Shell
render shell -s calmnesstrading-backend

# Dans le shell
python manage.py create_test_offer_5min
```

### 2. Tester le Workflow

```
1. Frontend → Services → "Test Telegram 5min"
2. Payer 1€ (ou gratuit si configuré)
3. Service Client valide
4. Notification avec lien bot
5. Cliquer sur le bot
6. Rejoindre le canal
7. Attendre 5 minutes
8. Vérifier révocation automatique
```

---

## 📊 URLs Importantes

```
Backend API: https://calmnesstrading.onrender.com
Frontend: https://calmnesstrading.vercel.app
Bot Telegram: https://t.me/VotreBotUsername

API Endpoints:
- Health: /api/auth/health/
- Telegram Stats: /api/telegram/admin/stats/
- Notifications: /api/telegram/notifications/
```

---

## 🆘 Support Render

### Logs

```bash
# Via CLI
render logs -s calmnesstrading-backend --tail
render logs -s calmnesstrading-celery-worker --tail
render logs -s calmnesstrading-celery-beat --tail
render logs -s calmnesstrading-telegram-bot --tail

# Via Dashboard
Services → Logs → Live Logs
```

### Shell Interactif

```bash
# Ouvrir un shell Django sur Render
render shell -s calmnesstrading-backend

# Tester quelque chose
python manage.py shell
```

### Restart Services

```bash
# Via CLI
render services restart -s calmnesstrading-backend

# Via Dashboard
Service → Manual Deploy → Clear build cache & deploy
```

---

## 💡 Optimisations

### 1. Réduire le Nombre de Services (Économie)

**Combiner Worker + Beat dans un seul service :**

```bash
# start_celery_all.sh
#!/bin/bash
celery -A backend worker -B -l info --concurrency=2
```

**Résultat** : 3 services au lieu de 4 → Économie $7/mois

### 2. Utiliser un Redis Upstash Gratuit

Vous utilisez déjà Upstash (gratuit jusqu'à 10 000 commandes/jour) ✅

### 3. Cache Django avec Redis

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': CELERY_BROKER_URL,
    }
}
```

---

## 🚀 Mise en Production - Commandes

```bash
# 1. Pousser le code
git add .
git commit -m "Deploy: Telegram system ready"
git push origin main

# 2. Les services se redéploient automatiquement

# 3. Vérifier les logs
render logs -s calmnesstrading-backend --tail
render logs -s calmnesstrading-telegram-bot --tail

# 4. Tester le bot
# Ouvrir Telegram → @VotreBotUsername → /start
```

---

## 📋 TODO Après Déploiement

- [ ] Configurer les variables Telegram sur Render
- [ ] Tester le bot en production
- [ ] Créer offre de test 5min
- [ ] Effectuer un test complet
- [ ] Surveiller les logs pendant 24h
- [ ] Configurer les alertes Render
- [ ] Documenter les credentials (sécurisé)

---

## 🎉 Déploiement Réussi !

**Votre système Telegram est maintenant en production avec :**

✅ **4 services** fonctionnant 24/7  
✅ **Révocation automatique** toutes les minutes  
✅ **Notifications** en temps réel  
✅ **Sécurité maximale** (tokens uniques)  
✅ **Monitoring** complet  
✅ **Auto-deploy** depuis GitHub  

**Le système est prêt pour gérer vos abonnements Telegram de manière professionnelle ! 🚀**

