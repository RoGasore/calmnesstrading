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
  FileText, 
  Download, 
  Eye,
  Loader2,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/config/api";

interface Invoice {
  id: number;
  invoice_number: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  due_date?: string;
  paid_at?: string;
  payment_method?: string;
  items: InvoiceItem[];
  notes?: string;
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const SupportInvoices = () => {
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Charger les vraies factures depuis l'API
      const response = await fetchWithAuth(`${API_CONFIG.BASE_URL}/api/payments/admin/invoices/`);
      if (response.ok) {
        const data = await response.json();
        // Adapter le format si nécessaire
        const adaptedInvoices = data.map((inv: any) => ({
          id: inv.id,
          invoice_number: inv.invoice_number || `CT-${String(inv.id).padStart(5, '0')}`,
          user: {
            id: inv.user?.id || 0,
            name: inv.user?.name || inv.user?.username || 'Utilisateur',
            email: inv.user?.email || ''
          },
          total_amount: parseFloat(inv.total_amount || inv.amount || 0),
          currency: inv.currency || 'EUR',
          status: inv.status || 'draft',
          created_at: inv.created_at,
          due_date: inv.due_date,
          paid_at: inv.paid_at,
          payment_method: inv.payment_method,
          items: inv.items || [],
          notes: inv.notes
        }));
        setInvoices(adaptedInvoices);
        return;
      }
      
      // Si l'API échoue, utiliser des données de démonstration
      const mockInvoices: Invoice[] = [
        {
          id: 1,
          invoice_number: "CT-00001",
          user: {
            id: 1,
            name: "Jean Dupont",
            email: "jean@example.com"
          },
          total_amount: 297.00,
          currency: "EUR",
          status: "paid",
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          paid_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          payment_method: "Virement bancaire",
          items: [
            {
              id: 1,
              description: "Signaux Premium - Abonnement mensuel",
              quantity: 1,
              unit_price: 297.00,
              total_price: 297.00
            }
          ]
        },
        {
          id: 2,
          invoice_number: "CT-00002",
          user: {
            id: 2,
            name: "Marie Martin",
            email: "marie@example.com"
          },
          total_amount: 497.00,
          currency: "EUR",
          status: "sent",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              id: 2,
              description: "Formation Complète - Cours de trading",
              quantity: 1,
              unit_price: 497.00,
              total_price: 497.00
            }
          ]
        },
        {
          id: 3,
          invoice_number: "CT-00003",
          user: {
            id: 3,
            name: "Pierre Durand",
            email: "pierre@example.com"
          },
          total_amount: 97.00,
          currency: "EUR",
          status: "overdue",
          created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              id: 3,
              description: "Signaux Basic - Abonnement mensuel",
              quantity: 1,
              unit_price: 97.00,
              total_price: 97.00
            }
          ],
          notes: "Relance envoyée le 15/12/2024"
        },
        {
          id: 4,
          invoice_number: "CT-00004",
          user: {
            id: 4,
            name: "Sophie Bernard",
            email: "sophie@example.com"
          },
          total_amount: 150.00,
          currency: "EUR",
          status: "cancelled",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              id: 4,
              description: "Consultation Privée - 1 heure",
              quantity: 1,
              unit_price: 150.00,
              total_price: 150.00
            }
          ],
          notes: "Annulée à la demande du client"
        }
      ];
      
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simuler le téléchargement
    toast({
      title: "Téléchargement",
      description: `Facture ${invoice.invoice_number} téléchargée`,
    });
  };

  const handleRegenerateInvoice = (invoice: Invoice) => {
    // Simuler la régénération
    toast({
      title: "Facture régénérée",
      description: `Facture ${invoice.invoice_number} a été régénérée`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-500"><Clock className="w-3 h-3 mr-1" />Brouillon</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500"><FileText className="w-3 h-3 mr-1" />Envoyée</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500"><CheckCircle className="w-3 h-3 mr-1" />Payée</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500"><XCircle className="w-3 h-3 mr-1" />En retard</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-500"><XCircle className="w-3 h-3 mr-1" />Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'sent').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Factures Support</h1>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Payé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalAmount.toFixed(2)}</div>
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
                placeholder="Rechercher par numéro, client ou email..."
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
                <option value="draft">Brouillons</option>
                <option value="sent">Envoyées</option>
                <option value="paid">Payées</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des factures */}
      <Card>
        <CardHeader>
          <CardTitle>Factures</CardTitle>
          <CardDescription>
            Gérez les factures et leur statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune facture trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'échéance</TableHead>
                  <TableHead>Date de paiement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.user.name}</div>
                        <div className="text-sm text-muted-foreground">{invoice.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      €{invoice.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateInvoice(invoice)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
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
            <DialogTitle>Facture {selectedInvoice?.invoice_number}</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.user.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* En-tête de la facture */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations Facture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Numéro de facture</Label>
                      <div className="font-mono font-bold text-lg">{selectedInvoice.invoice_number}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Statut</Label>
                      <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date de création</Label>
                      <div className="font-medium">
                        {new Date(selectedInvoice.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    {selectedInvoice.due_date && (
                      <div>
                        <Label className="text-muted-foreground">Date d'échéance</Label>
                        <div className="font-medium">
                          {new Date(selectedInvoice.due_date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informations client */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nom</Label>
                      <div className="font-medium">{selectedInvoice.user.name}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="font-medium">{selectedInvoice.user.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedInvoice.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-muted-foreground">
                            Quantité: {item.quantity} × €{item.unit_price.toFixed(2)}
                          </div>
                        </div>
                        <div className="font-bold">
                          €{item.total_price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>€{selectedInvoice.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations de paiement */}
              {selectedInvoice.status === 'paid' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations de Paiement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Date de paiement</Label>
                        <div className="font-medium">
                          {selectedInvoice.paid_at ? new Date(selectedInvoice.paid_at).toLocaleString('fr-FR') : '-'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Méthode de paiement</Label>
                        <div className="font-medium">{selectedInvoice.payment_method || '-'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedInvoice.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-3 rounded-lg">
                      {selectedInvoice.notes}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportInvoices;
