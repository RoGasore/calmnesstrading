# 👤 Utilisateur de Test - Calmness Trading

## 🔐 Informations de Connexion

### Utilisateur Standard
- **Email**: `test@calmnessfi.com`
- **Mot de passe**: `Test123!`
- **Nom**: Jean Dupont
- **Téléphone**: +33612345678
- **Telegram**: @jeandupont

### Administrateur
- **Email**: `admin@calmnessfi.com`
- **Mot de passe**: `calmness`

## 📋 Profil de l'Utilisateur Test

L'utilisateur test possède un profil complet avec :
- **Biographie**: "Trader débutant passionné par les crypto-monnaies et le forex."
- **Expérience de trading**: Intermédiaire
- **Langue préférée**: Français
- **Fuseau horaire**: Europe/Paris
- **Localisation**: Paris, France
- **Actifs préférés**: Crypto-monnaies, Forex
- **Tolérance au risque**: Moyenne
- **Compte vérifié**: ✅ Oui
- **Compte actif**: ✅ Oui

## 🚀 Comment utiliser l'utilisateur de test

### 1. Connexion via l'interface web
```
1. Accédez à http://localhost:5173 (ou votre URL frontend)
2. Cliquez sur "Connexion"
3. Entrez l'email: test@calmnessfi.com
4. Entrez le mot de passe: Test123!
5. Cliquez sur "Se connecter"
```

### 2. Connexion via API
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@calmnessfi.com",
    "password": "Test123!"
  }'
```

### 3. Récréer l'utilisateur de test
Si vous avez besoin de recréer l'utilisateur de test :
```bash
cd backend
python manage.py create_test_user
```

## 📝 Fonctionnalités à tester

Avec cet utilisateur, vous pouvez tester :
- ✅ Connexion/Déconnexion
- ✅ Consultation du profil utilisateur
- ✅ Modification des informations personnelles
- ✅ Changement de mot de passe
- ✅ Accès aux formations
- ✅ Gestion des signaux de trading
- ✅ Système de paiement et abonnements
- ✅ Interface utilisateur complète

## 🔧 Commandes utiles

### Créer un autre utilisateur de test
Pour créer un utilisateur de test personnalisé, vous pouvez utiliser le shell Django :
```bash
cd backend
python manage.py shell
```

Puis :
```python
from django.contrib.auth import get_user_model
from accounts.models import UserProfile

User = get_user_model()

# Créer un utilisateur
user = User.objects.create_user(
    username='nouveautest',
    email='nouveau@test.com',
    password='motdepasse123',
    first_name='Prénom',
    last_name='Nom',
    is_active=True,
    is_verified=True
)

# Créer son profil
UserProfile.objects.create(
    user=user,
    trading_experience='beginner',
    preferred_language='fr'
)
```

### Lister tous les utilisateurs
```bash
cd backend
python manage.py shell
```

Puis :
```python
from django.contrib.auth import get_user_model
User = get_user_model()

for user in User.objects.all():
    print(f"{user.email} - Active: {user.is_active} - Vérifié: {user.is_verified}")
```

## 🎯 Notes importantes

1. **Compte vérifié**: L'utilisateur de test a son compte déjà vérifié (pas besoin de valider l'email)
2. **Compte actif**: Le compte est actif et prêt à être utilisé immédiatement
3. **Données réelles**: Toutes les données du profil sont remplies pour des tests complets
4. **Base de données**: Les données sont stockées dans `backend/db.sqlite3`

---

**Bon développement ! 🚀**

