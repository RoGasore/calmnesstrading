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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";
import { 
  CreditCard, 
  CheckCircle, 
  CheckCircle2,
  XCircle, 
  Clock, 
  Loader2, 
  Eye,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  MessageCircle,
  Phone
} from "lucide-react";
import { usePayment } from "@/contexts/PaymentContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/config/api";

interface PendingPayment {
  id: number;
  user: {
    name: string;
    email: string;
  };
  offer: {
    name: string;
  };
  offer_type?: string;
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

const SupportPayments = () => {
  const { adminDashboard, fetchAdminDashboard, validatePendingPayment, cancelPendingPayment, loading } = usePayment();
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();

  const [allPendingPayments, setAllPendingPayments] = useState<PendingPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [adminTransactionId, setAdminTransactionId] = useState("");
  
  // Collapsibles
  const [showOfferDetails, setShowOfferDetails] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [showTransactionInfo, setShowTransactionInfo] = useState(true);

  useEffect(() => {
    fetchAdminDashboard();
    loadAllPendingPayments();
  }, [fetchAdminDashboard]);

  const loadAllPendingPayments = async () => {
    setLoadingPayments(true);
    try {
      const response = await fetchWithAuth(`${API_CONFIG.BASE_URL}/api/payments/admin/pending-payments/`);
      if (response.ok) {
        const data = await response.json();
        console.log('All pending payments loaded:', data);
        setAllPendingPayments(data);
      }
    } catch (error) {
      console.error('Error loading pending payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleValidatePayment = async () => {
    if (!selectedPayment) return;
    
    const transactionId = selectedPayment.transaction_id || adminTransactionId.trim();
    
    if (!transactionId) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un ID de transaction.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await validatePendingPayment(selectedPayment.id, adminNotes, transactionId);
      toast({
        title: "Paiement validé",
        description: "Le paiement a été validé avec succès. La facture a été envoyée.",
      });
      setValidateDialogOpen(false);
      setAdminNotes("");
      setAdminTransactionId("");
      fetchAdminDashboard();
      loadAllPendingPayments();
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
      loadAllPendingPayments();
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
      case 'transaction_submitted':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Transaction soumise</Badge>;
      case 'contacted':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500"><Users className="w-3 h-3 mr-1" />Contacté</Badge>;
      case 'confirmed':
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

  const pendingPayments = allPendingPayments;
  const stats = {
    total: pendingPayments.length,
    pending: pendingPayments.filter((p: PendingPayment) => p.status === 'pending' || p.status === 'transaction_submitted').length,
    validated: pendingPayments.filter((p: PendingPayment) => p.status === 'confirmed').length,
    totalAmount: pendingPayments.reduce((sum: number, p: PendingPayment) => sum + parseFloat(p.amount.toString()), 0)
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des Paiements - Support</h1>
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
              <div className="text-2xl font-bold">€{stats.totalAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des paiements */}
        <Card>
          <CardHeader>
            <CardTitle>Paiements en Attente</CardTitle>
            <CardDescription>
              Gérez les paiements en attente de validation pour le support client
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPayments ? (
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
      <Dialog open={validateDialogOpen} onOpenChange={(open) => {
        setValidateDialogOpen(open);
        if (open && selectedPayment) {
          setAdminTransactionId(selectedPayment.transaction_id || '');
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6" style={{ color: '#D4AF37' }} />
              Valider le Paiement #{selectedPayment?.id} - Support
            </DialogTitle>
            <DialogDescription>
              Vérifiez toutes les informations avant de valider. Une facture sera générée et envoyée automatiquement.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              {/* Transaction ID - Toujours visible en haut */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-lg border-2 border-[#D4AF37] shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      ID de Transaction
                    </Label>
                    {selectedPayment.transaction_id ? (
                      <div className="font-mono font-bold text-2xl mt-2" style={{ color: '#D4AF37' }}>
                        {selectedPayment.transaction_id}
                      </div>
                    ) : (
                      <Input
                        placeholder="Entrez l'ID de transaction"
                        value={adminTransactionId}
                        onChange={(e) => setAdminTransactionId(e.target.value)}
                        className="mt-2 font-mono text-lg"
                      />
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-green-500/10 text-green-700 border-green-500"
                  >
                    {selectedPayment.transaction_id ? 'Soumis par client' : 'À saisir'}
                  </Badge>
                </div>
                {selectedPayment.transaction_id && (
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    Vérifiez cet ID dans votre système bancaire avant de valider
                  </p>
                )}
              </div>

              {/* Détails de l'offre - Collapsible */}
              <Collapsible open={showOfferDetails} onOpenChange={setShowOfferDetails}>
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CreditCard className="h-5 w-5" style={{ color: '#D4AF37' }} />
                          Détails de l'Offre
                        </CardTitle>
                        {showOfferDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase">Nom de l'offre</Label>
                          <p className="font-semibold text-lg">{selectedPayment.offer.name}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase">Type</Label>
                          <p className="font-medium capitalize">{selectedPayment.offer_type || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase">Montant</Label>
                          <p className="font-bold text-2xl" style={{ color: '#D4AF37' }}>
                            {selectedPayment.amount} {selectedPayment.currency}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase">Statut</Label>
                          <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Informations utilisateur - Collapsible */}
              <Collapsible open={showUserInfo} onOpenChange={setShowUserInfo}>
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5" style={{ color: '#D4AF37' }} />
                          Informations Client
                        </CardTitle>
                        {showUserInfo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase">Nom</Label>
                          <p className="font-semibold">{selectedPayment.user_info?.full_name || selectedPayment.user.name}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                          <p className="font-medium">{selectedPayment.user_info?.email || selectedPayment.user.email}</p>
                        </div>
                      </div>

                      {selectedPayment.user_info && (
                        <div className="border-t pt-4">
                          <Label className="text-sm font-semibold mb-3 block">Méthodes de Contact</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedPayment.user_info.telegram_username && (
                              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Telegram</p>
                                  <p className="font-mono font-semibold text-blue-700">{selectedPayment.user_info.telegram_username}</p>
                                </div>
                              </div>
                            )}
                            {selectedPayment.user_info.whatsapp_number && (
                              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Phone className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                                  <p className="font-semibold text-green-700">{selectedPayment.user_info.whatsapp_number}</p>
                                </div>
                              </div>
                            )}
                            {selectedPayment.user_info.discord_username && (
                              <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <MessageCircle className="h-5 w-5 text-indigo-600" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Discord</p>
                                  <p className="font-mono font-semibold text-indigo-700">{selectedPayment.user_info.discord_username}</p>
                                </div>
                              </div>
                            )}
                            {selectedPayment.user_info.phone && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                                <Phone className="h-5 w-5 text-gray-600" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Téléphone</p>
                                  <p className="font-semibold text-gray-700">{selectedPayment.user_info.phone}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Notes et Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes et Validation - Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="admin-notes">Notes Support (optionnel)</Label>
                    <Textarea
                      id="admin-notes"
                      placeholder="Ajoutez des notes pour la facture ou le client..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Actions Automatiques
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Génération facture PDF avec numéro <strong>CT-XXXXX</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Envoi email à <strong>{selectedPayment.user_info?.email || selectedPayment.user.email}</strong> avec PDF en pièce jointe</span>
                      </li>
                      {selectedPayment.user_info?.telegram_username && (
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Notification Telegram à <strong>{selectedPayment.user_info.telegram_username}</strong></span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Activation automatique de l'abonnement</span>
                      </li>
                      {selectedPayment.user_info?.telegram_username && selectedPayment.offer_type?.includes('signal') && (
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Ajout au canal Telegram des signaux</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setValidateDialogOpen(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button 
              onClick={handleValidatePayment}
              disabled={!selectedPayment?.transaction_id && !adminTransactionId.trim()}
              style={{ backgroundColor: '#D4AF37', color: '#000000' }}
              className="w-full sm:w-auto hover:opacity-90"
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

export default SupportPayments;
