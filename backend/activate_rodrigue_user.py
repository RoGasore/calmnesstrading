#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def activate_rodrigue_user():
    """Activer l'utilisateur rodriguegasore11@gmail.com"""
    
    print("Activation de l'utilisateur rodriguegasore11@gmail.com...")
    
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
        
        # Activer l'utilisateur
        print("\nActivation de l'utilisateur...")
        
        activate_response = requests.post(
            f"https://calmnesstrading.onrender.com/api/auth/admin/users/{user_id}/activate/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if activate_response.status_code == 200:
            print("Utilisateur activé avec succès!")
        else:
            print(f"Erreur lors de l'activation: {activate_response.status_code}")
            print(f"Réponse: {activate_response.text}")
            return False
        
        # Marquer l'email comme vérifié
        print("Marquage de l'email comme vérifié...")
        
        patch_data = {
            "is_verified": True
        }
        
        verify_response = requests.patch(
            f"https://calmnesstrading.onrender.com/api/auth/admin/users/{user_id}/",
            json=patch_data,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if verify_response.status_code == 200:
            print("Email marqué comme vérifié avec succès!")
        else:
            print(f"Erreur lors de la vérification de l'email: {verify_response.status_code}")
            print(f"Réponse: {verify_response.text}")
        
        # Vérifier le statut final
        print("\nVérification du statut final...")
        
        final_response = requests.get(
            f"https://calmnesstrading.onrender.com/api/auth/admin/users/{user_id}/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if final_response.status_code == 200:
            final_user = final_response.json()
            print(f"Statut final:")
            print(f"   - Email: {final_user.get('email')}")
            print(f"   - Actif: {final_user.get('is_active')}")
            print(f"   - Vérifié: {final_user.get('is_verified')}")
            
            if final_user.get('is_active') and final_user.get('is_verified'):
                print("\nSUCCESS: L'utilisateur est maintenant actif et vérifié!")
                print("Il peut maintenant se connecter avec ses identifiants.")
            else:
                print("\nWARNING: L'utilisateur n'est pas complètement activé")
        else:
            print(f"Erreur lors de la vérification finale: {final_response.status_code}")
        
        return True
        
    except Exception as e:
        print(f"Erreur: {e}")
        return False

if __name__ == "__main__":
    success = activate_rodrigue_user()
    
    if success:
        print("\nActivation terminée avec succès!")
        print("L'utilisateur peut maintenant se connecter.")
    else:
        print("\nErreur lors de l'activation.")
