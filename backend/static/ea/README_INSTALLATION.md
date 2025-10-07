# 📊 Guide d'Installation - Calmness Fi Trading EA

## 🎯 Introduction

Bienvenue ! Ce script Expert Advisor (EA) vous permet de synchroniser automatiquement tous vos trades MetaTrader avec votre dashboard Calmness Fi.

### ✅ Avantages
- 📈 Suivi en temps réel de vos trades
- 📊 Statistiques détaillées automatiques
- 💰 Calcul automatique du profit/perte
- 📱 Accès depuis n'importe quel appareil
- 🔄 Synchronisation automatique

---

## 📋 Prérequis

- MetaTrader 4 (MT4) installé
- Un compte de trading configuré (démo ou réel)
- Connexion Internet active
- Votre clé API (fournie dans votre dashboard)

---

## 🚀 Installation en 5 étapes

### Étape 1 : Autoriser les URLs

1. Ouvrez MetaTrader 4
2. Allez dans **Outils** → **Options**
3. Cliquez sur l'onglet **Expert Advisors**
4. Cochez ☑ **Autoriser WebRequest pour les URLs suivantes**
5. Ajoutez cette URL :
   ```
   https://calmnesstrading.onrender.com
   ```
6. Cliquez sur **OK**

> ⚠️ IMPORTANT : Sans cette étape, l'EA ne pourra PAS envoyer vos trades !

### Étape 2 : Copier le fichier EA

1. Localisez le fichier **`CalmnessFi_EA.mq4`** (dans ce ZIP)
2. Ouvrez MetaTrader 4
3. Allez dans **Fichier** → **Ouvrir le dossier de données**
4. Naviguez vers le dossier **`MQL4\Experts\`**
5. Copiez **`CalmnessFi_EA.mq4`** dans ce dossier

### Étape 3 : Compiler le script

1. Dans MetaTrader, ouvrez **MetaEditor** (icône avec un livre)
2. Dans le Navigateur (à gauche), développez **Experts**
3. Double-cliquez sur **CalmnessFi_EA**
4. Cliquez sur **Compiler** (icône avec un marteau) ou appuyez sur **F7**
5. Vérifiez qu'il n'y a pas d'erreurs dans l'onglet **Erreurs** en bas
6. Vous devriez voir le message : **"0 erreur(s), 0 avertissement(s)"**
7. Fermez MetaEditor

### Étape 4 : Récupérer votre clé API

1. Connectez-vous à votre compte sur https://calmnesstrading.vercel.app
2. Allez dans **Mon Espace** → **Historique de Trading**
3. Cliquez sur **"Créer un compte MetaTrader"**
4. Remplissez les informations :
   - Numéro de compte MT4
   - Nom du broker
   - Type de compte (Démo ou Réel)
5. **Copiez votre clé API** (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
6. **NE PARTAGEZ JAMAIS** cette clé avec personne !

### Étape 5 : Configurer et activer l'EA

1. Dans MetaTrader, dans le **Navigateur** (à gauche)
2. Développez **Expert Advisors**
3. **Glissez-déposez** `CalmnessFi_EA` sur un graphique (n'importe quelle paire)
4. Une fenêtre s'ouvre avec les paramètres :
   
   **Onglet "Paramètres d'entrée"** :
   - **API_URL** : `https://calmnesstrading.onrender.com/api/auth/user/trading/ea/sync/`
   - **API_KEY** : Collez votre clé API ici
   - **SyncInterval** : 60 (secondes entre chaque synchronisation)
   
   **Onglet "Commun"** :
   - ☑ Autoriser le trading en direct
   - ☑ Autoriser l'import de DLL
   - ☑ Autoriser WebRequest
   
5. Cliquez sur **OK**

6. Vous devriez voir une **icône souriante** 😊 en haut à droite du graphique
   - 😊 = EA actif et fonctionne
   - 😐 = EA inactif
   - ❌ = Erreur

---

## ✅ Vérification

### Dans MetaTrader

1. Allez dans **Outils** → **Options** → **Expert Advisors**
2. Vérifiez que l'onglet **Journal** affiche :
   ```
   ===================================================
   Calmness Fi Trading EA - Version 1.00
   ===================================================
   API URL: https://calmnesstrading.onrender.com/...
   API Key configurée: xxxxxxxx...
   ===================================================
   EA initialisé avec succès!
   Synchronisation automatique des trades activée.
   ===================================================
   ```

