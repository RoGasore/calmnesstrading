# 🚀 Documentation Backend - Espace Utilisateur

## 📋 Vue d'ensemble

Ce backend fournit une API complète pour gérer l'espace utilisateur avec des fonctionnalités avancées :
- ✅ Profil utilisateur complet avec champs obligatoires
- ✅ Système de notifications automatiques
- ✅ Gestion automatique des abonnements
- ✅ Ajout/retrait automatique des canaux Telegram/Discord
- ✅ Vérification d'éligibilité au paiement
- ✅ Dashboard utilisateur complet

## 🗄️ Modèles de Base de Données

### 1. User (Étendu)
**Fichier**: `accounts/models.py`

```python
class User(AbstractUser):
    # Identification
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    
    # Comptes de contact (OBLIGATOIRES pour paiements)
    telegram_username = models.CharField(max_length=100)
    discord_username = models.CharField(max_length=100)
    whatsapp_number = models.CharField(max_length=20)  # Facultatif
    
    # Permissions
    is_verified = models.BooleanField(default=False)
    can_make_payment = models.BooleanField(default=False)
```

**Méthodes importantes**:
- `has_complete_profile()` - Vérifie si le profil est complet
- `update_payment_permission()` - Met à jour automatiquement la permission de paiement

### 2. UserNotification
**Fichier**: `accounts/models.py`

```python
class UserNotification(models.Model):
    user = ForeignKey(User)
    subscription = ForeignKey(Subscription, null=True)
    notification_type = CharField(choices=NOTIFICATION_TYPE_CHOICES)
    title = CharField(max_length=200)
    message = TextField()
    status = CharField(choices=['pending', 'sent', 'read', 'dismissed'])
    scheduled_for = DateTimeField(null=True)
```

**Types de notifications**:
- `subscription_expiring` - Abonnement expire bientôt
- `subscription_expired` - Abonnement expiré
- `payment_received` - Paiement reçu
- `payment_pending` - Paiement en attente
- `profile_incomplete` - Profil incomplet
- `welcome` - Bienvenue
- `general` - Général

## 🔌 API Endpoints

### Dashboard Utilisateur
```
GET /api/auth/user/dashboard/
```

**Réponse**:
```json
{
  "user": {
    "id": 1,
    "email": "test@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "telegram_username": "@jeandupont",
    "discord_username": "jeandupont#1234",
    "is_verified": true,
    "can_make_payment": true,
    "profile_complete": true
  },
  "stats": {
    "active_subscriptions": 2,
    "total_spent": 548.00,
    "total_payments": 5,
    "unread_notifications": 3
  },
  "active_subscriptions": [
    {
      "id": 1,
      "service_name": "Signaux Mensuels",
      "days_remaining": 15,
      "hours_remaining": 360,
      "minutes_remaining": 21600,
      "total_seconds_remaining": 1296000
    }
  ]
}
```

### Notifications
```
GET /api/auth/user/notifications/
POST /api/auth/user/notifications/<id>/read/
POST /api/auth/user/notifications/read-all/
```

### Abonnements
```
GET /api/auth/user/subscriptions/
```

**Réponse**:
```json
{
  "subscriptions": [
    {
      "id": 1,
      "service_name": "Signaux Mensuels",
      "status": "active",
      "is_active": true,
      "time_remaining": {
        "days": 15,
        "hours": 360,
        "minutes": 21600,
        "total_seconds": 1296000
      },
      "telegram_added": true,
      "discord_added": false
    }
  ]
}
```

### Paiements
```
GET /api/auth/user/payments/
```

### Profil
```
PATCH /api/auth/user/profile/
```

**Body**:
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "telegram_username": "@jeandupont",
  "discord_username": "jeandupont#1234",
  "whatsapp_number": "+33612345678",
  "bio": "Trader passionné",
  "trading_experience": "intermediate"
}
```

### Vérification d'éligibilité
```
GET /api/auth/user/payment-eligibility/
```

**Réponse**:
```json
{
  "can_make_payment": false,
  "missing_fields": [
    {
      "field": "telegram_username",
      "label": "Telegram",
      "message": "Vous devez fournir un identifiant Telegram"
    }
  ],
  "profile_completion": {
    "has_full_name": true,
    "email_verified": true,
    "has_contact_method": false,
    "has_telegram": false,
    "has_discord": false
  }
}
```

## 🤖 Commandes de Gestion

### 1. Créer un utilisateur de test
```bash
python manage.py create_test_user
```

**Informations créées**:
- Email: test@calmnessfi.com
- Mot de passe: Test123!
- Profil complet avec Telegram et Discord

### 2. Traiter les notifications d'abonnement
```bash
python manage.py process_subscription_notifications
```

**Fonctionnement**:
- Crée automatiquement les notifications selon le calendrier:
  - 7 jours avant expiration
  - 3 jours avant
  - 2 jours avant
  - 1 jour avant
  - 1 jour après expiration
  - 2 jours après
  - 3 jours après

**Chaque notification a un message unique et personnalisé**

### 3. Gérer les membres des canaux
```bash
python manage.py manage_channel_members
python manage.py manage_channel_members --dry-run  # Mode simulation
```

**Fonctionnement**:
- ✅ Ajoute automatiquement les utilisateurs aux canaux Telegram/Discord quand l'abonnement est activé
- ✅ Retire automatiquement les utilisateurs quand l'abonnement expire
- ⚙️ Prêt pour l'intégration avec les APIs Telegram et Discord

## 🔄 Workflow Complet

### 1. Inscription
```
Utilisateur s'inscrit
  ↓
