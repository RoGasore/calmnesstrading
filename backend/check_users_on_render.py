#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def check_users_on_render():
    """Vérifier les utilisateurs sur Render via l'API admin"""
    
    print("Vérification des utilisateurs sur Render...")
    
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
            print(f"Réponse: {login_response.text}")
            return
        
        login_data = login_response.json()
        access_token = login_data.get('access')
        
        if not access_token:
            print("Aucun token d'accès reçu")
            return
        
        print("Connexion admin reussie")
        
        # Recuperer la liste des utilisateurs
        users_response = requests.get(
            "https://calmnesstrading.onrender.com/api/auth/admin/users/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"\nUtilisateurs trouves sur Render ({len(users)}):")
            print("-" * 80)
            
            for user in users:
                status = "Actif" if user.get('is_active') else "Inactif"
                verified = "Verifie" if user.get('is_verified') else "Non verifie"
                
                print(f"Email: {user.get('email', 'N/A')}")
                print(f"   Username: {user.get('username', 'N/A')}")
                print(f"   Nom: {user.get('first_name', '')} {user.get('last_name', '')}")
                print(f"   Statut: {status} | {verified}")
                print(f"   Cree: {user.get('created_at', 'N/A')}")
                print("")
        else:
            print(f"Erreur lors de la recuperation des utilisateurs: {users_response.status_code}")
            print(f"Reponse: {users_response.text}")
            
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    check_users_on_render()
