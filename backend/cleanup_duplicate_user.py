#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def cleanup_duplicate_user():
    """Nettoyer l'utilisateur dupliqué créé par le double clic"""
    
    print("Nettoyage de l'utilisateur duplique...")
    
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
        print(f"Utilisateurs trouvés: {len(users)}")
        
        # Chercher l'utilisateur rodriguegasore11@gmail.com
        target_email = "rodriguegasore11@gmail.com"
        target_users = []
        
        for user in users:
            if user.get('email') == target_email:
                target_users.append(user)
                print(f"Utilisateur trouvé: {user.get('email')} (ID: {user.get('id')})")
                print(f"   - Username: {user.get('username')}")
                print(f"   - Actif: {user.get('is_active')}")
                print(f"   - Vérifié: {user.get('is_verified')}")
                print(f"   - Créé: {user.get('created_at')}")
        
        if len(target_users) > 1:
            print(f"\nATTENTION: {len(target_users)} utilisateurs trouvés avec l'email {target_email}")
            print("Suppression des doublons...")
            
            # Garder le plus ancien (premier créé) et supprimer les autres
            target_users.sort(key=lambda x: x.get('created_at', ''))
            users_to_delete = target_users[1:]  # Supprimer tous sauf le premier
            
            for user in users_to_delete:
                user_id = user.get('id')
                email = user.get('email')
                username = user.get('username')
                
                print(f"Suppression de {email} (ID: {user_id}, Username: {username})...")
                
                delete_response = requests.delete(
                    f"https://calmnesstrading.onrender.com/api/auth/admin/users/{user_id}/",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json"
                    }
                )
                
                if delete_response.status_code in [200, 204]:
                    print(f"Utilisateur {email} supprimé avec succès")
                else:
                    print(f"Erreur lors de la suppression de {email}: {delete_response.status_code}")
                    print(f"Réponse: {delete_response.text}")
        
        elif len(target_users) == 1:
            print(f"Un seul utilisateur trouvé avec l'email {target_email} - pas de doublon")
        else:
            print(f"Aucun utilisateur trouvé avec l'email {target_email}")
        
        # Afficher les utilisateurs restants
        print("\nUtilisateurs restants:")
        remaining_response = requests.get(
            "https://calmnesstrading.onrender.com/api/auth/admin/users/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if remaining_response.status_code == 200:
            remaining_users = remaining_response.json()
            for user in remaining_users:
                status = "Actif" if user.get('is_active') else "Inactif"
                verified = "Vérifié" if user.get('is_verified') else "Non vérifié"
                print(f"- {user.get('email')} ({status}, {verified})")
        
        return True
        
    except Exception as e:
        print(f"Erreur: {e}")
        return False

if __name__ == "__main__":
    success = cleanup_duplicate_user()
    
    if success:
        print("\nNettoyage terminé avec succès!")
    else:
        print("\nErreur lors du nettoyage.")
