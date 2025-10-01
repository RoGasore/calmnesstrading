import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { Offer } from "@/contexts/PaymentContext";
import { useNavigate } from "react-router-dom";

interface OfferCardProps {
  offer: Offer;
  popular?: boolean;
  onSelect?: (offer: Offer) => void;
}

export function OfferCard({ offer, popular = false, onSelect }: OfferCardProps) {
  const navigate = useNavigate();

  const handleSelect = () => {
    if (onSelect) {
      onSelect(offer);
    } else {
      // Par défaut, rediriger vers la page de paiement avec l'offre sélectionnée
      navigate(`/checkout?offer=${offer.id}`);
    }
  };

  const getOfferTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      subscription: 'Abonnement',
      formation: 'Formation',
      signal: 'Signal',
      account: 'Gestion de compte',
    };
    return labels[type] || type;
  };

  const getOfferTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Zap className="h-4 w-4" />;
      case 'formation':
        return <Check className="h-4 w-4" />;
      default:
        return <Crown className="h-4 w-4" />;
    }
  };

  return (
    <Card 
      className={`relative flex flex-col h-full transition-all hover:shadow-xl ${
        popular ? 'border-primary border-2 scale-105' : 'border-border'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1">
            <Crown className="h-3 w-3 mr-1" />
            Populaire
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getOfferTypeIcon(offer.offer_type)}
          <span className="text-sm text-muted-foreground">{getOfferTypeLabel(offer.offer_type)}</span>
        </div>
        <CardTitle className="text-2xl font-bold">{offer.name}</CardTitle>
        <CardDescription className="mt-2">{offer.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold">{offer.price}</span>
            <span className="text-2xl text-muted-foreground">{offer.currency}</span>
          </div>
          {offer.duration_days && (
            <p className="text-sm text-muted-foreground mt-2">
              Accès pendant {offer.duration_days} jours
            </p>
          )}
        </div>

        {/* Fonctionnalités basées sur le type d'offre */}
        <div className="space-y-3">
          {offer.offer_type === 'subscription' && (
            <>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Accès complet aux signaux de trading</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Support client prioritaire</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Analyses de marché quotidiennes</span>
              </div>
            </>
          )}

          {offer.offer_type === 'formation' && (
            <>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Accès à vie aux vidéos</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Certificat de formation</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Support par email</span>
              </div>
            </>
          )}

          {offer.offer_type === 'account' && (
            <>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Gestion professionnelle</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Rapports détaillés</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Support dédié</span>
              </div>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleSelect}
          className={`w-full ${
            popular 
              ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90' 
              : ''
          }`}
          size="lg"
        >
          Choisir cette offre
        </Button>
      </CardFooter>
    </Card>
  );
}

