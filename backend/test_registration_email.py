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

def test_registration_email():
    """Tester l'inscription et l'envoi d'email d'activation"""
    
    print("Test d'inscription avec envoi d'email...")
    
    # Donnees de test
    timestamp = int(time.time())
    test_email = f"test_registration_{timestamp}@example.com"
    test_username = f"test_user_{timestamp}"
    
    registration_data = {
        "username": test_username,
        "email": test_email,
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+33123456789",
        "telegram_username": "@testuser",
        "confirm_url": "https://calmnesstrading.vercel.app/verify-email"
    }
    
    print(f"Tentative d'inscription pour: {test_email}")
    
    try:
        # Test d'inscription
        response = requests.post(
            "https://calmnesstrading.onrender.com/api/auth/register/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Reponse HTTP: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.text:
            try:
                response_data = response.json()
                print(f"Reponse JSON: {json.dumps(response_data, indent=2)}")
            except:
                print(f"Reponse texte: {response.text}")
        else:
            print("Reponse vide")
        
        if response.status_code == 201:
            print("SUCCESS: Inscription reussie")
            print("Verifiez si l'email d'activation a ete envoye...")
        else:
            print("ERREUR: Inscription echouee")
            
    except Exception as e:
        print(f"ERREUR lors de la requete: {e}")

if __name__ == "__main__":
    test_registration_email()
