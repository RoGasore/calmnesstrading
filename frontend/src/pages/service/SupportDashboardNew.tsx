import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/contexts/PaymentContext";
import { API_CONFIG } from "@/config/api";
import { WidgetContainer } from "@/components/admin/widgets/WidgetContainer";
import { WidgetSettings } from "@/components/admin/widgets/WidgetSettings";
import {
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare,
  Package,
  Settings
} from "lucide-react";

const SupportDashboardNew = () => {
  const { fetchWithAuth } = useAuth();
  const { adminDashboard, fetchAdminDashboard } = usePayment();
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
      await fetchAdminDashboard();
      
      // Charger stats supplémentaires si nécessaire
      const response = await fetchWithAuth(`${API_CONFIG.BASE_URL}/api/payments/admin/dashboard/`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          pendingPayments: data.pending_payments_count || 0,
          totalRevenue: data.total_revenue || 0,
          totalClients: data.total_users || 0,
          activeSubscriptions: data.active_subscriptions || 0,
          unreadMessages: 0,
          pendingOrders: 0,
        });
        setRecentActivity(data.recent_pending_payments || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Dashboard Support</h1>
            <p className="text-muted-foreground mt-1">
              Gestion des opérations et support client
            </p>
          </div>
        </div>
        
        <WidgetSettings storageKey="support_widgets" />
      </div>

      {/* Widgets personnalisables */}
      <WidgetContainer
        storageKey="support_widgets"
        availableWidgets={[
          {
            id: 'payments',
            title: 'Paiements en attente',
            component: (
              <Card className="border-l-4 border-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paiements en attente</CardTitle>
                  <Clock className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nécessite votre attention
                  </p>
                  <Button 
                    className="mt-3 w-full" 
                    size="sm"
                    onClick={() => window.location.href = '/support/payments'}
                  >
                    Gérer les paiements
                  </Button>
                </CardContent>
              </Card>
            )
          },
          {
            id: 'revenue',
            title: 'Revenus Total',
            component: (
              <Card className="border-l-4 border-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus Total</CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                    {stats.totalRevenue.toFixed(2)} €
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +12% ce mois
                  </p>
                </CardContent>
              </Card>
            )
          },
          {
            id: 'clients',
            title: 'Clients Total',
            component: (
              <Card className="border-l-4 border-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clients Total</CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClients}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilisateurs actifs
                  </p>
                </CardContent>
              </Card>
            )
          },
          {
            id: 'subscriptions',
            title: 'Abonnements Actifs',
            component: (
              <Card className="border-l-4 border-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Renouvellements à venir
                  </p>
                </CardContent>
              </Card>
            )
          },
          {
            id: 'messages',
            title: 'Messages Non Lus',
            component: (
              <Card className="border-l-4 border-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages Non Lus</CardTitle>
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    En attente de réponse
                  </p>
                  <Button 
                    className="mt-3 w-full" 
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = '/support/messages'}
                  >
                    Voir les messages
                  </Button>
                </CardContent>
              </Card>
            )
          },
          {
            id: 'orders',
            title: 'Commandes en attente',
            component: (
              <Card className="border-l-4 border-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commandes en attente</CardTitle>
                  <Package className="h-5 w-5 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    À traiter
                  </p>
                </CardContent>
              </Card>
            )
          },
          {
            id: 'recent-payments',
            title: 'Paiements Récents',
            component: (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>Paiements Récents</CardTitle>
                  <CardDescription>
                    Les derniers paiements en attente de validation
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
            )
          },
          {
            id: 'quick-actions',
            title: 'Actions Rapides',
            component: (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                  <CardDescription>
                    Accès rapide aux fonctionnalités principales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <a
                      href="/support/payments"
                      className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center group"
                    >
                      <CreditCard className="h-8 w-8 group-hover:scale-110 transition-transform" style={{ color: '#D4AF37' }} />
                      <span className="font-medium">Gérer Paiements</span>
                    </a>
                    <a
                      href="/support/messages"
                      className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center group"
                    >
                      <MessageSquare className="h-8 w-8 group-hover:scale-110 transition-transform" style={{ color: '#D4AF37' }} />
                      <span className="font-medium">Messages</span>
                    </a>
                    <a
                      href="/support/clients"
                      className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center group"
                    >
                      <Users className="h-8 w-8 group-hover:scale-110 transition-transform" style={{ color: '#D4AF37' }} />
                      <span className="font-medium">Clients</span>
                    </a>
                    <a
                      href="/support/invoices"
                      className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center group"
                    >
                      <CheckCircle className="h-8 w-8 group-hover:scale-110 transition-transform" style={{ color: '#D4AF37' }} />
                      <span className="font-medium">Factures</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )
          }
        ]}
      />
    </div>
  );
};

export default SupportDashboardNew;

