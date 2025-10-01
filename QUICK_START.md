# 🚀 Guide de Démarrage Rapide - CALMNESS FI

## 📋 Prérequis

- Python 3.13+
- Node.js 18+
- PostgreSQL
- Docker (optionnel)

---

## ⚡ Démarrage en 5 minutes

### 1️⃣ Backend Django

```bash
# Naviguer vers le backend
cd backend

# Activer l'environnement virtuel
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Démarrer PostgreSQL (Docker)
docker-compose up -d

# Appliquer les migrations
python manage.py migrate

# Initialiser les données de paiement
python manage.py init_payment_data

# Initialiser les pages CMS
python manage.py init_header_sections
python manage.py init_footer_sections
python manage.py init_all_pages

# Démarrer le serveur
python manage.py runserver
```

✅ **Backend lancé sur** : `http://127.0.0.1:8000`

---

### 2️⃣ Frontend React

```bash
# Ouvrir un nouveau terminal
cd frontend

# Installer les dépendances (si nécessaire)
npm install

# Démarrer le serveur de développement
npm run dev
```

✅ **Frontend lancé sur** : `http://localhost:8080`

---

## 🔑 Comptes par défaut

### Administrateur
```
Email: admin@calmnessfi.com
Mot de passe: calmness
```

**Permissions** :
- ✅ Accès admin Django (`/admin`)
- ✅ Validation des paiements
- ✅ Gestion des utilisateurs
- ✅ Modification du contenu (CMS)

---

## 🧪 Test du système de paiement

### Parcours utilisateur

1. **Créer un compte utilisateur**
   - Aller sur `http://localhost:8080/register`
   - S'inscrire avec un email
   - Vérifier l'email (simulé en dev)

2. **Consulter les offres**
   - Aller sur `http://localhost:8080/tarifs`
   - Les offres s'affichent dynamiquement depuis la base

3. **Sélectionner une offre**
   - Cliquer sur "Choisir cette offre"
   - Redirection vers `/checkout?offer=ID`

4. **Finaliser le paiement**
   - Choisir un canal de contact (WhatsApp, Telegram, Discord)
   - Entrer ses coordonnées
   - Cliquer sur "Envoyer la demande"

5. **Vérifier dans le profil**
   - Aller sur `http://localhost:8080/profile`
   - Onglet "Abonnements"
   - Le paiement apparaît dans "Paiements en attente"

### Parcours admin

1. **Se connecter en admin**
   - Aller sur `http://localhost:8080/login`
   - Email: `admin@calmnessfi.com`
   - Mot de passe: `calmness`

2. **Accéder au dashboard paiements**
   - Aller sur `http://localhost:8080/admin/payments`
   - Voir les statistiques
   - Consulter la liste des paiements en attente

3. **Valider un paiement**
   - Cliquer sur "Valider" à côté d'un paiement
   - Le système crée automatiquement :
     - Un `Payment` (paiement validé)
     - Un `Subscription` (abonnement actif)
     - Une entrée dans l'historique

4. **Vérifier la création**
   - Retour sur le profil utilisateur
   - L'abonnement apparaît dans "Abonnements actifs"
   - Compte à rebours visible

---

## 📁 Structure du projet

```
chart-guru-prime-29/
├── backend/              # Django REST API
│   ├── accounts/         # Authentification + Utilisateurs
│   ├── content/          # CMS dynamique
│   ├── payments/         # 🆕 Système de paiement
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/             # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── payment/     # 🆕 Composants paiement
│   │   │   ├── admin/       # 🆕 Dashboard admin
│   │   │   └── user/        # 🆕 Dashboard utilisateur
│   │   ├── contexts/
│   │   │   └── PaymentContext.tsx  # 🆕 Context API
│   │   └── pages/
│   │       ├── Tarifs.tsx          # 🆕 Page dynamique
│   │       ├── Checkout.tsx        # 🆕 Page paiement
│   │       └── admin/
│   │           └── AdminPayments.tsx
│   └── package.json
│
├── PAYMENT_SYSTEM_GUIDE.md    # 📚 Documentation complète
└── QUICK_START.md             # 🚀 Ce fichier
```

---

## 🔧 Configuration

### Variables d'environnement (Backend)

Créer un fichier `.env` dans `backend/` :

