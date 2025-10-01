import React, { useEffect, useState } from 'react';
import { usePayment, Offer } from "@/contexts/PaymentContext";
import { OfferCard } from "./OfferCard";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function OffersGrid() {
  const { offers, fetchOffers, loading } = usePayment();
  const [subscriptions, setSubscriptions] = useState<Offer[]>([]);
  const [formations, setFormations] = useState<Offer[]>([]);
  const [accountManagement, setAccountManagement] = useState<Offer[]>([]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    if (offers.length > 0) {
      setSubscriptions(offers.filter(o => o.offer_type === 'subscription'));
      setFormations(offers.filter(o => o.offer_type === 'formation'));
      setAccountManagement(offers.filter(o => o.offer_type === 'account'));
    }
  }, [offers]);

  if (loading && offers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Déterminer l'offre populaire (généralement celle du milieu pour les abonnements)
  const getPopularIndex = (list: Offer[]) => {
    if (list.length === 4) return 1; // 15 jours
    if (list.length === 3) return 1; // Milieu
    return -1;
  };

  return (
    <Tabs defaultValue="subscriptions" className="w-full">
      <div className="flex justify-center mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="formations">Formations</TabsTrigger>
          <TabsTrigger value="account">Gestion</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="subscriptions">
        {subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptions.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                popular={index === getPopularIndex(subscriptions)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Aucun abonnement disponible pour le moment
          </p>
        )}
      </TabsContent>

      <TabsContent value="formations">
        {formations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                popular={index === getPopularIndex(formations)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Aucune formation disponible pour le moment
          </p>
        )}
      </TabsContent>

      <TabsContent value="account">
        {accountManagement.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accountManagement.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                popular={index === getPopularIndex(accountManagement)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Aucune offre de gestion de compte disponible pour le moment
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}

