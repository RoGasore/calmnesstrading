import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Target,
  User,
  Shield,
  Bell,
  CreditCard,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export function UserGestion() {
  const { user, fetchWithAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState<any>(null);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par un vrai appel API
      setAccountData({
        profile_completion: 85,
        verification_status: 'verified',
        payment_eligibility: true,
        active_subscriptions: 2,
        total_spent: 548.00,
        account_age: 45,
        last_activity: '2024-01-15',
        security_score: 92,
        notifications_enabled: true,
        two_factor_enabled: false,
        recent_activities: [
          { type: 'login', date: '2024-01-15', description: 'Connexion depuis Chrome' },
          { type: 'payment', date: '2024-01-13', description: 'Paiement Formation Advanced' },
          { type: 'profile', date: '2024-01-10', description: 'Mise à jour du profil' }
        ]
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 sm:h-8 sm:w-8" />
            Gestion de Compte
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez votre compte et surveillez votre activité
          </p>
        </div>
      </div>

      {/* Vue d'ensemble du compte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profil Complet</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountData?.profile_completion}%</div>
            <Progress value={accountData?.profile_completion} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {accountData?.profile_completion >= 100 ? 'Profil complet' : 'Informations manquantes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut Vérification</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {accountData?.verification_status === 'verified' ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Vérifié
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  En attente
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {accountData?.verification_status === 'verified' ? 'Compte vérifié' : 'Vérification en cours'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Éligibilité Paiement</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {accountData?.payment_eligibility ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Éligible
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Non éligible
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {accountData?.payment_eligibility ? 'Peut effectuer des paiements' : 'Profil incomplet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Sécurité</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountData?.security_score}/100</div>
            <Progress value={accountData?.security_score} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {accountData?.security_score >= 90 ? 'Excellent' : 'À améliorer'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du Compte
            </CardTitle>
            <CardDescription>
              Détails de votre compte et de votre activité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Membre depuis</p>
                <p className="text-lg font-semibold">{accountData?.account_age} jours</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dernière activité</p>
                <p className="text-lg font-semibold">
                  {new Date(accountData?.last_activity).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abonnements actifs</p>
                <p className="text-lg font-semibold">{accountData?.active_subscriptions}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total dépensé</p>
                <p className="text-lg font-semibold text-green-600">{accountData?.total_spent}€</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={() => navigate('/user/profile')} 
                className="w-full"
                variant="outline"
              >
                <User className="mr-2 h-4 w-4" />
                Modifier mon profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres de sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité du Compte
            </CardTitle>
            <CardDescription>
              Gérez la sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <Badge variant={accountData?.notifications_enabled ? "default" : "secondary"}>
                  {accountData?.notifications_enabled ? "Activées" : "Désactivées"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Authentification 2FA</span>
                </div>
                <Badge variant={accountData?.two_factor_enabled ? "default" : "secondary"}>
                  {accountData?.two_factor_enabled ? "Activée" : "Désactivée"}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button 
                onClick={() => navigate('/user/settings')} 
                className="w-full"
                variant="outline"
                size="sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                Paramètres de sécurité
              </Button>
              <Button 
                onClick={() => navigate('/user/notifications')} 
                className="w-full"
                variant="outline"
                size="sm"
              >
                <Bell className="mr-2 h-4 w-4" />
                Gérer les notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activité Récente
          </CardTitle>
          <CardDescription>
            Historique des dernières actions sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accountData?.recent_activities.map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="p-2 rounded-full bg-muted">
                  {activity.type === 'login' && <User className="h-4 w-4 text-primary" />}
                  {activity.type === 'payment' && <CreditCard className="h-4 w-4 text-green-600" />}
                  {activity.type === 'profile' && <Settings className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
