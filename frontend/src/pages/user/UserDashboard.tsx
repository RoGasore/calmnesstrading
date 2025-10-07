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
  DollarSign,
  PlayCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { WidgetContainer, WidgetSettings } from "@/components/user/widgets";

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
          signaux_actifs: 3,
          paiements_total: 548.00,
          total_spent: 548.00,
          profit_total: 250,
          win_rate: 75
        },
        active_subscriptions: [
          { id: 1, service: 'Signaux Mensuels', days_remaining: 15, hours_remaining: 360 }
        ],
        recent_activity: [
          { type: 'formation', title: 'Formation Basic complétée', date: '2024-01-15', status: 'completed' },
          { type: 'signal', title: 'Nouveau signal EUR/USD', date: '2024-01-14', status: 'new' },
          { type: 'payment', title: 'Paiement Formation Advanced', date: '2024-01-13', status: 'completed' }
        ],
        recent_payments: [
          { id: 1, paid_at: '2024-01-15', amount: 349.00 },
          { id: 2, paid_at: '2024-01-01', amount: 99.00 }
        ],
        formations: [
          { id: 1, name: 'Formation Initiation', status: 'completed', endDate: '2024-01-15' },
          { id: 2, name: 'Formation Basic', status: 'active', endDate: '2024-02-15', nextSession: '2024-01-22 19:00' }
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

  const handleWidgetReset = () => {
    // Le reset sera géré par WidgetContainer lui-même via le reload
  };

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

      {/* Widgets personnalisables */}
      <WidgetContainer dashboardData={dashboardData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progression des formations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Mes Formations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.formations.map((formation: any) => (
                <div key={formation.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    formation.status === 'active' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    'bg-green-50 dark:bg-green-900/20'
                  }`}>
                    {formation.status === 'active' ? (
                      <PlayCircle className="h-4 w-4 text-blue-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{formation.name}</span>
                      <Badge 
                        variant={formation.status === 'active' ? 'default' : 'secondary'}
                        className={formation.status === 'active' ? 'bg-blue-500' : 'bg-green-500'}
                      >
                        {formation.status === 'active' ? 'En cours' : 'Terminée'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formation.status === 'active' && formation.nextSession && (
                        <>Prochaine session : {new Date(formation.nextSession).toLocaleDateString('fr-FR')}</>
                      )}
                      {formation.status === 'completed' && (
                        <>Terminée le {new Date(formation.endDate).toLocaleDateString('fr-FR')}</>
                      )}
                    </p>
                  </div>
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
          {/* Paramètres des widgets */}
          <WidgetSettings onReset={handleWidgetReset} />
          
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

