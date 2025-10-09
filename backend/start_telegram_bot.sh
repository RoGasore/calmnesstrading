#!/bin/bash

# Script de démarrage pour le Bot Telegram (Render Background Worker)
echo "🤖 Démarrage du Bot Telegram..."

# Installer les dépendances
if [ -f "requirements.txt" ]; then
    echo "📦 Installation des dépendances..."
    pip install -r requirements.txt
    pip install -r requirements_telegram.txt
fi

# Appliquer les migrations (au cas où)
echo "🗄️  Vérification des migrations..."
python manage.py migrate --noinput

# Démarrer le Bot Telegram
echo "🚀 Lancement du Bot Telegram..."
python telegram_bot/bot.py

