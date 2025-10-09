import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/contexts/PaymentContext";
import { useToast } from "@/hooks/use-toast";
import { SupportWidgetContainer } from "./SupportWidgetContainer";
import { SupportWidgetSettings } from "./SupportWidgetSettings";
import { SupportRecentActivity } from "./SupportRecentActivity";
import { TrendingUp, Target, Loader2, Shield } from "lucide-react";

const SupportDashboardNew = () => {
  const { adminDashboard, fetchAdminDashboard, loading: paymentLoading } = usePayment();
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  
  // Refs pour éviter les dépendances instables
  const fetchWithAuthRef = useRef(fetchWithAuth);
  const fetchAdminDashboardRef = useRef(fetchAdminDashboard);
  const toastRef = useRef(toast);
  
  // Mettre à jour les refs
  fetchWithAuthRef.current = fetchWithAuth;
  fetchAdminDashboardRef.current = fetchAdminDashboard;
  toastRef.current = toast;

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Charger les données de paiements
      await fetchAdminDashboardRef.current();
      
      // Charger les statistiques support
      const supportStatsResponse = await fetchWithAuthRef.current(`${API_BASE}/api/support/dashboard/`);
      if (supportStatsResponse.ok) {
        const supportStats = await supportStatsResponse.json();
        setStatsData(supportStats);
      }
      
      // Charger les statistiques utilisateurs (fallback)
      const statsResponse = await fetchWithAuthRef.current(`${API_BASE}/api/auth/admin/overview/stats/`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatsData(statsData);
      }
      
      // Charger les données d'activité
      const activityResponse = await fetchWithAuthRef.current(`${API_BASE}/api/auth/admin/overview/activity/`);
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivityData(activityData);
      }
    } catch (error) {
      toastRef.current({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE]); // Seulement API_BASE comme dépendance

  useEffect(() => {
    fetchAllData();
  }, []); // Se déclenche une seule fois au montage

  // Calculer les objectifs basés sur les vraies données (mémorisé)
  const goals = useMemo(() => {
    if (!statsData || !adminDashboard) {
      return {
        users: { current: 0, target: 100, percentage: 0 },
        revenue: { current: 0, target: 10000, percentage: 0 },
        satisfaction: { current: 4.7, target: 5.0, percentage: 94 }
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Utilisateurs ce mois
    const newUsersThisMonth = statsData.users.new_this_week * 4; // Approximation
    const userGoal = 50; // Objectif mensuel
    const userPercentage = Math.min((newUsersThisMonth / userGoal) * 100, 100);
    
    // Revenus ce mois
    const currentMonthRevenue = adminDashboard.payment_history
      ?.filter((p: any) => {
        const date = new Date(p.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      ?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;
    
    const revenueGoal = 5000; // Objectif mensuel
    const revenuePercentage = Math.min((currentMonthRevenue / revenueGoal) * 100, 100);

    return {
      users: { 
        current: newUsersThisMonth, 
        target: userGoal, 
        percentage: userPercentage 
      },
      revenue: { 
        current: currentMonthRevenue, 
        target: revenueGoal, 
        percentage: revenuePercentage 
      },
      satisfaction: { 
        current: 4.7, 
        target: 5.0, 
        percentage: 94 
      }
    };
  }, [statsData, adminDashboard]);

  // Calculer les métriques de performance (mémorisé)
  const performance = useMemo(() => {
    if (!adminDashboard) {
      return {
        retention: 0,
        responseTime: 0,
        conversion: 0,
        support: 0
      };
    }

    const totalUsers = statsData?.users?.total || 1;
    const activeUsers = statsData?.users?.active || 0;
    const totalPayments = adminDashboard.payment_history?.length || 0;
    const pendingPayments = adminDashboard.pending_payments_count || 0;

    return {
      retention: Math.round((activeUsers / totalUsers) * 100),
      responseTime: 2.3, // Temps de réponse moyen
      conversion: Math.round((totalPayments / totalUsers) * 100),
      support: Math.round(((totalPayments - pendingPayments) / Math.max(totalPayments, 1)) * 100)
    };
  }, [adminDashboard, statsData]);

  const handleWidgetReset = () => {
    // Le reset sera géré par SupportWidgetContainer lui-même
  };

  if (loading || paymentLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bouton Support Panel fixe pour mobile */}
      <div className="fixed left-4 top-24 z-50 md:hidden">
        <SidebarTrigger className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-3 shadow-lg">
          <Shield className="h-5 w-5" />
        </SidebarTrigger>
      </div>
      
      {/* Widgets personnalisables */}
      <SupportWidgetContainer statsData={statsData} adminDashboard={adminDashboard} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SupportRecentActivity activityData={activityData} />
        </div>
        
        <div className="space-y-6">
          {/* Paramètres des widgets */}
          <SupportWidgetSettings onReset={handleWidgetReset} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objectifs Mensuels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Nouveaux clients</span>
                  <span>{goals.users.percentage.toFixed(0)}%</span>
                </div>
                <Progress value={goals.users.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {goals.users.current.toFixed(0)}/{goals.users.target} objectif
                </p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Revenus</span>
                  <span>{goals.revenue.percentage.toFixed(0)}%</span>
                </div>
                <Progress value={goals.revenue.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  €{goals.revenue.current.toFixed(0)}/{goals.revenue.target} objectif
                </p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Satisfaction client</span>
                  <span>{goals.satisfaction.percentage}%</span>
                </div>
                <Progress value={goals.satisfaction.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {goals.satisfaction.current}/5.0 étoiles
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Taux de rétention</span>
                <span className="font-semibold text-green-600">{performance.retention}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Temps de réponse</span>
                <span className="font-semibold text-blue-600">{performance.responseTime}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Taux de conversion</span>
                <span className="font-semibold text-purple-600">{performance.conversion}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Satisfaction support</span>
                <span className="font-semibold text-green-600">{performance.support}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboardNew;

