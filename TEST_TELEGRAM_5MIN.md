# 🧪 Test Complet - Abonnement Telegram 5 Minutes

## 🎯 Objectif

Tester le workflow complet avec un abonnement de **5 minutes** qui se révoque automatiquement.

---

## 📋 Prérequis

- ✅ Bot Telegram créé et configuré
- ✅ Canal Telegram privé créé
- ✅ Bot ajouté comme admin du canal
- ✅ Variables d'environnement configurées
- ✅ Celery Worker et Beat lancés
- ✅ Bot Telegram lancé

---

## 🚀 Étapes du Test

### 1️⃣ Créer l'Offre de Test (1 min)

```bash
cd backend
python manage.py create_test_offer_5min
```

**Résultat attendu :**
```
✅ Offre de test créée !

📋 Détails de l'offre:
   ID              : 1
   Nom             : Test Telegram 5min
   Prix            : 1.0 EUR
   Type            : Signal
   Durée           : 5 minutes
   Statut          : Actif
```

---

### 2️⃣ Créer un Utilisateur de Test (30 sec)

```bash
python manage.py shell
```

```python
from accounts.models import User

# Créer l'utilisateur
user = User.objects.create_user(
    username='testuser_telegram',
    email='test_telegram@example.com',
    password='testpass123',
    first_name='Test',
    last_name='Telegram',
    telegram_username='@votreusername'  # ← VOTRE USERNAME TELEGRAM
)

print(f"✅ Utilisateur créé: {user.email}")
print(f"🔑 Connexion: test_telegram@example.com / testpass123")
exit()
```

---

### 3️⃣ Créer un Paiement en Attente (1 min)

**Option A : Via le Site** (Recommandé)
```
1. Aller sur https://calmnesstrading.vercel.app
2. Se connecter avec test_telegram@example.com / testpass123
3. Aller dans Services → Signaux
4. Sélectionner "Test Telegram 5min" (1€)
5. Remplir le formulaire avec votre @username Telegram
6. Soumettre un ID de transaction (ex: TEST-001)
```

**Option B : Via Django Shell**
```python
from accounts.models import User
from payments.models import Offer, PendingPayment

user = User.objects.get(email='test_telegram@example.com')
offer = Offer.objects.get(name='Test Telegram 5min')

pending = PendingPayment.objects.create(
    user=user,
    offer=offer,
    amount=offer.price,
    currency=offer.currency,
    status='transaction_submitted',
    transaction_id='TEST-001',
    user_info={
        'full_name': 'Test Telegram',
        'email': user.email,
        'telegram_username': '@votreusername'  # ← IMPORTANT
    }
)

print(f"✅ Paiement en attente créé: ID {pending.id}")
```

---

### 4️⃣ Valider le Paiement (Service Client) (1 min)

```
1. Se connecter en tant que Service Client
   Email: serviceclient@calmnesstrading.com
   Password: ServiceClient2024!

2. Aller dans /support/payments

3. Cliquer sur "Vérifier & Valider" pour le paiement

4. Confirmer la validation
```

**Résultat attendu :**
- ✅ Paiement validé
- ✅ Token Telegram généré automatiquement
- ✅ Notification créée avec lien bot

---

### 5️⃣ Vérifier la Notification (30 sec)

