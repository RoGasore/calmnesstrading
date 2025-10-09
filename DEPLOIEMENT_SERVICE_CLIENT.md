# 🚀 DÉPLOIEMENT SERVICE CLIENT SUR RENDER

## ❌ Problème Actuel

L'utilisateur service client existe uniquement en **local**, pas sur **Render (production)**.

Erreur : `401 - Email ou mot de passe incorrect`

---

## ✅ SOLUTION : Créer le compte sur Render

### Option 1 : Via Shell Render (RECOMMANDÉ)

1. **Aller sur Render Dashboard**
   - https://dashboard.render.com/
   - Sélectionner votre service `calmnesstrading`

2. **Ouvrir le Shell**
   - Cliquer sur l'onglet **"Shell"**
   - Ou aller directement à l'URL :
     ```
     https://dashboard.render.com/web/[VOTRE-SERVICE-ID]/shell
     ```

3. **Exécuter la commande**
   ```bash
   python manage.py create_customer_service
   ```

4. **Vérifier la création**
   ```
   ============================================================
   ✓ Compte Service Client créé avec succès!
   ============================================================

   📧 Email    : service@calmnessfi.com
   🔑 Mot de passe : ServiceClient2024!
   👤 Rôle    : Service Client
   🔗 URL     : https://calmnesstrading.vercel.app/support

   ============================================================
   ```

---

### Option 2 : Via Migrations (Alternative)

Si vous préférez créer le compte via une migration automatique :

1. **Créer une migration de données**
   ```python
   # backend/accounts/migrations/0010_create_service_client.py
   from django.db import migrations
   from django.contrib.auth import get_user_model

   def create_service_client(apps, schema_editor):
       User = get_user_model()
       
       if not User.objects.filter(email='service@calmnessfi.com').exists():
           User.objects.create_user(
               username='service_client',
               email='service@calmnessfi.com',
               password='ServiceClient2024!',
               first_name='Service',
               last_name='Client',
               role='customer_service',
               is_staff=True,
               is_active=True,
               is_verified=True,
           )

   def reverse_func(apps, schema_editor):
       User = get_user_model()
       User.objects.filter(email='service@calmnessfi.com').delete()

   class Migration(migrations.Migration):
       dependencies = [
           ('accounts', '0009_user_role'),
       ]

       operations = [
           migrations.RunPython(create_service_client, reverse_func),
       ]
   ```

2. **Push et déployer**
   ```bash
   git add .
   git commit -m "feat: Migration automatique service client"
   git push origin main
   ```

---

### Option 3 : Via Django Admin (Si superuser existe)

1. **Se connecter au Django Admin**
   ```
   https://calmnesstrading.onrender.com/admin/
   ```

2. **Créer un nouvel utilisateur**
   - Aller dans **Comptes > Utilisateurs > Ajouter**
   - Remplir :
     - Username: `service_client`
     - Email: `service@calmnessfi.com`
     - Password: `ServiceClient2024!`
     - First name: `Service`
     - Last name: `Client`
     - **Role**: `customer_service`
     - **Is staff**: ✅ Coché
     - **Is active**: ✅ Coché
     - **Is verified**: ✅ Coché

3. **Sauvegarder**

---

## 🔍 VÉRIFICATION

### 1. Tester la connexion

1. Aller sur : https://calmnesstrading.vercel.app/login
2. Entrer :
   - Email: `service@calmnessfi.com`
   - Password: `ServiceClient2024!`
3. Devrait rediriger vers : `/support`

### 2. Vérifier le rôle

Dans le Shell Render :
```python
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(email='service@calmnessfi.com')
print(f"Role: {user.role}")
print(f"Is staff: {user.is_staff}")
print(f"Is customer service: {user.is_customer_service}")
```

Devrait afficher :
```
Role: customer_service
Is staff: True
Is customer service: True
```

---

## 📋 CHECKLIST COMPLÈTE

- [ ] Migration `0009_user_role` appliquée sur Render
- [ ] Compte service client créé sur Render
- [ ] Email: `service@calmnessfi.com`
- [ ] Role: `customer_service`
- [ ] Is staff: `True`
- [ ] Is active: `True`
- [ ] Connexion réussie depuis `/login`
- [ ] Redirection vers `/support`
- [ ] Dashboard service client accessible

---

## 🔧 COMMANDES UTILES

### Vérifier les migrations
```bash
python manage.py showmigrations accounts
```

### Lister tous les utilisateurs
```bash
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> for u in User.objects.all():
...     print(f"{u.email} - Role: {u.role} - Staff: {u.is_staff}")
```

### Changer le mot de passe
```bash
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> user = User.objects.get(email='service@calmnessfi.com')
>>> user.set_password('NouveauMotDePasse123!')
>>> user.save()
```

### Mettre à jour le rôle manuellement
```bash
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> user = User.objects.get(email='service@calmnessfi.com')
>>> user.role = 'customer_service'
>>> user.is_staff = True
>>> user.save()
```

---

## ⚠️ NOTES IMPORTANTES

1. **Migrations** : Assurez-vous que la migration `0009_user_role` est bien appliquée sur Render
2. **Permissions** : Le service client doit avoir `is_staff=True` pour accéder aux fonctionnalités
3. **Mot de passe** : Changez le mot de passe par défaut après la première connexion
4. **Sécurité** : Ne commitez JAMAIS les mots de passe en clair dans le code

---

## 🎯 PROCHAINES ÉTAPES

Après avoir créé le compte service client :

1. ✅ Se connecter sur https://calmnesstrading.vercel.app/support
2. ✅ Tester la validation d'un paiement
3. ✅ Vérifier la génération de facture
4. ✅ Tester l'envoi d'email

---

**Date** : 9 janvier 2025  
**Version** : 1.0

