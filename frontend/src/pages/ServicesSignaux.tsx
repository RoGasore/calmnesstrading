import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Zap, Shield, CheckCircle, Target, DollarSign, Clock, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePayment } from "@/contexts/PaymentContext";
import { useEffect, useState } from "react";

const ServicesSignaux = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { fetchOffersByType } = usePayment();
  
  const [offerIds, setOfferIds] = useState<Record<string, number>>({});

  // Charger les IDs des offres depuis la base de données
  useEffect(() => {
    const loadOffers = async () => {
      const offers = await fetchOffersByType('signal');
      const mapping: Record<string, number> = {};
      offers.forEach(offer => {
        if (offer.name.includes('Starter')) mapping['starter'] = offer.id;
        if (offer.name.includes('Pro') && !offer.name.includes('Annuel')) mapping['pro'] = offer.id;
        if (offer.name.includes('Elite') && !offer.name.includes('Annuel')) mapping['elite'] = offer.id;
      });
      setOfferIds(mapping);
    };
    loadOffers();
  }, [fetchOffersByType]);
  
  const currentSignals = [
    {
      id: 1,
      pair: "EUR/USD",
      type: "BUY",
      entry: 1.0850,
      target: 1.0920,
      stopLoss: 1.0800,
      risk: "Moyen",
      timeframe: "4H",
      status: "Actif",
      profit: "+45 pips",
      time: "Il y a 2h"
    },
    {
      id: 2,
      pair: "GBP/JPY",
      type: "SELL",
      entry: 185.20,
      target: 184.50,
      stopLoss: 185.80,
      risk: "Élevé",
      timeframe: "1H",
      status: "En cours",
      profit: "+25 pips",
      time: "Il y a 45min"
    },
    {
      id: 3,
      pair: "USD/CAD",
      type: "BUY",
      entry: 1.3650,
      target: 1.3720,
      stopLoss: 1.3600,
      risk: "Faible",
      timeframe: "Daily",
      status: "Nouveau",
      profit: "En attente",
      time: "Il y a 15min"
    }
  ];

  const recentHistory = [
    {
      id: 1,
      pair: "AUD/USD",
      type: "BUY",
      result: "Gagnant",
      profit: "+85 pips",
      date: "2024-03-15"
    },
    {
      id: 2,
      pair: "EUR/GBP",
      type: "SELL",
      result: "Gagnant",
      profit: "+62 pips",
      date: "2024-03-14"
    },
    {
      id: 3,
      pair: "USD/JPY",
      type: "BUY",
      result: "Perdant",
      profit: "-30 pips",
      date: "2024-03-13"
    }
  ];

  const stats = [
    {
      label: "Taux de Réussite",
      value: "87%",
      icon: Target,
      trend: "+2.5%"
    },
    {
      label: "Profit Moyen",
      value: "+65 pips",
      icon: DollarSign,
      trend: "+12%"
    },
    {
      label: "Signaux/Jour",
      value: "5-8",
      icon: BarChart3,
      trend: "Stable"
    },
    {
      label: "Temps Moyen",
      value: "6h",
      icon: Clock,
      trend: "-15%"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: 29,
      period: "mois",
      features: [
        {
          fr: "5-8 signaux par jour",
          en: "5-8 signals per day"
        },
        {
          fr: "Signaux sur les paires majeures (EUR/USD, GBP/USD, USD/JPY)",
          en: "Signals on major pairs (EUR/USD, GBP/USD, USD/JPY)"
        },
        {
          fr: "Points d'entrée et sortie précis",
          en: "Precise entry and exit points"
        },
        {
          fr: "Ratios risque/récompense optimisés",
          en: "Optimized risk/reward ratios"
        },
        {
          fr: "Support par email",
          en: "Email support"
        }
      ],
      popular: false
    },
    {
      name: "Pro",
      price: 59,
      period: "mois",
      features: [
        {
          fr: "8-12 signaux par jour",
          en: "8-12 signals per day"
        },
        {
          fr: "Toutes les paires majeures et mineures",
          en: "All major and minor pairs"
        },
        {
          fr: "Analyses techniques détaillées",
          en: "Detailed technical analysis"
        },
        {
          fr: "Nouvelles économiques et calendrier",
          en: "Economic news and calendar"
        },
        {
          fr: "Support prioritaire + Telegram",
          en: "Priority support + Telegram"
        }
      ],
      popular: true
    },
    {
      name: "Premium",
      price: 99,
      period: "mois",
      features: [
        {
          fr: "12-15 signaux par jour",
          en: "12-15 signals per day"
        },
        {
          fr: "Toutes les paires + crypto + indices",
          en: "All pairs + crypto + indices"
        },
        {
          fr: "Analyses fondamentales avancées",
          en: "Advanced fundamental analysis"
        },
        {
          fr: "Signaux scalping (M1, M5)",
          en: "Scalping signals (M1, M5)"
        },
        {
          fr: "Support VIP + coaching personnalisé",
          en: "VIP support + personalized coaching"
        }
      ],
      popular: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actif": return "default";
      case "En cours": return "secondary";
      case "Nouveau": return "outline";
      default: return "secondary";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Faible": return "text-green-500";
      case "Moyen": return "text-yellow-500";
      case "Élevé": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('signaux.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {t('signaux.hero.subtitle')}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Nos signaux professionnels et analyses intégrées vous permettent de trader avec confiance et précision, sans perdre de temps à analyser chaque marché. Et si vous souhaitez progresser, explorez nos{' '}
                <Link to="/services/formations" className="text-primary hover:text-primary/80 underline font-medium">
                  formations
                </Link>
                {' '}ou laissez notre équipe gérer votre capital grâce à nos{' '}
                <Link to="/services/gestion" className="text-primary hover:text-primary/80 underline font-medium">
                  services de gestion de comptes
                </Link>
                .
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge variant="secondary" className="px-4 py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Temps Réel
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  87% de Réussite
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications Instant
                </Badge>
              </div>
            </div>
          </div>
        </section>


        {/* What We Offer */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Ce que nous offrons</h2>
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Signaux en Temps Réel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Recevez des signaux de trading précis directement sur Telegram avec un taux de réussite de 87%
                  </p>
                  <ul className="space-y-2 text-sm text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>5-8 signaux par jour</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Points d'entrée/sortie précis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Ratios risque/récompense optimisés</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Notifications instantanées</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Analyses Techniques</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Analyses approfondies des marchés avec indicateurs techniques et fondamentaux
                  </p>
                  <ul className="space-y-2 text-sm text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Analyses quotidiennes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Support et résistance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Patterns de trading</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Nouvelles économiques</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Gestion des Risques</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Protection maximale de votre capital avec des stops adaptés et une gestion stricte
                  </p>
                  <ul className="space-y-2 text-sm text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Stop loss automatiques</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Position sizing optimal</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Diversification des paires</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Suivi des performances</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nos Abonnements</h2>
            <div className="flex flex-col items-center">
              <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                {plans.map((plan, index) => (
                  <Card 
                    key={plan.name} 
                    className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 ${
                      plan.popular ? 'border-primary' : 'border-primary/30'
                    }`}
                  >
                    <CardHeader className={`${plan.popular ? 'bg-primary/10' : 'bg-primary/5'} rounded-t-lg`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <p className="text-2xl font-bold text-primary mt-2">
                              ${plan.price}/{plan.period}
                            </p>
                          </div>
                        </div>
                        {plan.popular && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                            Plus Populaire
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {plan.name === 'Hebdomadaire' ? 'Accès à tous les signaux pendant 7 jours' : 'Accès à tous les signaux pendant 30 jours'}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Features */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Ce que vous obtenez
                        </h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                              <span>{feature.fr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Button */}
                      <Button 
                        className="w-full group-hover:bg-primary/90 transition-colors" 
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => {
                          const planKey = plan.name.toLowerCase();
                          const offerId = offerIds[planKey];
                          if (offerId) {
                            navigate(`/checkout?offer=${offerId}`);
                          }
                        }}
                      >
                        Choisir ce plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesSignaux;
