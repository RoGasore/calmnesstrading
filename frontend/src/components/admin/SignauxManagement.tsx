import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target
} from "lucide-react";

interface Signal {
  id: number;
  pair: string;
  type: 'buy' | 'sell';
  entry_price: number;
  target_price: number;
  stop_loss: number;
  status: 'active' | 'closed' | 'cancelled';
  profit_loss: number;
  created_at: string;
  closed_at?: string;
}

export function SignauxManagement() {
  const [signaux, setSignaux] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Données de démonstration
  useEffect(() => {
    const mockSignaux: Signal[] = [
      {
        id: 1,
        pair: "EUR/USD",
        type: 'buy',
        entry_price: 1.0850,
        target_price: 1.0920,
        stop_loss: 1.0800,
        status: 'active',
        profit_loss: 0,
        created_at: '2024-03-01T10:30:00'
      },
      {
        id: 2,
        pair: "GBP/USD",
        type: 'sell',
        entry_price: 1.2650,
        target_price: 1.2580,
        stop_loss: 1.2700,
        status: 'closed',
        profit_loss: 45.2,
        created_at: '2024-02-28T14:15:00',
        closed_at: '2024-02-28T16:45:00'
      },
      {
        id: 3,
        pair: "USD/JPY",
        type: 'buy',
        entry_price: 150.20,
        target_price: 151.00,
        stop_loss: 149.50,
        status: 'cancelled',
        profit_loss: -12.5,
        created_at: '2024-02-27T09:20:00',
        closed_at: '2024-02-27T11:30:00'
      }
    ];
    
    setTimeout(() => {
      setSignaux(mockSignaux);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeIcon = (type: string) => {
    return type === 'buy' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTypeBadge = (type: string) => {
    return type === 'buy' ? 
      <Badge variant="default" className="bg-green-600">Achat</Badge> : 
      <Badge variant="destructive">Vente</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, label: 'Actif' },
      closed: { variant: 'secondary' as const, label: 'Fermé' },
      cancelled: { variant: 'destructive' as const, label: 'Annulé' }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatProfitLoss = (value: number) => {
    const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-muted-foreground';
    const icon = value > 0 ? <TrendingUp className="h-3 w-3" /> : value < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />;
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span>{value > 0 ? '+' : ''}{value.toFixed(1)} pips</span>
      </div>
    );
  };

  const filteredSignaux = signaux.filter(signal =>
    signal.pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Signaux</h2>
          <p className="text-muted-foreground">
            Gérez vos signaux de trading en temps réel
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Signal
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Signaux Actifs</p>
                <p className="text-2xl font-bold">{signaux.filter(s => s.status === 'active').length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de Réussite</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Moyen</p>
                <p className="text-2xl font-bold">+32.5</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Signaux</p>
                <p className="text-2xl font-bold">{signaux.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par paire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des signaux */}
      <Card>
        <CardHeader>
          <CardTitle>Signaux ({filteredSignaux.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paire</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Prix d'Entrée</TableHead>
                    <TableHead>Cible</TableHead>
                    <TableHead>Stop Loss</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSignaux.map((signal) => (
                    <TableRow key={signal.id}>
                      <TableCell>
                        <div className="font-medium">{signal.pair}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(signal.type)}
                          {getTypeBadge(signal.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{signal.entry_price}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-green-600">{signal.target_price}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-red-600">{signal.stop_loss}</span>
                      </TableCell>
                      <TableCell>
                        {formatProfitLoss(signal.profit_loss)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(signal.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(signal.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
