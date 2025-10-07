import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Plus,
  Minus,
  DollarSign,
  Calendar,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export function UserWallet() {
  const { user, fetchWithAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par un vrai appel API
      setWalletData({
        total_balance: 1250.75,
        available_balance: 850.25,
        pending_balance: 400.50,
        total_deposits: 2000.00,
        total_withdrawals: 749.25,
        monthly_income: 1250.75,
        monthly_expenses: 450.00,
        profit_loss: 800.75,
        profit_percentage: 64.2,
        transactions: [
          {
            id: 1,
            type: 'deposit',
            amount: 500.00,
            description: 'Formation Advanced',
            date: '2024-01-15',
            status: 'completed'
          },
          {
            id: 2,
            type: 'withdrawal',
            amount: -99.00,
            description: 'Signaux Mensuels',
            date: '2024-01-10',
            status: 'completed'
          },
          {
            id: 3,
            type: 'profit',
            amount: 250.75,
            description: 'Profit Trading',
            date: '2024-01-08',
            status: 'completed'
          },
          {
            id: 4,
            type: 'pending',
            amount: 400.50,
            description: 'Formation Basic',
            date: '2024-01-20',
            status: 'pending'
          }
        ],
        upcoming_payments: [
          {
            service: 'Signaux Mensuels',
            amount: 99.00,
            date: '2024-02-01',
            type: 'subscription'
          },
          {
            service: 'Formation Pro',
            amount: 699.00,
            date: '2024-02-15',
            type: 'formation'
          }
        ]
      });
    } catch (error) {
      console.error('Erreur lors du chargement du portefeuille:', error);
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

  const formatAmount = (amount: number) => {
    return showBalance ? `${amount.toFixed(2)}€` : '••••€';
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'profit':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'profit':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'pending':
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 sm:h-8 sm:w-8" />
            Mon Portefeuille
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez vos finances et suivez vos transactions
          </p>
        </div>
      </div>

      {/* Solde principal */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Solde Total
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl sm:text-4xl font-bold text-primary">
            {formatAmount(walletData?.total_balance)}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground">Disponible</p>
              <p className="text-lg font-semibold text-green-600">
                {formatAmount(walletData?.available_balance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatAmount(walletData?.pending_balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit/Perte</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{formatAmount(walletData?.profit_loss)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={walletData?.profit_percentage} className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {walletData?.profit_percentage}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépôts Total</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(walletData?.total_deposits)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tous les temps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retraits Total</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(walletData?.total_withdrawals)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tous les temps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{formatAmount(walletData?.monthly_income)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenus - {formatAmount(walletData?.monthly_expenses)} dépenses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transactions Récentes
            </CardTitle>
            <CardDescription>
              Historique de vos dernières transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {walletData?.transactions.slice(0, 5).map((transaction: any) => (
                <div key={transaction.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 rounded-full bg-muted">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                    </p>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status === 'completed' ? 'Terminé' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => navigate('/user/payments')} 
              className="w-full mt-4"
              variant="outline"
            >
              Voir toutes les transactions
            </Button>
          </CardContent>
        </Card>

        {/* Paiements à venir */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Paiements à Venir
            </CardTitle>
            <CardDescription>
              Prochains paiements programmés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {walletData?.upcoming_payments.map((payment: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{payment.service}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">
                      {formatAmount(payment.amount)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {payment.type === 'subscription' ? 'Abonnement' : 'Formation'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => navigate('/user/payments')} 
              className="w-full mt-4"
              variant="outline"
            >
              Gérer les paiements
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
          <CardDescription>
            Gérez rapidement votre portefeuille
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/user/payments')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-sm">Mes Paiements</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/services')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Nouveau Service</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/user/profile')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Target className="h-6 w-6" />
              <span className="text-sm">Mon Profil</span>
            </Button>
            
            <Button 
              onClick={() => {/* TODO: Export des données */}}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Download className="h-6 w-6" />
              <span className="text-sm">Exporter</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
