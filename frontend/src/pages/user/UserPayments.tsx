import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  CreditCard, 
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function UserPayments() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Données de démonstration
  const payments = [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Formation Advanced',
      amount: 349.00,
      status: 'completed',
      method: 'Carte bancaire',
      invoice: 'INV-2024-001'
    },
    {
      id: 2,
      date: '2024-01-01',
      description: 'Signaux Mensuels - Janvier',
      amount: 99.00,
      status: 'completed',
      method: 'Carte bancaire',
      invoice: 'INV-2024-002'
    },
    {
      id: 3,
      date: '2023-12-20',
      description: 'Formation Basic',
      amount: 199.00,
      status: 'completed',
      method: 'PayPal',
      invoice: 'INV-2023-045'
    },
    {
      id: 4,
      date: '2024-02-01',
      description: 'Signaux Mensuels - Février',
      amount: 99.00,
      status: 'pending',
      method: 'Carte bancaire',
      invoice: 'INV-2024-003'
    }
  ];

  const subscriptions = [
    {
      id: 1,
      name: 'Signaux Mensuels',
      price: 99,
      status: 'active',
      nextPayment: '2024-02-01',
      frequency: 'monthly'
    }
  ];

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'completed') return p.status === 'completed';
    if (filter === 'pending') return p.status === 'pending';
    return true;
  });

  const stats = {
    total: payments.reduce((acc, p) => p.status === 'completed' ? acc + p.amount : acc, 0),
    thisMonth: payments
      .filter(p => p.date.startsWith('2024-01') && p.status === 'completed')
      .reduce((acc, p) => acc + p.amount, 0),
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Payé</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Échoué</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Mes Paiements</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gérez vos paiements et abonnements
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/services')} className="w-full sm:w-auto">
          <TrendingUp className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Découvrir nos services</span>
          <span className="sm:hidden">Services</span>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dépensé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">cumulé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisMonth.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">janvier 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">complétés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">à venir</p>
          </CardContent>
        </Card>
      </div>

      {/* Abonnements actifs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mes Abonnements
          </CardTitle>
          <CardDescription>
            Gérez vos abonnements et renouvellements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{sub.name}</h4>
                    <Badge className="bg-green-500">Actif</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Prochain paiement: {sub.nextPayment}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{sub.price}€</p>
                  <p className="text-xs text-muted-foreground">par mois</p>
                </div>
                <Button variant="outline" size="sm" className="ml-4">
                  Gérer
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Tous
        </Button>
        <Button 
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
        >
          Payés
        </Button>
        <Button 
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          En attente
        </Button>
      </div>

      {/* Historique des paiements */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Transactions</CardTitle>
          <CardDescription>
            Liste complète de vos paiements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Facture</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {new Date(payment.date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{payment.method}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{payment.amount.toFixed(2)}€</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{payment.invoice}</TableCell>
                  <TableCell>
                    {payment.status === 'completed' && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Méthodes de paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Méthodes de Paiement</CardTitle>
          <CardDescription>
            Gérez vos moyens de paiement enregistrés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Visa •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expire 12/25</p>
                </div>
              </div>
              <Badge>Par défaut</Badge>
            </div>
            
            <Button variant="outline" className="w-full">
              + Ajouter une méthode de paiement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

