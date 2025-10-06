#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def delete_rodrigue_user():
    """Supprimer l'utilisateur rodriguegasore11@gmail.com pour permettre une nouvelle inscription"""
    
    print("Suppression de l'utilisateur rodriguegasore11@gmail.com...")
    
    # Se connecter en tant qu'admin
    login_data = {
        "email": "admin@calmness.com",
        "password": "calmness"
    }
    
    try:
        # Connexion admin
        login_response = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code != 200:
            print(f"Erreur de connexion admin: {login_response.status_code}")
            return False
        
        login_data = login_response.json()
        access_token = login_data.get('access')
        
        if not access_token:
            print("Aucun token d'accès reçu")
            return False
        
        print("Connexion admin reussie")
        
        # Récupérer la liste des utilisateurs
        users_response = requests.get(
            "https://calmnesstrading.onrender.com/api/auth/admin/users/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if users_response.status_code != 200:
            print(f"Erreur lors de la récupération des utilisateurs: {users_response.status_code}")
            return False
        
        users = users_response.json()
        
        # Chercher l'utilisateur rodriguegasore11@gmail.com
        target_email = "rodriguegasore11@gmail.com"
        target_user = None
        
        for user in users:
            if user.get('email') == target_email:
                target_user = user
                break
        
        if not target_user:
            print(f"Aucun utilisateur trouvé avec l'email {target_email}")
            return False
        
        user_id = target_user.get('id')
        print(f"Utilisateur trouvé: {target_user.get('email')} (ID: {user_id})")
        print(f"   - Username: {target_user.get('username')}")
        print(f"   - Actif: {target_user.get('is_active')}")
        print(f"   - Vérifié: {target_user.get('is_verified')}")
        
        # Supprimer l'utilisateur
        print("\nSuppression de l'utilisateur...")
        
        delete_response = requests.delete(
            f"https://calmnesstrading.onrender.com/api/auth/admin/users/{user_id}/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if delete_response.status_code in [200, 204]:
            print("Utilisateur supprimé avec succès!")
        else:
            print(f"Erreur lors de la suppression: {delete_response.status_code}")
            print(f"Réponse: {delete_response.text}")
            return False
        
        # Vérifier la suppression
        print("\nVérification de la suppression...")
        
        verify_response = requests.get(
            "https://calmnesstrading.onrender.com/api/auth/admin/users/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if verify_response.status_code == 200:
            remaining_users = verify_response.json()
            user_still_exists = any(user.get('email') == target_email for user in remaining_users)
            
            if not user_still_exists:
                print("SUCCESS: L'utilisateur a été supprimé avec succès!")
                print("Vous pouvez maintenant refaire l'inscription complète.")
            else:
                print("WARNING: L'utilisateur existe encore")
        else:
            print(f"Erreur lors de la vérification: {verify_response.status_code}")
        
        return True
        
    except Exception as e:
        print(f"Erreur: {e}")
        return False

if __name__ == "__main__":
    success = delete_rodrigue_user()
    
    if success:
        print("\nSuppression terminée avec succès!")
        print("Vous pouvez maintenant tester l'inscription complète:")
        print("1. Aller sur /register")
        print("2. S'inscrire avec rodriguegasore11@gmail.com")
        print("3. Vérifier l'email d'activation")
        print("4. Cliquer sur le lien d'activation")
        print("5. Se connecter")
    else:
        print("\nErreur lors de la suppression.")
