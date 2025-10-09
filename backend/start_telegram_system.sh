#!/bin/bash

echo "🚀 Démarrage du système Telegram Calmness Trading..."

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier les variables d'environnement
echo -e "${YELLOW}📋 Vérification de la configuration...${NC}"

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${RED}❌ TELEGRAM_BOT_TOKEN non défini${NC}"
    exit 1
fi

if [ -z "$UPSTASH_REDIS_REST_URL" ]; then
    echo -e "${RED}❌ UPSTASH_REDIS_REST_URL non défini${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuration OK${NC}"

# Fonction pour arrêter proprement les processus
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt du système...${NC}"
    kill $CELERY_WORKER_PID $CELERY_BEAT_PID $BOT_PID 2>/dev/null
    echo -e "${GREEN}✅ Système arrêté${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Démarrer Celery Worker
echo -e "${YELLOW}🔧 Démarrage de Celery Worker...${NC}"
celery -A backend worker -l info --concurrency=2 &
CELERY_WORKER_PID=$!
echo -e "${GREEN}✅ Celery Worker démarré (PID: $CELERY_WORKER_PID)${NC}"

# Attendre un peu
sleep 2

# Démarrer Celery Beat
echo -e "${YELLOW}⏰ Démarrage de Celery Beat...${NC}"
celery -A backend beat -l info &
CELERY_BEAT_PID=$!
echo -e "${GREEN}✅ Celery Beat démarré (PID: $CELERY_BEAT_PID)${NC}"

# Attendre un peu
sleep 2

# Démarrer le Bot Telegram
echo -e "${YELLOW}🤖 Démarrage du Bot Telegram...${NC}"
python telegram_bot/bot.py &
BOT_PID=$!
echo -e "${GREEN}✅ Bot Telegram démarré (PID: $BOT_PID)${NC}"

echo -e "\n${GREEN}🎉 Système Telegram démarré avec succès!${NC}"
echo -e "${YELLOW}📊 Processus en cours:${NC}"
echo -e "   • Celery Worker: PID $CELERY_WORKER_PID"
echo -e "   • Celery Beat: PID $CELERY_BEAT_PID"
echo -e "   • Bot Telegram: PID $BOT_PID"
echo -e "\n${YELLOW}💡 Appuyez sur Ctrl+C pour arrêter le système${NC}\n"

# Attendre que les processus se terminent
wait

