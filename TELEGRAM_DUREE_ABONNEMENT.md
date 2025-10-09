# ⏱️ Gestion des Durées d'Abonnement Telegram

## 📋 Vue d'ensemble

Le système gère automatiquement les durées d'abonnement **flexibles** :
- ✅ **Minutes** (ex: 5 min pour test)
- ✅ **Heures** (ex: 24h pour essai)
- ✅ **Jours** (ex: 30 jours pour mensuel)

L'expiration et la révocation sont **automatiques** et **précises à la minute près**.

---

## 🎯 Configuration des Offres

### Dans Django Admin

Lors de la création d'une offre, vous pouvez définir **une seule** de ces durées :

```python
# Exemple 1: Abonnement de 5 minutes (pour test)
Offer.objects.create(
    name="Signal Test 5min",
    offer_type="signal",
    price=1.00,
    duration_minutes=5  # ← 5 minutes
)

# Exemple 2: Abonnement de 24 heures
Offer.objects.create(
    name="Signal Journalier",
    offer_type="signal",
    price=9.90,
    duration_hours=24  # ← 24 heures
)

# Exemple 3: Abonnement mensuel
Offer.objects.create(
    name="Signal Premium",
    offer_type="signal",
    price=297.00,
    duration_days=30  # ← 30 jours
)
```

### Champs Disponibles

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `duration_minutes` | Integer | Durée en minutes | 5, 15, 30 |
| `duration_hours` | Integer | Durée en heures | 1, 12, 24 |
| `duration_days` | Integer | Durée en jours | 7, 30, 90, 365 |

**Important** : Utiliser **une seule** durée par offre. Si plusieurs sont définies, la priorité est :
1. `duration_days` (prioritaire)
2. `duration_hours`
3. `duration_minutes`

---

## 🔄 Workflow Automatique

### 1. Lors du Paiement

```
Utilisateur achète "Signal Test 5min" (duration_minutes=5)
        ↓
Service Client valide
        ↓
Token Telegram généré automatiquement
        ↓
Notification envoyée à l'utilisateur
```

### 2. Accès au Canal

```
Utilisateur clique sur le lien bot
        ↓
Bot vérifie le token
        ↓
Bot crée une invitation unique (5 min expiration)
        ↓
Utilisateur rejoint le canal
        ↓
Membership créé avec:
  - subscription_end_date = now + 5 minutes
  - expires_at = now + 5 minutes
```

### 3. Expiration Automatique

```
Celery vérifie TOUTES LES MINUTES
        ↓
Si subscription_end_date <= now:
  1. Status → 'expired'
  2. Ban du canal Telegram
  3. Notification à l'utilisateur
```

---

## ⏰ Vérification des Expirations

### Fréquence de Vérification

**Celery Beat** exécute la tâche `check_expired_subscriptions` **toutes les minutes** :

```python
# backend/backend/celery.py
'check-expired-subscriptions-every-minute': {
    'task': 'accounts.tasks_telegram.check_expired_subscriptions',
    'schedule': crontab(),  # Toutes les minutes
}
```

### Précision

- ✅ **Abonnement 5 min** → Révoqué exactement 5 minutes après l'accès
- ✅ **Abonnement 24h** → Révoqué exactement 24 heures après l'accès
- ✅ **Abonnement 30j** → Révoqué exactement 30 jours après l'accès

**Marge d'erreur** : Maximum 60 secondes (délai entre 2 vérifications Celery)

---

## 👤 Username Telegram

### Récupération du Username

Le système utilise **le username Telegram validé** lors du paiement :

1. **Priorité 1** : Username actuel de Telegram (`user.username`)
2. **Priorité 2** : Username sauvegardé dans `user.telegram_username`

```python
# Dans bot.py - track_member_update()
telegram_username = user.username or ''
if not telegram_username and invite.user.telegram_username:
    telegram_username = invite.user.telegram_username.replace('@', '')
```

### Mise à Jour Automatique

Lors du paiement, l'utilisateur peut fournir son username Telegram dans `user_info` :

```json
{
  "telegram_username": "@username",
  "whatsapp_number": "+33123456789",
  "discord_username": "user#1234"
}
```

Ce username est automatiquement sauvegardé dans le profil utilisateur.

---

