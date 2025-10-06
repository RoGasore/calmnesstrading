# Configuration Email pour Render

## Variables d'environnement à ajouter sur Render :

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

## Configuration Gmail (recommandée) :

1. **Activer l'authentification à 2 facteurs** sur votre compte Gmail
2. **Générer un mot de passe d'application** :
   - Aller dans Paramètres Google > Sécurité
   - Authentification à 2 facteurs > Mots de passe d'application
   - Générer un mot de passe pour "Mail"
3. **Utiliser ce mot de passe** dans `EMAIL_HOST_PASSWORD`

## Alternative : Service email dédié

### SendGrid (gratuit jusqu'à 100 emails/jour) :
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=votre-api-key-sendgrid
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@calmnesstrading.com
```

### Mailgun (gratuit jusqu'à 5000 emails/mois) :
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_HOST_USER=postmaster@mg.votre-domaine.com
EMAIL_HOST_PASSWORD=votre-password-mailgun
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@votre-domaine.com
```

## Test de la configuration :

Une fois configuré, l'inscription enverra automatiquement un email d'activation.
