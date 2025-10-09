#!/bin/bash

echo "========================================="
echo "  CALMNESS TRADING - Démarrage Complet  "
echo "========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier les variables d'environnement essentielles
echo -e "${YELLOW}📋 Vérification de la configuration...${NC}"

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${RED}❌ TELEGRAM_BOT_TOKEN non défini${NC}"
    echo -e "${YELLOW}⚠️  Le bot Telegram ne pourra pas démarrer${NC}"
fi

if [ -z "$UPSTASH_REDIS_REST_URL" ]; then
    echo -e "${RED}❌ UPSTASH_REDIS_REST_URL non défini${NC}"
    echo -e "${YELLOW}⚠️  Celery ne pourra pas démarrer${NC}"
fi

echo -e "${GREEN}✅ Configuration vérifiée${NC}"
echo ""

# Installation des dépendances
echo -e "${BLUE}📦 Installation des dépendances...${NC}"
pip install -r requirements.txt
pip install -r requirements_telegram.txt 2>/dev/null || echo "⚠️  requirements_telegram.txt non trouvé"
echo -e "${GREEN}✅ Dépendances installées${NC}"
echo ""

# Appliquer les migrations
echo -e "${BLUE}🗄️  Application des migrations...${NC}"
python manage.py migrate --noinput
echo -e "${GREEN}✅ Migrations appliquées${NC}"
echo ""

# Créer les utilisateurs essentiels
echo -e "${BLUE}👤 Création des utilisateurs système...${NC}"
python manage.py sync_admin_user
python manage.py create_customer_service
python manage.py create_test_user
echo -e "${GREEN}✅ Utilisateurs créés${NC}"
echo ""

# Créer l'offre de test 10 minutes
echo -e "${BLUE}🎯 Création de l'offre de test 10 minutes...${NC}"
python manage.py create_test_offer_10min
echo -e "${GREEN}✅ Offre de test créée${NC}"
echo ""

# Fonction pour arrêter proprement les processus
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt de tous les services...${NC}"
    kill $DJANGO_PID $CELERY_WORKER_PID $CELERY_BEAT_PID $BOT_PID 2>/dev/null
    echo -e "${GREEN}✅ Tous les services arrêtés${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Lancement des Services                ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# 1. Démarrer Django
echo -e "${BLUE}[1/4] 🌐 Démarrage de Django...${NC}"
python manage.py runserver 0.0.0.0:8000 > logs/django.log 2>&1 &
DJANGO_PID=$!
echo -e "${GREEN}✅ Django démarré (PID: $DJANGO_PID)${NC}"
echo -e "   📍 URL: http://localhost:8000"
sleep 3

# 2. Démarrer Celery Worker
echo -e "${BLUE}[2/4] 🔧 Démarrage de Celery Worker...${NC}"
celery -A backend worker -l info --concurrency=2 > logs/celery_worker.log 2>&1 &
CELERY_WORKER_PID=$!
echo -e "${GREEN}✅ Celery Worker démarré (PID: $CELERY_WORKER_PID)${NC}"
sleep 3

# 3. Démarrer Celery Beat
echo -e "${BLUE}[3/4] ⏰ Démarrage de Celery Beat (Scheduler)...${NC}"
celery -A backend beat -l info > logs/celery_beat.log 2>&1 &
CELERY_BEAT_PID=$!
echo -e "${GREEN}✅ Celery Beat démarré (PID: $CELERY_BEAT_PID)${NC}"
sleep 3

# 4. Démarrer le Bot Telegram
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${BLUE}[4/4] 🤖 Démarrage du Bot Telegram...${NC}"
    python telegram_bot/bot.py > logs/telegram_bot.log 2>&1 &
    BOT_PID=$!
    echo -e "${GREEN}✅ Bot Telegram démarré (PID: $BOT_PID)${NC}"
    echo -e "   📍 Bot: @$TELEGRAM_BOT_USERNAME"
else
    echo -e "${YELLOW}[4/4] ⚠️  Bot Telegram non démarré (TELEGRAM_BOT_TOKEN manquant)${NC}"
    BOT_PID=""
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  🎉 TOUS LES SERVICES SONT DÉMARRÉS ! ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}📊 Services actifs:${NC}"
echo -e "   🌐 Django API       : PID $DJANGO_PID → http://localhost:8000"
echo -e "   🔧 Celery Worker    : PID $CELERY_WORKER_PID"
echo -e "   ⏰ Celery Beat      : PID $CELERY_BEAT_PID"
if [ -n "$BOT_PID" ]; then
    echo -e "   🤖 Telegram Bot     : PID $BOT_PID → @$TELEGRAM_BOT_USERNAME"
fi
echo ""
echo -e "${YELLOW}📝 Logs disponibles:${NC}"
echo -e "   tail -f logs/django.log"
echo -e "   tail -f logs/celery_worker.log"
echo -e "   tail -f logs/celery_beat.log"
if [ -n "$BOT_PID" ]; then
    echo -e "   tail -f logs/telegram_bot.log"
fi
echo ""
echo -e "${GREEN}🧪 OFFRE DE TEST CRÉÉE:${NC}"
echo -e "   Nom: Signal Demo 10min"
echo -e "   Prix: 1€"
echo -e "   Durée: 10 minutes"
echo -e "   Révocation: Automatique après 10 min"
echo ""
echo -e "${GREEN}🚀 PRÊT POUR LE TEST:${NC}"
echo -e "   1. Admin: Créer l'offre si pas déjà fait"
echo -e "   2. User: Acheter l'offre"
echo -e "   3. Service Client: Valider le paiement"
echo -e "   4. User: Cliquer sur le lien bot"
echo -e "   5. User: Rejoindre le canal"
echo -e "   6. Attendre 10 minutes → Révocation auto"
echo ""
echo -e "${YELLOW}💡 Appuyez sur Ctrl+C pour arrêter tous les services${NC}"
echo ""

# Attendre que les processus se terminent
wait

