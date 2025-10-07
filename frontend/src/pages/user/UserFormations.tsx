import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  CheckCircle2,
  Video,
  ExternalLink,
  AlertCircle,
  PlayCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserFormations() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');

  // Données de démonstration
  const formations = [
    {
      id: 1,
      name: 'Formation Initiation',
      description: 'Les bases du trading pour débutants',
      status: 'completed',
      level: 'Débutant',
      startDate: '2024-01-10',
      endDate: '2024-01-15',
      platform: 'Zoom',
      meetingLink: 'https://zoom.us/j/123456789',
      instructor: 'John Doe',
      schedule: 'Lun-Ven, 18h-20h',
      color: 'from-gray-500/20 to-gray-600/20'
    },
    {
      id: 2,
      name: 'Formation Basic',
      description: 'Analyse technique et gestion du risque',
      status: 'active',
      level: 'Débutant',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      platform: 'Google Meet',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      instructor: 'Jane Smith',
      schedule: 'Mar-Jeu, 19h-21h',
      nextSession: '2024-01-22 19:00',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      id: 3,
      name: 'Formation Advanced',
      description: 'Stratégies avancées et psychologie du trading',
      status: 'upcoming',
      level: 'Intermédiaire',
      startDate: '2024-02-01',
      endDate: '2024-03-15',
      platform: 'Zoom',
      meetingLink: 'https://zoom.us/j/987654321',
      instructor: 'Mike Johnson',
      schedule: 'Sam-Dim, 14h-17h',
      color: 'from-purple-500/20 to-purple-600/20'
    }
  ];

  const filteredFormations = formations.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'active') return f.status === 'active';
    if (filter === 'completed') return f.status === 'completed';
    if (filter === 'upcoming') return f.status === 'upcoming';
    return true;
  });

  const stats = {
    total: formations.length,
    completed: formations.filter(f => f.status === 'completed').length,
    active: formations.filter(f => f.status === 'active').length,
    upcoming: formations.filter(f => f.status === 'upcoming').length
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-3xl font-bold">Mes Formations</h1>
            <p className="text-muted-foreground">
              Suivez votre progression et continuez votre apprentissage
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/services')}>
          <GraduationCap className="mr-2 h-4 w-4" />
          Explorer les formations
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inscrit</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">formations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">actives maintenant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">complétées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À Venir</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">prochainement</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Toutes
        </Button>
        <Button 
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
          size="sm"
        >
          En cours
        </Button>
        <Button 
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setFilter('upcoming')}
          size="sm"
        >
          À venir
        </Button>
        <Button 
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
        >
          Terminées
        </Button>
      </div>

      {/* Liste des formations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFormations.map((formation) => (
          <Card 
            key={formation.id}
            className={`hover:shadow-lg transition-all border-l-4 ${
              formation.status === 'active' ? 'border-l-blue-500' :
              formation.status === 'completed' ? 'border-l-green-500' :
              'border-l-orange-500'
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{formation.name}</CardTitle>
                    {formation.status === 'active' && (
                      <Badge className="bg-blue-500">En cours</Badge>
                    )}
                    {formation.status === 'completed' && (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Terminée
                      </Badge>
                    )}
                    {formation.status === 'upcoming' && (
                      <Badge className="bg-orange-500">À venir</Badge>
                    )}
                  </div>
                  <CardDescription>{formation.description}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary">{formation.level}</Badge>
                <Badge variant="outline">
                  <Video className="h-3 w-3 mr-1" />
                  {formation.platform}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Informations de la formation */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Période</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(formation.startDate).toLocaleDateString('fr-FR')} - {new Date(formation.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Horaires</p>
                    <p className="text-xs text-muted-foreground">{formation.schedule}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Formateur</p>
                    <p className="text-xs text-muted-foreground">{formation.instructor}</p>
                  </div>
                </div>

                {formation.nextSession && formation.status === 'active' && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Prochaine session</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {new Date(formation.nextSession).toLocaleString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2 pt-2 border-t">
                {formation.status === 'active' && (
                  <Button 
                    className="flex-1" 
                    onClick={() => window.open(formation.meetingLink, '_blank')}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Rejoindre la session
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                )}

                {formation.status === 'upcoming' && (
                  <Button className="flex-1" variant="outline" disabled>
                    <Clock className="mr-2 h-4 w-4" />
                    Commence le {new Date(formation.startDate).toLocaleDateString('fr-FR')}
                  </Button>
                )}

                {formation.status === 'completed' && (
                  <Button className="flex-1" variant="outline">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Formation terminée
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

