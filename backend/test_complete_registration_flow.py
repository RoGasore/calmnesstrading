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

from django.contrib.auth import get_user_model
from accounts.models import EmailVerificationToken

User = get_user_model()

def test_complete_registration_flow():
    """Test du processus complet d'inscription et d'activation"""
    
    print("=== TEST DU PROCESSUS COMPLET D'INSCRIPTION ===")
    
    # 1. Inscription
    test_email = f"test_flow_{int(time.time())}@example.com"
    registration_data = {
        "username": f"test_flow_{int(time.time())}",
        "email": test_email,
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "Flow",
        "phone": "+33123456789",
        "telegram_username": "@testflow",
        "confirm_url": "https://calmnesstrading.vercel.app/verify-email"
    }
    
    print(f"\n1. INSCRIPTION de {test_email}")
    print(f"Donnees: {json.dumps(registration_data, indent=2)}")
    
    try:
        reg_response = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/register/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Reponse: {reg_response.status_code}")
        if reg_response.text:
            reg_data = reg_response.json()
            print(f"Donnees: {json.dumps(reg_data, indent=2)}")
        
        if reg_response.status_code != 201:
            print("ERREUR: Inscription echouee")
            return False
            
    except Exception as e:
        print(f"ERREUR lors de l'inscription: {e}")
        return False
    
    print("✅ Inscription reussie")
    
    # 2. Vérifier que l'utilisateur est créé mais inactif
    print(f"\n2. VERIFICATION de l'utilisateur {test_email}")
    
    try:
        # Connexion admin pour vérifier
        login_data = {
            "email": "admin@calmness.com",
            "password": "calmness"
        }
        
        login_response = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code != 200:
            print("ERREUR: Impossible de se connecter en admin")
            return False
        
        access_token = login_response.json().get('access')
        
        # Récupérer la liste des utilisateurs
        users_response = requests.get(
            "https://calmnesstrading.onrender.com/api/auth/admin/users/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if users_response.status_code != 200:
            print("ERREUR: Impossible de recuperer les utilisateurs")
            return False
        
        users = users_response.json()
        target_user = None
        
        for user in users:
            if user.get('email') == test_email:
                target_user = user
                break
        
        if not target_user:
            print("ERREUR: Utilisateur non trouve apres inscription")
            return False
        
        print(f"Utilisateur trouve: {target_user.get('username')}")
        print(f"Statut: Actif={target_user.get('is_active')}, Verifie={target_user.get('is_verified')}")
        
        if target_user.get('is_active') or target_user.get('is_verified'):
            print("ERREUR: Utilisateur devrait etre inactif et non verifie")
            return False
        
        print("✅ Utilisateur correctement cree (inactif, non verifie)")
        
    except Exception as e:
        print(f"ERREUR lors de la verification: {e}")
        return False
    
    # 3. Test de connexion (devrait échouer)
    print(f"\n3. TEST DE CONNEXION (devrait echouer)")
    
    try:
        login_attempt = {
            "email": test_email,
            "password": "testpassword123"
        }
        
        login_response = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/login/",
            json=login_attempt,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Reponse connexion: {login_response.status_code}")
        
        if login_response.status_code == 200:
            print("ERREUR: La connexion ne devrait pas reussir")
            return False
        
        error_data = login_response.json()
        print(f"Erreur attendue: {error_data.get('detail', 'Inconnue')}")
        
        if "non vérifié" not in error_data.get('detail', '').lower():
            print("ERREUR: Mauvaise erreur de connexion")
            return False
        
        print("✅ Connexion correctement bloquee (email non verifie)")
        
    except Exception as e:
        print(f"ERREUR lors du test de connexion: {e}")
        return False
    
    # 4. Simulation d'activation (via token)
    print(f"\n4. SIMULATION D'ACTIVATION")
    
    try:
        # Récupérer le token d'activation depuis la base locale (pour simulation)
        # En production, ce token serait dans l'email
        user_local = User.objects.filter(email=test_email).first()
        if user_local:
            token_obj = EmailVerificationToken.objects.filter(user=user_local, is_used=False).first()
            if token_obj:
                activation_token = token_obj.token
                print(f"Token trouve: {activation_token[:10]}...")
                
                # Activer via l'API
                activation_response = requests.get(
                    f"https://calmnesstrading.onrender.com/api/auth/activate/?token={activation_token}",
                    headers={"Content-Type": "application/json"}
                )
                
                print(f"Reponse activation: {activation_response.status_code}")
                
                if activation_response.status_code == 200:
                    activation_data = activation_response.json()
                    print(f"Activation reussie: {activation_data.get('detail')}")
                    print("✅ Activation reussie")
                else:
                    error_data = activation_response.json()
                    print(f"ERREUR activation: {error_data.get('detail')}")
                    return False
            else:
                print("ERREUR: Aucun token d'activation trouve")
                return False
        else:
            print("ERREUR: Utilisateur non trouve en base locale")
            return False
            
    except Exception as e:
        print(f"ERREUR lors de l'activation: {e}")
        return False
    
    # 5. Test de connexion après activation (devrait réussir)
    print(f"\n5. TEST DE CONNEXION APRES ACTIVATION")
    
    try:
        login_attempt = {
            "email": test_email,
            "password": "testpassword123"
        }
        
        login_response = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/login/",
            json=login_attempt,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Reponse connexion: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            print(f"Connexion reussie!")
            print(f"Utilisateur: {login_data.get('user', {}).get('email')}")
            print("✅ Connexion reussie apres activation")
        else:
            error_data = login_response.json()
            print(f"ERREUR connexion: {error_data.get('detail')}")
            return False
        
    except Exception as e:
        print(f"ERREUR lors du test de connexion finale: {e}")
        return False
    
    print(f"\n🎉 PROCESSUS COMPLET VALIDE!")
    print(f"L'utilisateur {test_email} peut maintenant se connecter normalement.")
    
    return True

if __name__ == "__main__":
    success = test_complete_registration_flow()
    
    if success:
        print("\n✅ TOUS LES TESTS SONT PASSES")
        print("Le processus d'inscription et d'activation fonctionne correctement!")
    else:
        print("\n❌ CERTAINS TESTS ONT ECHOUE")
        print("Veuillez verifier la configuration.")
