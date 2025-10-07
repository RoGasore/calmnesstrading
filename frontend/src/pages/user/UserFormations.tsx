import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  CheckCircle2,
  PlayCircle,
  Lock,
  TrendingUp,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserFormations() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Données de démonstration
  const formations = [
    {
      id: 1,
      name: 'Formation Initiation',
      description: 'Les bases du trading pour débutants',
      progress: 100,
      status: 'completed',
      lessons: 12,
      completedLessons: 12,
      duration: '4h',
      level: 'Débutant',
      thumbnail: '/placeholder.svg',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      id: 2,
      name: 'Formation Basic',
      description: 'Analyse technique et gestion du risque',
      progress: 100,
      status: 'completed',
      lessons: 18,
      completedLessons: 18,
      duration: '8h',
      level: 'Débutant',
      thumbnail: '/placeholder.svg',
      color: 'from-green-500/20 to-green-600/20'
    },
    {
      id: 3,
      name: 'Formation Advanced',
      description: 'Stratégies avancées et psychologie du trading',
      progress: 45,
      status: 'in_progress',
      lessons: 24,
      completedLessons: 11,
      duration: '12h',
      level: 'Intermédiaire',
      thumbnail: '/placeholder.svg',
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      id: 4,
      name: 'Formation Elite',
      description: 'Trading professionnel et gestion de portefeuille',
      progress: 0,
      status: 'locked',
      lessons: 32,
      completedLessons: 0,
      duration: '20h',
      level: 'Expert',
      thumbnail: '/placeholder.svg',
      color: 'from-yellow-500/20 to-yellow-600/20'
    }
  ];

  const filteredFormations = formations.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'in_progress') return f.status === 'in_progress';
    if (filter === 'completed') return f.status === 'completed';
    return true;
  });

  const stats = {
    total: formations.length,
    completed: formations.filter(f => f.status === 'completed').length,
    inProgress: formations.filter(f => f.status === 'in_progress').length,
    totalHours: formations.reduce((acc, f) => {
      if (f.status !== 'locked') {
        return acc + parseInt(f.duration);
      }
      return acc;
    }, 0)
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
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">formations disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">formations complétées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">formations actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps total</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">d'apprentissage</p>
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
          variant={filter === 'in_progress' ? 'default' : 'outline'}
          onClick={() => setFilter('in_progress')}
          size="sm"
        >
          En cours
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
            className={`hover:shadow-lg transition-all ${formation.status === 'locked' ? 'opacity-60' : ''}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{formation.name}</CardTitle>
                    {formation.status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {formation.status === 'locked' && (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>{formation.description}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary">{formation.level}</Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {formation.duration}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formation.status !== 'locked' && (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progression</span>
                      <span className="font-medium">{formation.progress}%</span>
                    </div>
                    <Progress value={formation.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formation.completedLessons}/{formation.lessons} leçons complétées
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {formation.status === 'completed' ? (
                      <>
                        <Button className="flex-1" variant="outline">
                          <Award className="mr-2 h-4 w-4" />
                          Voir le certificat
                        </Button>
                        <Button className="flex-1">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Revoir
                        </Button>
                      </>
                    ) : (
                      <Button className="w-full">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        {formation.progress === 0 ? 'Commencer' : 'Continuer'}
                      </Button>
                    )}
                  </div>
                </>
              )}

              {formation.status === 'locked' && (
                <div className="text-center py-4">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Formation non disponible
                  </p>
                  <Button variant="outline" onClick={() => navigate('/services')}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Débloquer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

