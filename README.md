# 🌟 Calmness Trading - Plateforme de Trading Professionelle

![Version](https://img.shields.io/badge/version-2.0.0-gold)
![Django](https://img.shields.io/badge/Django-4.2-green)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

**Plateforme complète de formation au trading avec analytics avancées, support multicanal et synchronisation MetaTrader.**

---

## ✨ Fonctionnalités Principales

### 👥 Pour les Utilisateurs
- 📊 **Dashboard Personnalisable** - Widgets drag & drop
- 🎓 **Formations en Direct** - Zoom/Google Meet intégrés
- 📈 **Signaux de Trading** - Notifications multi-canaux
- 💹 **Historique MetaTrader** - Synchronisation automatique via EA
- 💳 **Paiements Sécurisés** - Factures PDF conformes
- 📱 **Support 24/7** - Chat, WhatsApp, Telegram, Discord, Email

### 🔧 Pour les Administrateurs
- 📊 **Analytics Avancées** - Tracking IP, géolocalisation, démographie
- 🏆 **Classement Traders** - Ranking dynamique avec podium
- 📅 **Gestion Formations** - Sessions programmées, notifications auto
- 💰 **Gestion Paiements** - Validation, facturation automatique
- 👥 **Gestion Utilisateurs** - Activation, statistiques, historique
- 📄 **Gestion Contenu** - CMS intégré pour toutes les pages

---

## 🎨 Design

**Palette exclusive Gold/Noir/Blanc**

![Gold](https://img.shields.io/badge/Gold-%23D4AF37-gold?style=for-the-badge)
![Black](https://img.shields.io/badge/Black-%23000000-black?style=for-the-badge)
![White](https://img.shields.io/badge/White-%23FFFFFF-white?style=for-the-badge)

---

## 🚀 Installation

### Prérequis
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (ou SQLite pour dev)

### Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Analytics

Le système analytics inclut :

- **Tracking IP** avec géolocalisation automatique
- **Performances Trading** détaillées (TP, SL, pips, profits)
- **Top 10 Traders** avec ranking score
- **Entonnoir de Conversion** visuel
- **Démographie** (âge, genre, localisation)
- **5 Onglets** d'analyses approfondies

![Analytics Preview](https://via.placeholder.com/800x400/D4AF37/000000?text=Analytics+Dashboard)

---

## 💬 Support Client

Widget multicanal flottant avec :
- 💬 **Chat intégré** temps réel
- 📱 **WhatsApp** - Réponse 5 min
- ✈️ **Telegram** - Support 24/7
- 🎮 **Discord** - Communauté
- 📧 **Email** - Réponse 24h

---

## 📈 MetaTrader Integration

### Expert Advisor (EA)
- Synchronisation automatique des trades
- **Lecture seule** (sécurité maximale)
- Clé API unique par utilisateur
- Compatible MT4 et MT5

### Installation EA
1. Télécharger le script depuis l'espace utilisateur
2. Installer dans `MQL4/Experts`
3. Configurer avec votre clé API
4. Activer "Auto Trading"

---

## 📄 Facturation

Conforme aux normes françaises :
- Numérotation **CT-YYYYMMDD-XXXX**
- PDF automatique avec logo gold
- Mentions légales (SIRET, TVA)
- Téléchargement instantané

---

## 🔐 Sécurité

- ✅ **JWT Authentication** avec refresh tokens
- ✅ **HTTPS Only** en production
- ✅ **Rate Limiting** sur APIs
- ✅ **CORS** configuré
- ✅ **Permissions** granulaires
- ✅ **Hashing** bcrypt pour passwords

---

## 📚 Documentation

- [📊 Analytics Setup Guide](./ANALYTICS_SETUP_GUIDE.md)
- [📈 Trading History Guide](./TRADING_HISTORY_ACTIVATION_GUIDE.md)
- [📋 Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [🎯 Final Summary](./PROJECT_FINAL_SUMMARY.md)

---

## 🛠️ Stack Technique

### Frontend
- **React 18** - UI moderne
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Composants
- **React Router** - Navigation
- **React Query** - État serveur

### Backend
- **Django 4.2** - Framework principal
- **DRF** - API REST
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **WeasyPrint** - PDF

### Intégrations
- MetaTrader (MQL4)
- WhatsApp, Telegram, Discord
- Email (SMTP)
- ipapi.co (géolocalisation)

---

## 📊 Statistiques

- **47+ Commits** organisés
- **20,000+ Lignes** de code
- **21 Modèles** Django
- **35+ Endpoints** API
- **45+ Composants** React
- **25+ Pages** complètes

---

## 🎯 Roadmap

### ✅ Phase 1 - Terminée
- Espace utilisateur complet
- Espace admin professionnel
- Analytics avancées
- Support multicanal
- Facturation française

### 🔄 Phase 2 - En cours
- Chat admin WebSocket temps réel
- Notifications push navigateur
- Celery pour tâches asynchrones

### 🔮 Phase 3 - Futur
- Application mobile (React Native)
- IA pour prédictions trading
- Marketplace stratégies
- API publique développeurs

---

## 🤝 Contribution

Ce projet est **propriétaire**. Contributions internes uniquement.

---

## 📞 Support

- **Email** : support@calmnesstrading.com
- **Telegram** : @calmnesstrading
- **Discord** : [Communauté Calmness](https://discord.gg/calmnesstrading)
- **WhatsApp** : +33 1 23 45 67 89

---

## 📜 License

**Proprietary** - © 2024 Calmness Trading. Tous droits réservés.

---

## 👥 Équipe

Développé avec ❤️ par l'équipe technique Calmness Trading

---

## 🌟 Screenshots

### Dashboard Utilisateur
![User Dashboard](https://via.placeholder.com/800x400/D4AF37/000000?text=User+Dashboard)

### Analytics Admin
![Admin Analytics](https://via.placeholder.com/800x400/D4AF37/000000?text=Admin+Analytics)

### Support Widget
![Support Widget](https://via.placeholder.com/400x600/D4AF37/000000?text=Support+Widget)

---

<div align="center">

**🎉 Calmness Trading - Votre Partenaire Trading de Confiance 🎉**

[![Website](https://img.shields.io/badge/Website-calmnesstrading.com-gold)](https://calmnesstrading.com)
[![Status](https://img.shields.io/badge/Status-Production-success)](https://calmnesstrading.com)

</div>