### Sur le Dashboard

1. Retournez sur https://calmnesstrading.vercel.app
2. Allez dans **Mon Espace** → **Historique de Trading**
3. Attendez 1-2 minutes
4. Vos trades devraient apparaître automatiquement !

---

## 🔧 Dépannage

### Problème : Aucun trade n'apparaît

**Solution 1** : Vérifier l'API Key
- Assurez-vous d'avoir copié la clé complète
- Vérifiez qu'il n'y a pas d'espaces avant/après
- La clé doit ressembler à : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**Solution 2** : Vérifier l'autorisation WebRequest
- Outils → Options → Expert Advisors
- Vérifiez que l'URL est bien autorisée
- **Redémarrez MetaTrader** après modification

**Solution 3** : Vérifier le Journal
- Outils → Options → Journal (ou Ctrl+T)
- Cherchez des messages d'erreur
- Codes d'erreur courants :
  - `4014` = WebRequest non autorisé
  - `401` = API Key invalide
  - `500` = Erreur serveur

### Problème : EA ne démarre pas

**Solution** :
1. Vérifiez que l'icône Auto Trading est activée (bouton en haut)
2. Clic droit sur le graphique → Expert Advisors → Propriétés
3. Vérifiez que toutes les autorisations sont cochées
4. Supprimez l'EA du graphique et réessayez

### Problème : Erreur de compilation

**Solution** :
1. Assurez-vous d'utiliser MetaTrader 4 (pas MT5)
2. Vérifiez qu'il n'y a pas de caractères spéciaux dans le nom du fichier
3. Téléchargez à nouveau le fichier .mq4

---

## 🔐 Sécurité

### ✅ Bonnes pratiques

1. **NE PARTAGEZ JAMAIS** votre API Key
2. **Régénérez** votre clé si vous pensez qu'elle a été compromise
3. **Utilisez** un compte démo pour tester d'abord
4. **Vérifiez** que l'URL de l'API est correcte

### 🔄 Régénérer votre API Key

Si votre clé a été compromise :
1. Allez sur votre dashboard
2. Mon Espace → Historique de Trading
3. Cliquez sur **"Régénérer la clé API"**
4. **Mettez à jour** la nouvelle clé dans l'EA

---

## 📊 Que fait cet EA ?

### Fonctionnement

1. **Lit** tous vos trades ouverts et historiques
2. **Envoie** les informations à votre dashboard
3. **Synchronise** toutes les 60 secondes (configurable)
4. **Met à jour** le solde, équité, marge du compte
5. **N'interfère PAS** avec votre trading

### Données envoyées

Pour chaque trade :
- Ticket, Symbole, Type (BUY/SELL)
- Volume, Prix d'ouverture/clôture
- Stop Loss, Take Profit
- Profit, Swap, Commission
- Dates d'ouverture/clôture
- Commentaire

Pour le compte :
- Solde, Équité
- Marge, Marge libre

### ⚠️ CE QUE L'EA NE FAIT PAS

- ❌ Ne prend PAS de trades automatiquement
- ❌ Ne modifie PAS vos trades existants
- ❌ Ne gère PAS votre compte
- ❌ Ne prend PAS de décisions de trading

**Cet EA est UNIQUEMENT pour la synchronisation des données !**

---

## 🆘 Support

### Besoin d'aide ?

Contactez notre support :
- 💬 Telegram : [Votre canal Telegram]
- 🎮 Discord : [Votre serveur Discord]
- 📧 Email : support@calmnesstrading.com

### Logs pour le support

Si vous contactez le support, envoyez :
1. Capture d'écran du Journal (onglet Journal dans MT4)
2. Capture d'écran de vos paramètres EA
3. Description du problème

---

## 📝 Notes

- Version de l'EA : **1.00**
- Compatible : **MetaTrader 4**
- Date de dernière mise à jour : Janvier 2024

---

## 🎉 Félicitations !

Une fois installé correctement, vos trades apparaîtront automatiquement sur votre dashboard !

Vous pourrez :
- ✅ Voir tous vos trades en temps réel
- ✅ Filtrer par période, statut, résultat
- ✅ Analyser vos performances
- ✅ Télécharger des rapports Excel
- ✅ Suivre votre évolution

**Bon trading ! 📈**

---

*Copyright © 2024 Calmness Fi Trading. Tous droits réservés.*

