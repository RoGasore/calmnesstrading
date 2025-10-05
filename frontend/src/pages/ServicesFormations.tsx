import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, GraduationCap } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { ServiceOffersList } from "@/components/payment/ServiceOffersList";

const ServicesFormations = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: coursesRef, isVisible: coursesVisible } = useScrollAnimation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const defaultFeatures = [
    'Videos HD illimitees',
    'Certificat de formation',
    'Support par email',
    'Mises a jour gratuites'
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
                {t('formations.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {t('formations.hero.subtitle')}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Vous voulez enfin maîtriser le trading et progresser rapidement ? Nos formations professionnelles sont conçues pour vous guider pas à pas et transformer vos connaissances en résultats concrets. Pendant que vous apprenez, vous pouvez aussi profiter de nos{' '}
                <Link to="/services/signaux" className="text-primary hover:text-primary/80 underline font-medium">
                  signaux
                </Link>
                {' '}pour trader en toute confiance ou confier votre capital à notre{' '}
                <Link to="/services/gestion" className="text-primary hover:text-primary/80 underline font-medium">
                  gestion de comptes
                </Link>
                {' '}pour des performances optimales.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge variant="secondary" className="px-4 py-2">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  {t('formations.hero.stats.courses')}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  {t('formations.hero.stats.students')}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Star className="w-4 h-4 mr-2" />
                  {t('formations.hero.stats.rating')}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Formations Grid - DYNAMIQUE */}
        <section ref={coursesRef} className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('formations.courses.title')}</h2>
            <div className={coursesVisible ? 'animate-fade-in-up' : ''}>
              <ServiceOffersList 
                serviceType="formation" 
                icon={GraduationCap}
                defaultFeatures={defaultFeatures}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesFormations;

