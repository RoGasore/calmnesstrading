#!/usr/bin/env python
"""
Script de vérification des endpoints API
"""
import os
import sys
import django
from django.conf import settings
from django.core.wsgi import get_wsgi_application

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.urls import reverse, NoReverseMatch
from django.test import Client

def check_endpoints():
    client = Client()
    
    # Endpoints à vérifier
    endpoints = [
        '/api/content/comprehensive-cms/public/global-settings/',
        '/api/content/comprehensive-cms/public/pages/header/',
        '/api/content/comprehensive-cms/public/pages/footer/',
        '/api/content/comprehensive-cms/public/pages/home/content-blocks/',
        '/api/content/comprehensive-cms/public/faq/',
        '/api/content/comprehensive-cms/public/testimonials/',
        '/api/content/comprehensive-cms/reviews/public/',
        '/api/content/comprehensive-cms/services-for-reviews/',
    ]
    
    print("=== Vérification des endpoints ===\n")
    
    for endpoint in endpoints:
        try:
            response = client.get(endpoint)
            status = "✅ OK" if response.status_code == 200 else f"❌ {response.status_code}"
            print(f"{endpoint:<60} {status}")
        except Exception as e:
            print(f"{endpoint:<60} ❌ ERROR: {e}")
    
    print("\n=== Configuration Django ===")
    print(f"DEBUG: {settings.DEBUG}")
    print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
    print(f"CORS_ALLOWED_ORIGINS: {getattr(settings, 'CORS_ALLOWED_ORIGINS', 'Non défini')}")

if __name__ == '__main__':
    check_endpoints()
