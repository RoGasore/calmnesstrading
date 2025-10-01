import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  MessageCircle,
  TrendingUp,
  Loader2
} from "lucide-react";
import { usePayment } from "@/contexts/PaymentContext";
import { motion } from "framer-motion";

export function UserSubscriptions() {
  const { userDashboard, fetchUserDashboard, loading } = usePayment();

  useEffect(() => {
    fetchUserDashboard();
  }, [fetchUserDashboard]);

  if (loading && !userDashboard) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeSubscriptions = userDashboard?.active_subscriptions || [];
  const pendingPayments = userDashboard?.pending_payments || [];
  const paymentHistory = userDashboard?.payment_history || [];

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Zap className="h-5 w-5" />;
      case 'formation':
        return <TrendingUp className="h-5 w-5" />;
      case 'account':
        return <MessageCircle className="h-5 w-5" />;
      default:
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const getProgressPercentage = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    const percentage = (elapsed / total) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  return (
    <div className="space-y-6">
      {/* Abonnements actifs */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Mes Abonnements Actifs</h2>
        {activeSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                Vous n'avez aucun abonnement actif pour le moment
              </p>
              <Button onClick={() => window.location.href = '/tarifs'}>
                Voir les offres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeSubscriptions.map((subscription, index) => (
              <motion.div
                key={subscription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getOfferIcon(subscription.offer_type)}
                        <div>
                          <CardTitle>{subscription.offer_name}</CardTitle>
                          <CardDescription className="capitalize">{subscription.offer_type}</CardDescription>
                        </div>
                      </div>
                      {subscription.is_active_now && (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Actif
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Compte à rebours */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Temps restant</span>
                        <span className="font-semibold">
                          {subscription.days_remaining > 0 
                            ? `${subscription.days_remaining} jour${subscription.days_remaining > 1 ? 's' : ''}`
                            : `${subscription.hours_remaining} heure${subscription.hours_remaining > 1 ? 's' : ''}`
                          }
                        </span>
                      </div>
                      <Progress 
                        value={100 - getProgressPercentage(subscription.start_date, subscription.end_date)}
                        className="h-2"
                      />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Début</p>
                          <p className="font-medium">
                            {new Date(subscription.start_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Fin</p>
                          <p className="font-medium">
                            {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Canaux */}
                    <div className="flex gap-2 pt-2 border-t">
                      {subscription.telegram_added && (
                        <Badge variant="secondary" className="text-xs">
                          Telegram ✓
                        </Badge>
                      )}
                      {subscription.discord_added && (
                        <Badge variant="secondary" className="text-xs">
                          Discord ✓
                        </Badge>
                      )}
                      {!subscription.telegram_added && !subscription.discord_added && (
                        <Badge variant="outline" className="text-xs">
                          En attente d'ajout
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Paiements en attente */}
      {pendingPayments.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Paiements en attente</h2>
          <div className="grid grid-cols-1 gap-4">
            {pendingPayments.map((payment) => (
              <Card key={payment.id} className="border-yellow-500/50">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <Clock className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="font-medium">{payment.offer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        En attente de validation - {payment.amount} {payment.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Créé le {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {payment.status_display}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Historique des paiements */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Historique des paiements</h2>
        {paymentHistory.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun paiement effectué pour le moment
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium">{payment.offer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.amount} {payment.currency} - {payment.payment_method_display}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.paid_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">
                    {payment.status_display}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Total dépensé */}
      <Card>
        <CardHeader>
          <CardTitle>Total dépensé</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {userDashboard?.total_spent?.toFixed(2) || '0.00'} EUR
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