Email de vérification envoyé
  ↓
Utilisateur vérifie son email
  ↓
is_verified = True
```

### 2. Complétion du profil
```
Utilisateur remplit son profil
  ↓
first_name ✅
last_name ✅
telegram_username OU discord_username ✅
  ↓
has_complete_profile() = True
  ↓
can_make_payment = True
```

### 3. Paiement et Abonnement
```
Utilisateur effectue un paiement
  ↓
Admin confirme le paiement
  ↓
Subscription créé
  ↓
Commande: manage_channel_members
  ↓
Utilisateur ajouté au canal Telegram/Discord
  ↓
telegram_added = True / discord_added = True
```

### 4. Notifications automatiques
```
Commande: process_subscription_notifications (cron job)
  ↓
Vérifie tous les abonnements actifs
  ↓
Crée les notifications selon le calendrier
  ↓
Notifications envoyées à l'utilisateur
```

### 5. Expiration
```
Abonnement expire
  ↓
status = 'expired'
  ↓
Commande: manage_channel_members
  ↓
Utilisateur retiré du canal
  ↓
telegram_added = False / discord_added = False
  ↓
Notification d'expiration envoyée
```

## ⚙️ Configuration Requise

### Variables d'environnement

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:port/database

# Telegram Bot (facultatif - pour auto-ajout)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_ID=your_channel_id

# Discord Bot (facultatif - pour auto-ajout)
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_guild_id
```

### Cron Jobs (Production)

Ajoutez ces tâches à votre cron:

```cron
# Notifications d'abonnement (tous les jours à 9h)
0 9 * * * cd /path/to/project && python manage.py process_subscription_notifications

# Gestion des canaux (toutes les 15 minutes)
*/15 * * * * cd /path/to/project && python manage.py manage_channel_members
```

## 🔐 Sécurité

### Champs obligatoires pour paiement

Avant qu'un utilisateur puisse effectuer un paiement:
1. ✅ `first_name` et `last_name` remplis
2. ✅ Email vérifié (`is_verified = True`)
3. ✅ Au moins un identifiant: `telegram_username` OU `discord_username`

### Validation automatique

```python
# Dans views_user.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment_eligibility(request):
    can_pay = request.user.has_complete_profile()
    # Retourne les champs manquants
```

## 📊 Migrations

### Créer les migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Migrations nécessaires
1. Ajout des champs `discord_username`, `whatsapp_number`, `can_make_payment` au modèle User
2. Création du modèle `UserNotification`
3. Index sur les champs de notification pour optimiser les requêtes

## 🧪 Tests

### Tester le dashboard
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/auth/user/dashboard/
```

### Tester la vérification d'éligibilité
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/auth/user/payment-eligibility/
```

## 📝 Intégration Frontend

### Exemples d'utilisation

```typescript
// Récupérer le dashboard
const response = await fetchWithAuth('/api/auth/user/dashboard/');
const data = await response.json();

// Vérifier l'éligibilité avant le paiement
const eligibility = await fetchWithAuth('/api/auth/user/payment-eligibility/');
if (!eligibility.can_make_payment) {
  // Afficher les champs manquants
  eligibility.missing_fields.forEach(field => {
    console.log(`${field.label}: ${field.message}`);
  });
}

// Mettre à jour le profil
await fetchWithAuth('/api/auth/user/profile/', {
  method: 'PATCH',
  body: JSON.stringify({
    telegram_username: '@newusername',
    discord_username: 'user#1234'
  })
});
```

## 🎯 Prochaines Étapes

### Intégration Telegram (à implémenter)
1. Créer un bot via @BotFather
2. Installer `python-telegram-bot`
3. Décommenter le code dans `manage_channel_members.py`

### Intégration Discord (à implémenter)
1. Créer une application Discord
2. Installer `discord.py`
3. Décommenter le code dans `manage_channel_members.py`

### Notifications par Email
1. Configurer le backend d'email dans `settings.py`
2. Créer des templates email
3. Ajouter l'envoi d'email dans les notifications

## 🆘 Dépannage

### L'utilisateur ne peut pas payer
```python
# Vérifier le profil
user = User.objects.get(email='user@example.com')
print(f"Nom complet: {user.first_name} {user.last_name}")
print(f"Email vérifié: {user.is_verified}")
print(f"Telegram: {user.telegram_username}")
print(f"Discord: {user.discord_username}")
print(f"Peut payer: {user.has_complete_profile()}")
```

### Les notifications ne sont pas créées
```bash
# Exécuter manuellement
python manage.py process_subscription_notifications

# Vérifier les abonnements
python manage.py shell
>>> from payments.models import Subscription
>>> Subscription.objects.filter(status='active').count()
```

### Les utilisateurs ne sont pas ajoutés aux canaux
```bash
# Mode simulation pour debug
python manage.py manage_channel_members --dry-run

# Vérifier les configurations des offres
python manage.py shell
>>> from payments.models import Offer
>>> for offer in Offer.objects.all():
...     print(f"{offer.name}: Telegram={offer.telegram_channel_id}, Discord={offer.discord_channel_id}")
```

---

**Documentation créée le**: 2024
**Version**: 1.0.0

