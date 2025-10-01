import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Check,
  X
} from "lucide-react";
import { usePayment } from "@/contexts/PaymentContext";
import { motion } from "framer-motion";

export function PaymentsManagement() {
  const { 
    adminDashboard, 
    adminPendingPayments, 
    fetchAdminDashboard, 
    fetchAdminPendingPayments,
    validatePendingPayment,
    cancelPendingPayment,
    loading 
  } = usePayment();

  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAdminDashboard();
    fetchAdminPendingPayments('pending');
  }, [fetchAdminDashboard, fetchAdminPendingPayments]);

  useEffect(() => {
    fetchAdminPendingPayments(selectedStatus);
  }, [selectedStatus, fetchAdminPendingPayments]);

  const handleValidate = async (id: number) => {
    setProcessingId(id);
    await validatePendingPayment(id);
    setProcessingId(null);
  };

  const handleCancel = async (id: number) => {
    setProcessingId(id);
    await cancelPendingPayment(id);
    setProcessingId(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "default", label: "En attente" },
      contacted: { variant: "secondary", label: "Contacté" },
      confirmed: { variant: "outline", label: "Confirmé" },
      cancelled: { variant: "destructive", label: "Annulé" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paiements en attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminDashboard?.pending_payments_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                À traiter
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminDashboard?.total_revenue?.toFixed(2) || 0} EUR
              </div>
              <p className="text-xs text-muted-foreground">
                Tous les paiements validés
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminDashboard?.active_subscriptions_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Utilisateurs avec abonnement
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expirant bientôt</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminDashboard?.expiring_soon_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Dans les 7 prochains jours
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des paiements en attente</CardTitle>
          <CardDescription>Validez ou annulez les demandes de paiement</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="contacted">Contactés</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmés</TabsTrigger>
              <TabsTrigger value="cancelled">Annulés</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus}>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : adminPendingPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun paiement {selectedStatus === 'pending' ? 'en attente' : selectedStatus}
                </div>
              ) : (
                <Table>
                  <TableCaption>Liste des paiements {selectedStatus === 'pending' ? 'en attente' : selectedStatus}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Offre</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminPendingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.user_email}</div>
                            <div className="text-sm text-muted-foreground">
                              {payment.user_first_name} {payment.user_last_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.offer_name}</div>
                            <div className="text-sm text-muted-foreground capitalize">{payment.offer_type}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {payment.amount} {payment.currency}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm capitalize">{payment.contact_method}</div>
                            <div className="text-xs text-muted-foreground">{payment.contact_info}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {payment.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleValidate(payment.id)}
                                  disabled={processingId === payment.id}
                                >
                                  {processingId === payment.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      Valider
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancel(payment.id)}
                                  disabled={processingId === payment.id}
                                >
                                  {processingId === payment.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <X className="h-4 w-4 mr-1" />
                                      Annuler
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                            {payment.status !== 'pending' && (
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

