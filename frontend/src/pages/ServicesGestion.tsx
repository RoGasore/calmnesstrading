import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, Clock, Award, TrendingUp, Target, Zap, Shield, Bell, ArrowRight, Link as LinkIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { usePayment } from "@/contexts/PaymentContext";
import { useEffect, useState } from "react";

const ServicesGestion = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { fetchOffersByType } = usePayment();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  const [offerIds, setOfferIds] = useState<Record<string, number>>({});

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Charger les IDs des offres depuis la base de données
  useEffect(() => {
    const loadOffers = async () => {
      const offers = await fetchOffersByType('account');
      const mapping: Record<string, number> = {};
      offers.forEach(offer => {
        if (offer.name.includes('Bronze')) mapping['bronze'] = offer.id;
        if (offer.name.includes('Silver')) mapping['silver'] = offer.id;
        if (offer.name.includes('Gold') && !offer.name.includes('Platinum')) mapping['gold'] = offer.id;
        if (offer.name.includes('Platinum')) mapping['platinum'] = offer.id;
      });
      setOfferIds(mapping);
    };
    loadOffers();
  }, [fetchOffersByType]);

  const features = [
    {
      icon: TrendingUp,
      title: t('gestion.features.strategies.title'),
      description: t('gestion.features.strategies.desc')
    },
    {
      icon: Shield,
      title: t('gestion.features.risk.title'),
      description: t('gestion.features.risk.desc')
    },
    {
      icon: Target,
      title: t('gestion.features.performance.title'),
      description: t('gestion.features.performance.desc')
    },
    {
      icon: Users,
      title: t('gestion.features.expert.title'),
      description: t('gestion.features.expert.desc')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section ref={heroRef} className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-4xl mx-auto ${heroVisible ? 'animate-fade-in-up' : ''}`}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('gestion.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {t('gestion.hero.subtitle')}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Notre service de gestion de comptes vous permet de profiter de nos stratégies, signaux et analyses sans lever le petit doigt. En parallèle, vous pouvez développer vos compétences grâce à nos{' '}
                <Link to="/services/formations" className="text-primary hover:text-primary/80 underline font-medium">
                  formations
                </Link>
                {' '}ou suivre nos{' '}
                <Link to="/services/signaux" className="text-primary hover:text-primary/80 underline font-medium">
                  signaux
                </Link>
                {' '}pour mieux comprendre le marché.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge variant="secondary" className="px-4 py-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t('gestion.stats.performance')}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  {t('gestion.stats.security')}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  {t('gestion.stats.experts')}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('gestion.features.title')}</h2>
            <div className={`grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto ${featuresVisible ? 'animate-fade-in-up' : ''}`}>
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-2xl mx-auto ${ctaVisible ? 'animate-fade-in-up' : ''}`}>
              <h2 className="text-3xl font-bold mb-4">{t('gestion.cta.title')}</h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t('gestion.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="hero"
                  onClick={() => {
                    // Rediriger vers l'offre Silver (la plus populaire)
                    const offerId = offerIds['silver'] || Object.values(offerIds)[0];
                    if (offerId) {
                      navigate(`/checkout?offer=${offerId}`);
                    }
                  }}
                >
                  {t('gestion.cta.button')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesGestion;
