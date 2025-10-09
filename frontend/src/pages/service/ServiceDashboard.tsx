import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/config/api";
import {
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare,
  Package
} from "lucide-react";

const ServiceDashboard = () => {
  const { fetchWithAuth } = useAuth();
  const [stats, setStats] = useState({
    pendingPayments: 0,
    totalRevenue: 0,
    totalClients: 0,
    activeSubscriptions: 0,
    unreadMessages: 0,
    pendingOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_CONFIG.BASE_URL}/api/payments/admin/dashboard/`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          pendingPayments: data.pending_payments_count || 0,
          totalRevenue: data.total_revenue || 0,
          totalClients: data.total_users || 0,
          activeSubscriptions: data.active_subscriptions || 0,
          unreadMessages: 0, // À implémenter
          pendingOrders: 0, // À implémenter
        });
        setRecentActivity(data.recent_pending_payments || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Paiements en attente",
      value: stats.pendingPayments,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500",
    },
    {
      title: "Revenus Total",
      value: `${stats.totalRevenue.toFixed(2)} €`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500",
    },
    {
      title: "Clients Total",
      value: stats.totalClients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
    },
    {
      title: "Abonnements Actifs",
      value: stats.activeSubscriptions,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
    },
    {
      title: "Messages Non Lus",
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500",
    },
    {
      title: "Commandes en attente",
      value: stats.pendingOrders,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Service Client</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de vos opérations quotidiennes
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index} className={`border-l-4 ${stat.borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activité Récente */}
      <Card>
        <CardHeader>
          <CardTitle>Paiements Récents</CardTitle>
          <CardDescription>
            Les derniers paiements en attente de traitement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun paiement en attente
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5" style={{ color: '#D4AF37' }} />
                    </div>
                    <div>
                      <p className="font-medium">{payment.user?.name || 'Utilisateur'}</p>
                      <p className="text-sm text-muted-foreground">{payment.offer?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: '#D4AF37' }}>
                      {payment.amount} {payment.currency}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {payment.status === 'transaction_submitted' ? 'À vérifier' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Accès rapide aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/service/payments"
              className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <CreditCard className="h-8 w-8" style={{ color: '#D4AF37' }} />
              <span className="font-medium">Gérer Paiements</span>
            </a>
            <a
              href="/service/messages"
              className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <MessageSquare className="h-8 w-8" style={{ color: '#D4AF37' }} />
              <span className="font-medium">Messages</span>
            </a>
            <a
              href="/service/clients"
              className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <Users className="h-8 w-8" style={{ color: '#D4AF37' }} />
              <span className="font-medium">Clients</span>
            </a>
            <a
              href="/service/invoices"
              className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <CheckCircle className="h-8 w-8" style={{ color: '#D4AF37' }} />
              <span className="font-medium">Factures</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceDashboard;

