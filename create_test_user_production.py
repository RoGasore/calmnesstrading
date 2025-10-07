#!/usr/bin/env python3
"""
Script pour créer un utilisateur de test sur Render (Production)
Usage: python create_test_user_production.py
"""

import requests
import json
import sys

# Configuration
PRODUCTION_URL = "https://calmnesstrading.onrender.com"
ADMIN_EMAIL = "admin@calmnessfi.com"
ADMIN_PASSWORD = "calmness"

# Données de l'utilisateur de test
TEST_USER = {
    "username": "testuser",
    "email": "test@calmnessfi.com",
    "password": "Test123!",
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "+33612345678",
    "telegram_username": "@jeandupont"
}

def print_step(step, message):
    """Afficher une étape avec formatage"""
    print(f"\n{'='*60}")
    print(f"Étape {step}: {message}")
    print('='*60)

def main():
    print("\n🚀 Création d'un utilisateur de test sur Render (Production)")
    print(f"URL: {PRODUCTION_URL}")
    
    # Étape 1: Connexion admin
    print_step(1, "Connexion en tant qu'administrateur")
    
    try:
        login_response = requests.post(
            f"{PRODUCTION_URL}/api/auth/login/",
            json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            },
            timeout=30
        )
        
        if login_response.status_code != 200:
            print(f"❌ Erreur de connexion admin: {login_response.status_code}")
            print(f"Réponse: {login_response.text}")
            sys.exit(1)
        
        token = login_response.json().get('access')
        if not token:
            print("❌ Aucun token d'accès reçu")
            sys.exit(1)
        
        print("✅ Connexion admin réussie")
        print(f"Token reçu: {token[:20]}...")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        sys.exit(1)
    
    # Étape 2: Créer l'utilisateur
    print_step(2, "Création de l'utilisateur de test")
    
    try:
        create_response = requests.post(
            f"{PRODUCTION_URL}/api/auth/register/",
            json=TEST_USER,
            timeout=30
        )
        
        if create_response.status_code == 201:
            user_data = create_response.json()
            print("✅ Utilisateur créé avec succès")
            print(f"Données: {json.dumps(user_data, indent=2)}")
            user_id = user_data.get('user', {}).get('id')
        elif create_response.status_code == 400:
            # L'utilisateur existe peut-être déjà
            error_data = create_response.json()
            if 'email' in error_data and 'already exists' in str(error_data['email']).lower():
                print("⚠️  L'utilisateur existe déjà, récupération de l'ID...")
                
                # Récupérer la liste des utilisateurs pour trouver l'ID
                users_response = requests.get(
                    f"{PRODUCTION_URL}/api/auth/admin/users/",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    },
                    timeout=30
                )
                
                if users_response.status_code == 200:
                    users = users_response.json()
                    target_user = next((u for u in users if u.get('email') == TEST_USER['email']), None)
                    if target_user:
                        user_id = target_user['id']
                        print(f"✅ Utilisateur trouvé avec ID: {user_id}")
                    else:
                        print("❌ Utilisateur non trouvé dans la liste")
                        sys.exit(1)
                else:
                    print(f"❌ Erreur lors de la récupération des utilisateurs: {users_response.text}")
                    sys.exit(1)
            else:
                print(f"❌ Erreur de création: {create_response.text}")
                sys.exit(1)
        else:
            print(f"❌ Erreur de création: {create_response.status_code}")
            print(f"Réponse: {create_response.text}")
            sys.exit(1)
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la création: {e}")
        sys.exit(1)
    
    # Étape 3: Activer l'utilisateur
    print_step(3, "Activation de l'utilisateur")
    
    try:
        activate_response = requests.patch(
            f"{PRODUCTION_URL}/api/auth/admin/users/{user_id}/",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "is_active": True,
                "is_verified": True
            },
            timeout=30
        )
        
        if activate_response.status_code == 200:
            print("✅ Utilisateur activé avec succès")
            activated_user = activate_response.json()
            print(f"Données: {json.dumps(activated_user, indent=2)}")
        else:
            print(f"⚠️  Statut d'activation: {activate_response.status_code}")
            print(f"L'utilisateur peut déjà être activé. Réponse: {activate_response.text}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de l'activation: {e}")
        sys.exit(1)
    
    # Étape 4: Vérification de la connexion
    print_step(4, "Vérification de la connexion")
    
    try:
        test_login_response = requests.post(
            f"{PRODUCTION_URL}/api/auth/login/",
            json={
                "email": TEST_USER['email'],
                "password": TEST_USER['password']
            },
            timeout=30
        )
        
        if test_login_response.status_code == 200:
            print("✅ Connexion de test réussie")
            test_data = test_login_response.json()
            print(f"Token utilisateur reçu: {test_data.get('access', '')[:20]}...")
        else:
            print(f"⚠️  Échec de la connexion de test: {test_login_response.status_code}")
            print(f"Réponse: {test_login_response.text}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la vérification: {e}")
    
    # Résumé final
    print("\n" + "="*60)
    print("🎉 CRÉATION TERMINÉE")
    print("="*60)
    print(f"\n📧 Email: {TEST_USER['email']}")
    print(f"🔑 Mot de passe: {TEST_USER['password']}")
    print(f"👤 Nom: {TEST_USER['first_name']} {TEST_USER['last_name']}")
    print(f"📱 Téléphone: {TEST_USER['phone']}")
    print(f"💬 Telegram: {TEST_USER['telegram_username']}")
    print(f"\n🌐 URL de connexion: https://calmnesstrading.vercel.app")
    print("\n✅ Vous pouvez maintenant vous connecter avec ces identifiants!")

if __name__ == "__main__":
    main()

