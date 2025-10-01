import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Loader2, Star, Clock, BookOpen, Users } from "lucide-react";
import { usePayment, Offer } from "@/contexts/PaymentContext";
import { useNavigate } from "react-router-dom";

interface ServiceOffersListProps {
  serviceType: 'formation' | 'signal' | 'account';
  icon: React.ElementType;
  defaultFeatures?: string[];
}

export function ServiceOffersList({ serviceType, icon: Icon, defaultFeatures = [] }: ServiceOffersListProps) {
  const { fetchOffersByType, loading } = usePayment();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const loadOffers = async () => {
      const data = await fetchOffersByType(serviceType);
      setOffers(data);
    };
    loadOffers();
  }, [serviceType, fetchOffersByType]);

  const getColorClasses = (colorTheme: string) => {
    switch (colorTheme) {
      case 'gold':
        return {
          bg: 'from-yellow-500/20 to-yellow-600/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-600'
        };
      case 'black':
        return {
          bg: 'from-gray-900/20 to-gray-800/10',
          border: 'border-gray-800/50',
          text: 'text-gray-900 dark:text-gray-100'
        };
      case 'white':
        return {
          bg: 'from-gray-50 to-gray-100/30',
          border: 'border-gray-300',
          text: 'text-gray-700'
        };
      default:
        return {
          bg: 'from-primary/20 to-primary/10',
          border: 'border-primary/30',
          text: 'text-primary'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune offre disponible pour le moment
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-7xl mx-auto">
      {offers.map((offer) => {
        const colorClasses = getColorClasses((offer as any).color_theme || 'gold');
        
        return (
          <Card 
            key={offer.id} 
            className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 ${colorClasses.border} bg-gradient-to-br ${colorClasses.bg}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{offer.name}</CardTitle>
                    <p className={`text-2xl font-bold ${colorClasses.text} mt-2`}>
                      {parseFloat(offer.price) === 0 ? 'Gratuit' : `${offer.price} ${offer.currency}`}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">{offer.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Stats depuis metadata */}
              {offer.metadata && Object.keys(offer.metadata).length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {offer.metadata.duration && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{offer.metadata.duration}</span>
                    </div>
                  )}
                  {offer.metadata.lessons && (
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>{offer.metadata.lessons}</span>
                    </div>
                  )}
                  {offer.metadata.students && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{offer.metadata.students}</span>
                    </div>
                  )}
                  {offer.metadata.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-primary" />
                      <span>{offer.metadata.rating}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Features depuis metadata ou par défaut */}
              {(() => {
                // Si metadata.features existe, l'utiliser (format: ligne par ligne)
                const featuresText = offer.metadata?.features;
                const featuresList = featuresText 
                  ? featuresText.split('\n').filter((f: string) => f.trim()) 
                  : defaultFeatures;
                
                return featuresList.length > 0 && (
                  <div>
                    <ul className="space-y-2">
                      {featuresList.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Duration */}
              {offer.duration_days && (
                <div className="text-sm text-muted-foreground border-t pt-4">
                  Accès pendant {offer.duration_days} jours
                </div>
              )}

              {/* Button */}
              <Button 
                onClick={() => navigate(`/checkout?offer=${offer.id}`)}
                className={`w-full ${
                  (offer as any).color_theme === 'gold' 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:opacity-90 text-white' 
                    : (offer as any).color_theme === 'black'
                    ? 'bg-black hover:bg-gray-900 text-white'
                    : (offer as any).color_theme === 'white'
                    ? 'bg-white hover:bg-gray-100 text-black border border-gray-300'
                    : 'bg-primary hover:bg-primary/90'
                }`}
                size="lg"
              >
                {parseFloat(offer.price) === 0 ? 'Commencer Gratuitement' : 'Choisir cette offre'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

