# 🎯 SYSTÈME DE RÔLES - CALMNESS TRADING

## 📊 Architecture des Rôles

### 1. **ADMINISTRATEUR** (`role: 'admin'`)

#### Responsabilités
- Configuration et paramétrage du système
- Gestion des formations et sessions
- Analytics et statistiques avancées
- Audit et historique complet
- Gestion des utilisateurs et rôles

#### Permissions
| Fonctionnalité | Accès |
|---------------|-------|
| Configuration système | ✅ Complet |
| Gestion formations | ✅ Complet |
| Analytics | ✅ Complet |
| Utilisateurs | ✅ Complet |
| **Paiements** | 👁️ **Lecture seule** |
| **Revenus** | 👁️ **Lecture seule** |
| **Validation commandes** | ❌ Non |

#### Interface
- URL : `/admin`
- Dashboard : Vue d'ensemble système
- Sections :
  - Dashboard
  - Analytics
  - Utilisateurs
  - Formations
  - Offres
  - Contenu (CMS)
  - Paramètres

---

### 2. **SERVICE CLIENT** (`role: 'customer_service'`)

#### Responsabilités
- **Validation des paiements** 💰
- **Gestion des revenus** 📊
- **Validation des commandes** ✅
- Communication clients (Email, Telegram, Discord, WhatsApp)
- Support client via messagerie intégrée
- Génération et envoi de factures

#### Permissions
| Fonctionnalité | Accès |
|---------------|-------|
| **Validation paiements** | ✅ **Complet** |
| **Gestion revenus** | ✅ **Complet** |
| **Validation commandes** | ✅ **Complet** |
| Messagerie clients | ✅ Complet |
| Génération factures | ✅ Complet |
| Gestion clients | ✅ Complet |
| Configuration système | ❌ Non |
| Gestion formations | ❌ Non |

#### Interface
- URL : `/service`
- Dashboard : Opérations quotidiennes
- Sections :
  - Dashboard
  - **Paiements** (validation et gestion)
  - Messages (messagerie intégrée)
  - Clients
  - **Revenus**
  - **Commandes**
  - Factures

#### Fonctionnalités Exclusives
1. **Validation Paiements**
   - Vérification ID transaction
   - Validation ou refus
   - Génération facture automatique
   - Envoi email + Telegram

2. **Gestion Revenus**
   - Statistiques financières
   - Rapports mensuels
   - Suivi des performances

3. **Dialog de Validation Professionnel**
   - Transaction ID en évidence
   - Sections déroulantes (Offre, Client, Notes)
   - Informations de contact colorées
   - Actions automatiques détaillées
   - Design responsive gold/black/white

---

### 3. **UTILISATEUR** (`role: 'user'`)

#### Responsabilités
- Inscription aux formations
- Abonnements aux signaux
- Suivi de trading avec EA MetaTrader
- Gestion de profil et paramètres

#### Permissions
| Fonctionnalité | Accès |
|---------------|-------|
| Mon espace | ✅ Complet |
| Profil | ✅ Complet |
| Formations | ✅ Complet |
| Signaux | ✅ Complet |
| Trading History | ✅ Complet (avec EA) |
| Paiements | ✅ Création et consultation |
| Factures | ✅ Consultation |
| Espaces admin/service | ❌ Non |

#### Interface
- URL : `/user`
- Dashboard : Espace personnel
- Sections :
  - Dashboard (widgets personnalisables)
  - Profil
  - Formations
  - Signaux
  - Historique Trading
  - Paiements
  - Mon Portefeuille
  - Gestion de compte
  - Notifications
  - Paramètres

---

## 🔄 WORKFLOW COMPLET : PAIEMENT

### Étape 1 : Client (Utilisateur)
```
1. Sélectionne une offre (Formation, Signal, Gestion)
2. Remplit informations de contact
   - Nom complet
   - Email
   - Telegram username
   - WhatsApp (optionnel)
   - Discord username (optionnel)
3. Effectue le paiement (virement bancaire)
4. Soumet l'ID de transaction
5. Statut : "Transaction soumise" (bleu)
```

### Étape 2 : Service Client
```
1. Reçoit notification nouveau paiement
2. Ouvre le paiement dans /service/payments
3. Clique "Vérifier & Valider" (bouton gold)
4. Dialog professionnel s'ouvre :
   ┌─────────────────────────────────────────┐
   │ TRANSACTION ID                          │
   │ ███████████████                         │
   │ (grand, gold, font-mono)                │
   └─────────────────────────────────────────┘
   
   ▼ Détails de l'Offre
   - Nom, Type, Montant, Statut
   
   ▼ Informations Client
   - Nom, Email
   - 📱 Telegram (bleu)
   - 💬 WhatsApp (vert)
   - 🎮 Discord (indigo)
   
   ▼ Notes et Validation
   - Notes admin (optionnel)
   - Actions automatiques listées
   
5. Vérifie l'ID dans le système bancaire
6. Clique "Valider et Envoyer Facture"
```

