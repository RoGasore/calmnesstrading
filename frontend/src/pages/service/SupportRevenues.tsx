import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  CreditCard,
  Calendar,
  Loader2
} from "lucide-react";
import { usePayment } from "@/contexts/PaymentContext";
import { motion } from "framer-motion";

const SupportRevenues = () => {
  const { adminDashboard, fetchAdminDashboard, loading } = usePayment();

  useEffect(() => {
    fetchAdminDashboard();
  }, [fetchAdminDashboard]);

  const [revenueData, setRevenueData] = useState<any>(null);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      const response = await fetchWithAuth(`${API_CONFIG.BASE_URL}/api/support/revenues/`);
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    }
  };

  const stats = revenueData ? {
    totalRevenue: revenueData.total_revenue,
    thisMonth: revenueData.this_month,
    lastMonth: revenueData.last_month,
    growth: revenueData.growth,
    totalTransactions: revenueData.total_transactions,
    activeSubscriptions: 0 // Pas encore implémenté
  } : {
    totalRevenue: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    totalTransactions: 0,
    activeSubscriptions: 0
  };

  const offerStats = revenueData?.offer_stats || [];

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des Revenus - Support</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Statistiques principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Depuis le début
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€{stats.thisMonth.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      {stats.growth >= 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-green-500">+{stats.growth.toFixed(1)}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-500" />
                          <span className="text-red-500">{stats.growth.toFixed(1)}%</span>
                        </>
                      )}
                      <span className="ml-1">vs mois dernier</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Paiements validés
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Utilisateurs actifs
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Revenus par offre */}
            <Card>
              <CardHeader>
                <CardTitle>Revenus par offre</CardTitle>
                <CardDescription>
                  Performance de chaque offre - Vue Support
                </CardDescription>
              </CardHeader>
              <CardContent>
                {offerStats.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune donnée de revenus disponible
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Offre</TableHead>
                        <TableHead className="text-center">Ventes</TableHead>
                        <TableHead className="text-right">Revenu Total</TableHead>
                        <TableHead className="text-right">Revenu Moyen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offerStats.map((offer: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{offer.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{offer.count}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {offer.revenue.toFixed(2)} {offer.currency}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {(offer.revenue / offer.count).toFixed(2)} {offer.currency}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Historique récent */}
            <Card>
              <CardHeader>
                <CardTitle>Historique des paiements</CardTitle>
                <CardDescription>
                  Derniers paiements validés - Vue Support
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!revenueData?.recent_payments || revenueData.recent_payments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucun paiement validé
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Offre</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueData.recent_payments.slice(0, 10).map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-sm">
                            {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{payment.user.name}</div>
                              <div className="text-sm text-muted-foreground">{payment.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{payment.offer?.name || 'Offre'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {payment.amount} {payment.currency}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500">
                              Validé
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
  );
};

export default SupportRevenues;
