# 📚 Guide des Formations Externes (Zoom/Google Meet)

## 🎯 Concept

Les formations se déroulent **en dehors de la plateforme** via des outils de visioconférence (Zoom, Google Meet, Teams). La plateforme gère uniquement :
- ✅ Les inscriptions
- ✅ Les dates et horaires
- ✅ Les liens de session
- ✅ Le suivi de présence
- ✅ Les certificats de complétion

## 🗄️ Modèles de Base de Données

### 1. Formation
Informations sur la formation disponible :
```python
{
  "name": "Formation Advanced",
  "description": "Stratégies avancées...",
  "level": "intermediate",
  "platform": "zoom",  # ou google_meet, teams
  "meeting_link": "https://zoom.us/j/123456789",
  "meeting_id": "123 456 789",
  "meeting_password": "secret123",
  "instructor_name": "John Doe",
  "schedule_description": "Mar-Jeu, 19h-21h"
}
```

### 2. UserFormationEnrollment
Inscription d'un utilisateur à une formation :
```python
{
  "user": User object,
  "formation": Formation object,
  "start_date": "2024-01-15",
  "end_date": "2024-02-15",
  "status": "active",  # upcoming, active, completed, cancelled
  "next_session_date": "2024-01-22 19:00",
  "total_sessions": 10,
  "attended_sessions": 5,
  "completion_certificate": "certificates/cert_123.pdf"
}
```

### 3. FormationSession
Session individuelle (optionnel, pour suivi détaillé) :
```python
{
  "formation": Formation object,
  "session_number": 1,
  "title": "Introduction au trading",
  "scheduled_date": "2024-01-22 19:00",
  "duration_minutes": 120,
  "meeting_link": "https://zoom.us/j/123456789",
  "recording_link": "https://zoom.us/rec/share/...",
  "user_attended": True
}
```

## 🔌 API Endpoints

### Liste des formations de l'utilisateur
```
GET /api/auth/user/formations/
```

**Réponse** :
```json
{
  "formations": [
    {
      "id": 1,
      "name": "Formation Basic",
      "description": "Analyse technique et gestion du risque",
      "level": "beginner",
      "platform": "google_meet",
      "meeting_link": "https://meet.google.com/abc-defg-hij",
      "meeting_id": "abc-defg-hij",
      "instructor": "Jane Smith",
      "schedule": "Mar-Jeu, 19h-21h",
      "start_date": "2024-01-15",
      "end_date": "2024-02-15",
      "status": "active",
      "next_session": "2024-01-22T19:00:00Z",
      "total_sessions": 10,
      "attended_sessions": 5,
      "attendance_rate": 50.0,
      "days_until_end": 25
    }
  ],
  "stats": {
    "total": 3,
    "active": 1,
    "completed": 1,
    "upcoming": 1
  }
}
```

### Sessions d'une formation
```
GET /api/auth/user/formations/{enrollment_id}/sessions/
```

### Prochaines sessions
```
GET /api/auth/user/formations/next-sessions/
```

### Marquer une présence
```
POST /api/auth/user/sessions/{session_id}/attend/
```

## 🎨 Interface Utilisateur

### Page "Mes Formations" (`/user/formations`)

Affiche pour chaque formation :
- ✅ Nom et description
- ✅ Niveau (Débutant, Intermédiaire, Avancé, Expert)
- ✅ Plateforme (Zoom, Google Meet, Teams)
- ✅ Période (date début - date fin)
- ✅ Horaires (ex: Mar-Jeu, 19h-21h)
- ✅ Formateur
- ✅ Prochaine session (pour les formations actives)
- ✅ **Bouton "Rejoindre la session"** (ouvre le lien Zoom/Meet dans un nouvel onglet)
- ✅ Statut avec badges colorés :
  - 🔵 **En cours** (bleu)
  - 🟢 **Terminée** (vert)
  - 🟠 **À venir** (orange)

### Statistiques
- **Total Inscrit** : Nombre total de formations
- **En Cours** : Formations actives maintenant
- **Terminées** : Formations complétées
- **À Venir** : Formations planifiées

### Filtres
- Toutes
- En cours
- À venir
- Terminées

## 🔄 Workflow Complet

### 1. Création d'une Formation (Admin)
```
Admin crée une formation
  ↓
Nom, description, niveau
  ↓
Plateforme (Zoom/Meet)
  ↓
Lien de session
  ↓
Planning et formateur
  ↓
Formation disponible
```

