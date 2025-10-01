# Configuration de Chart Guru Prime

## 🚀 Démarrage Rapide

### 1. Prérequis
- Python 3.8+
- PostgreSQL
- Node.js 18+ (pour le frontend)

### 2. Configuration de l'environnement

#### Variables d'environnement
Créez un fichier `.env` dans le dossier `backend/` avec le contenu suivant :

```env
# Django Configuration
DJANGO_SECRET_KEY=django-insecure-change-me-in-production-12345
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
POSTGRES_DB=calmnessTrading
POSTGRES_USER=calmnessAdmin
POSTGRES_PASSWORD=calmness1234
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT Configuration
JWT_ACCESS_MINUTES=60
JWT_REFRESH_DAYS=7

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
CORS_ALLOW_ALL=False

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
DEFAULT_FROM_EMAIL=admin@calmnessfi.com

# Frontend Configuration
FRONTEND_BASE_URL=http://127.0.0.1:5173

# Site Configuration
SITE_NAME=CALMNESS FI
BRAND_COLOR=#F5B301
```

### 3. Installation et Configuration

#### Backend (Django)
```bash
# Activer l'environnement virtuel
venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Configuration automatique
python setup.py

# Ou configuration manuelle :
python manage.py makemigrations
python manage.py migrate
python manage.py create_admin
```

#### Base de données PostgreSQL
```bash
# Démarrer PostgreSQL avec Docker
docker-compose up -d

# Ou créer manuellement la base de données
createdb calmnessTrading
```

#### Frontend (React)
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Compte Administrateur

Un compte administrateur est créé automatiquement :
- **Email**: admin@calmnessfi.com
- **Mot de passe**: calmness

### 5. Démarrage des Services

#### Backend
```bash
cd backend
python manage.py runserver
```

#### Frontend
```bash
cd frontend
npm run dev
```

### 6. Accès aux Services

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin

## 🔧 Fonctionnalités Implémentées

### ✅ Authentification
- Inscription avec validation par email
- Connexion par email (pas username)
- Activation de compte par email
- JWT tokens avec refresh
- Gestion des permissions

### ✅ Gestion Admin
- Interface d'administration des utilisateurs
- Activation/désactivation des comptes
- Visualisation des informations utilisateur
- Filtres et recherche

### ✅ Modèles de Données
- Utilisateur personnalisé avec champs étendus
- Profil utilisateur avec préférences de trading
- Tokens de vérification d'email
- Gestion des avatars

## 🛠️ API Endpoints

### Authentification
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/login/` - Connexion par email
- `POST /api/auth/token/refresh/` - Rafraîchir token
- `GET /api/auth/me/` - Informations utilisateur
- `GET /api/auth/activate/` - Activation par email

### Administration
- `GET /api/auth/admin/users/` - Liste des utilisateurs
- `GET /api/auth/admin/users/{id}/` - Détails utilisateur
- `POST /api/auth/admin/users/{id}/activate/` - Activer utilisateur
- `POST /api/auth/admin/users/{id}/deactivate/` - Désactiver utilisateur

## 🐛 Dépannage

### Erreur de connexion à la base de données
```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps

# Redémarrer PostgreSQL
docker-compose restart
```

### Erreur de migration
```bash
# Supprimer les migrations et recréer
rm -rf accounts/migrations/__pycache__
rm accounts/migrations/0*.py
python manage.py makemigrations accounts
python manage.py migrate
```

### Erreur de permissions
```bash
# Vérifier les permissions de l'utilisateur PostgreSQL
psql -U calmnessAdmin -d calmnessTrading -c "\du"
```

## 📝 Notes de Développement

- Les emails sont envoyés dans la console en mode développement
- Les tokens de vérification expirent après 24h
- Le système utilise JWT pour l'authentification
- Les mots de passe sont hachés avec Django's PBKDF2
