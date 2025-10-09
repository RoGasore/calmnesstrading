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
  user_info?: any;
  transaction_id?: string;
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
                          {(payment.status === 'pending' || payment.status === 'transaction_submitted' || payment.status === 'contacted') && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setValidateDialogOpen(true);
                                }}
                                style={payment.status === 'transaction_submitted' ? { backgroundColor: '#D4AF37', color: '#000000' } : {}}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {payment.status === 'transaction_submitted' ? 'Vérifier & Valider' : 'Valider'}
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
              {selectedPayment.transaction_id && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-2 border-yellow-300">
                  <Label className="text-muted-foreground">ID de Transaction</Label>
                  <div className="font-mono font-bold text-lg" style={{ color: '#D4AF37' }}>
                    {selectedPayment.transaction_id}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fourni par l'utilisateur après paiement
                  </p>
                </div>
              )}
              {selectedPayment.user_info && Object.keys(selectedPayment.user_info).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Informations Utilisateur</Label>
                  <div className="text-sm space-y-1 mt-2 bg-muted p-3 rounded">
                    {selectedPayment.user_info.full_name && <p><strong>Nom :</strong> {selectedPayment.user_info.full_name}</p>}
                    {selectedPayment.user_info.email && <p><strong>Email :</strong> {selectedPayment.user_info.email}</p>}
                    {selectedPayment.user_info.telegram_username && <p><strong>Telegram :</strong> {selectedPayment.user_info.telegram_username}</p>}
                    {selectedPayment.user_info.whatsapp_number && <p><strong>WhatsApp :</strong> {selectedPayment.user_info.whatsapp_number}</p>}
                    {selectedPayment.user_info.discord_username && <p><strong>Discord :</strong> {selectedPayment.user_info.discord_username}</p>}
                  </div>
                </div>
              )}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Valider le paiement</DialogTitle>
            <DialogDescription>
              Vérifiez les informations et confirmez la validation. Une facture sera générée et envoyée automatiquement.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              {/* Récapitulatif */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilisateur</span>
                  <span className="font-medium">{selectedPayment.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offre</span>
                  <span className="font-medium">{selectedPayment.offer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-bold text-lg" style={{ color: '#D4AF37' }}>
                    {selectedPayment.amount} {selectedPayment.currency}
                  </span>
                </div>
              </div>

              {/* Transaction ID si disponible */}
              {selectedPayment.transaction_id && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-2 border-[#D4AF37]">
                  <Label className="text-sm text-muted-foreground">ID de Transaction Soumis</Label>
                  <div className="font-mono font-bold text-xl mt-2" style={{ color: '#D4AF37' }}>
                    {selectedPayment.transaction_id}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ⚠️ Vérifiez cet ID dans votre système bancaire avant de valider
                  </p>
                </div>
              )}

              {/* Informations utilisateur */}
              {selectedPayment.user_info && Object.keys(selectedPayment.user_info).length > 0 && (
                <div>
                  <Label>Informations de Contact</Label>
                  <div className="text-sm space-y-1 mt-2 bg-muted p-3 rounded">
                    {selectedPayment.user_info.telegram_username && (
                      <p><strong>📱 Telegram :</strong> {selectedPayment.user_info.telegram_username}</p>
                    )}
                    {selectedPayment.user_info.whatsapp_number && (
                      <p><strong>💬 WhatsApp :</strong> {selectedPayment.user_info.whatsapp_number}</p>
                    )}
                    {selectedPayment.user_info.discord_username && (
                      <p><strong>🎮 Discord :</strong> {selectedPayment.user_info.discord_username}</p>
                    )}
                    {selectedPayment.user_info.email && (
                      <p><strong>📧 Email :</strong> {selectedPayment.user_info.email}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="admin-notes">Notes Admin (optionnel)</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Ajoutez des notes pour la facture ou le client..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">✨ Actions automatiques après validation :</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Génération facture PDF (numéro CT-XXXXX)</li>
                  <li>• Envoi email avec facture en pièce jointe</li>
                  <li>• Notification Telegram (si configuré)</li>
                  <li>• Activation abonnement automatique</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setValidateDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleValidatePayment}
              style={{ backgroundColor: '#D4AF37', color: '#000000' }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Valider et Envoyer Facture
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