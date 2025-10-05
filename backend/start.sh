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
    echo "📦 Installation des dépendances..."
    pip install -r requirements.txt
fi

# Appliquer les migrations
echo "🗄️  Application des migrations..."
python manage.py migrate --noinput

# Collecter les fichiers statiques
echo "📁 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# Note: Aucune modification de la base de données lors du redémarrage
# Les données CMS sont gérées via l'interface d'administration

# Démarrer l'application
echo "🌐 Démarrage du serveur..."
python manage.py runserver 0.0.0.0:$PORT