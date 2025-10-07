import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  User, 
  GraduationCap, 
  Zap, 
  CreditCard, 
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  Award,
  Activity,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function UserDashboard() {
  const { user, fetchWithAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simuler des données pour l'instant
      // TODO: Remplacer par un vrai appel API backend
      setDashboardData({
        stats: {
          formations_actives: 2,
          formations_completees: 1,
          signaux_actifs: 1,
          paiements_total: 548.00
        },
        recent_activity: [
          { type: 'formation', title: 'Formation Basic complétée', date: '2024-01-15', status: 'completed' },
          { type: 'signal', title: 'Nouveau signal EUR/USD', date: '2024-01-14', status: 'new' },
          { type: 'payment', title: 'Paiement Formation Advanced', date: '2024-01-13', status: 'completed' }
        ],
        formations: [
          { id: 1, name: 'Formation Basic', progress: 100, status: 'completed' },
          { id: 2, name: 'Formation Advanced', progress: 45, status: 'in_progress' },
          { id: 3, name: 'Formation Elite', progress: 0, status: 'not_started' }
        ],
        next_payment: {
          service: 'Signaux Mensuels',
          amount: 99,
          date: '2024-02-01'
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      title: "Formations Actives",
      value: dashboardData?.stats.formations_actives || 0,
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/user/formations"
    },
    {
      title: "Signaux Actifs",
      value: dashboardData?.stats.signaux_actifs || 0,
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      link: "/user/signaux"
    },
    {
      title: "Formations Complétées",
      value: dashboardData?.stats.formations_completees || 0,
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/user/formations"
    },
    {
      title: "Total Investi",
      value: `${dashboardData?.stats.paiements_total.toFixed(2) || 0}€`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/user/payments"
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec message de bienvenue */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-6 border border-primary/20">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bienvenue, {user?.first_name || user?.username} ! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Voici un aperçu de votre activité et de vos progrès
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(stat.link)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto hover:bg-transparent">
                <span className="text-xs text-primary flex items-center gap-1">
                  Voir plus <ArrowRight className="h-3 w-3" />
                </span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progression des formations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Mes Formations en Cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.formations
                .filter((f: any) => f.status !== 'not_started')
                .map((formation: any) => (
                  <div key={formation.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formation.name}</span>
                        {formation.status === 'completed' && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formation.progress}%
                      </span>
                    </div>
                    <Progress value={formation.progress} className="h-2" />
                  </div>
                ))}
              
              <Button 
                onClick={() => navigate('/user/formations')} 
                className="w-full mt-4"
                variant="outline"
              >
                Voir toutes mes formations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recent_activity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'formation' ? 'bg-blue-50' :
                      activity.type === 'signal' ? 'bg-yellow-50' :
                      'bg-green-50'
                    }`}>
                      {activity.type === 'formation' && <GraduationCap className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'signal' && <Zap className="h-4 w-4 text-yellow-600" />}
                      {activity.type === 'payment' && <CreditCard className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                    <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                      {activity.status === 'completed' ? 'Terminé' : 
                       activity.status === 'new' ? 'Nouveau' : 'En cours'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne de droite */}
        <div className="space-y-6">
          {/* Prochain paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Prochain Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Service</span>
                  <span className="text-sm font-medium">{dashboardData?.next_payment.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Montant</span>
                  <span className="text-sm font-medium">{dashboardData?.next_payment.amount}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm font-medium">{dashboardData?.next_payment.date}</span>
                </div>
              </div>
              <Button className="w-full" size="sm" onClick={() => navigate('/user/payments')}>
                Gérer mes abonnements
              </Button>
            </CardContent>
          </Card>

          {/* Objectifs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Mes Objectifs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Formations complétées</span>
                  <span>33%</span>
                </div>
                <Progress value={33} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  1/3 formations terminées
                </p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Signaux suivis ce mois</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  15/20 signaux suivis
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={() => navigate('/user/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Modifier mon profil
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={() => navigate('/services')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Explorer les services
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={() => navigate('/user/notifications')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Mes notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

