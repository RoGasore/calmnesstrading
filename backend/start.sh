#!/bin/bash

# Script de démarrage pour Render
echo "🚀 Démarrage de l'application Django..."

# Activer l'environnement virtuel s'il existe
if [ -d "venv" ]; then
    echo "📦 Activation de l'environnement virtuel..."
    source venv/bin/activate
fi

# Installer les dépendances si requirements.txt existe
if [ -f "requirements.txt" ]; then
    echo "📦 Installation des dépendances principales..."
    pip install -r requirements.txt
fi

# Installer les dépendances Telegram et Celery (système d'accès canal)
if [ -f "requirements_telegram.txt" ]; then
    echo "🤖 Installation des dépendances Telegram et Celery..."
    pip install -r requirements_telegram.txt
fi

# Installer les dépendances Analytics (si présentes)
if [ -f "requirements_analytics.txt" ]; then
    echo "📊 Installation des dépendances Analytics..."
    pip install -r requirements_analytics.txt
fi

# Appliquer les migrations
echo "🗄️  Application des migrations..."
python manage.py migrate --noinput

# Collecter les fichiers statiques
echo "📁 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# Initialiser les données CMS (essentiel pour le fonctionnement)
echo "🏗️  Initialisation des données CMS..."
python manage.py init_production_cms

# Synchroniser l'utilisateur admin (essentiel pour l'accès admin)
echo "👤 Synchronisation de l'utilisateur admin..."
python manage.py sync_admin_user

# Créer l'utilisateur service client (essentiel pour la gestion des paiements)
echo "🛟 Création de l'utilisateur service client..."
python manage.py create_customer_service

# Créer l'utilisateur de test (pour le développement)
echo "👥 Création de l'utilisateur de test..."
python manage.py create_test_user

# Note: Les données CMS sont gérées via l'interface d'administration

# Démarrer l'application
echo "🌐 Démarrage du serveur..."
python manage.py runserver 0.0.0.0:$PORT