### Étape 3 : Système (Automatique)
```
1. Génère facture PDF
   - Numéro : CT-YYYYMMDD-XXXX
   - Logo en arrière-plan
   - Thème gold/black/white
   - Informations complètes
   
2. Envoie facture
   - Email avec PDF en pièce jointe
   - Telegram (si username configuré)
   
3. Active l'abonnement
   - Formation : accès modules
   - Signal : ajout canal Telegram
   - Gestion : activation service
   
4. Crée historique
   - Enregistre dans la base
   - Visible pour admin (lecture seule)
```

### Étape 4 : Admin (Consultation)
```
1. Voit le paiement dans /admin/payments
2. Accès en lecture seule
3. Peut voir :
   - Historique complet
   - Factures générées
   - Actions du service client
4. Ne peut PAS :
   - Valider/refuser
   - Modifier le statut
   - Gérer les revenus
```

---

## 🔐 SÉCURITÉ ET PERMISSIONS

### Backend (Django)

#### Modèle User
```python
class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'Utilisateur'),
        ('customer_service', 'Service Client'),
        ('admin', 'Administrateur'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    
    @property
    def is_customer_service(self):
        return self.role == 'customer_service' or self.is_staff
    
    @property
    def is_admin_user(self):
        return self.role == 'admin' or self.is_superuser
    
    def can_manage_payments(self):
        return self.role in ['customer_service', 'admin'] or self.is_staff
```

#### Permissions API
```python
# Validation paiements : Service Client UNIQUEMENT
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_pending_payment(request):
    if not request.user.can_manage_payments():
        return Response({'error': 'Permission refusée'}, status=403)
    # ... logique validation

# Dashboard admin : Lecture seule pour admin
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    # Retourne données sans actions de modification
```

### Frontend (React)

#### Routing par Rôle
```typescript
// App.tsx
<Route path="/admin/*" element={<Admin />} />
<Route path="/service/*" element={<Service />} />
<Route path="/user/*" element={<User />} />

// UserMenu.tsx
const handleClick = () => {
  if (isAdmin()) navigate("/admin");
  else if (user.is_customer_service) navigate("/service");
  else navigate("/user");
};
```

#### Protection des Routes
```typescript
// Service.tsx
const Service = () => {
  const { user } = useAuth();
  
  if (!user || (!user.is_customer_service && !user.is_staff)) {
    return <Navigate to="/" replace />;
  }
  
  return <Routes>...</Routes>;
};
```

---

## 📱 MESSAGERIE INTÉGRÉE

### Fonctionnalités
- **Chat en direct** entre service client et utilisateurs
- **Multi-canal** : Email, Telegram, Discord, WhatsApp
- **Historique** des conversations
- **Notifications** en temps réel
- **Support Widget** sur toutes les pages utilisateur

### Workflow
```
Utilisateur clique sur widget support
  ↓
Choisit canal (Chat, WhatsApp, Telegram, etc.)
  ↓
Service Client reçoit message dans /service/messages
  ↓
Répond via messagerie intégrée
  ↓
Utilisateur reçoit notification
```

---

## 📊 REVENUS ET ANALYTICS

### Service Client
- **Gestion active** des revenus
- Validation des transactions
- Génération de rapports
- Statistiques financières

### Admin
- **Consultation** des revenus
- Analytics avancées
- Graphiques et tendances
- Export de données
- **Pas de modification**

---

## 🎨 DESIGN SYSTEM

### Couleurs par Rôle

#### Admin
- Primaire : Gold (#D4AF37)
- Secondaire : Noir (#000000)
- Accent : Blanc (#FFFFFF)

#### Service Client
- Primaire : Gold (#D4AF37)
- Secondaire : Bleu (#3B82F6) pour actions
- Accent : Vert (#10B981) pour validations

#### Utilisateur
- Primaire : Gold (#D4AF37)
- Secondaire : Variations selon section
- Accent : Personnalisable

### Badges de Statut

| Statut | Couleur | Icône |
|--------|---------|-------|
| En attente | 🟡 Jaune | Clock |
| Transaction soumise | 🔵 Bleu | CheckCircle |
| Contacté | 🟣 Violet | Users |
| Validé/Confirmé | 🟢 Vert | CheckCircle |
| Annulé | 🔴 Rouge | XCircle |

---

## 🚀 DÉPLOIEMENT

### Backend (Render)
```bash
# Migrations
python manage.py makemigrations accounts
python manage.py migrate accounts

# Créer les comptes
python manage.py createsuperuser  # Admin
python manage.py create_customer_service  # Service Client
python manage.py create_test_user  # Test
```

### Frontend (Vercel)
- Routes automatiquement déployées
- `/admin` → Admin
- `/service` → Service Client
- `/user` → Utilisateur

---

## 📈 MÉTRIQUES DE SUCCÈS

### Service Client
- Temps moyen de validation : < 30 minutes
- Taux de satisfaction client : > 95%
- Messages traités par jour : suivi automatique

### Admin
- Disponibilité système : 99.9%
- Analytics mis à jour : temps réel
- Formations actives : dashboard

### Utilisateurs
- Taux d'activation EA : suivi
- Engagement formations : analytics
- Renouvellements abonnements : automatique

---

**Version** : 2.0  
**Date** : 9 janvier 2025  
**Auteur** : Calmness Trading Team

