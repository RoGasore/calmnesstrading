import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Eye,
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react";
import { usePayment } from "@/contexts/PaymentContext";
import { useToast } from "@/hooks/use-toast";

interface PendingPayment {
  id: number;
  user: {
    name: string;
    email: string;
  };
  offer: {
    name: string;
  };
  amount: number;
  currency: string;
  contact_method: string;
  contact_info: string;
  status: string;
  created_at: string;
  admin_notes?: string;
}

const AdminPayments = () => {
  const { adminDashboard, fetchAdminDashboard, validatePendingPayment, cancelPendingPayment, loading } = usePayment();
  const { toast } = useToast();

  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchAdminDashboard();
  }, [fetchAdminDashboard]);

  const handleValidatePayment = async () => {
    if (!selectedPayment) return;
    
    try {
      await validatePendingPayment(selectedPayment.id, adminNotes);
      toast({
        title: "Paiement validé",
        description: "Le paiement a été validé avec succès.",
      });
      setValidateDialogOpen(false);
      setAdminNotes("");
      fetchAdminDashboard();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider le paiement.",
        variant: "destructive",
      });
    }
  };

  const handleCancelPayment = async () => {
    if (!selectedPayment) return;
    
    try {
      await cancelPendingPayment(selectedPayment.id, adminNotes);
      toast({
        title: "Paiement annulé",
        description: "Le paiement a été annulé.",
      });
      setCancelDialogOpen(false);
      setAdminNotes("");
      fetchAdminDashboard();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le paiement.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'validated':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500"><CheckCircle className="w-3 h-3 mr-1" />Validé</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500"><XCircle className="w-3 h-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getContactMethodLabel = (method: string) => {
    switch (method) {
      case 'whatsapp': return 'WhatsApp';
      case 'telegram': return 'Telegram';
      case 'discord': return 'Discord';
      default: return method;
    }
  };

  const pendingPayments = adminDashboard?.recent_pending_payments || [];
  const stats = {
    total: pendingPayments.length,
    pending: pendingPayments.filter((p: PendingPayment) => p.status === 'pending').length,
    validated: pendingPayments.filter((p: PendingPayment) => p.status === 'validated').length,
    totalAmount: pendingPayments.reduce((sum: number, p: PendingPayment) => sum + parseFloat(p.amount.toString()), 0)
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paiements</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Validés</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des paiements */}
        <Card>
          <CardHeader>
            <CardTitle>Paiements en Attente</CardTitle>
            <CardDescription>
              Gérez les paiements en attente de validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingPayments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucun paiement en attente
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Offre</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment: PendingPayment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.user.name}</div>
                          <div className="text-sm text-muted-foreground">{payment.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payment.offer.name}</TableCell>
                      <TableCell className="font-medium">
                        {payment.amount} {payment.currency}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{getContactMethodLabel(payment.contact_method)}</div>
                          <div className="text-muted-foreground">{payment.contact_info}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payment.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setValidateDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Valider
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Refuser
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      {/* Dialog de détails */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du paiement</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Utilisateur</Label>
                <div className="font-medium">{selectedPayment.user.name}</div>
                <div className="text-sm text-muted-foreground">{selectedPayment.user.email}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Offre</Label>
                <div className="font-medium">{selectedPayment.offer.name}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Montant</Label>
                <div className="font-medium">{selectedPayment.amount} {selectedPayment.currency}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Méthode de contact</Label>
                <div className="font-medium">{getContactMethodLabel(selectedPayment.contact_method)}</div>
                <div className="text-sm text-muted-foreground">{selectedPayment.contact_info}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Statut</Label>
                <div>{getStatusBadge(selectedPayment.status)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Date de création</Label>
                <div className="text-sm">{new Date(selectedPayment.created_at).toLocaleString('fr-FR')}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de validation */}
      <Dialog open={validateDialogOpen} onOpenChange={setValidateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le paiement</DialogTitle>
            <DialogDescription>
              Confirmez la validation de ce paiement. Vous pouvez ajouter des notes pour l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-notes">Notes (optionnel)</Label>
              <Textarea
                id="admin-notes"
                placeholder="Ajoutez des notes pour l'utilisateur..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setValidateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleValidatePayment}>
              Valider le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'annulation */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler le paiement</DialogTitle>
            <DialogDescription>
              Annulez ce paiement. Vous pouvez ajouter une raison pour l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">Raison de l'annulation</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Expliquez pourquoi ce paiement est annulé..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleCancelPayment}>
              Annuler le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPayments;