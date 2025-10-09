@echo off
echo ========================================
echo  Calmness Trading - Telegram System
echo ========================================
echo.

REM Vérifier les variables d'environnement
echo [1/4] Verification de la configuration...
if "%TELEGRAM_BOT_TOKEN%"=="" (
    echo ERREUR: TELEGRAM_BOT_TOKEN non defini
    echo Veuillez configurer les variables d'environnement
    pause
    exit /b 1
)

if "%UPSTASH_REDIS_REST_URL%"=="" (
    echo ERREUR: UPSTASH_REDIS_REST_URL non defini
    echo Veuillez configurer les variables d'environnement
    pause
    exit /b 1
)

echo Configuration OK
echo.

REM Démarrer Celery Worker
echo [2/4] Demarrage de Celery Worker...
start "Celery Worker" cmd /k celery -A backend worker -l info --concurrency=2
timeout /t 3 >nul

REM Démarrer Celery Beat
echo [3/4] Demarrage de Celery Beat...
start "Celery Beat" cmd /k celery -A backend beat -l info
timeout /t 3 >nul

REM Démarrer le Bot Telegram
echo [4/4] Demarrage du Bot Telegram...
start "Telegram Bot" cmd /k python telegram_bot/bot.py
timeout /t 2 >nul

echo.
echo ========================================
echo  Systeme Telegram demarre avec succes!
echo ========================================
echo.
echo 3 fenetres ont ete ouvertes:
echo   - Celery Worker (taches)
echo   - Celery Beat (scheduler)
echo   - Telegram Bot
echo.
echo Fermez les fenetres pour arreter le systeme
echo.
pause

