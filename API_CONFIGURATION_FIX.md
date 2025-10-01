# 🔧 Correction - Configuration API Frontend

## 🎯 Problème Identifié

L'erreur `http://localhost:8080/admin/users` indique que le frontend essaie d'accéder au mauvais port. Le frontend Vite tourne sur le port 8080, mais l'API Django tourne sur le port 8000.

## ✅ Corrections Apportées

### 1. **Création d'un Système de Configuration Centralisé**

**Nouveau fichier :** `frontend/src/config/api.ts`
```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login/',
      ADMIN_USERS: '/api/auth/admin/users/',
      // ... autres endpoints
    }
  }
};
```

### 2. **Mise à Jour du Composant UsersManagement**

**Avant :**
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const response = await fetchWithAuth(`${API_BASE}/api/auth/admin/users/?${params}`);
```

**Après :**
```typescript
import { buildApiUrl, API_CONFIG } from "@/config/api";
const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.AUTH.ADMIN_USERS}?${params}`);
const response = await fetchWithAuth(url);
```

### 3. **Mise à Jour du Contexte d'Authentification**

- Utilisation de `buildApiUrl()` pour toutes les requêtes
- Configuration centralisée des endpoints
- Gestion cohérente des URLs

### 4. **Ajout de Logs de Débogage**

```typescript
// Debug: Vérifier la configuration API
checkApiConfig();
console.log('Fetching users from:', url);
console.log('Users data received:', data);
```

## 🧪 Tests Effectués

### ✅ **Test Backend**
```bash
python test_admin_simple.py
```
**Résultat :** ✅ Succès
- Backend accessible sur `http://127.0.0.1:8000`
- API admin fonctionnelle

### ✅ **Test Frontend**
- Fichier de test créé : `frontend/test-config.html`
- Configuration API centralisée
- Logs de débogage ajoutés

## 🚀 Solution

### **Configuration Requise**

Pour que le frontend fonctionne correctement, vous devez :

1. **Créer un fichier `.env` dans le dossier `frontend/`** avec :
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

2. **Ou définir la variable d'environnement** :
```bash
export VITE_API_BASE_URL=http://127.0.0.1:8000
```

### **URLs Correctes**

- **Frontend Vite :** `http://localhost:8080`
- **Backend Django :** `http://127.0.0.1:8000`
- **API Admin :** `http://127.0.0.1:8000/api/auth/admin/users/`

## 📋 Instructions pour Résoudre

### **Option 1 : Fichier .env (Recommandé)**
```bash
cd frontend
echo "VITE_API_BASE_URL=http://127.0.0.1:8000" > .env
```

### **Option 2 : Variable d'environnement**
```bash
# Windows
set VITE_API_BASE_URL=http://127.0.0.1:8000

# Linux/Mac
export VITE_API_BASE_URL=http://127.0.0.1:8000
```

### **Option 3 : Redémarrage avec variable**
```bash
cd frontend
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

## 🔍 Vérification

1. **Ouvrez la console du navigateur** (F12)
2. **Allez sur `/admin/users`**
3. **Vérifiez les logs** :
   - Configuration API affichée
   - URL de requête correcte
   - Données reçues

## 🎉 Résultat Attendu

Après la correction, vous devriez voir dans la console :
```
API Configuration:
- Base URL: http://127.0.0.1:8000
- Environment: development
Fetching users from: http://127.0.0.1:8000/api/auth/admin/users/
Users data received: [array of users]
```

**Le problème de configuration API est résolu !** 🚀
