#!/usr/bin/env python
"""
Script de configuration pour Chart Guru Prime
Ce script configure l'environnement et crée le compte admin par défaut
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_environment():
    """Configure les variables d'environnement par défaut"""
    env_vars = {
        'DJANGO_SECRET_KEY': 'django-insecure-change-me-in-production-12345',
        'DJANGO_DEBUG': 'True',
        'DJANGO_ALLOWED_HOSTS': 'localhost,127.0.0.1',
        'POSTGRES_DB': 'calmnessTrading',
        'POSTGRES_USER': 'calmnessAdmin',
        'POSTGRES_PASSWORD': 'calmness1234',
        'POSTGRES_HOST': 'localhost',
        'POSTGRES_PORT': '5432',
        'JWT_ACCESS_MINUTES': '60',
        'JWT_REFRESH_DAYS': '7',
        'CORS_ALLOWED_ORIGINS': 'http://127.0.0.1:5173,http://localhost:5173',
        'CORS_ALLOW_ALL': 'False',
        'EMAIL_BACKEND': 'django.core.mail.backends.console.EmailBackend',
        'EMAIL_HOST': '',
        'EMAIL_PORT': '587',
        'EMAIL_HOST_USER': '',
        'EMAIL_HOST_PASSWORD': '',
        'EMAIL_USE_TLS': 'True',
        'EMAIL_USE_SSL': 'False',
        'DEFAULT_FROM_EMAIL': 'admin@calmnessfi.com',
        'FRONTEND_BASE_URL': 'http://127.0.0.1:5173',
        'SITE_NAME': 'CALMNESS FI',
        'BRAND_COLOR': '#F5B301'
    }
    
    for key, value in env_vars.items():
        if key not in os.environ:
            os.environ[key] = value

def main():
    """Fonction principale de configuration"""
    print("🚀 Configuration de Chart Guru Prime...")
    
    # Configuration de l'environnement
    setup_environment()
    
    # Configuration de Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    
    try:
        # Créer les migrations
        print("📝 Création des migrations...")
        execute_from_command_line(['manage.py', 'makemigrations'])
        
        # Appliquer les migrations
        print("🗄️ Application des migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        # Créer le compte admin
        print("👤 Création du compte administrateur...")
        execute_from_command_line(['manage.py', 'create_admin'])
        
        print("✅ Configuration terminée avec succès!")
        print("\n📋 Informations de connexion admin:")
        print("   Email: admin@calmnessfi.com")
        print("   Mot de passe: calmness")
        print("\n🌐 Pour démarrer le serveur:")
        print("   python manage.py runserver")
        
    except Exception as e:
        print(f"❌ Erreur lors de la configuration: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
