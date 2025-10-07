# 📊 Guide de Configuration Analytics Avancées

## Vue d'ensemble

Le système analytics de Calmness Trading fournit des analyses en temps réel sur :
- 📈 **Performances de trading** (TP, SL, pips, profits)
- 👥 **Comportement des visiteurs** (pages vues, sessions, conversions)
- 🏆 **Classement des traders** (ranking dynamique basé sur performances)
- 🌍 **Données démographiques** (âge, genre, localisation)
- 📊 **Entonnoir de conversion** (parcours utilisateur)

---

## 🚀 Installation Backend

### 1. Ajouter l'app dans settings.py

```python
# backend/calmnesstrading/settings.py

INSTALLED_APPS = [
    # ... apps existantes
    'analytics',
    # ... 
]
```

### 2. Créer les migrations

```bash
cd backend
python manage.py makemigrations analytics
python manage.py migrate analytics
```

### 3. Inclure les URLs

```python
# backend/calmnesstrading/urls.py

from django.urls import path, include

urlpatterns = [
    # ... autres URLs
    path('', include('analytics.urls')),
]
```

### 4. Configuration optionnelle pour IP tracking

Pour activer la géolocalisation automatique par IP, installer :

```bash
pip install requests
```

La géolocalisation utilise l'API gratuite ipapi.co (jusqu'à 30 000 requêtes/mois).

---

## 📡 API Endpoints Disponibles

### Analytics Générales
- `GET /api/analytics/overview/?period=7days` - Vue d'ensemble
- `GET /api/analytics/traffic/?period=7days` - Sources de trafic
- `GET /api/analytics/pages/?period=7days` - Performance des pages

### Trading Analytics
- `GET /api/analytics/trading/overview/?period=7days` - Stats trading globales
- `GET /api/analytics/trading/rankings/?limit=10` - Top traders
- `GET /api/analytics/trading/details/?period=7days` - Analyses détaillées

### Démographie
- `GET /api/analytics/demographics/` - Analyses démographiques

### Conversions
- `GET /api/analytics/conversions/funnel/?period=7days` - Entonnoir

**Paramètres de période** : `today`, `7days`, `30days`, `90days`, `year`

---

## 🎨 Interface Admin

### Accès
Naviguez vers `/admin/analytics` pour accéder au dashboard complet.

### Fonctionnalités

#### Onglet Vue d'ensemble
- 8 métriques principales avec indicateurs de croissance
- Entonnoir de conversion visuel
- Comparaison période précédente

#### Onglet Trading
- Statistiques globales (trades, win rate, profit factor)
- Pips gagnés/perdus, TP/SL
- **Top 10 Traders** avec podium (🥇 🥈 🥉)
- Métriques : ranking_score, profit net, pips, séries

#### Onglet Trafic
- Répartition par appareil (Desktop, Mobile, Tablet)
- Top 10 pays avec pourcentages
- Sources UTM

#### Onglet Comportement
- Pages populaires avec métriques complètes
- Temps moyen, taux de rebond par page
- Visiteurs uniques

#### Onglet Démographie
- Répartition par genre, âge, expérience
- Performance moyenne par démographie
- Corrélations avec succès trading

---

## 🔄 Mise à Jour Automatique des Métriques

### Calcul des performances trading

Pour recalculer les performances d'un trader :

```python
from analytics.models import TradingPerformance
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(email='trader@example.com')

perf, created = TradingPerformance.objects.get_or_create(user=user)
perf.calculate_all_metrics()  # Recalcule tout
```

### Mise à jour du classement global

```python
from analytics.models import TradingPerformance

# Met à jour le ranking de tous les traders
TradingPerformance.update_global_rankings()
```

### Génération des résumés quotidiens

```python
from analytics.models import AnalyticsSummary
from datetime import date

# Générer le résumé pour aujourd'hui
summary = AnalyticsSummary.generate_for_date(date.today())
```

---

## ⚙️ Tâches Programmées (Recommandé)

Pour automatiser les mises à jour, configurez Celery ou cron jobs :

### Exemple avec Celery

```python
# backend/calmnesstrading/celery.py

from celery import shared_task
from analytics.models import TradingPerformance, AnalyticsSummary
from datetime import date, timedelta

@shared_task
def update_trading_rankings():
    """Exécuter toutes les heures"""
    TradingPerformance.update_global_rankings()

@shared_task
def generate_daily_summary():
    """Exécuter à minuit"""
    yesterday = date.today() - timedelta(days=1)
    AnalyticsSummary.generate_for_date(yesterday)
```

### Exemple avec Cron (Linux)

```bash
# Exécuter tous les jours à minuit
0 0 * * * cd /path/to/backend && python manage.py shell -c "from analytics.models import AnalyticsSummary; from datetime import date, timedelta; AnalyticsSummary.generate_for_date(date.today() - timedelta(days=1))"

# Exécuter toutes les heures
0 * * * * cd /path/to/backend && python manage.py shell -c "from analytics.models import TradingPerformance; TradingPerformance.update_global_rankings()"
```

---

## 📊 Métriques Calculées

### TradingPerformance

