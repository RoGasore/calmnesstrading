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
  Package, 
  CheckCircle, 
  Clock,
  XCircle,
  Eye,
  Loader2,
  Users,
  DollarSign,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/config/api";

interface Order {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  offer: {
    name: string;
    description: string;
    price: number;
    currency: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  notes?: string;
  tracking_info?: {
    method: string;
    details: string;
  };
}

const SupportOrders = () => {
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Simuler des données pour le moment
      const mockOrders: Order[] = [
        {
          id: 1,
          user: {
            id: 1,
            name: "Jean Dupont",
            email: "jean@example.com"
          },
          offer: {
            name: "Signaux Premium",
            description: "Accès aux signaux de trading premium",
            price: 297.00,
            currency: "EUR"
          },
          status: "completed",
          payment_status: "paid",
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          tracking_info: {
            method: "email",
            details: "Accès envoyé par email"
          }
        },
        {
          id: 2,
          user: {
            id: 2,
            name: "Marie Martin",
            email: "marie@example.com"
          },
          offer: {
            name: "Formation Complète",
            description: "Formation complète au trading",
            price: 497.00,
            currency: "EUR"
          },
          status: "processing",
          payment_status: "paid",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Formation en cours de préparation"
        },
        {
          id: 3,
          user: {
            id: 3,
            name: "Pierre Durand",
            email: "pierre@example.com"
          },
          offer: {
            name: "Signaux Basic",
            description: "Accès aux signaux de trading basique",
            price: 97.00,
            currency: "EUR"
          },
          status: "pending",
          payment_status: "pending",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "En attente de paiement"
        },
        {
          id: 4,
          user: {
            id: 4,
            name: "Sophie Bernard",
            email: "sophie@example.com"
          },
          offer: {
            name: "Consultation Privée",
            description: "Session de consultation privée 1h",
            price: 150.00,
            currency: "EUR"
          },
          status: "cancelled",
          payment_status: "refunded",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Annulé par le client - remboursement effectué"
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500"><Package className="w-3 h-3 mr-1" />En cours</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500"><CheckCircle className="w-3 h-3 mr-1" />Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500"><XCircle className="w-3 h-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500">En attente</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500">Payé</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500">Échec</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-500">Remboursé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.offer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.offer.price, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Commandes Support</h1>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
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
                placeholder="Rechercher par client, email ou offre..."
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
                <option value="pending">En attente</option>
                <option value="processing">En cours</option>
                <option value="completed">Terminés</option>
                <option value="cancelled">Annulés</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes</CardTitle>
          <CardDescription>
            Gérez les commandes et leur statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune commande trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Offre</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.user.name}</div>
                        <div className="text-sm text-muted-foreground">{order.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.offer.name}</div>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {order.offer.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      €{order.offer.price.toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
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
            <DialogTitle>Commande #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              {selectedOrder?.offer.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Informations du client */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nom</Label>
                      <div className="font-medium">{selectedOrder.user.name}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="font-medium">{selectedOrder.user.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Détails de la commande */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détails de la Commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Offre</Label>
                        <div className="font-medium">{selectedOrder.offer.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedOrder.offer.description}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Prix</Label>
                        <div className="font-bold text-lg">€{selectedOrder.offer.price.toFixed(2)}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Statut</Label>
                        <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Paiement</Label>
                        <div className="mt-1">{getPaymentStatusBadge(selectedOrder.payment_status)}</div>
                      </div>
                    </div>
                    
                    {selectedOrder.notes && (
                      <div>
                        <Label className="text-muted-foreground">Notes</Label>
                        <div className="bg-muted p-3 rounded-lg mt-1">
                          {selectedOrder.notes}
                        </div>
                      </div>
                    )}

                    {selectedOrder.tracking_info && (
                      <div>
                        <Label className="text-muted-foreground">Informations de suivi</Label>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-1">
                          <div className="font-medium">{selectedOrder.tracking_info.method}</div>
                          <div className="text-sm text-muted-foreground">{selectedOrder.tracking_info.details}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Créé le</Label>
                      <div className="font-medium">
                        {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Modifié le</Label>
                      <div className="font-medium">
                        {new Date(selectedOrder.updated_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
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

export default SupportOrders;
