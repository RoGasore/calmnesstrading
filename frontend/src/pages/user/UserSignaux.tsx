import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign
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

export function UserSignaux() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');

  // Données de démonstration
  const signals = [
    {
      id: 1,
      pair: 'EUR/USD',
      type: 'BUY',
      entry: 1.0850,
      takeProfit: 1.0950,
      stopLoss: 1.0800,
      currentPrice: 1.0920,
      status: 'active',
      profit: 70,
      date: '2024-01-15 10:30',
      timeframe: '4H'
    },
    {
      id: 2,
      pair: 'BTC/USD',
      type: 'SELL',
      entry: 42500,
      takeProfit: 41000,
      stopLoss: 43200,
      currentPrice: 41800,
      status: 'active',
      profit: 700,
      date: '2024-01-15 08:00',
      timeframe: '1D'
    },
    {
      id: 3,
      pair: 'GBP/JPY',
      type: 'BUY',
      entry: 185.50,
      takeProfit: 187.00,
      stopLoss: 184.80,
      currentPrice: 187.00,
      status: 'closed',
      profit: 150,
      date: '2024-01-14 14:20',
      closeDate: '2024-01-15 09:15',
      timeframe: '1H'
    },
    {
      id: 4,
      pair: 'ETH/USD',
      type: 'BUY',
      entry: 2250,
      takeProfit: 2400,
      stopLoss: 2180,
      currentPrice: 2180,
      status: 'closed',
      profit: -70,
      date: '2024-01-13 16:45',
      closeDate: '2024-01-14 10:30',
      timeframe: '4H'
    }
  ];

  const filteredSignals = signals.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'active') return s.status === 'active';
    if (filter === 'closed') return s.status === 'closed';
    return true;
  });

  const stats = {
    total: signals.length,
    active: signals.filter(s => s.status === 'active').length,
    closed: signals.filter(s => s.status === 'closed').length,
    totalProfit: signals.reduce((acc, s) => acc + s.profit, 0),
    winRate: Math.round((signals.filter(s => s.profit > 0).length / signals.length) * 100)
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Actif</Badge>;
      case 'closed':
        return <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" />Clôturé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'BUY' ? (
      <Badge className="bg-green-500"><TrendingUp className="h-3 w-3 mr-1" />BUY</Badge>
    ) : (
      <Badge className="bg-red-500"><TrendingDown className="h-3 w-3 mr-1" />SELL</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-3xl font-bold">Mes Signaux</h1>
            <p className="text-muted-foreground">
              Suivez vos signaux de trading en temps réel
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/services')}>
          <Zap className="mr-2 h-4 w-4" />
          S'abonner aux signaux
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">signaux reçus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clôturés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
            <p className="text-xs text-muted-foreground">terminés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Total</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit}€
            </div>
            <p className="text-xs text-muted-foreground">cumulé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.winRate}%</div>
            <p className="text-xs text-muted-foreground">de réussite</p>
          </CardContent>
        </Card>
      </div>

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
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
          size="sm"
        >
          Actifs
        </Button>
        <Button 
          variant={filter === 'closed' ? 'default' : 'outline'}
          onClick={() => setFilter('closed')}
          size="sm"
        >
          Clôturés
        </Button>
      </div>

      {/* Tableau des signaux */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Signaux</CardTitle>
          <CardDescription>
            Liste complète de vos signaux de trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Paire</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entrée</TableHead>
                <TableHead>TP</TableHead>
                <TableHead>SL</TableHead>
                <TableHead>Prix Actuel</TableHead>
                <TableHead>Profit/Perte</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSignals.map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">{signal.date.split(' ')[0]}</span>
                      <span className="text-xs text-muted-foreground">{signal.date.split(' ')[1]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{signal.pair}</span>
                      <Badge variant="outline" className="text-xs">{signal.timeframe}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(signal.type)}</TableCell>
                  <TableCell>{signal.entry}</TableCell>
                  <TableCell className="text-green-600">{signal.takeProfit}</TableCell>
                  <TableCell className="text-red-600">{signal.stopLoss}</TableCell>
                  <TableCell className="font-semibold">{signal.currentPrice}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${signal.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {signal.profit >= 0 ? '+' : ''}{signal.profit}€
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(signal.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Abonnement */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Mon Abonnement Signaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plan Mensuel</p>
              <p className="text-sm text-muted-foreground">Actif jusqu'au 31 janvier 2024</p>
            </div>
            <Badge className="bg-green-500">Actif</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Prix</p>
              <p className="font-bold">99€/mois</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Signaux ce mois</p>
              <p className="font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prochain paiement</p>
              <p className="font-bold">01/02/2024</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate('/user/payments')}>
            Gérer mon abonnement
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

