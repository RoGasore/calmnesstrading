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
from accounts.models import EmailVerificationToken

User = get_user_model()

def test_registration():
    """Test de l'inscription via l'API"""
    
    # Données de test
    test_data = {
        "username": "test_user_1234",
        "email": "test@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+33123456789",
        "telegram_username": "@testuser",
        "confirm_url": "https://calmnesstrading.vercel.app/api/auth/activate/"
    }
    
    print("Test d'inscription...")
    print(f"Donnees envoyees: {json.dumps(test_data, indent=2)}")
    
    # Test via l'API
    try:
        response = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/register/",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nReponse HTTP: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.text:
            try:
                response_data = response.json()
                print(f"Reponse JSON: {json.dumps(response_data, indent=2)}")
            except:
                print(f"Reponse texte: {response.text}")
        else:
            print("Reponse vide")
            
    except Exception as e:
        print(f"Erreur lors de la requete: {e}")
    
    # Verifier en base
    print(f"\nVerification en base de donnees...")
    try:
        user = User.objects.filter(email="test@example.com").first()
        if user:
            print(f"Utilisateur trouve: {user.username} ({user.email})")
            print(f"   - Actif: {user.is_active}")
            print(f"   - Verifie: {user.is_verified}")
            print(f"   - Cree: {user.date_joined}")
            
            # Verifier le token
            token = EmailVerificationToken.objects.filter(user=user).first()
            if token:
                print(f"Token trouve: {token.token[:10]}...")
                print(f"   - Expire: {token.expires_at}")
                print(f"   - Utilise: {token.is_used}")
            else:
                print("Aucun token trouve")
        else:
            print("Utilisateur non trouve")
            
    except Exception as e:
        print(f"Erreur lors de la verification: {e}")

if __name__ == "__main__":
    test_registration()
