# 🚀 Guide de Déploiement - Calmness Trading

## Vue d'ensemble

Ce guide explique comment déployer Calmness Trading en production sur Render.com (backend) et Vercel (frontend).

---

## 📦 Backend (Render.com)

### 1. Variables d'Environnement

Configurer dans Render Dashboard :

```bash
# Django
DJANGO_SECRET_KEY=your-super-secret-key-change-me
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=calmnesstrading.onrender.com

# Database (PostgreSQL automatique sur Render)
# Ces variables sont auto-configurées par Render

# JWT
JWT_ACCESS_MINUTES=60
JWT_REFRESH_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=https://calmnesstrading.vercel.app,https://calmnesstrading.com

# Email (pour notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@calmnesstrading.com
EMAIL_HOST_PASSWORD=your-email-password

# Telegram Bot (optionnel)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHANNEL_ID=@calmnesstrading

# Discord Webhook (optionnel)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# WhatsApp Business API (optionnel)
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_PHONE_NUMBER=+33123456789
```

### 2. Fichier build.sh

Le script `backend/build.sh` est automatiquement exécuté par Render :

```bash
#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
pip install -r requirements_analytics.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Créer un superuser automatiquement (optionnel)
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@calmnesstrading.com', 'Admin@2024!');
    print('Superuser créé');
else:
    print('Superuser existe déjà');
"

# Générer les analytics pour les 7 derniers jours
python manage.py update_analytics --days=7
```

### 3. Configuration Render

1. **New Web Service**
2. **Connect GitHub** repository
3. **Environment** : Python 3
4. **Build Command** : `./build.sh`
5. **Start Command** : `gunicorn backend.wsgi:application`
6. **Plan** : Starter ($7/mois) ou Free
7. **Add PostgreSQL** database

---

## 🎨 Frontend (Vercel)

### 1. Variables d'Environnement

Dans Vercel Dashboard (Settings → Environment Variables) :

```bash
VITE_API_BASE_URL=https://calmnesstrading.onrender.com
```

### 2. Configuration Vercel

Fichier `vercel.json` (optionnel) :

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. Déploiement

1. **Connect GitHub** sur Vercel
2. **Import Project**
3. **Framework Preset** : Vite
4. **Root Directory** : `frontend`
5. **Build Command** : `npm run build`
6. **Output Directory** : `dist`
7. **Deploy**

---

## 🔄 Tâches Programmées (Optionnel mais Recommandé)

### Option 1 : Render Cron Jobs

Ajouter dans Render Dashboard :

```bash
# Tous les jours à minuit : générer résumé quotidien
0 0 * * * curl https://calmnesstrading.onrender.com/api/analytics/cron/daily-summary/

# Toutes les heures : mettre à jour rankings
0 * * * * curl https://calmnesstrading.onrender.com/api/analytics/cron/update-rankings/
```

### Option 2 : Celery (Recommandé pour Production)

```bash
# Installer Redis sur Render
# Ajouter dans requirements.txt :
celery==5.3.0
redis==5.0.0

# Créer worker Render
# Build Command : pip install -r requirements.txt
# Start Command : celery -A backend worker --loglevel=info
```

---

## 📊 Middleware Analytics

### Activer le Tracking Automatique

Dans `backend/backend/settings.py`, ajouter :

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ... autres middleware
    'analytics.middleware.AnalyticsTrackingMiddleware',  # ⭐ AJOUTER
]
```

**⚠️ Attention** : Ce middleware enregistre CHAQUE page vue. 
En production, considérez :
- Limiter aux pages publiques
- Utiliser un système de sampling (1 visite sur 10)
- Exclure les bots via user-agent

---

## 🔐 Sécurité Production

### Django Settings

```python
# Production uniquement
DEBUG = False
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HSTS
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

### CORS

```python
CORS_ALLOWED_ORIGINS = [
    'https://calmnesstrading.vercel.app',
    'https://calmnesstrading.com',
    'https://www.calmnesstrading.com',
]

CORS_ALLOW_CREDENTIALS = True
```

---

## 💾 Base de Données

### PostgreSQL (Render)

