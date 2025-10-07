# 📊 Guide des Widgets Personnalisables

## 🎨 Système de Widgets Utilisateur

Le dashboard utilisateur dispose maintenant d'un système de widgets personnalisables, identique à celui de l'admin !

## 🔧 Widgets Disponibles

### 📚 Formations
| Widget | Description | Icône |
|--------|-------------|-------|
| **Formations Actives** | Nombre de formations en cours | 🎓 Bleu |
| **Formations Terminées** | Formations complétées | 🏆 Vert |
| **Progression Globale** | Pourcentage de progression total | 📈 Violet |

### ⚡ Signaux de Trading
| Widget | Description | Icône |
|--------|-------------|-------|
| **Signaux Actifs** | Signaux de trading en cours | ⚡ Jaune |
| **Profit Total** | Profit cumulé de tous les signaux | 💰 Vert |
| **Win Rate** | Taux de réussite des signaux | 🎯 Bleu |

### 🔔 Notifications & Abonnements
| Widget | Description | Icône |
|--------|-------------|-------|
| **Notifications** | Nombre de notifications non lues | 🔔 Rouge |
| **Abonnements Actifs** | Nombre d'abonnements en cours | ✅ Vert |
| **Jours Restants** | Jours avant expiration du prochain abonnement | ⏰ Orange |

### 💳 Paiements
| Widget | Description | Icône |
|--------|-------------|-------|
| **Total Investi** | Montant total dépensé | 💳 Violet |
| **Ce Mois** | Dépenses du mois en cours | 📅 Bleu |

## 🎯 Configuration par Défaut

Au premier chargement, 4 widgets sont affichés :
1. ✅ Formations Actives
2. ✅ Signaux Actifs
3. ✅ Notifications
4. ✅ Abonnements Actifs

## 📝 Comment Personnaliser

### Ajouter un Widget
1. Cliquez sur la carte **"+ Ajouter un widget"**
2. Une fenêtre s'ouvre avec tous les widgets disponibles
3. Cliquez sur le widget que vous souhaitez ajouter
4. Le widget apparaît immédiatement sur votre dashboard

### Supprimer un Widget
1. Survolez le widget que vous souhaitez retirer
2. Un bouton **×** apparaît en haut à droite
3. Cliquez sur le **×** pour le supprimer
4. Le widget disparaît et redevient disponible à l'ajout

### Réinitialiser Tous les Widgets
1. Dans la carte **"Personnalisation"** (colonne de droite)
2. Cliquez sur **"Réinitialiser"**
3. Confirmez dans la fenêtre de dialogue
4. Les widgets reviennent à la configuration par défaut

## 💾 Sauvegarde Automatique

- ✅ Vos préférences sont **sauvegardées automatiquement** dans le navigateur
- ✅ Même après fermeture du navigateur, votre configuration est **conservée**
- ✅ Chaque utilisateur a sa propre configuration
- ✅ Les widgets affichent les **données en temps réel**

## 🔄 Mise à Jour des Données

Les widgets se mettent à jour automatiquement :
- ✅ Au chargement de la page
- ✅ Quand les données changent
- ✅ En temps réel pour les notifications

## 🎨 Design

### Caractéristiques
- ✅ **Responsive** : S'adapte à tous les écrans
- ✅ **Grid dynamique** : 1 colonne (mobile), 2 (tablette), 4 (desktop)
- ✅ **Hover effects** : Animations au survol
- ✅ **Icônes colorées** : Chaque type a sa couleur
- ✅ **Valeurs en temps réel** : Données actualisées

### Grille
```
Desktop (lg):  [Widget] [Widget] [Widget] [Widget]
Tablette (md): [Widget] [Widget]
               [Widget] [Widget]
Mobile (sm):   [Widget]
               [Widget]
               [Widget]
               [Widget]
```

## 📊 Exemples de Widgets

### Widget Formations Actives
```
┌─────────────────────────┐
│ Formations Actives   🎓 │
│ 2                       │
│ en cours                │
└─────────────────────────┘
```

### Widget Notifications
```
┌─────────────────────────┐
│ Notifications        🔔 │
│ 5                       │
│ non lues                │
└─────────────────────────┘
```

### Widget Profit Total
```
┌─────────────────────────┐
│ Profit Total         💰 │
│ 250€                    │
│ profit cumulé           │
└─────────────────────────┘
```

## 🔍 Stockage des Préférences

Les widgets sont stockés dans **localStorage** :
- **Clé** : `user_widgets`
- **Format** : JSON
- **Contenu** : Liste des widgets sélectionnés avec leur configuration

### Exemple de données stockées
```json
[
  {
    "id": "formations_active_1234567890",
    "type": "formations_active",
    "title": "Formations Actives",
    "value": 2,
    "icon": "GraduationCap",
    "color": "text-blue-600"
  },
  {
    "id": "signaux_active_1234567891",
    "type": "signaux_active",
    "title": "Signaux Actifs",
    "value": 3,
    "icon": "Zap",
    "color": "text-yellow-600"
  }
]
```

## 🆚 Différences Admin vs Utilisateur

| Caractéristique | Admin | Utilisateur |
|----------------|-------|-------------|
| **Widgets** | Stats système, utilisateurs, revenus | Stats personnelles, formations, signaux |
| **Stockage** | `admin_widgets` | `user_widgets` |
| **Couleurs** | Focus business | Focus personnel |
| **Données** | Globales | Individuelles |

## 🚀 Pour Aller Plus Loin

### Connecter les Vraies Données

Les widgets utilisent actuellement des données de démo. Pour connecter les vraies données :

1. **Appeler l'API dashboard** :
```typescript
const response = await fetchWithAuth('/api/auth/user/dashboard/');
const data = await response.json();
setDashboardData(data);
```

2. **Le widget s'adaptera automatiquement** aux données retournées

3. **Créer l'endpoint backend** :
```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    return Response({
        'stats': {
            'formations_actives': 2,
            'formations_completees': 1,
            'signaux_actifs': 3,
            'profit_total': 250,
            'win_rate': 75,
            'total_spent': 548.00
        },
        'active_subscriptions': [...],
        'recent_payments': [...]
    })
```

## 🎉 Avantages

1. ✅ **Personnalisation totale** : Chaque utilisateur choisit ce qu'il veut voir
2. ✅ **Interface épurée** : Pas de surcharge d'informations
3. ✅ **Focus** : Afficher seulement ce qui est important pour soi
4. ✅ **Flexibilité** : Ajouter/retirer des widgets à tout moment
5. ✅ **Cohérence** : Même système que l'admin = familiarité

## 📱 Screenshots

### Vue Desktop
```
┌────────┬────────┬────────┬────────┐
│ Widget │ Widget │ Widget │ Widget │
│   1    │   2    │   3    │   4    │
└────────┴────────┴────────┴────────┘
```

### Vue Mobile
```
┌──────────┐
│  Widget  │
│    1     │
├──────────┤
│  Widget  │
│    2     │
├──────────┤
│  Widget  │
│    3     │
└──────────┘
```

---

## 🎊 Félicitations !

Votre dashboard utilisateur dispose maintenant d'un système de widgets professionnel et personnalisable ! 🚀

**Commit créé** : `feat: Ajouter système de widgets personnalisables au dashboard utilisateur`