**Via API :**
```bash
# Récupérer le JWT token de l'utilisateur test d'abord
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test_telegram@example.com", "password": "testpass123"}'

# Puis récupérer les notifications
curl http://localhost:8000/api/telegram/notifications/ \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

**Résultat attendu :**
```json
[
  {
    "id": 1,
    "type": "payment_verified",
    "title": "🎉 Paiement validé !",
    "message": "Votre paiement a été validé...",
    "action_url": "https://t.me/VotreBotUsername?start=ABC123...",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### 6️⃣ Cliquer sur le Lien Bot (2 min)

```
1. Copier le action_url (https://t.me/VotreBotUsername?start=...)
2. L'ouvrir dans Telegram
3. Cliquer sur "START"
```

**Messages attendus du bot :**
```
✅ Bienvenue Test!

Votre paiement a été vérifié avec succès.

🎉 Génération de votre lien d'accès privé au canal...

---

🎯 Votre lien d'accès privé est prêt!

🔒 Ce lien est unique et expire dans 5 minutes.
⚠️ Il ne peut être utilisé qu'une seule fois.

👇 Cliquez sur le bouton ci-dessous pour rejoindre le canal:
[🔗 Rejoindre le Canal]
```

---

### 7️⃣ Rejoindre le Canal (30 sec)

```
1. Cliquer sur "Rejoindre le Canal"
2. Telegram ouvre le canal
3. Accepter l'invitation
```

**Résultat attendu :**
- ✅ Vous êtes maintenant membre du canal privé
- ✅ Vous voyez les messages du canal
- ✅ Membership créé dans la BDD

**Vérifier dans la BDD :**
```python
from accounts.models_telegram import TelegramChannelMember

member = TelegramChannelMember.objects.latest('id')
print(f"User: {member.user.username}")
print(f"Channel: {member.channel_name}")
print(f"Type: {member.subscription_type}")
print(f"Rejoint: {member.joined_at}")
print(f"Expire: {member.subscription_end_date}")
print(f"Temps restant: {member.subscription_end_date - timezone.now()}")
```

---

### 8️⃣ Attendre l'Expiration (5 min) ⏰

**Pendant l'attente**, vérifier :

```python
# Django shell - Vérifier le statut en temps réel
from accounts.models_telegram import TelegramChannelMember
from django.utils import timezone

member = TelegramChannelMember.objects.latest('id')
remaining = member.subscription_end_date - timezone.now()

print(f"⏳ Temps restant: {remaining}")
print(f"📊 Status: {member.status}")
print(f"✅ Actif: {member.is_active()}")
```

**Logs Celery à surveiller :**
```
[2024-01-15 10:05:00] Task check_expired_subscriptions started
[2024-01-15 10:05:00] ✅ 0 abonnements révoqués

[2024-01-15 10:06:00] Task check_expired_subscriptions started
[2024-01-15 10:06:00] ✅ 1 abonnements révoqués
[2024-01-15 10:06:00] ✅ testuser_telegram banni du canal Calmness Trading Signals
```

---

### 9️⃣ Vérifier la Révocation (30 sec)

**Après 5 minutes**, vérifier :

**1. Dans Telegram :**
- ❌ Vous n'êtes plus membre du canal
- ❌ Le canal n'apparaît plus dans votre liste
- ❌ Si vous tentez d'y accéder → "Vous n'êtes pas membre"

**2. Dans la BDD :**
```python
from accounts.models_telegram import TelegramChannelMember

member = TelegramChannelMember.objects.latest('id')
print(f"Status: {member.status}")  # Devrait être 'expired'
print(f"Actif: {member.is_active()}")  # Devrait être False
print(f"Banni le: {member.banned_at}")  # Devrait avoir une date
```

**3. Notification reçue :**
```bash
curl http://localhost:8000/api/telegram/notifications/ \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

Devrait inclure :
```json
{
  "type": "access_expired",
  "title": "Abonnement expiré",
  "message": "Votre abonnement au canal ... a expiré..."
}
```

---

## ✅ Checklist du Test

- [ ] Offre de test créée (duration_minutes=5)
- [ ] Utilisateur de test créé avec telegram_username
- [ ] Paiement en attente créé
- [ ] Paiement validé par service client
- [ ] Token généré automatiquement
- [ ] Notification reçue avec lien bot
- [ ] Lien bot cliqué → Bot répond
- [ ] Lien invitation reçu (expire 5min)
- [ ] Canal rejoint avec succès
- [ ] Membership créé (expires_at = now + 5min)
- [ ] Attente 5 minutes
- [ ] Celery détecte expiration
- [ ] User banni du canal automatiquement
- [ ] Membership status = 'expired'
- [ ] Notification expiration reçue

---

## 🐛 Résolution de Problèmes

### Le bot ne génère pas de lien d'invitation

**Cause** : Le bot n'a pas les bonnes permissions

**Solution** :
1. Aller dans le canal Telegram
2. Paramètres → Administrateurs
3. Vérifier que le bot a :
   - ✅ Inviter des utilisateurs
   - ✅ Bannir des utilisateurs
   - ✅ Gérer les liens d'invitation

### L'utilisateur n'est pas révoqué après 5 minutes

**Cause** : Celery Beat n'est pas lancé

**Solution** :
```bash
# Vérifier que Celery Beat tourne
celery -A backend inspect scheduled

# Si vide, relancer
celery -A backend beat -l info
```

### Le membership a une mauvaise durée

**Cause** : L'offre n'a pas duration_minutes défini

**Solution** :
```python
from payments.models import Offer

offer = Offer.objects.get(name='Test Telegram 5min')
print(f"Duration minutes: {offer.duration_minutes}")  # Doit être 5

# Si None, mettre à jour
offer.duration_minutes = 5
offer.save()
```

---

## 📊 Timeline Détaillée

```
00:00 → Paiement validé
00:00 → Token généré (expire dans 24h)
00:00 → Notification créée
00:01 → User clique sur bot
00:01 → Bot vérifie token ✅
00:01 → Bot crée invite (expire dans 5min)
00:01 → User clique "Rejoindre"
00:02 → User membre du canal ✅
00:02 → Membership créé (expire 00:07)
00:03 → User voit les signaux ✅
00:04 → User voit les signaux ✅
00:05 → User voit les signaux ✅
00:06 → User voit les signaux ✅
00:07 → Celery détecte expiration ⏰
00:07 → User banni du canal ❌
00:07 → Status → 'expired'
00:07 → Notification envoyée
00:08 → User ne voit plus le canal ❌
```

---

## 🎓 Cas d'Usage Réels

### Test Gratuit 5 Minutes

```python
Offer.objects.create(
    name="Découverte Gratuite",
    price=0.00,
    duration_minutes=5
)
```
**Usage** : Permettre aux prospects de tester les signaux

### Abonnement Journalier

```python
Offer.objects.create(
    name="Signaux 24h",
    price=9.90,
    duration_hours=24
)
```
**Usage** : Abonnement court terme

### Abonnement Hebdomadaire

```python
Offer.objects.create(
    name="Signaux Semaine",
    price=49.00,
    duration_days=7
)
```
**Usage** : Essai avant engagement mensuel

### Abonnement Mensuel

```python
Offer.objects.create(
    name="Premium",
    price=297.00,
    duration_days=30
)
```
**Usage** : Abonnement standard

### Abonnement Annuel

```python
Offer.objects.create(
    name="VIP Annuel",
    price=2500.00,
    duration_days=365
)
```
**Usage** : Meilleur tarif

---

## 📈 Monitoring du Test

### Logs à Surveiller

**Terminal 1 - Celery Worker :**
```
[2024-01-15 10:07:00: INFO] Task check_expired_subscriptions started
[2024-01-15 10:07:00: INFO] ✅ 1 abonnements révoqués
```

**Terminal 2 - Celery Beat :**
```
[2024-01-15 10:07:00: INFO] Scheduler: Sending task check-expired-subscriptions-every-minute
```

**Terminal 3 - Bot Telegram :**
```
[2024-01-15 10:01:00: INFO] 🚀 /start reçu de votreusername
[2024-01-15 10:01:01: INFO] ✅ Token vérifié pour votreusername
[2024-01-15 10:01:02: INFO] ✅ Lien d'invitation envoyé
[2024-01-15 10:02:00: INFO] ✅ votreusername a rejoint le canal
[2024-01-15 10:02:01: INFO] ✅ Membership créé
```

### Vérifier la BDD en Temps Réel

```python
# Pendant le test
from accounts.models_telegram import *
from django.utils import timezone

# Tokens
tokens = TelegramBotToken.objects.all()
for t in tokens:
    print(f"Token: {t.token[:8]}... - Status: {t.status} - Valid: {t.is_valid()}")

# Invitations
invites = TelegramChannelInvite.objects.all()
for i in invites:
    print(f"Invite: {i.user.username} - Status: {i.status} - Expires: {i.expires_at}")

# Memberships
members = TelegramChannelMember.objects.all()
for m in members:
    remaining = m.subscription_end_date - timezone.now()
    print(f"Member: {m.user.username} - Status: {m.status} - Remaining: {remaining}")

# Notifications
notifications = TelegramNotification.objects.all().order_by('-created_at')
for n in notifications[:5]:
    print(f"Notif: {n.notification_type} - {n.title} - Status: {n.status}")
```

---

## 🎯 Résultats Attendus

### ✅ Succès du Test

Tous ces points doivent être validés :

1. **Token généré** avec statut 'pending'
2. **Notification créée** avec lien bot
3. **User clique** sur lien → Bot répond
4. **Token utilisé** (status='used')
5. **Invitation créée** avec expire_at dans 5min
6. **User rejoint** le canal
7. **Membership créé** avec subscription_end_date dans 5min
8. **Accès fonctionnel** pendant 5 minutes
9. **Celery détecte** expiration à la minute près
10. **User banni** du canal automatiquement
11. **Status** = 'expired'
12. **Notification** d'expiration envoyée

### ❌ Échecs Possibles

| Symptôme | Cause | Solution |
|----------|-------|----------|
| Bot ne répond pas | Bot pas lancé | Lancer `python telegram_bot/bot.py` |
| Pas de lien invitation | Bot pas admin | Ajouter bot comme admin du canal |
| Révocation ne fonctionne pas | Celery Beat pas lancé | Lancer `celery -A backend beat` |
| Durée incorrecte | Offre mal configurée | Vérifier `duration_minutes=5` |
| Username incorrect | Pas fourni dans user_info | Remplir telegram_username au checkout |

---

## 📸 Captures d'Écran Attendues

### 1. Notification dans le Site
![Notification avec lien bot]

### 2. Message du Bot
![Bot envoie lien invitation unique]

### 3. Accès au Canal
![User voit les messages du canal]

### 4. Après Expiration
![User n'est plus membre]

---

## 🔄 Refaire le Test

```bash
# Nettoyer les données du test précédent
python manage.py shell
```

```python
from accounts.models_telegram import *

# Supprimer tous les tokens/invites/members de test
TelegramBotToken.objects.filter(user__email='test_telegram@example.com').delete()
TelegramChannelInvite.objects.filter(user__email='test_telegram@example.com').delete()
TelegramChannelMember.objects.filter(user__email='test_telegram@example.com').delete()
TelegramNotification.objects.filter(user__email='test_telegram@example.com').delete()

# Supprimer le paiement
from payments.models import PendingPayment, Payment
PendingPayment.objects.filter(user__email='test_telegram@example.com').delete()
Payment.objects.filter(user__email='test_telegram@example.com').delete()

print("✅ Données de test nettoyées - Vous pouvez refaire le test")
```

---

## 🎉 Succès !

Si tous les points sont validés, votre **système Telegram est 100% fonctionnel** !

Vous pouvez maintenant :
- ✅ Créer des offres réelles (30 jours, etc.)
- ✅ Déployer en production
- ✅ Utiliser le système avec de vrais clients

---

**⏱️ Durée totale du test : ~10 minutes**  
**📊 Précision de la révocation : ±1 minute**  
**🔒 Sécurité : Maximale (tokens uniques, invites 1 usage)**

