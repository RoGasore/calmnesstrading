# 🔐 IDENTIFIANTS DU SYSTÈME CALMNESS TRADING

## 📋 Vue d'ensemble

Ce document contient tous les identifiants d'accès pour les différents rôles du système.

---

## 👑 ADMINISTRATEUR

### Accès
- **URL** : https://calmnesstrading.vercel.app/admin
- **Email** : admin@calmnessfi.com
- **Mot de passe** : Admin2024Secure!

### Permissions
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Gestion des utilisateurs et rôles
- ✅ Configuration du système
- ✅ Consultation (lecture seule) des paiements
- ✅ Visualisation de l'historique complet
- ✅ Gestion des formations et sessions
- ✅ Analytics et statistiques avancées
- ❌ **Validation des paiements** (géré par le service client)
- ❌ **Gestion des revenus** (géré par le service client)

---

## 👥 SERVICE CLIENT

### Accès
- **URL** : https://calmnesstrading.vercel.app/service
- **Email** : service@calmnessfi.com
- **Mot de passe** : ServiceClient2024!

### Permissions
- ✅ **Validation et gestion des paiements**
- ✅ **Gestion des revenus**
- ✅ **Validation des commandes**
- ✅ Messagerie intégrée avec clients
- ✅ Gestion de la communication (Email, Telegram, Discord, WhatsApp)
- ✅ Génération et envoi de factures
- ✅ Gestion des clients
- ✅ Support client via widget
- ❌ Configuration système (réservé à l'admin)
- ❌ Gestion des formations (réservé à l'admin)

### Fonctionnalités Principales
1. **Dashboard Service Client** (`/service`)
   - Statistiques en temps réel
   - Paiements en attente
   - Messages non lus
   - Actions rapides

2. **Gestion des Paiements** (`/service/payments`)
   - Validation des paiements en attente
   - Vérification des transactions
   - Génération automatique de factures
   - Envoi email/Telegram

3. **Messagerie** (`/service/messages`)
   - Communication directe avec clients
   - Support multi-canal
   - Historique des conversations

4. **Gestion Clients** (`/service/clients`)
   - Liste des clients
   - Profils détaillés
   - Historique d'achat

5. **Revenus** (`/service/revenues`)
   - Suivi des revenus
   - Statistiques financières
   - Rapports mensuels

6. **Commandes** (`/service/orders`)
   - Validation des commandes
   - Suivi des livraisons
   - Gestion des retours

7. **Factures** (`/service/invoices`)
   - Génération de factures PDF
   - Envoi automatique
   - Numérotation CT-XXXXX

---

## 👤 UTILISATEUR TEST

### Accès
- **URL** : https://calmnesstrading.vercel.app/user
- **Email** : test@calmnessfi.com
- **Mot de passe** : Test1234!

### Permissions
- ✅ Accès à son espace utilisateur
- ✅ Gestion de profil
- ✅ Inscriptions aux formations
- ✅ Abonnements aux signaux
- ✅ Historique de trading (avec EA installé)
- ✅ Notifications
- ✅ Paiements et factures
- ❌ Accès aux espaces admin/service

---

## 🔄 WORKFLOW PAIEMENTS

### Processus Complet

1. **Utilisateur** crée une commande
   - Remplit ses informations de contact
   - Sélectionne une offre (Formation, Signal, Gestion)
   - Effectue le paiement
   - Soumet l'ID de transaction

2. **Service Client** reçoit la notification
   - Vérifie l'ID de transaction dans le système bancaire
   - Consulte les informations client
   - Valide ou refuse le paiement

3. **Actions Automatiques** (après validation)
   - Génération facture PDF (CT-YYYYMMDD-XXXX)
   - Envoi email avec facture
   - Notification Telegram (si configuré)
   - Activation de l'abonnement
   - Ajout au canal Telegram (pour signaux)

4. **Admin** voit l'historique
   - Consultation en lecture seule
   - Analytics et statistiques
   - Audit complet

---

## 🛡️ SÉCURITÉ

### Recommandations
- ⚠️ **Changez tous les mots de passe par défaut après la première connexion**
- ⚠️ Utilisez des mots de passe forts (min. 12 caractères, majuscules, minuscules, chiffres, symboles)
- ⚠️ Activez l'authentification à 2 facteurs (à implémenter)
- ⚠️ Ne partagez jamais ces identifiants
- ⚠️ Créez des comptes nominatifs pour chaque membre de l'équipe

### Rotation des Mots de Passe
- 🔄 Service Client : tous les 3 mois
- 🔄 Admin : tous les 3 mois
- 🔄 Test : à la demande

---

## 📊 HIÉRARCHIE DES RÔLES

```
┌─────────────────────────┐
│   ADMINISTRATEUR        │  ← Configuration + Analytics
│   (Lecture seule $)     │
└───────────┬─────────────┘
            │
            ├─── Peut tout voir
            │
┌───────────▼─────────────┐
│   SERVICE CLIENT        │  ← Gestion Paiements + Communication
│   (Validation $$$)      │
└───────────┬─────────────┘
            │
            ├─── Gère les clients
            │
┌───────────▼─────────────┐
│   UTILISATEUR           │  ← Formation + Trading + Paiements
│   (Client final)        │
└─────────────────────────┘
```

---

## 🔧 GESTION DES COMPTES

### Créer un nouveau Service Client
```bash
cd backend
python manage.py create_customer_service
```

### Créer un nouveau Admin
```bash
cd backend
python manage.py createsuperuser
# Puis mettre à jour le rôle en 'admin' dans la base de données
```

### Créer un utilisateur test
```bash
cd backend
python manage.py create_test_user
```

---

## 📞 SUPPORT

En cas de problème d'accès :
1. Vérifiez que vous utilisez la bonne URL
2. Vérifiez l'email et le mot de passe
3. Effacez le cache du navigateur
4. Essayez en navigation privée
5. Contactez l'administrateur système

---

## 📝 NOTES IMPORTANTES

### Pour le Service Client
- Vous êtes responsable de TOUTES les validations de paiements
- Vérifiez toujours l'ID de transaction avant de valider
- Les factures sont générées automatiquement lors de la validation
- L'admin peut voir mais ne peut PAS modifier vos actions
- Utilisez la messagerie intégrée pour communiquer avec les clients

### Pour l'Admin
- Vous avez un accès en **lecture seule** aux paiements
- Focus sur : analytics, formations, configuration système
- Déléguez toutes les opérations de paiement au service client
- Consultez l'historique complet pour audit

### Pour les Utilisateurs
- Complétez votre profil avant tout paiement
- Gardez vos informations de contact à jour (Telegram/Discord)
- Installez l'EA MetaTrader pour l'historique de trading
- Contactez le service client via le widget pour toute question

---

**Date de création** : 9 janvier 2025  
**Dernière mise à jour** : 9 janvier 2025  
**Version** : 1.0

---

⚠️ **CE DOCUMENT EST CONFIDENTIEL - NE PAS PARTAGER PUBLIQUEMENT**

