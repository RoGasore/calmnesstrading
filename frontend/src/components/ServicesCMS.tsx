import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Users, Award, Star, ArrowRight, CheckCircle, Target, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useLanguage } from "@/contexts/LanguageContext";
import { API_URLS } from "@/config/api";

interface ContentBlock {
  id: number;
  block_key: string;
  content: string;
  content_type: string;
  order: number;
  is_visible: boolean;
}

const ServicesCMS: React.FC = () => {
  const { ref: servicesRef, isVisible: servicesVisible } = useScrollAnimation();
  const { ref: whyChooseRef, isVisible: whyChooseVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();
  const { t } = useLanguage();
  
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URLS.PAGE_PUBLIC_CONTENT_BLOCKS('services'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Services content blocks loaded:', data);
      
      // Extraire les blocs de contenu de la réponse
      const blocks = data.content_blocks || data;
      setContentBlocks(Array.isArray(blocks) ? blocks : []);
    } catch (error) {
      console.error('Erreur lors du chargement du contenu:', error);
      setError('Erreur lors du chargement du contenu');
    } finally {
      setLoading(false);
    }
  };

  const getBlockContent = (key: string, defaultValue: string = '') => {
    const block = contentBlocks.find(b => b.block_key === key);
    return block?.content || defaultValue;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadContent}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const services = [
    {
      id: "services",
      title: getBlockContent('services_title', 'Nos Services'),
      description: getBlockContent('services_description', 'Découvrez notre gamme complète de services de trading professionnels'),
      icon: Award,
      features: [
        getBlockContent('services_feature_1', 'Signaux en temps réel'),
        getBlockContent('services_feature_2', 'Formations structurées'),
        getBlockContent('services_feature_3', 'Gestion de comptes'),
        getBlockContent('services_feature_4', 'Analyses intégrées')
      ],
      stats: {
        services: getBlockContent('services_stat_1', '3+'),
        clients: getBlockContent('services_stat_2', '2000+'),
        rating: getBlockContent('services_stat_3', '4.9/5')
      },
      link: "/services",
      color: "from-primary/20 to-primary/10",
      borderColor: "border-primary/30"
    },
    {
      id: "formations",
      title: getBlockContent('formations_title', t('services.formation.title')),
      description: getBlockContent('formations_description', t('services.formation.desc')),
      icon: BookOpen,
      features: [
        getBlockContent('formations_feature_1', t('services.features.technical.analysis')),
        getBlockContent('formations_feature_2', t('services.features.risk.management')),
        getBlockContent('formations_feature_3', t('services.features.trading.psychology')),
        getBlockContent('formations_feature_4', t('services.features.profitable.strategies'))
      ],
      stats: {
        students: getBlockContent('formations_stat_1', '+2000'),
        rating: getBlockContent('formations_stat_2', '4.8/5'),
        courses: getBlockContent('formations_stat_3', '12+')
      },
      link: "/services/formations",
      color: "from-primary/30 to-primary/20",
      borderColor: "border-primary/50"
    },
    {
      id: "signaux",
      title: getBlockContent('signaux_title', t('services.signals.title')),
      description: getBlockContent('signaux_description', t('services.signals.desc')),
      icon: TrendingUp,
      features: [
        getBlockContent('signaux_feature_1', t('services.features.daily.signals')),
        getBlockContent('signaux_feature_2', t('services.features.entry.exit.points')),
        getBlockContent('signaux_feature_3', t('services.features.risk.reward.ratios')),
        getBlockContent('signaux_feature_4', t('services.features.tracked.performance'))
      ],
      stats: {
        success: getBlockContent('signaux_stat_1', '87%'),
        signals: getBlockContent('signaux_stat_2', '5-8/jour'),
        profit: getBlockContent('signaux_stat_3', '+65 pips')
      },
      link: "/services/signaux",
      color: "from-primary/40 to-primary/30",
      borderColor: "border-primary/70"
    },
    {
      id: "gestion",
      title: getBlockContent('gestion_title', 'Gestion de Comptes'),
      description: getBlockContent('gestion_description', 'Confiez votre trading à nos experts pour des performances optimales'),
      icon: Target,
      features: [
        getBlockContent('gestion_feature_1', 'Stratégies éprouvées'),
        getBlockContent('gestion_feature_2', 'Gestion des risques'),
        getBlockContent('gestion_feature_3', 'Performance suivie'),
        getBlockContent('gestion_feature_4', 'Équipe d\'experts')
      ],
      stats: {
        performance: getBlockContent('gestion_stat_1', '+25%'),
        security: getBlockContent('gestion_stat_2', 'Sécurisé'),
        experts: getBlockContent('gestion_stat_3', '10+ ans')
      },
      link: "/services/gestion",
      color: "from-primary/50 to-primary/40",
      borderColor: "border-primary"
    }
  ];

  const whyChooseUs = [
    {
      title: getBlockContent('why_choose_1_title', t('services.why.expertise.title')),
      description: getBlockContent('why_choose_1_description', t('services.why.expertise.desc')),
      icon: Award
    },
    {
      title: getBlockContent('why_choose_2_title', t('services.why.community.title')),
      description: getBlockContent('why_choose_2_description', t('services.why.community.desc')),
      icon: Users
    },
    {
      title: getBlockContent('why_choose_3_title', t('services.why.results.title')),
      description: getBlockContent('why_choose_3_description', t('services.why.results.desc')),
      icon: Star
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {getBlockContent('hero_title', t('services.hero.title'))}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {getBlockContent('hero_subtitle', t('services.hero.subtitle'))}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {getBlockContent('hero_description', 'Vous souhaitez enfin comprendre le marché et prendre des décisions éclairées sans stress ? Nous sommes là pour vous guider : profitez de nos signaux professionnels, formations et analyses intégrées pour reprendre le contrôle de votre trading.')}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge variant="secondary" className="px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  {getBlockContent('hero_stat_1', t('services.stats.trained'))}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Award className="w-4 h-4 mr-2" />
                  {getBlockContent('hero_stat_2', t('services.stats.success'))}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Star className="w-4 h-4 mr-2" />
                  {getBlockContent('hero_stat_3', t('services.stats.roi'))}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section ref={servicesRef} className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {getBlockContent('services_grid_title', t('services.solutions.title'))}
            </h2>
            <div className={`grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-7xl mx-auto ${servicesVisible ? 'animate-fade-in-up' : ''}`}>
              {services.map((service, index) => (
                <Card 
                  key={service.id} 
                  className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${service.borderColor} border-2`}
                >
                  <CardHeader className={`${service.color} rounded-t-lg`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <service.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{service.title}</CardTitle>
                          <p className="text-2xl font-bold text-primary mt-2">
                            {service.id === 'services' ? getBlockContent('services_price', 'Complet') : 
                             service.id === 'formations' ? getBlockContent('formations_price', '150$ - 1500$') :
                             service.id === 'signaux' ? getBlockContent('signaux_price', '87% Réussite') :
                             service.id === 'gestion' ? getBlockContent('gestion_price', 'Sur mesure') : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                        {service.id === 'services' ? getBlockContent('services_badge', 'Complet') :
                         service.id === 'formations' ? getBlockContent('formations_badge', 'Populaire') :
                         service.id === 'signaux' ? getBlockContent('signaux_badge', 'Recommandé') :
                         service.id === 'gestion' ? getBlockContent('gestion_badge', 'Premium') : ''}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(service.stats).map(([key, value], statIndex) => {
                        const icons = [Clock, Users, Star, Award];
                        const IconComponent = icons[statIndex % icons.length];
                        return (
                          <div key={statIndex} className="flex items-center gap-2 text-sm">
                            <IconComponent className="h-4 w-4 text-primary" />
                            <span>{value}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {getBlockContent('features_title', 'Ce que vous obtenez')}
                      </h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button */}
                    <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                      <Link to={service.link}>
                        {getBlockContent('learn_more_button', 'En savoir plus')}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section ref={whyChooseRef} className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {getBlockContent('why_choose_title', t('services.why.title'))}
            </h2>
            <div className={`grid gap-8 md:grid-cols-3 max-w-4xl mx-auto ${whyChooseVisible ? 'animate-fade-in-up' : ''}`}>
              {whyChooseUs.map((item, index) => (
                <Card 
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                  style={{
                    animationDelay: `${index * 0.2 + 0.4}s`
                  }}
                >
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <item.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="py-16">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-2xl mx-auto ${ctaVisible ? 'animate-fade-in-up' : ''}`}>
              <h2 className="text-3xl font-bold mb-4">
                {getBlockContent('cta_title', t('services.cta.title'))}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {getBlockContent('cta_subtitle', t('services.cta.subtitle'))}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="hero">
                  <Link to="/services/formations">
                    {getBlockContent('cta_formations_button', t('services.cta.formations'))}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/services/signaux">
                    {getBlockContent('cta_signaux_button', t('services.cta.signals'))}
                  </Link>
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

export default ServicesCMS;