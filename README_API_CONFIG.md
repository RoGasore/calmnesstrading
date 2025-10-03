# Configuration centralisée de l'API

## 🎯 Objectif

Éviter de modifier les URLs dans chaque fichier lors du changement d'environnement (local ↔ production).

## 📁 Structure

### Backend (`backend/backend/settings.py`)
```python
# Configuration API
API_BASE_URL = os.getenv('API_BASE_URL', 'http://127.0.0.1:8000')
```

### Frontend (`frontend/src/config/api.ts`)
```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (isLocal ? 'http://127.0.0.1:8000' : 'https://calmnesstrading.onrender.com'),
  IS_LOCAL: isLocal,
  IS_PRODUCTION: !isLocal,
}
```

## 🔧 Configuration

### Développement Local
```bash
# Frontend
VITE_API_BASE_URL=http://127.0.0.1:8000

# Backend
API_BASE_URL=http://127.0.0.1:8000
```

### Production
```bash
# Frontend
VITE_API_BASE_URL=https://calmnesstrading.onrender.com

# Backend
API_BASE_URL=https://calmnesstrading.onrender.com
```

## 📝 Utilisation

### Dans les composants React
```typescript
import { API_URLS } from '@/config/api';

// Au lieu de :
const response = await fetch('http://127.0.0.1:8000/api/auth/login/');

// Utiliser :
const response = await fetch(API_URLS.LOGIN);
// ou
const response = await fetch(API_URLS.PAGE_PUBLIC('header'));
```

### URLs disponibles
- `API_URLS.LOGIN` - Connexion
- `API_URLS.REGISTER` - Inscription
- `API_URLS.ADMIN_STATS` - Statistiques admin
- `API_URLS.PAYMENTS_DASHBOARD` - Dashboard payments
- `API_URLS.PAGE_PUBLIC('header')` - Page header
- `API_URLS.PAGE_PUBLIC('footer')` - Page footer
- `API_URLS.GLOBAL_SETTINGS_PUBLIC` - Paramètres globaux
- etc.

## 🚀 Avantages

1. **Centralisation** : Une seule source de vérité pour les URLs
2. **Flexibilité** : Changement d'environnement en une ligne
3. **Maintenance** : Plus facile de gérer les endpoints
4. **Type Safety** : TypeScript pour éviter les erreurs
5. **Auto-détection** : Détection automatique local/production

## 🔄 Migration

Pour migrer un fichier existant :

1. **Ajouter l'import** :
```typescript
import { API_URLS } from '@/config/api';
```

2. **Remplacer les URLs hardcodées** :
```typescript
// Avant
const API_BASE = 'http://127.0.0.1:8000';
const response = await fetch(`${API_BASE}/api/auth/login/`);

// Après
import { API_URLS } from '@/config/api';
const response = await fetch(API_URLS.LOGIN);
```

## 📋 Fichiers mis à jour

- ✅ `frontend/src/config/api.ts` - Configuration centralisée
- ✅ `frontend/src/contexts/AuthContext.tsx`
- ✅ `frontend/src/contexts/EditModeContext.tsx`
- ✅ `frontend/src/contexts/PaymentContext.tsx`
- ✅ `frontend/src/components/Header.tsx`
- ✅ `frontend/src/components/Footer.tsx`
- ✅ `frontend/src/pages/VerifyEmail.tsx`
- ✅ `frontend/src/pages/Register.tsx`
- ✅ `backend/backend/settings.py`

## 🎉 Résultat

Plus besoin de modifier les URLs dans chaque fichier ! Le système détecte automatiquement l'environnement et utilise la bonne configuration.
