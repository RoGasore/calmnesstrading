#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def cleanup_test_users():
    """Nettoyer les utilisateurs de test sur Render"""
    
    print("Nettoyage des utilisateurs de test sur Render...")
    
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
        
        # Recuperer la liste des utilisateurs
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
        print(f"Utilisateurs trouves: {len(users)}")
        
        # Identifier les utilisateurs de test à supprimer
        test_emails = [
            "test@example.com",
            "test_flow_1759731517@example.com",
            "rayanhussen243@gmail.com"  # Ajoutez d'autres emails de test si nécessaire
        ]
        
        users_to_delete = []
        for user in users:
            if user.get('email') in test_emails:
                users_to_delete.append(user)
                print(f"Utilisateur de test identifie: {user.get('email')} (ID: {user.get('id')})")
        
        if not users_to_delete:
            print("Aucun utilisateur de test a supprimer")
            return True
        
        # Supprimer les utilisateurs de test
        deleted_count = 0
        for user in users_to_delete:
            user_id = user.get('id')
            email = user.get('email')
            
            print(f"Suppression de {email} (ID: {user_id})...")
            
            delete_response = requests.delete(
                f"https://calmnesstrading.onrender.com/api/auth/admin/users/{user_id}/",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if delete_response.status_code in [200, 204]:
                print(f"OK {email} supprime avec succes")
                deleted_count += 1
            else:
                print(f"ERREUR lors de la suppression de {email}: {delete_response.status_code}")
                print(f"Reponse: {delete_response.text}")
        
        print(f"\nNettoyage termine: {deleted_count}/{len(users_to_delete)} utilisateurs supprimes")
        
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
                verified = "Verifie" if user.get('is_verified') else "Non verifie"
                print(f"- {user.get('email')} ({status}, {verified})")
        
        return True
        
    except Exception as e:
        print(f"Erreur: {e}")
        return False

if __name__ == "__main__":
    success = cleanup_test_users()
    
    if success:
        print("\nNettoyage termine avec succes!")
        print("Vous pouvez maintenant tester l'inscription avec de nouveaux emails.")
    else:
        print("\nErreur lors du nettoyage.")
