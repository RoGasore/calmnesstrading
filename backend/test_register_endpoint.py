#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def test_register_endpoint():
    # Test data
    test_data = {
        'username': 'testuser456',
        'email': 'test456@example.com',
        'password': 'testpassword456',
        'first_name': 'Test',
        'last_name': 'User456',
        'phone': '',
        'telegram_username': ''
    }
    
    print("Testing registration endpoint locally...")
    print(f"Data: {test_data}")
    print()
    
    # Test local endpoint
    try:
        response = requests.post(
            'http://127.0.0.1:8000/api/auth/register/',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Local registration successful!")
        else:
            print("❌ Local registration failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to local server")
        print("Make sure the server is running with: python manage.py runserver")
    
    print("\n" + "="*50 + "\n")
    
    # Test production endpoint
    print("Testing registration endpoint on production...")
    
    try:
        response = requests.post(
            'https://calmnesstrading.onrender.com/api/auth/register/',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Production registration successful!")
        else:
            print("❌ Production registration failed!")
            
    except Exception as e:
        print(f"❌ Error testing production endpoint: {e}")

if __name__ == "__main__":
    test_register_endpoint()
