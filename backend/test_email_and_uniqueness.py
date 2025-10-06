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

def test_email_uniqueness():
    """Tester l'unicité des champs email, téléphone et telegram"""
    
    print("=== TEST D'UNICITE DES CHAMPS ===")
    
    # Test 1: Email dupliqué
    print("\n1. Test email duplique...")
    timestamp = int(time.time())
    
    # Premier utilisateur
    user1_data = {
        "username": f"user1_{timestamp}",
        "email": f"duplicate_test_{timestamp}@example.com",
        "password": "testpassword123",
        "first_name": "User",
        "last_name": "One",
        "phone": "+33111111111",
        "telegram_username": "@user1",
        "confirm_url": "https://calmnesstrading.vercel.app/verify-email"
    }
    
    response1 = requests.post(
        "https://calmnesstrading.onrender.com/api/auth/register/",
        json=user1_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Premier utilisateur: {response1.status_code}")
    if response1.status_code == 201:
        print("Premier utilisateur cree avec succes")
        
        # Deuxième utilisateur avec le même email
        user2_data = user1_data.copy()
        user2_data["username"] = f"user2_{timestamp}"
        user2_data["first_name"] = "User"
        user2_data["last_name"] = "Two"
        
        response2 = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/register/",
            json=user2_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Deuxieme utilisateur (meme email): {response2.status_code}")
        if response2.status_code == 400:
            try:
                error_data = response2.json()
                print(f"Erreur attendue: {error_data}")
                if "email" in str(error_data) and "unique" in str(error_data).lower():
                    print("SUCCESS: Email unique fonctionne correctement")
                else:
                    print("WARNING: Erreur differente de celle attendue")
            except:
                print("Erreur lors du parsing de la reponse")
        else:
            print("ERROR: Le deuxieme utilisateur a ete cree (probleme d'unicite)")
    
    # Test 2: Téléphone dupliqué (si applicable)
    print("\n2. Test telephone duplique...")
    timestamp2 = int(time.time())
    
    user3_data = {
        "username": f"user3_{timestamp2}",
        "email": f"phone_test_{timestamp2}@example.com",
        "password": "testpassword123",
        "first_name": "User",
        "last_name": "Three",
        "phone": "+33222222222",
        "telegram_username": "@user3",
        "confirm_url": "https://calmnesstrading.vercel.app/verify-email"
    }
    
    response3 = requests.post(
        "https://calmnesstrading.onrender.com/api/auth/register/",
        json=user3_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response3.status_code == 201:
        print("Utilisateur avec telephone cree")
        
        # Deuxième utilisateur avec le même téléphone
        user4_data = user3_data.copy()
        user4_data["username"] = f"user4_{timestamp2}"
        user4_data["email"] = f"phone_test2_{timestamp2}@example.com"
        user4_data["first_name"] = "User"
        user4_data["last_name"] = "Four"
        
        response4 = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/register/",
            json=user4_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Deuxieme utilisateur (meme telephone): {response4.status_code}")
        if response4.status_code == 201:
            print("INFO: Telephone n'est pas unique (peut etre normal)")
        else:
            print("INFO: Telephone est unique")
    
    # Test 3: Telegram username dupliqué
    print("\n3. Test telegram username duplique...")
    timestamp3 = int(time.time())
    
    user5_data = {
        "username": f"user5_{timestamp3}",
        "email": f"telegram_test_{timestamp3}@example.com",
        "password": "testpassword123",
        "first_name": "User",
        "last_name": "Five",
        "phone": "+33333333333",
        "telegram_username": "@duplicate_telegram",
        "confirm_url": "https://calmnesstrading.vercel.app/verify-email"
    }
    
    response5 = requests.post(
        "https://calmnesstrading.onrender.com/api/auth/register/",
        json=user5_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response5.status_code == 201:
        print("Utilisateur avec telegram username cree")
        
        # Deuxième utilisateur avec le même telegram username
        user6_data = user5_data.copy()
        user6_data["username"] = f"user6_{timestamp3}"
        user6_data["email"] = f"telegram_test2_{timestamp3}@example.com"
        user6_data["first_name"] = "User"
        user6_data["last_name"] = "Six"
        
        response6 = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/register/",
            json=user6_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Deuxieme utilisateur (meme telegram): {response6.status_code}")
        if response6.status_code == 201:
            print("INFO: Telegram username n'est pas unique (peut etre normal)")
        else:
            print("INFO: Telegram username est unique")

def test_email_sending():
    """Tester l'envoi d'emails d'activation"""
    
    print("\n=== TEST D'ENVOI D'EMAILS ===")
    
    # Créer un utilisateur pour tester l'email
    timestamp = int(time.time())
    test_user_data = {
        "username": f"email_test_{timestamp}",
        "email": f"email_test_{timestamp}@example.com",
        "password": "testpassword123",
        "first_name": "Email",
        "last_name": "Test",
        "phone": "+33444444444",
        "telegram_username": "@emailtest",
        "confirm_url": "https://calmnesstrading.vercel.app/verify-email"
    }
    
    print(f"Creation d'un utilisateur pour tester l'email: {test_user_data['email']}")
    
    response = requests.post(
        "https://calmnesstrading.onrender.com/api/auth/register/",
        json=test_user_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 201:
        print("Utilisateur cree avec succes")
        print("Un email d'activation devrait avoir ete envoye")
        print("Verifiez la console du serveur Render pour voir les logs d'envoi d'email")
        
        # Vérifier que l'utilisateur est inactif
        print("\nVerification du statut de l'utilisateur...")
        
        # Se connecter en tant qu'admin
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
            
            # Récupérer les utilisateurs
            users_response = requests.get(
                "https://calmnesstrading.onrender.com/api/auth/admin/users/",
                headers={
                    "Authorization": f"Bearer {admin_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if users_response.status_code == 200:
                users = users_response.json()
                test_user = None
                for user in users:
                    if user.get('email') == test_user_data['email']:
                        test_user = user
                        break
                
                if test_user:
                    print(f"Utilisateur trouve: {test_user.get('email')}")
                    print(f"   - Actif: {test_user.get('is_active')} (devrait etre False)")
                    print(f"   - Verifie: {test_user.get('is_verified')} (devrait etre False)")
                    
                    if not test_user.get('is_active') and not test_user.get('is_verified'):
                        print("SUCCESS: Utilisateur correctement inactif et non verifie")
                    else:
                        print("WARNING: Statut utilisateur inattendu")
                else:
                    print("ERROR: Utilisateur de test non trouve")
    else:
        print(f"ERROR: Echec de creation de l'utilisateur: {response.status_code}")
        try:
            error_data = response.json()
            print(f"Erreur: {error_data}")
        except:
            print(f"Reponse: {response.text}")

def main():
    """Fonction principale"""
    print("Test du systeme d'inscription et d'activation par email")
    print("=" * 60)
    
    test_email_uniqueness()
    test_email_sending()
    
    print("\n" + "=" * 60)
    print("Tests termines")
    print("\nRecommandations:")
    print("1. Verifiez les logs du serveur Render pour confirmer l'envoi d'emails")
    print("2. Testez manuellement l'activation via le lien dans l'email")
    print("3. Verifiez que les champs uniques fonctionnent comme attendu")

if __name__ == "__main__":
    main()