## 📊 Exemples de Cas d'Usage

### Cas 1: Abonnement Test 5 Minutes

```python
# Admin crée l'offre
Offer.objects.create(
    name="Test 5min",
    price=1.00,
    offer_type="signal",
    duration_minutes=5
)

# Timeline
00:00 → Paiement validé, token généré
00:01 → User clique sur bot
00:02 → User rejoint canal (membership créé: expires_at=00:07)
00:03-00:06 → User a accès
00:07 → Celery détecte expiration
00:07 → User banni du canal
00:08 → Notification envoyée
```

### Cas 2: Abonnement Journalier

```python
Offer.objects.create(
    name="Signaux 24h",
    price=9.90,
    offer_type="signal",
    duration_hours=24
)

# Timeline
Lundi 10:00 → Accès accordé
Mardi 10:00 → Expiration exacte
Mardi 10:01 → Révocation (max 1 min de délai)
```

### Cas 3: Abonnement Mensuel

```python
Offer.objects.create(
    name="Premium",
    price=297.00,
    offer_type="signal",
    duration_days=30
)

# Timeline
01/01 14:30 → Accès accordé
31/01 14:30 → Expiration exacte
31/01 14:31 → Révocation (max 1 min de délai)
```

---

## 🔧 Commandes Utiles

### Vérifier les Memberships Actifs

```bash
cd backend
python manage.py shell
```

```python
from accounts.models_telegram import TelegramChannelMember
from django.utils import timezone

# Tous les memberships actifs
active = TelegramChannelMember.objects.filter(status='active')
for m in active:
    remaining = m.subscription_end_date - timezone.now()
    print(f"{m.user.username}: {m.subscription_type} - Reste {remaining}")
```

### Forcer une Vérification Manuelle

```python
from accounts.tasks_telegram import check_expired_subscriptions

# Exécuter manuellement
result = check_expired_subscriptions()
print(result)
```

### Créer une Offre Test 5min

```python
from payments.models import Offer

Offer.objects.create(
    name="Test Telegram 5min",
    description="Abonnement de test 5 minutes",
    offer_type="signal",
    price=1.00,
    currency="EUR",
    duration_minutes=5,
    is_active=True
)
```

---

## 🐛 Dépannage

### L'utilisateur n'est pas révoqué après expiration

**Vérifier** :
1. Celery Beat est lancé ? → `ps aux | grep celery`
2. Tâche planifiée ? → `celery -A backend inspect scheduled`
3. Logs Celery Beat → Regarder si la tâche s'exécute

**Solution** :
```bash
# Relancer Celery Beat
celery -A backend beat -l info
```

### L'utilisateur est révoqué trop tôt

**Cause** : Timezone incorrecte

**Solution** :
```python
# backend/backend/settings.py
TIME_ZONE = 'Europe/Paris'
USE_TZ = True

# backend/backend/celery.py
app.conf.timezone = 'Europe/Paris'
```

### Le membership n'a pas la bonne durée

**Vérifier** :
1. L'offre a bien `duration_minutes/hours/days` défini
2. Le bot récupère bien le payment → Logs bot
3. Le calcul de `subscription_end_date` est correct

**Debug** :
```python
from payments.models import Payment

payment = Payment.objects.latest('id')
print(f"Offre: {payment.offer.name}")
print(f"Duration days: {payment.offer.duration_days}")
print(f"Duration hours: {payment.offer.duration_hours}")
print(f"Duration minutes: {payment.offer.duration_minutes}")
```

---

## 📈 Monitoring

### Statistiques en Temps Réel

```bash
curl http://localhost:8000/api/telegram/admin/stats/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Réponse** :
```json
{
  "members": {
    "total": 15,
    "active": 12,
    "recent_joins": 5
  },
  "tokens": {
    "total": 20,
    "pending": 3,
    "used": 17
  }
}
```

---

## ✅ Checklist Configuration

- [ ] Offre créée avec `duration_minutes/hours/days`
- [ ] Celery Worker lancé
- [ ] Celery Beat lancé
- [ ] Bot Telegram lancé
- [ ] Test avec abonnement 5min réussi
- [ ] Vérification expiration automatique OK

---

**🎉 Votre système gère maintenant les durées flexibles automatiquement !**

