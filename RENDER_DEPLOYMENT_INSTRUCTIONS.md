# 🚀 Instructions de Redéploiement Render

## ⚠️ Action Immédiate Requise

Le backend doit être redéployé sur Render pour que les nouveaux endpoints fonctionnent.

---

## 📋 **Nouveaux Endpoints à Déployer**

### Payments
- `POST /api/payments/{id}/submit-transaction/` - Soumission ID transaction
- Modification de `POST /api/payments/pending-payments/create/` - Retourne objet complet

### Analytics
- `GET /api/analytics/overview/`
- `GET /api/analytics/traffic/`
- `GET /api/analytics/pages/`
- `GET /api/analytics/trading/overview/`
- `GET /api/analytics/trading/rankings/`
- `GET /api/analytics/trading/details/`
- `GET /api/analytics/demographics/`
- `GET /api/analytics/conversions/funnel/`

---

## 🔧 **Nouveaux Modèles/Migrations**

### Analytics App
- PageView
- UserSession
- TradingPerformance
- AnalyticsSummary
- UserDemographics

### Payments Updates
- PendingPayment : `user_info` (JSON), `transaction_id` (CharField)
- Nouveaux statuts: `transaction_submitted`, `verified`

---

## 📝 **Comment Redéployer sur Render**

### Méthode 1 : Via Dashboard (Recommandé)

1. Ouvrir [Render Dashboard](https://dashboard.render.com)
2. Sélectionner votre service **calmnesstrading** (backend)
3. Cliquer sur **"Manual Deploy"** en haut à droite
4. Sélectionner **"Clear build cache & deploy"** (recommandé pour nouvelles migrations)
5. Cliquer **"Deploy"**
6. Attendre 3-5 minutes

### Méthode 2 : Via API Deploy Hook

Si vous avez configuré un deploy hook :

```bash
curl -X POST https://api.render.com/deploy/srv-xxxxx?key=your-key
```

### Méthode 3 : Auto-Deploy (Si Activé)

Si auto-deploy est activé, Render détectera automatiquement les nouveaux commits et redéploiera dans 5-10 minutes.

---

## ✅ **Vérification Après Déploiement**

### 1. Vérifier les Logs

Dans Render Dashboard → Logs, chercher :

```
Running migrations:
  Applying payments.0006_pendingpayment_transaction_id_and_more... OK
  Applying analytics.0001_initial... OK
```

### 2. Tester les Endpoints

```bash
# Test création paiement
curl -X POST https://calmnesstrading.onrender.com/api/payments/pending-payments/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"offer": 1, "amount": "100", "currency": "EUR", "contact_method": "telegram", "contact_info": "@test", "user_info": {}}'

# Devrait retourner un objet avec "id"

# Test submit transaction
curl -X POST https://calmnesstrading.onrender.com/api/payments/1/submit-transaction/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": "TXN123456"}'

# Devrait retourner {"success": true}
```

### 3. Tester sur le Site

1. Aller sur https://calmnesstrading.vercel.app
2. Se connecter
3. Aller sur un service → Choisir un plan
4. Compléter les 4 étapes du checkout
5. Vérifier que tout fonctionne sans erreur 404

---

## 🐛 **Troubleshooting**

### Erreur : "No module named 'analytics'"

**Solution** : Vérifier que `analytics` est dans `INSTALLED_APPS` de `backend/backend/settings.py`

```python
INSTALLED_APPS = [
    # ...
    'analytics',  # ← Vérifier
]
```

### Erreur : Migration Failed

**Solution** : Se connecter en SSH et migrer manuellement

```bash
python manage.py migrate analytics
python manage.py migrate payments
```

### Erreur 404 sur les endpoints

**Solution** : Vérifier que `analytics.urls` est inclus dans `backend/backend/urls.py`

```python
urlpatterns = [
    # ...
    path('', include('analytics.urls')),  # ← Vérifier
]
```

---

## 📦 **Requirements Supplémentaires**

S'assurer que ces packages sont installés sur Render :

```bash
# Dans requirements.txt ou requirements_analytics.txt
requests>=2.31.0
user-agents>=2.2.0
pyyaml>=6.0
```

Si nécessaire, ajouter dans le script `build.sh` :

```bash
pip install -r requirements_analytics.txt
```

---

## ⏱️ **Temps Estimé**

- **Build** : 2-3 minutes
- **Migration** : 30 secondes
- **Démarrage** : 1 minute
- **Total** : ~4 minutes

---

## ✅ **Après Redéploiement**

Le système sera **100% fonctionnel** :

- ✅ Création paiement avec ID
- ✅ Soumission transaction ID
- ✅ Validation admin
- ✅ Génération factures
- ✅ Envoi email/Telegram
- ✅ Analytics complètes
- ✅ Tout opérationnel !

---

## 📞 **Support**

Si problème pendant le déploiement :
- Vérifier les logs Render
- Vérifier variables d'environnement
- Contacter support Render si nécessaire

---

**🎯 Redéployez maintenant et le système sera parfait ! 🚀**
