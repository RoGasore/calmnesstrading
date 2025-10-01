#!/bin/bash
# Script de démarrage pour Render

# Exécuter les migrations
python manage.py migrate

# Initialiser les pages CMS
python manage.py init_all_pages

# Démarrer le serveur
python manage.py runserver 0.0.0.0:$PORT