### 2. Inscription de l'Utilisateur
```
Utilisateur paie pour une formation
  ↓
Admin confirme le paiement
  ↓
UserFormationEnrollment créé
  ↓
status = 'upcoming'
  ↓
start_date définie
```

### 3. Début de la Formation
```
Date de début atteinte
  ↓
status = 'active'
  ↓
Lien de session accessible
  ↓
next_session_date mise à jour
```

### 4. Session en Direct
```
Utilisateur clique sur "Rejoindre la session"
  ↓
Nouveau onglet vers Zoom/Meet
  ↓
Participe à la formation
  ↓
(Optionnel) Marque sa présence
```

### 5. Fin de la Formation
```
Date de fin atteinte
  ↓
status = 'completed'
  ↓
Certificat de complétion généré
  ↓
Enregistrements disponibles
```

## 🔐 Sécurité

### Accès aux Liens
- ✅ Lien de session visible **uniquement** si `status = 'active'`
- ✅ Lien masqué pour les formations "upcoming" ou "completed"
- ✅ Authentification requise pour tous les endpoints

### Vérification
```python
# Dans views_formations.py
if enrollment.status == 'active':
    return meeting_link
else:
    return None  # Masquer le lien
```

## 📝 Commandes de Gestion

### Créer une formation (Shell Django)
```python
from accounts.models import Formation

formation = Formation.objects.create(
    name="Formation Advanced",
    description="Stratégies avancées...",
    level="intermediate",
    platform="zoom",
    meeting_link="https://zoom.us/j/123456789",
    meeting_id="123 456 789",
    meeting_password="secret123",
    instructor_name="John Doe",
    schedule_description="Mar-Jeu, 19h-21h"
)
```

### Inscrire un utilisateur
```python
from accounts.models import User, UserFormationEnrollment
from datetime import date, timedelta

user = User.objects.get(email='test@calmnessfi.com')
formation = Formation.objects.get(name='Formation Advanced')

enrollment = UserFormationEnrollment.objects.create(
    user=user,
    formation=formation,
    start_date=date.today(),
    end_date=date.today() + timedelta(days=30),
    status='active',
    total_sessions=10
)
```

## 🎯 Widgets Formations

### 3 Widgets Disponibles
1. **Formations Actives** (🎓 bleu)
   - Nombre de formations en cours
   
2. **Formations Terminées** (🏆 vert)
   - Formations complétées
   
3. **Formations À Venir** (⏰ orange)
   - Formations planifiées

## 📊 Différences Avant/Après

### ❌ Avant (Système de leçons intégré)
- Progress bar avec pourcentage
- Leçons complétées / total
- Boutons "Commencer" / "Continuer"
- Contenu hébergé sur la plateforme

### ✅ Maintenant (Formations externes)
- Dates de début et fin
- Plateforme (Zoom/Meet)
- Bouton "Rejoindre la session"
- Liens externes vers Zoom/Meet
- Suivi de présence optionnel
- Certificats de complétion

## 💡 Avantages

1. ✅ **Flexibilité** : Utiliser les outils que vous préférez (Zoom, Meet, Teams)
2. ✅ **Simple** : Pas besoin d'héberger du contenu vidéo
3. ✅ **Interaction** : Sessions en direct avec formateur
4. ✅ **Enregistrements** : Liens vers les replays
5. ✅ **Suivi** : Taux de présence et statistiques

## 🔮 Améliorations Futures (Optionnel)

### Intégration Zoom API
- Créer automatiquement les sessions Zoom
- Récupérer automatiquement les enregistrements
- Envoyer des invitations calendrier

### Intégration Google Calendar
- Ajouter les sessions au calendrier de l'utilisateur
- Rappels automatiques avant les sessions

### Système de Rappels
- Email 24h avant la session
- SMS ou notification push 1h avant
- Notification dans l'app 15 min avant

## 📝 Données de Démonstration

La page utilise actuellement des données de démo :
```javascript
{
  name: 'Formation Basic',
  status: 'active',
  startDate: '2024-01-15',
  endDate: '2024-02-15',
  platform: 'Google Meet',
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  instructor: 'Jane Smith',
  schedule: 'Mar-Jeu, 19h-21h',
  nextSession: '2024-01-22 19:00'
}
```

## 🚀 Déploiement

### Migrations
```bash
cd backend
python manage.py migrate
```

### Créer des formations de test
```bash
python manage.py shell
```
Puis copier le code ci-dessus

---

**Les formations externes sont maintenant parfaitement intégrées ! 🎓**