Automatiquement configuré par Render. Variables disponibles :
- `DATABASE_URL` - URL complète
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`

### Backups

Configurer backups automatiques sur Render :
- **Fréquence** : Quotidien
- **Rétention** : 7 jours (plan gratuit) ou 30 jours (payant)

---

## 📧 Email Configuration

### Gmail SMTP

```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = 'Calmness Trading <noreply@calmnesstrading.com>'
```

**⚠️ Gmail** : Activer "App Passwords" dans les paramètres Google

### Alternative : SendGrid

```bash
pip install sendgrid

# Plus fiable pour production
EMAIL_BACKEND = 'sendgrid_backend.SendgridBackend'
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
```

---

## 🔔 Notifications

### Telegram

1. Créer bot avec [@BotFather](https://t.me/botfather)
2. Récupérer le token
3. Ajouter dans variables d'environnement
4. Tester : `/api/test-telegram/`

### Discord

1. Créer Webhook dans paramètres channel Discord
2. Ajouter URL dans variables d'environnement
3. Tester avec : `curl -X POST webhook_url -d {...}`

### WhatsApp

Option 1 : **WhatsApp Business API** (officiel, payant)
Option 2 : **Twilio** (recommandé, $$$)
Option 3 : **WAPI** (non-officiel, risqué)

---

## 📈 Performance

### Optimisations Recommandées

1. **Redis Cache**
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL'),
    }
}
```

2. **Celery Worker** pour :
   - Envoi emails
   - Géolocalisation IP
   - Génération résumés analytics
   - Calcul performances trading

3. **CDN** pour static files (Cloudflare, AWS CloudFront)

4. **Database Connection Pooling**
```python
DATABASES['default']['CONN_MAX_AGE'] = 600
```

---

## 🧪 Tests

### Backend

```bash
cd backend
python manage.py test
```

### Frontend

```bash
cd frontend
npm run test
```

---

## 📊 Monitoring

### Logs (Render)

Render fournit logs en temps réel dans le dashboard.

### Sentry (Recommandé)

```bash
pip install sentry-sdk

# settings.py
import sentry_sdk
sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    environment='production'
)
```

### Uptime Monitoring

- **UptimeRobot** (gratuit)
- **Pingdom**
- **StatusCake**

---

## 🔄 CI/CD

### Automatisation avec GitHub Actions

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
      
      - name: Deploy to Vercel
        run: |
          curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK }}
```

---

## 🎯 Checklist de Déploiement

### Avant le Déploiement

- [ ] Changer `SECRET_KEY` en production
- [ ] Désactiver `DEBUG = False`
- [ ] Configurer `ALLOWED_HOSTS`
- [ ] Configurer CORS
- [ ] Tester toutes les APIs
- [ ] Créer compte Superuser
- [ ] Uploader logo/images
- [ ] Configurer emails
- [ ] Tester paiements (mode sandbox)

### Après le Déploiement

- [ ] Vérifier site accessible
- [ ] Tester connexion/inscription
- [ ] Vérifier emails envoyés
- [ ] Tester paiements réels
- [ ] Configurer domaine custom
- [ ] Activer SSL/HTTPS
- [ ] Configurer DNS
- [ ] Tester sur mobile
- [ ] Vérifier analytics
- [ ] Setup monitoring

---

## 🆘 Troubleshooting

### Erreur 500

1. Vérifier logs Render
2. Checker `ALLOWED_HOSTS`
3. Vérifier migrations appliquées
4. Tester `collectstatic`

### CORS Errors

```python
CORS_ALLOWED_ORIGINS = ['https://calmnesstrading.vercel.app']
CORS_ALLOW_CREDENTIALS = True
```

### Database Connection

Vérifier variable `DATABASE_URL` dans Render.

### Static Files

```bash
python manage.py collectstatic --no-input
```

---

## 📞 Support Déploiement

Pour aide au déploiement :
- **Email** : dev@calmnesstrading.com
- **Documentation** : Ce fichier
- **Render Docs** : https://render.com/docs
- **Vercel Docs** : https://vercel.com/docs

---

**✅ Prêt pour la production !**