```env
# Database
POSTGRES_DB=chart_guru_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend
FRONTEND_BASE_URL=http://localhost:8080

# Email (pour vérification des comptes)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# DeepL (pour traductions automatiques - optionnel)
DEEPL_API_KEY=your-deepl-api-key
```

### Variables d'environnement (Frontend)

Créer un fichier `.env` dans `frontend/` :

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 🗄️ Données initiales

### Commandes d'initialisation

```bash
# Initialiser les offres et canaux de contact
python manage.py init_payment_data

# Initialiser le contenu CMS
python manage.py init_header_sections
python manage.py init_footer_sections
python manage.py init_all_pages
```

### Résultat

✅ **10 offres** créées :
- 4 abonnements (7, 15, 30, 90 jours)
- 3 formations (Débutant, Intermédiaire, Élite)
- 3 offres de gestion de compte (Bronze, Silver, Gold)

✅ **3 canaux de contact** créés :
- WhatsApp
- Telegram
- Discord

✅ **1 admin** créé :
- Email: `admin@calmnessfi.com`
- Mot de passe: `calmness`

---

## 🎯 Fonctionnalités testables

### ✅ Système de paiement
- [x] Affichage dynamique des offres
- [x] Sélection d'offre et checkout
- [x] Création de paiement en attente
- [x] Validation admin
- [x] Création automatique d'abonnement
- [x] Compte à rebours en temps réel
- [x] Historique des paiements

### ✅ Dashboard utilisateur
- [x] Abonnements actifs
- [x] Paiements en attente
- [x] Historique des paiements
- [x] Total dépensé

### ✅ Dashboard admin
- [x] Statistiques temps réel
- [x] Liste des paiements en attente
- [x] Validation/Annulation
- [x] Gestion des abonnements

### ✅ CMS (Système de gestion de contenu)
- [x] Mode édition inline
- [x] Modification de texte
- [x] Upload d'images
- [x] Versioning
- [x] Traductions automatiques (DeepL)

---

## 📊 Endpoints API importants

### Paiements
```
GET  /api/payments/offers/                    # Liste des offres
POST /api/payments/pending-payments/create/   # Créer un paiement
GET  /api/payments/dashboard/                 # Dashboard utilisateur
GET  /api/payments/admin/dashboard/           # Dashboard admin
POST /api/payments/admin/pending-payments/validate/  # Valider un paiement
```

### CMS
```
GET  /api/content/cms/pages/               # Liste des pages
GET  /api/content/cms/sections/            # Sections de contenu
POST /api/content/cms/sections/{id}/save/  # Sauvegarder une section
```

### Authentification
```
POST /api/auth/register/      # Inscription
POST /api/auth/login/         # Connexion
POST /api/auth/token/refresh/ # Rafraîchir le token
```

---

## 🐛 Dépannage

### Erreur : "connection refused" PostgreSQL
```bash
# Vérifier que Docker est lancé
docker ps

# Redémarrer PostgreSQL
cd backend
docker-compose restart
```

### Erreur : "Module not found" (Frontend)
```bash
cd frontend
npm install
```

### Erreur : "No module named 'payments'"
```bash
# Vérifier que l'app est dans INSTALLED_APPS
# backend/backend/settings.py
INSTALLED_APPS = [
    ...
    'payments',  # ✅ Doit être présent
]
```

### Port déjà utilisé
```bash
# Backend (8000)
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Frontend (8080)
# Changer le port dans vite.config.ts
```

---

## 🔐 Sécurité

### En développement
- ✅ DEBUG=True (pour voir les erreurs)
- ✅ CORS activé pour localhost
- ✅ Tokens JWT en mémoire

### En production (à configurer)
- ⚠️ DEBUG=False
- ⚠️ SECRET_KEY unique et sécurisée
- ⚠️ ALLOWED_HOSTS configuré
- ⚠️ HTTPS activé
- ⚠️ Variables d'environnement sécurisées

---

## 📚 Documentation supplémentaire

- **Guide complet** : [PAYMENT_SYSTEM_GUIDE.md](./PAYMENT_SYSTEM_GUIDE.md)
- **API Django Admin** : http://127.0.0.1:8000/admin
- **API REST Browsable** : http://127.0.0.1:8000/api/

---

## 🎉 Prêt à démarrer !

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev

# Ouvrir le navigateur
# Frontend: http://localhost:8080
# Admin: http://localhost:8080/login (admin@calmnessfi.com / calmness)
```

---

**Bon développement ! 🚀**

