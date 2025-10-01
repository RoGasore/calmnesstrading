import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Offer } from "@/contexts/PaymentContext";
import { useNavigate } from "react-router-dom";

interface DynamicOfferCardProps {
  offer: Offer;
  icon?: React.ReactNode;
  features?: string[];
}

export function DynamicOfferCard({ offer, icon, features = [] }: DynamicOfferCardProps) {
  const navigate = useNavigate();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'gold':
        return {
          bg: 'from-yellow-500/20 to-yellow-600/10',
          border: 'border-yellow-500/30',
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-600',
          text: 'text-yellow-600'
        };
      case 'black':
        return {
          bg: 'from-gray-900/20 to-gray-800/10',
          border: 'border-gray-800/30',
          iconBg: 'bg-gray-900/20',
          iconColor: 'text-gray-900 dark:text-gray-100',
          text: 'text-gray-900 dark:text-gray-100'
        };
      case 'white':
        return {
          bg: 'from-gray-100/50 to-gray-200/30',
          border: 'border-gray-300/30',
          iconBg: 'bg-white',
          iconColor: 'text-gray-700',
          text: 'text-gray-700'
        };
      default:
        return {
          bg: 'from-primary/20 to-primary/10',
          border: 'border-primary/30',
          iconBg: 'bg-primary/20',
          iconColor: 'text-primary',
          text: 'text-primary'
        };
    }
  };

  const colorClasses = getColorClasses((offer as any).color_theme || 'gold');

  const handleSelect = () => {
    navigate(`/checkout?offer=${offer.id}`);
  };

  return (
    <Card 
      className={`group hover:shadow-xl transition-all border-2 ${colorClasses.border} bg-gradient-to-br ${colorClasses.bg}`}
    >
      <CardHeader className="text-center pb-4">
        {icon && (
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${colorClasses.iconBg}`}>
              <div className={colorClasses.iconColor}>
                {icon}
              </div>
            </div>
          </div>
        )}

        <CardTitle className="text-2xl mb-2">{offer.name}</CardTitle>
        <p className="text-muted-foreground text-sm min-h-[60px]">
          {offer.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Prix */}
        <div className="text-center py-4 border-y">
          <div className="flex items-baseline justify-center gap-2">
            <span className={`text-4xl font-bold ${colorClasses.text}`}>{offer.price}</span>
            <span className="text-xl text-muted-foreground">{offer.currency}</span>
          </div>
          {offer.duration_days ? (
            <p className="text-sm text-muted-foreground mt-2">
              {offer.duration_days} jours
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">Accès à vie</p>
          )}
        </div>

        {/* Fonctionnalités */}
        {features.length > 0 && (
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${colorClasses.iconColor} shrink-0`} />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bouton */}
        <Button
          onClick={handleSelect}
          className={`w-full ${
            (offer as any).color_theme === 'gold' 
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:opacity-90 text-white' 
              : (offer as any).color_theme === 'black'
              ? 'bg-black hover:bg-gray-900 text-white'
              : 'bg-white hover:bg-gray-100 text-black border border-gray-300'
          }`}
          size="lg"
        >
          Choisir cette offre
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

