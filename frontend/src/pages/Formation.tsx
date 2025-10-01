import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, Clock, Award, BookOpen, TrendingUp, Target, Zap, Lock, Crown, GraduationCap, UserCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { EditableLayout } from "@/components/cms/EditableLayout";

const Formation = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: coursesRef, isVisible: coursesVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  const formations = [
    {
      id: "initiation",
      title: t('formations.initiation.title'),
      price: t('formations.initiation.price'),
      description: t('formations.initiation.description'),
      badge: t('formations.initiation.badge'),
      features: [
        t('formations.initiation.features.videos'),
        t('formations.initiation.features.quizzes'),
        t('formations.initiation.features.prerequisite')
      ],
      learnings: [
        t('formations.initiation.learnings.markets'),
        t('formations.initiation.learnings.technical'),
        t('formations.initiation.learnings.psychology')
      ],
      buttonText: t('formations.initiation.button'),
      buttonAction: "free",
      icon: BookOpen,
      color: "from-primary/20 to-primary/10",
      borderColor: "border-primary/30",
      stats: {
        duration: t('formations.initiation.stats.duration'),
        lessons: t('formations.initiation.stats.lessons'),
        students: t('formations.initiation.stats.students'),
        rating: "4.9/5"
      }
    },
    {
      id: "basic",
      title: t('formations.basic.title'),
      price: t('formations.basic.price'),
      description: t('formations.basic.description'),
      badge: t('formations.basic.badge'),
      features: [
        t('formations.basic.features.coaching'),
        t('formations.basic.features.signals'),
        t('formations.basic.features.exercises')
      ],
      learnings: [
        t('formations.basic.learnings.indicators'),
        t('formations.basic.learnings.risk'),
        t('formations.basic.learnings.strategies')
      ],
      buttonText: t('formations.basic.button'),
      buttonAction: "purchase",
      icon: Target,
      color: "from-primary/30 to-primary/20",
      borderColor: "border-primary/50",
      stats: {
        duration: t('formations.basic.stats.duration'),
        lessons: t('formations.basic.stats.lessons'),
        students: t('formations.basic.stats.students'),
        rating: "4.8/5"
      }
    },
    {
      id: "advanced",
      title: t('formations.advanced.title'),
      price: t('formations.advanced.price'),
      description: t('formations.advanced.description'),
      badge: t('formations.advanced.badge'),
      features: [
        t('formations.advanced.features.coaching'),
        t('formations.advanced.features.strategies'),
        t('formations.advanced.features.community')
      ],
      learnings: [
        t('formations.advanced.learnings.patterns'),
        t('formations.advanced.learnings.indicators'),
        t('formations.advanced.learnings.discipline')
      ],
      buttonText: t('formations.advanced.button'),
      buttonAction: "purchase",
      icon: TrendingUp,
      color: "from-primary/40 to-primary/30",
      borderColor: "border-primary/70",
      stats: {
        duration: t('formations.advanced.stats.duration'),
        lessons: t('formations.advanced.stats.lessons'),
        students: t('formations.advanced.stats.students'),
        rating: "4.9/5"
      }
    },
    {
      id: "elite",
      title: t('formations.elite.title'),
      price: t('formations.elite.price'),
      description: t('formations.elite.description'),
      badge: t('formations.elite.badge'),
      features: [
        t('formations.elite.features.mentorship'),
        t('formations.elite.features.vip'),
        t('formations.elite.features.coaching'),
        t('formations.elite.features.strategy')
      ],
      learnings: [
        t('formations.elite.learnings.strategies'),
        t('formations.elite.learnings.capital'),
        t('formations.elite.learnings.methodology')
      ],
      buttonText: t('formations.elite.button'),
      buttonAction: "purchase",
      icon: Crown,
      color: "from-primary/50 to-primary/40",
      borderColor: "border-primary",
      stats: {
        duration: t('formations.elite.stats.duration'),
        lessons: t('formations.elite.stats.lessons'),
        students: t('formations.elite.stats.students'),
        rating: "5.0/5"
      }
    }
  ];

  const handleButtonClick = (action: string, formationId: string) => {
    if (action === "free") {
      // Rediriger vers la formation gratuite
      navigate('/course/initiation');
    } else {
      // Rediriger vers la page de paiement
      navigate('/checkout', { state: { formation: formationId } });
    }
  };

  return (
    <EditableLayout pageSlug="formations">
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
              <p className="text-xl text-muted-foreground mb-8">
                {t('formations.hero.subtitle')}
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

        {/* Formations Grid */}
        <section ref={coursesRef} className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('formations.courses.title')}</h2>
            <div className={`grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-7xl mx-auto ${coursesVisible ? 'animate-fade-in-up' : ''}`}>
              {formations.map((formation, index) => (
                <Card 
                  key={formation.id} 
                  className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${formation.borderColor} border-2`}
                >
                  <CardHeader className={`${formation.color} rounded-t-lg`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <formation.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{formation.title}</CardTitle>
                          <p className="text-2xl font-bold text-primary mt-2">{formation.price}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                        {formation.badge}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{formation.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{formation.stats.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span>{formation.stats.lessons}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{formation.stats.students}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        <span>{formation.stats.rating}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        {t('formations.features.title')}
                      </h4>
                      <ul className="space-y-2">
                        {formation.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* What you'll learn */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        {t('formations.learnings.title')}
                      </h4>
                      <ul className="space-y-2">
                        {formation.learnings.map((learning, learningIndex) => (
                          <li key={learningIndex} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{learning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button */}
                    <Button 
                      onClick={() => handleButtonClick(formation.buttonAction, formation.id)}
                      className={`w-full ${
                        formation.id === 'initiation' 
                          ? 'bg-primary hover:bg-primary/90' 
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                      size="lg"
                    >
                      {formation.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
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
              <h2 className="text-3xl font-bold mb-4">{t('formations.cta.title')}</h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t('formations.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="hero">
                  <a href="#formations">
                    {t('formations.cta.button')}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
        </main>

        <Footer />
      </div>
    </EditableLayout>
  );
};

export default Formation;