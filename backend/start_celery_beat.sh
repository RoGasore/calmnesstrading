#!/bin/bash

# Script de démarrage pour Celery Beat (Render Background Worker)
echo "⏰ Démarrage de Celery Beat..."

# Installer les dépendances
if [ -f "requirements.txt" ]; then
    echo "📦 Installation des dépendances..."
    pip install -r requirements.txt
    pip install -r requirements_telegram.txt
fi

# Appliquer les migrations (au cas où)
echo "🗄️  Vérification des migrations..."
python manage.py migrate --noinput

# Démarrer Celery Beat
echo "🚀 Lancement de Celery Beat (Scheduler)..."
celery -A backend beat -l info

