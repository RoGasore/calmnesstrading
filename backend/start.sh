#!/bin/bash
# Script de démarrage pour Render

# Exécuter les migrations
python manage.py migrate

# Créer un compte admin s'il n'existe pas
python manage.py create_admin

# Initialiser les pages CMS
python manage.py init_all_pages

# Initialiser le contenu CMS (formations, services, etc.)
python manage.py init_cms_content

# Initialiser les sections header et footer
python manage.py init_header_sections
python manage.py init_footer_sections

# Synchroniser les vraies données des services (formations, signaux, gestion)
python manage.py sync_real_data

# Initialiser les données de test pour les paiements
python manage.py init_test_payments

# Démarrer le serveur
python manage.py runserver 0.0.0.0:$PORT
