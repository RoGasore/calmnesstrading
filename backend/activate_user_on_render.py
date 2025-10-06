#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def activate_user_on_render(email):
    """Activer un utilisateur sur Render via l'API admin"""
    
    print(f"Activation de l'utilisateur {email} sur Render...")
    
    # D'abord, se connecter en tant qu'admin
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
        
        # Recuperer la liste des utilisateurs pour trouver l'ID
        users_response = requests.get(
            "https://calmnesstrading.onrender.com/api/auth/admin/users/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if users_response.status_code != 200:
            print(f"Erreur lors de la recuperation des utilisateurs: {users_response.status_code}")
            return False
        
        users = users_response.json()
        target_user = None
        
        for user in users:
            if user.get('email') == email:
                target_user = user
                break
        
        if not target_user:
            print(f"Utilisateur {email} non trouve")
            return False
        
        user_id = target_user.get('id')
        print(f"Utilisateur trouve: ID {user_id}")
        
        # Activer l'utilisateur
        activation_data = {
            "is_active": True,
            "is_verified": True
        }
        
        activate_response = requests.patch(
            f"https://calmnesstrading.onrender.com/api/auth/admin/users/{user_id}/",
            json=activation_data,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if activate_response.status_code == 200:
            print(f"Utilisateur {email} active avec succes!")
            return True
        else:
            print(f"Erreur lors de l'activation: {activate_response.status_code}")
            print(f"Reponse: {activate_response.text}")
            return False
            
    except Exception as e:
        print(f"Erreur: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python activate_user_on_render.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    success = activate_user_on_render(email)
    
    if success:
        print("\nL'utilisateur peut maintenant se connecter!")
    else:
        print("\nEchec de l'activation.")
