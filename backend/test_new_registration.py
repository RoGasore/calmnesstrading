#!/usr/bin/env python
import os
import sys
import django
import requests
import json
import time

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def test_new_registration():
    """Tester l'inscription avec un nouvel email"""
    
    print("Test d'inscription avec un nouvel email...")
    
    # Générer un email unique
    timestamp = int(time.time())
    test_email = f"test_new_{timestamp}@example.com"
    test_username = f"test_new_{timestamp}"
    
    # Données d'inscription
    register_data = {
        "username": test_username,
        "email": test_email,
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "New",
        "phone": "+33123456789",
        "telegram_username": "@testnew",
        "confirm_url": "https://calmnesstrading.vercel.app/verify-email"
    }
    
    print(f"Tentative d'inscription avec l'email: {test_email}")
    print(f"Données envoyées: {json.dumps(register_data, indent=2)}")
    
    try:
        # Tentative d'inscription
        response = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/register/",
            json=register_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nRéponse HTTP: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.text:
            try:
                response_data = response.json()
                print(f"Réponse JSON: {json.dumps(response_data, indent=2)}")
            except:
                print(f"Réponse texte: {response.text}")
        else:
            print("Réponse vide")
        
        if response.status_code == 201:
            print("\nInscription reussie!")
            
            # Vérifier que l'utilisateur a été créé
            print("\nVérification de la création de l'utilisateur...")
            
            # Se connecter en tant qu'admin pour vérifier
            admin_login_data = {
                "email": "admin@calmness.com",
                "password": "calmness"
            }
            
            admin_response = requests.post(
                "https://calmnesstrading.onrender.com/api/auth/login/",
                json=admin_login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if admin_response.status_code == 200:
                admin_token = admin_response.json().get("access")
                
                # Récupérer la liste des utilisateurs
                users_response = requests.get(
                    "https://calmnesstrading.onrender.com/api/auth/admin/users/",
                    headers={
                        "Authorization": f"Bearer {admin_token}",
                        "Content-Type": "application/json"
                    }
                )
                
                if users_response.status_code == 200:
                    users = users_response.json()
                    print(f"Utilisateurs trouvés: {len(users)}")
                    
                    # Chercher notre utilisateur
                    new_user = None
                    for user in users:
                        if user.get('email') == test_email:
                            new_user = user
                            break
                    
                    if new_user:
                        print(f"Utilisateur trouve: {new_user.get('email')}")
                        print(f"   - Username: {new_user.get('username')}")
                        print(f"   - Actif: {new_user.get('is_active')}")
                        print(f"   - Verifie: {new_user.get('is_verified')}")
                        print(f"   - Cree: {new_user.get('created_at')}")
                    else:
                        print("Utilisateur non trouve dans la liste")
                else:
                    print(f"Erreur lors de la recuperation des utilisateurs: {users_response.status_code}")
            else:
                print(f"Erreur de connexion admin: {admin_response.status_code}")
                
        else:
            print(f"Inscription echouee: {response.status_code}")
            
    except Exception as e:
        print(f"Erreur lors de la requete: {e}")

if __name__ == "__main__":
    test_new_registration()
