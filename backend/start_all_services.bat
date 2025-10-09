@echo off
cls
echo =========================================
echo   CALMNESS TRADING - Demarrage Complet
echo =========================================
echo.

REM Vérifier les variables d'environnement
echo [Config] Verification de la configuration...
if "%TELEGRAM_BOT_TOKEN%"=="" (
    echo ATTENTION: TELEGRAM_BOT_TOKEN non defini
    echo Le bot Telegram ne pourra pas demarrer
)

if "%UPSTASH_REDIS_REST_URL%"=="" (
    echo ATTENTION: UPSTASH_REDIS_REST_URL non defini
    echo Celery ne pourra pas demarrer
)

echo Configuration verifiee
echo.

REM Installation des dépendances
echo [Setup] Installation des dependances...
pip install -r requirements.txt
pip install -r requirements_telegram.txt 2>nul
echo Dependances installees
echo.

REM Appliquer les migrations
echo [Database] Application des migrations...
python manage.py migrate --noinput
echo Migrations appliquees
echo.

REM Créer les utilisateurs essentiels
echo [Users] Creation des utilisateurs systeme...
python manage.py sync_admin_user
python manage.py create_customer_service
python manage.py create_test_user
echo Utilisateurs crees
echo.

REM Créer l'offre de test 10 minutes
echo [Offer] Creation de l'offre de test 10 minutes...
python manage.py create_test_offer_10min
echo Offre de test creee
echo.

echo =========================================
echo   Lancement des Services
echo =========================================
echo.

REM Créer le dossier logs s'il n'existe pas
if not exist "logs" mkdir logs

REM Démarrer Django
echo [1/4] Demarrage de Django API...
start "Django API" cmd /k "python manage.py runserver 0.0.0.0:8000 2>&1 | tee logs/django.log"
timeout /t 3 >nul
echo Django demarre (http://localhost:8000)
echo.

REM Démarrer Celery Worker
echo [2/4] Demarrage de Celery Worker...
start "Celery Worker" cmd /k "celery -A backend worker -l info --concurrency=2 2>&1 | tee logs/celery_worker.log"
timeout /t 3 >nul
echo Celery Worker demarre
echo.

REM Démarrer Celery Beat
echo [3/4] Demarrage de Celery Beat...
start "Celery Beat" cmd /k "celery -A backend beat -l info 2>&1 | tee logs/celery_beat.log"
timeout /t 3 >nul
echo Celery Beat demarre
echo.

REM Démarrer le Bot Telegram
if not "%TELEGRAM_BOT_TOKEN%"=="" (
    echo [4/4] Demarrage du Bot Telegram...
    start "Telegram Bot" cmd /k "python telegram_bot/bot.py 2>&1 | tee logs/telegram_bot.log"
    timeout /t 2 >nul
    echo Bot Telegram demarre (@%TELEGRAM_BOT_USERNAME%)
) else (
    echo [4/4] Bot Telegram non demarre (token manquant)
)

echo.
echo =========================================
echo   TOUS LES SERVICES SONT DEMARRES !
echo =========================================
echo.
echo Services actifs:
echo   - Django API       : http://localhost:8000
echo   - Celery Worker    : Traitement des taches
echo   - Celery Beat      : Scheduler automatique
if not "%TELEGRAM_BOT_TOKEN%"=="" (
    echo   - Telegram Bot     : @%TELEGRAM_BOT_USERNAME%
)
echo.
echo Logs disponibles:
echo   - logs/django.log
echo   - logs/celery_worker.log
echo   - logs/celery_beat.log
if not "%TELEGRAM_BOT_TOKEN%"=="" (
    echo   - logs/telegram_bot.log
)
echo.
echo OFFRE DE TEST CREEE:
echo   Nom: Signal Demo 10min
echo   Prix: 1 EUR
echo   Duree: 10 minutes
echo   Revocation: Automatique apres 10 min
echo.
echo PRET POUR LE TEST:
echo   1. Admin: Creer l'offre si pas deja fait
echo   2. User: Acheter l'offre
echo   3. Service Client: Valider le paiement
echo   4. User: Cliquer sur le lien bot
echo   5. User: Rejoindre le canal
echo   6. Attendre 10 minutes pour revocation auto
echo.
echo Fermez les fenetres pour arreter les services
echo.
pause

