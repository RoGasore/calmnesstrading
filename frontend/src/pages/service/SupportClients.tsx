import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  User, 
  Mail, 
  Phone,
  MessageSquare,
  Loader2,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/config/api";

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  telegram_username?: string;
  discord_username?: string;
  whatsapp_number?: string;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  created_at: string;
  last_login?: string;
  subscription?: {
    name: string;
    status: 'active' | 'expired' | 'cancelled';
    expires_at?: string;
  };
  payment_history?: Payment[];
  total_spent: number;
  support_tickets: number;
}

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  offer: {
    name: string;
  };
}

const SupportClients = () => {
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadClients();
  }, [searchTerm, statusFilter]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetchWithAuth(`${API_CONFIG.BASE_URL}/api/support/clients/?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        throw new Error('Erreur lors du chargement des clients');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (client: Client) => {
    if (!client.is_active) {
      return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500">Inactif</Badge>;
    }
    if (client.subscription?.status === 'active') {
      return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500">Actif</Badge>;
    }
    if (client.subscription?.status === 'expired') {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500">Expiré</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-500">Inactif</Badge>;
  };

  const getSubscriptionBadge = (subscription: Client['subscription']) => {
    if (!subscription) return <Badge variant="secondary">Aucun abonnement</Badge>;
    
    switch (subscription.status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500">{subscription.name}</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500">{subscription.name}</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500">Annulé</Badge>;
      default:
        return <Badge variant="secondary">{subscription.name}</Badge>;
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && client.is_active && client.subscription?.status === 'active') ||
                         (statusFilter === "inactive" && !client.is_active) ||
                         (statusFilter === "expired" && client.subscription?.status === 'expired');
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.is_active && c.subscription?.status === 'active').length,
    inactive: clients.filter(c => !c.is_active).length,
    totalRevenue: clients.reduce((sum, c) => sum + c.total_spent, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients Support</h1>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="expired">Expirés</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>
            Gérez les clients et leurs abonnements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun client trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dépenses</TableHead>
                  <TableHead>Support</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                        )}
                        {client.telegram_username && (
                          <div className="flex items-center gap-1 text-sm">
                            <MessageCircle className="h-3 w-3" />
                            {client.telegram_username}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getSubscriptionBadge(client.subscription)}</TableCell>
                    <TableCell>{getStatusBadge(client)}</TableCell>
                    <TableCell className="font-medium">€{client.total_spent.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.support_tickets} tickets</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClient(client)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de visualisation */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du client</DialogTitle>
            <DialogDescription>
              {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations Générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nom</Label>
                      <div className="font-medium">{selectedClient.name}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="font-medium">{selectedClient.email}</div>
                    </div>
                    {selectedClient.phone && (
                      <div>
                        <Label className="text-muted-foreground">Téléphone</Label>
                        <div className="font-medium">{selectedClient.phone}</div>
                      </div>
                    )}
                    {selectedClient.telegram_username && (
                      <div>
                        <Label className="text-muted-foreground">Telegram</Label>
                        <div className="font-medium">{selectedClient.telegram_username}</div>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Statut</Label>
                      <div className="mt-1">{getStatusBadge(selectedClient)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Dernière connexion</Label>
                      <div className="font-medium">
                        {selectedClient.last_login 
                          ? new Date(selectedClient.last_login).toLocaleString('fr-FR')
                          : 'Jamais'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Abonnement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Abonnement</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedClient.subscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-lg">{selectedClient.subscription.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedClient.subscription.status === 'active' && selectedClient.subscription.expires_at && (
                              `Expire le ${new Date(selectedClient.subscription.expires_at).toLocaleDateString('fr-FR')}`
                            )}
                          </div>
                        </div>
                        {getSubscriptionBadge(selectedClient.subscription)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucun abonnement actif
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Historique des paiements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historique des Paiements</CardTitle>
                  <CardDescription>
                    Total dépensé: €{selectedClient.total_spent.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedClient.payment_history && selectedClient.payment_history.length > 0 ? (
                    <div className="space-y-3">
                      {selectedClient.payment_history.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">{payment.offer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">€{payment.amount.toFixed(2)}</div>
                            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500">
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucun paiement
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedClient.support_tickets} tickets</div>
                      <div className="text-sm text-muted-foreground">Demandes de support</div>
                    </div>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Voir les tickets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportClients;
