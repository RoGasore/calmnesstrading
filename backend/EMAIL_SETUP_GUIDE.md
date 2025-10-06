# Guide de Configuration Email pour l'Activation Automatique

## 🎯 Objectif
Configurer l'envoi automatique d'emails d'activation lors de l'inscription.

## 📋 Processus Actuel (Fonctionnel)
1. ✅ **Inscription** : L'utilisateur saisit ses identifiants
2. ✅ **Validation** : Vérification des données (email unique, etc.)
3. ✅ **Création** : Utilisateur créé mais inactif (`is_active=False`, `is_verified=False`)
4. ✅ **Token** : Token d'activation généré automatiquement
5. ❌ **Email** : L'email d'activation n'est PAS envoyé (problème de configuration)
6. ✅ **Activation** : L'endpoint d'activation existe (`/api/auth/activate/`)
7. ✅ **Page Frontend** : Page `/verify-email` pour l'activation

## 🔧 Configuration sur Render

### Option 1 : Gmail (Recommandée pour commencer)

1. **Aller sur Render Dashboard** > Votre service > Environment
2. **Ajouter ces variables** :
   ```
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=votre-email@gmail.com
   EMAIL_HOST_PASSWORD=votre-mot-de-passe-app
   EMAIL_USE_TLS=True
   EMAIL_USE_SSL=False
   DEFAULT_FROM_EMAIL=votre-email@gmail.com
   ```

3. **Configurer Gmail** :
   - Activer l'authentification à 2 facteurs
   - Générer un mot de passe d'application
   - Utiliser ce mot de passe dans `EMAIL_HOST_PASSWORD`

### Option 2 : SendGrid (Gratuit, 100 emails/jour)

1. **Créer un compte SendGrid**
2. **Générer une API Key**
3. **Ajouter sur Render** :
   ```
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_HOST_USER=apikey
   EMAIL_HOST_PASSWORD=votre-api-key-sendgrid
   EMAIL_USE_TLS=True
   DEFAULT_FROM_EMAIL=noreply@calmnesstrading.com
   ```

### Option 3 : Mailgun (Gratuit, 5000 emails/mois)

1. **Créer un compte Mailgun**
2. **Configurer un domaine**
3. **Ajouter sur Render** :
   ```
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_HOST_USER=postmaster@mg.votre-domaine.com
   EMAIL_HOST_PASSWORD=votre-password-mailgun
   EMAIL_USE_TLS=True
   DEFAULT_FROM_EMAIL=noreply@votre-domaine.com
   ```

## 🧪 Test de la Configuration

### 1. Test d'inscription
```bash
# Tester l'inscription
curl -X POST https://calmnesstrading.onrender.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user_123",
    "email": "test@example.com",
    "password": "testpassword123",
    "first_name": "Test",
    "last_name": "User",
    "confirm_url": "https://calmnesstrading.vercel.app/verify-email"
  }'
```

### 2. Vérifier les logs Render
- Aller dans Render Dashboard > Votre service > Logs
- Chercher les messages d'envoi d'email

### 3. Test d'activation
- Récupérer le token depuis l'email reçu
- Aller sur : `https://calmnesstrading.vercel.app/verify-email?token=VOTRE_TOKEN`

## 📧 Template Email Actuel

L'email d'activation contient :
- **Sujet** : "CALMNESS TRADING • Confirmez votre e-mail"
- **Contenu** : Message de bienvenue + bouton d'activation
- **Lien** : `https://calmnesstrading.vercel.app/verify-email?token=TOKEN`

## 🔄 Processus Complet

1. **Utilisateur s'inscrit** → Formulaire d'inscription
2. **Validation** → Vérification des données
3. **Création compte** → Utilisateur inactif créé
4. **Génération token** → Token d'activation unique
5. **Envoi email** → Email avec lien d'activation
6. **Clic sur lien** → Redirection vers `/verify-email?token=XXX`
7. **Activation** → Appel API `/api/auth/activate/?token=XXX`
8. **Compte activé** → `is_active=True`, `is_verified=True`
9. **Connexion possible** → L'utilisateur peut se connecter

## 🚨 Dépannage

### Email non reçu
- Vérifier les logs Render
- Vérifier le dossier spam
- Tester avec un autre email

### Erreur d'envoi
- Vérifier les variables d'environnement
- Tester la configuration SMTP
- Vérifier les quotas du service email

### Token invalide
- Vérifier l'URL d'activation
- Vérifier l'expiration du token (24h)
- Vérifier que le token n'est pas déjà utilisé

## ✅ Validation

Une fois configuré, le processus doit fonctionner ainsi :
1. Inscription → Email reçu
2. Clic sur lien → Compte activé
3. Connexion → Succès

Le système est déjà entièrement implémenté, il ne manque que la configuration email sur Render !
