import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Users, Award, Star, ArrowRight, CheckCircle, Target, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const { ref: servicesRef, isVisible: servicesVisible } = useScrollAnimation();
  const { ref: whyChooseRef, isVisible: whyChooseVisible } = useScrollAnimation();
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      id: "services",
      title: "Nos Services",
      description: "Découvrez notre gamme complète de services de trading professionnels",
      icon: Award,
      features: [
        "Signaux en temps réel",
        "Formations structurées", 
        "Gestion de comptes",
        "Analyses intégrées"
      ],
      stats: {
        services: "3+",
        clients: "2000+",
        rating: "4.9/5"
      },
      link: "/services",
      color: "from-primary/20 to-primary/10",
      borderColor: "border-primary/30"
    },
    {
      id: "formations",
      title: t('services.formation.title'),
      description: t('services.formation.desc'),
      icon: BookOpen,
      features: [
        t('services.features.technical.analysis'),
        t('services.features.risk.management'),
        t('services.features.trading.psychology'),
        t('services.features.profitable.strategies')
      ],
      stats: {
        students: "+2000",
        rating: "4.8/5",
        courses: "12+"
      },
      link: "/services/formations",
      color: "from-primary/30 to-primary/20",
      borderColor: "border-primary/50"
    },
    {
      id: "signaux",
      title: t('services.signals.title'),
      description: t('services.signals.desc'),
      icon: TrendingUp,
      features: [
        t('services.features.daily.signals'),
        t('services.features.entry.exit.points'),
        t('services.features.risk.reward.ratios'),
        t('services.features.tracked.performance')
      ],
      stats: {
        success: "87%",
        signals: "5-8/jour",
        profit: "+65 pips"
      },
      link: "/services/signaux",
      color: "from-primary/40 to-primary/30",
      borderColor: "border-primary/70"
    },
    {
      id: "gestion",
      title: "Gestion de Comptes",
      description: "Confiez votre trading à nos experts pour des performances optimales",
      icon: Target,
      features: [
        "Stratégies éprouvées",
        "Gestion des risques",
        "Performance suivie",
        "Équipe d'experts"
      ],
      stats: {
        performance: "+25%",
        security: "Sécurisé",
        experts: "10+ ans"
      },
      link: "/services/gestion",
      color: "from-primary/50 to-primary/40",
      borderColor: "border-primary"
    }
  ];

  const whyChooseUs = [
    {
      title: t('services.why.expertise.title'),
      description: t('services.why.expertise.desc'),
      icon: Award
    },
    {
      title: t('services.why.community.title'),
      description: t('services.why.community.desc'),
      icon: Users
    },
    {
      title: t('services.why.results.title'),
      description: t('services.why.results.desc'),
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
                {t('services.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {t('services.hero.subtitle')}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Vous souhaitez enfin comprendre le marché et prendre des décisions éclairées sans stress ? Nous sommes là pour vous guider : profitez de nos{' '}
                <Link to="/services/signaux" className="text-primary hover:text-primary/80 underline font-medium">
                  signaux professionnels
                </Link>
                {', '}
                <Link to="/services/formations" className="text-primary hover:text-primary/80 underline font-medium">
                  formations
                </Link>
                {' et '}
                <Link to="/services/gestion" className="text-primary hover:text-primary/80 underline font-medium">
                  analyses intégrées
                </Link>
                {' pour reprendre le contrôle de votre trading. Et si vous n\'avez pas le temps d\'apprendre, nos services de gestion de comptes et signaux prêts à l\'emploi sont là pour vous.'}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge variant="secondary" className="px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  {t('services.stats.trained')}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Award className="w-4 h-4 mr-2" />
                  {t('services.stats.success')}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Star className="w-4 h-4 mr-2" />
                  {t('services.stats.roi')}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section ref={servicesRef} className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('services.solutions.title')}</h2>
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
                            {service.id === 'services' ? 'Complet' : 
                             service.id === 'formations' ? '150$ - 1500$' :
                             service.id === 'signaux' ? '87% Réussite' :
                             service.id === 'gestion' ? 'Sur mesure' : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                        {service.id === 'services' ? 'Complet' :
                         service.id === 'formations' ? 'Populaire' :
                         service.id === 'signaux' ? 'Recommandé' :
                         service.id === 'gestion' ? 'Premium' : ''}
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
                            <IconComponent className="w-4 h-4 text-primary" />
                            <span>{value}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Ce que vous obtenez
                      </h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button */}
                    <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                      <Link to={service.link}>
                        En savoir plus
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
            <h2 className="text-3xl font-bold text-center mb-12">{t('services.why.title')}</h2>
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

      </main>

      <Footer />
    </div>
  );
};

export default Services;
