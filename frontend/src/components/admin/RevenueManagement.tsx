import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Calendar,
  Download,
  Filter
} from "lucide-react";

interface RevenueData {
  period: string;
  total_revenue: number;
  subscriptions: number;
  one_time_payments: number;
  refunds: number;
  net_revenue: number;
  growth: number;
}

interface SubscriptionData {
  id: number;
  user_name: string;
  plan: string;
  amount: number;
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  next_billing: string;
}

export function RevenueManagement() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Données de démonstration
  useEffect(() => {
    const mockRevenueData: RevenueData[] = [
      {
        period: 'Mars 2024',
        total_revenue: 15420,
        subscriptions: 12800,
        one_time_payments: 2620,
        refunds: 0,
        net_revenue: 15420,
        growth: 12.5
      },
      {
        period: 'Février 2024',
        total_revenue: 13700,
        subscriptions: 11200,
        one_time_payments: 2500,
        refunds: 0,
        net_revenue: 13700,
        growth: 8.3
      },
      {
        period: 'Janvier 2024',
        total_revenue: 12650,
        subscriptions: 10200,
        one_time_payments: 2450,
        refunds: 0,
        net_revenue: 12650,
        growth: -2.1
      }
    ];

    const mockSubscriptions: SubscriptionData[] = [
      {
        id: 1,
        user_name: "Jean Dupont",
        plan: "Professional",
        amount: 99,
        status: 'active',
        start_date: '2024-01-15',
        next_billing: '2024-04-15'
      },
      {
        id: 2,
        user_name: "Marie Martin",
        plan: "Elite",
        amount: 199,
        status: 'active',
        start_date: '2024-02-01',
        next_billing: '2024-04-01'
      },
      {
        id: 3,
        user_name: "Pierre Durand",
        plan: "Starter",
        amount: 49,
        status: 'cancelled',
        start_date: '2024-01-20',
        next_billing: '2024-03-20'
      }
    ];
    
    setTimeout(() => {
      setRevenueData(mockRevenueData);
      setSubscriptions(mockSubscriptions);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, label: 'Actif' },
      cancelled: { variant: 'destructive' as const, label: 'Annulé' },
      expired: { variant: 'secondary' as const, label: 'Expiré' }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const variants = {
      Starter: { variant: 'secondary' as const, label: 'Starter' },
      Professional: { variant: 'default' as const, label: 'Professional' },
      Elite: { variant: 'destructive' as const, label: 'Elite' }
    };
    const config = variants[plan as keyof typeof variants] || { variant: 'outline' as const, label: plan };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const currentMonth = revenueData[0];
  const totalActiveSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const monthlyRecurringRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Revenus</h2>
          <p className="text-muted-foreground">
            Suivez vos revenus et abonnements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus du Mois</p>
                <p className="text-2xl font-bold">{currentMonth ? formatCurrency(currentMonth.net_revenue) : '€0'}</p>
                {currentMonth && (
                  <div className={`flex items-center gap-1 text-sm ${currentMonth.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentMonth.growth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{currentMonth.growth > 0 ? '+' : ''}{currentMonth.growth}%</span>
                  </div>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyRecurringRevenue)}</p>
                <p className="text-sm text-muted-foreground">Revenus récurrents</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abonnements Actifs</p>
                <p className="text-2xl font-bold">{totalActiveSubscriptions}</p>
                <p className="text-sm text-muted-foreground">sur {subscriptions.length} total</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de Rétention</p>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-sm text-muted-foreground">Ce mois</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Évolution des revenus */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Revenus</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {revenueData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{data.period}</h3>
                    <p className="text-sm text-muted-foreground">
                      Abonnements: {formatCurrency(data.subscriptions)} • 
                      Paiements uniques: {formatCurrency(data.one_time_payments)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(data.net_revenue)}</p>
                    <div className={`flex items-center gap-1 text-sm ${data.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.growth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span>{data.growth > 0 ? '+' : ''}{data.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abonnements récents */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnements Récents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{subscription.user_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getPlanBadge(subscription.plan)}
                      {getStatusBadge(subscription.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Début: {formatDate(subscription.start_date)} • 
                      Prochaine facture: {formatDate(subscription.next_billing)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(subscription.amount)}</p>
                    <p className="text-sm text-muted-foreground">/mois</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}