| Métrique | Calcul | Description |
|----------|--------|-------------|
| `win_rate` | (winning_trades / total_trades) × 100 | Pourcentage de trades gagnants |
| `profit_factor` | total_profit / total_loss | Ratio profit/perte (> 1 = profitable) |
| `risk_reward_ratio` | average_win / average_loss | Ratio gain moyen / perte moyenne |
| `tp_hit_rate` | (tp_hit_count / trades_with_tp) × 100 | % de TP atteints |
| `ranking_score` | (net_profit × 0.4) + (net_pips × 0.3) + (win_rate × 10) + (profit_factor × 50) | Score global pour classement |

### Séries de Victoires/Défaites

Le système track automatiquement :
- `max_consecutive_wins` : Plus longue série de victoires
- `max_consecutive_losses` : Plus longue série de défaites  
- `current_streak` : Série actuelle en cours
- `current_streak_type` : 'win' ou 'loss'

---

## 🎯 Système de Ranking

### Calcul du Score

Le `ranking_score` est calculé avec une formule pondérée :

```
score = (profit_net × 0.4) + (pips_net × 0.3) + (win_rate × 10) + (profit_factor × 50)
```

### Classement Global

Les traders sont classés par `ranking_score` décroissant.
Le `global_rank` est automatiquement assigné (1 = meilleur trader).

### Critères d'Éligibilité

Un trader doit avoir au moins **5 trades** pour apparaître dans le classement.

---

## 👥 Données Démographiques

### Champs Collectés (Optionnels)

- **Genre** : Homme, Femme, Autre, Préfère ne pas dire
- **Tranche d'âge** : 18-24, 25-34, 35-44, 45-54, 55-64, 65+
- **Localisation** : Pays, région, ville (auto-rempli via IP)
- **Expérience trading** : Débutant, Intermédiaire, Avancé, Expert
- **Années d'expérience** : Nombre d'années

### Ajouter au Profil Utilisateur

Ces données peuvent être collectées via un formulaire dans `UserProfile` :

```typescript
// frontend/src/pages/user/UserProfile.tsx

const demographicFields = [
  {
    label: "Genre",
    name: "gender",
    options: [
      { value: "M", label: "Homme" },
      { value: "F", label: "Femme" },
      { value: "O", label: "Autre" },
      { value: "N", label: "Préfère ne pas dire" }
    ]
  },
  {
    label: "Tranche d'âge",
    name: "age_range",
    options: [
      { value: "18-24", label: "18-24 ans" },
      { value: "25-34", label: "25-34 ans" },
      { value: "35-44", label: "35-44 ans" },
      // ...
    ]
  }
];
```

---

## 🔐 Sécurité

### Permissions

Toutes les routes analytics sont protégées par `@permission_classes([IsAdminUser])`.

Seuls les administrateurs peuvent :
- Voir les analytics globales
- Accéder au classement des traders
- Consulter les données démographiques agrégées

### Confidentialité

Les données personnelles ne sont **jamais** exposées dans les APIs publiques :
- Les noms des traders sont visibles uniquement dans le top 10
- Les IPs sont stockées mais pas exposées via API
- Les données démographiques sont agrégées (comptages uniquement)

---

## 🎨 Couleurs du Design

### Palette Gold/Noir/Blanc

```typescript
const COLORS = {
  gold: '#D4AF37',        // Gold principal
  goldHover: '#C5A028',   // Gold au survol
  goldLight: '#F4E5B8',   // Gold clair
  black: '#000000',       // Noir
  grayDark: '#1F1F1F',    // Gris foncé
  grayMedium: '#6B6B6B',  // Gris moyen
  grayLight: '#E5E5E5',   // Gris clair
  white: '#FFFFFF',       // Blanc
};
```

### Utilisation

- **Icônes principales** : `gold` (#D4AF37)
- **Boutons primaires** : fond `gold`, texte `black`
- **Badges** : fond `gold` 20% opacité, texte `gold`
- **Podium** : 🥇 gold, 🥈 silver (#C0C0C0), 🥉 bronze (#CD7F32)

---

## 📈 Optimisation

### Index de Base de Données

Les modèles incluent des index sur :
- `created_at`, `start_time` pour les requêtes temporelles
- `session_id`, `user` pour les jointures
- `country`, `device_type` pour les agrégations

### Résumés Quotidiens

`AnalyticsSummary` pré-calcule les métriques quotidiennes pour :
- Réduire la charge sur la base de données
- Accélérer l'affichage des tendances
- Permettre des comparaisons historiques rapides

---

## 🐛 Debugging

### Vérifier les données

```python
# Dans Django shell
python manage.py shell

from analytics.models import PageView, TradingPerformance

# Compter les page views
PageView.objects.count()

# Voir le top trader
TradingPerformance.objects.first()

# Vérifier le ranking
for perf in TradingPerformance.objects.all()[:5]:
    print(f"{perf.global_rank}. {perf.user.email} - Score: {perf.ranking_score}")
```

### Logs

Activer les logs pour analytics :

```python
# settings.py
LOGGING = {
    'loggers': {
        'analytics': {
            'level': 'DEBUG',
            'handlers': ['console'],
        }
    }
}
```

---

## 📚 Ressources

- **Modèles** : `backend/analytics/models.py`
- **Vues API** : `backend/analytics/views.py`
- **URLs** : `backend/analytics/urls.py`
- **Interface Admin** : `frontend/src/components/admin/AnalyticsPageNew.tsx`

---

**Système créé avec ❤️ pour Calmness Trading**  
Version 2.0.0 - Octobre 2024
