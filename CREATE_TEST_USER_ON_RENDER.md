# 🚀 Créer un Utilisateur de Test sur Render (Production)

## 📋 URL de Production
- **Backend API**: `https://calmnesstrading.onrender.com`
- **Frontend**: `https://calmnesstrading.vercel.app`

## 🔧 Méthode 1 : Via le Shell Render (Recommandé)

### Étapes sur le Dashboard Render

1. **Accédez à votre service**
   - Allez sur https://dashboard.render.com
   - Sélectionnez votre service backend `calmnesstrading`

2. **Ouvrez le Shell**
   - Dans l'onglet du service, cliquez sur **"Shell"** (en haut à droite)
   - Un terminal s'ouvrira dans votre conteneur

3. **Exécutez la commande**
   ```bash
   python manage.py create_test_user
   ```

4. **Vérifiez la création**
   Vous devriez voir :
   ```
   ✅ Utilisateur de test créé avec succès!
   📧 Email: test@calmnessfi.com
   🔑 Mot de passe: Test123!
   👤 Nom: Jean Dupont
   📱 Téléphone: +33612345678
   💬 Telegram: @jeandupont
   ```

## 🔧 Méthode 2 : Via l'API Admin (Alternative)

Si le shell n'est pas accessible, utilisez l'API admin :

### Script Python automatisé

```python
import requests
import json

# 1. Se connecter en tant qu'admin
login_response = requests.post(
    "https://calmnesstrading.onrender.com/api/auth/login/",
    json={
        "email": "admin@calmnessfi.com",
        "password": "calmness"
    }
)

if login_response.status_code == 200:
    token = login_response.json()['access']
    
    # 2. Créer l'utilisateur via l'API
    create_response = requests.post(
        "https://calmnesstrading.onrender.com/api/auth/register/",
        json={
            "username": "testuser",
            "email": "test@calmnessfi.com",
            "password": "Test123!",
            "first_name": "Jean",
            "last_name": "Dupont",
            "phone": "+33612345678",
            "telegram_username": "@jeandupont"
        }
    )
    
    if create_response.status_code == 201:
        user_data = create_response.json()
        user_id = user_data['user']['id']
        
        # 3. Activer l'utilisateur via l'API admin
        activate_response = requests.patch(
            f"https://calmnesstrading.onrender.com/api/auth/admin/users/{user_id}/",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "is_active": True,
                "is_verified": True
            }
        )
        
        if activate_response.status_code == 200:
            print("✅ Utilisateur de test créé et activé avec succès!")
        else:
            print(f"❌ Erreur d'activation: {activate_response.text}")
    else:
        print(f"❌ Erreur de création: {create_response.text}")
else:
    print(f"❌ Erreur de connexion admin: {login_response.text}")
```

### Enregistrer et exécuter

1. Créez un fichier `create_test_user_production.py` avec le script ci-dessus
2. Exécutez-le localement :
   ```bash
   python create_test_user_production.py
   ```

## 🔧 Méthode 3 : Via curl (Ligne de commande)

```bash
# 1. Se connecter en tant qu'admin et récupérer le token
TOKEN=$(curl -s -X POST https://calmnesstrading.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@calmnessfi.com","password":"calmness"}' \
  | grep -o '"access":"[^"]*' | cut -d'"' -f4)

# 2. Créer l'utilisateur
curl -X POST https://calmnesstrading.onrender.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@calmnessfi.com",
    "password": "Test123!",
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "+33612345678",
    "telegram_username": "@jeandupont"
  }'

# 3. Activer l'utilisateur (remplacez USER_ID par l'ID reçu)
curl -X PATCH https://calmnesstrading.onrender.com/api/auth/admin/users/USER_ID/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": true, "is_verified": true}'
```

## ✅ Vérification

Après la création, testez la connexion :

### Via curl
```bash
curl -X POST https://calmnesstrading.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@calmnessfi.com",
    "password": "Test123!"
  }'
```

### Via l'interface web
1. Allez sur https://calmnesstrading.vercel.app
2. Cliquez sur "Connexion"
3. Utilisez les identifiants :
   - **Email** : `test@calmnessfi.com`
   - **Mot de passe** : `Test123!`

## 🔑 Informations de l'utilisateur de test

Une fois créé, l'utilisateur aura :
- ✅ Compte actif
- ✅ Email vérifié
- ✅ Profil complet
- ✅ Accès à toutes les fonctionnalités utilisateur

## 📝 Notes importantes

1. **Commande déjà disponible** : La commande `create_test_user` est déjà dans votre code et sera disponible sur Render après le prochain déploiement.

2. **Si l'utilisateur existe déjà** : La commande affichera un message d'avertissement sans créer de doublon.

3. **Sécurité** : L'utilisateur de test utilise un mot de passe simple (`Test123!`). C'est OK pour un environnement de test, mais évitez d'utiliser cet utilisateur pour des données sensibles.

4. **Suppression** : Pour supprimer l'utilisateur de test plus tard, utilisez le shell Render :
   ```bash
   python manage.py shell
   ```
   Puis :
   ```python
   from django.contrib.auth import get_user_model
   User = get_user_model()
   User.objects.filter(email='test@calmnessfi.com').delete()
   ```

## 🚨 Troubleshooting

### Erreur "Commande introuvable"
Si la commande `create_test_user` n'existe pas encore sur Render :
1. Assurez-vous que le fichier `backend/accounts/management/commands/create_test_user.py` est bien dans votre dépôt Git
2. Faites un commit et push :
   ```bash
   git add backend/accounts/management/commands/create_test_user.py
   git commit -m "Ajouter commande create_test_user"
   git push
   ```
3. Attendez que Render redéploie automatiquement
4. Réessayez la commande

### Erreur de connexion admin
Si vous ne pouvez pas vous connecter avec `admin@calmnessfi.com` :
- Vérifiez que l'admin existe sur Render
- Utilisez le shell Render pour créer l'admin :
  ```bash
  python manage.py create_admin
  ```

---

**Bon développement ! 🎉**

