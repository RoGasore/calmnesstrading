#!/bin/bash

# Script de démarrage pour Celery Worker (Render Background Worker)
echo "🔧 Démarrage de Celery Worker..."

# Installer les dépendances
if [ -f "requirements.txt" ]; then
    echo "📦 Installation des dépendances..."
    pip install -r requirements.txt
    pip install -r requirements_telegram.txt
fi

# Appliquer les migrations (au cas où)
echo "🗄️  Vérification des migrations..."
python manage.py migrate --noinput

# Démarrer Celery Worker
echo "🚀 Lancement de Celery Worker..."
celery -A backend worker -l info --concurrency=2

