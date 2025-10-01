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
  DollarSign,
  Users,
  Target,
  Shield
} from "lucide-react";

interface GestionAccount {
  id: number;
  client_name: string;
  client_email: string;
  account_balance: number;
  managed_balance: number;
  performance: number;
  status: 'active' | 'paused' | 'closed';
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
  last_trade: string;
}

export function GestionManagement() {
  const [accounts, setAccounts] = useState<GestionAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Données de démonstration
  useEffect(() => {
    const mockAccounts: GestionAccount[] = [
      {
        id: 1,
        client_name: "Jean Dupont",
        client_email: "jean.dupont@email.com",
        account_balance: 10000,
        managed_balance: 8500,
        performance: 12.5,
        status: 'active',
        risk_level: 'medium',
        created_at: '2024-01-15',
        last_trade: '2024-03-01T14:30:00'
      },
      {
        id: 2,
        client_name: "Marie Martin",
        client_email: "marie.martin@email.com",
        account_balance: 25000,
        managed_balance: 22000,
        performance: 8.2,
        status: 'active',
        risk_level: 'low',
        created_at: '2024-02-01',
        last_trade: '2024-02-28T16:45:00'
      },
      {
        id: 3,
        client_name: "Pierre Durand",
        client_email: "pierre.durand@email.com",
        account_balance: 5000,
        managed_balance: 4500,
        performance: -2.1,
        status: 'paused',
        risk_level: 'high',
        created_at: '2024-02-15',
        last_trade: '2024-02-25T10:20:00'
      }
    ];
    
    setTimeout(() => {
      setAccounts(mockAccounts);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, label: 'Actif' },
      paused: { variant: 'secondary' as const, label: 'En pause' },
      closed: { variant: 'destructive' as const, label: 'Fermé' }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: { variant: 'default' as const, label: 'Faible', color: 'text-green-600' },
      medium: { variant: 'secondary' as const, label: 'Moyen', color: 'text-yellow-600' },
      high: { variant: 'destructive' as const, label: 'Élevé', color: 'text-red-600' }
    };
    const config = variants[risk as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPerformance = (value: number) => {
    const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-muted-foreground';
    const icon = value > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span>{value > 0 ? '+' : ''}{value.toFixed(1)}%</span>
      </div>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
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

  const filteredAccounts = accounts.filter(account =>
    account.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.client_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalManaged = accounts.reduce((sum, account) => sum + account.managed_balance, 0);
  const averagePerformance = accounts.length > 0 ? 
    accounts.reduce((sum, account) => sum + account.performance, 0) / accounts.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion de Comptes</h2>
          <p className="text-muted-foreground">
            Gérez les comptes clients sous gestion
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Compte
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comptes Actifs</p>
                <p className="text-2xl font-bold">{accounts.filter(a => a.status === 'active').length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Capital Géré</p>
                <p className="text-2xl font-bold">{formatCurrency(totalManaged)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Moy.</p>
                <p className="text-2xl font-bold">{averagePerformance > 0 ? '+' : ''}{averagePerformance.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comptes</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
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
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des comptes */}
      <Card>
        <CardHeader>
          <CardTitle>Comptes sous Gestion ({filteredAccounts.length})</CardTitle>
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
                    <TableHead>Client</TableHead>
                    <TableHead>Solde Total</TableHead>
                    <TableHead>Capital Géré</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Risque</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernier Trade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{account.client_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.client_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(account.account_balance)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(account.managed_balance)}</span>
                      </TableCell>
                      <TableCell>
                        {formatPerformance(account.performance)}
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(account.risk_level)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(account.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateTime(account.last_trade)}
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
                            <DropdownMenuItem>
                              <Shield className="h-4 w-4 mr-2" />
                              Gérer risque
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Fermer compte
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
