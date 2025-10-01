import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { EditableLayout } from "@/components/cms/EditableLayout";
import { EditableText } from "@/components/cms/EditableText";
import { EditableImage } from "@/components/cms/EditableImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  GraduationCap, 
  Zap, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Target,
  Shield,
  Award,
  BarChart3,
  Clock,
  MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import heroImage from "@/assets/hero-trading.jpg";

const Index = () => {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const philosophyRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);
  
  const isHeroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const isServicesInView = useInView(servicesRef, { once: true, margin: "-100px" });
  const isPhilosophyInView = useInView(philosophyRef, { once: true, margin: "-100px" });
  const isTestimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" });
  const isCtaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  const services = [
    {
      icon: GraduationCap,
      title: "Formations Expertes",
      description: "Apprenez le trading avec des professionnels certifiés. Formations complètes du débutant à l'expert.",
      link: "/services/formations",
      color: "from-blue-500/20 to-blue-600/10",
      borderColor: "border-blue-500/30",
      badge: "Populaire"
    },
    {
      icon: Zap,
      title: "Signaux Professionnels", 
      description: "Recevez des signaux de trading précis directement sur Telegram. Analyses techniques approfondies.",
      link: "/services/signaux",
      color: "from-green-500/20 to-green-600/10",
      borderColor: "border-green-500/30",
      badge: "Premium"
    },
    {
      icon: Users,
      title: "Gestion de Comptes",
      description: "Confiez la gestion de votre portefeuille à nos experts. Performance trackée et transparente.",
      link: "/services/gestion",
      color: "from-purple-500/20 to-purple-600/10", 
      borderColor: "border-purple-500/30",
      badge: "Expert"
    }
  ];

  const philosophy = [
    {
      icon: Target,
      title: "Excellence",
      description: "Nous visons l'excellence dans chaque formation, chaque signal, chaque analyse."
    },
    {
      icon: Shield,
      title: "Sécurité",
      description: "Votre capital est protégé par nos stratégies de gestion des risques éprouvées."
    },
    {
      icon: Award,
      title: "Expertise",
      description: "Plus de 10 ans d'expérience sur les marchés financiers internationaux."
    },
    {
      icon: Users,
      title: "Accompagnement",
      description: "Un support personnalisé pour votre réussite, du débutant au trader confirmé."
    }
  ];

  const testimonials = [
    {
      name: "Pierre Martin",
      role: "Trader Indépendant",
      content: "Excellent service ! Les signaux sont très précis et m'ont permis d'améliorer considérablement mes performances de trading.",
      rating: 5,
      avatar: "/placeholder.svg"
    },
    {
      name: "Sarah Johnson", 
      role: "Débutante",
      content: "Formation de qualité exceptionnelle. Les stratégies enseignées sont applicables immédiatement.",
      rating: 5,
      avatar: "/placeholder.svg"
    },
    {
      name: "Ahmed Benali",
      role: "Investisseur",
      content: "Très bon accompagnement et analyses techniques détaillées. Je recommande vivement !",
      rating: 4,
      avatar: "/placeholder.svg"
    }
  ];

  return (
    <EditableLayout pageSlug="home">
      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <EditableImage
                src={heroImage}
                alt="Trading platform dashboard"
                sectionId={1}
                fieldName="content"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/90" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <EditableText
                    value="Maîtrisez le Trading avec Calmness Trading"
                    sectionId={2}
                    fieldName="content"
                    className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 block"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                >
                  <EditableText
                    value="Développez vos compétences en trading avec nos formations expertes, signaux professionnels et services de gestion de comptes. Rejoignez des milliers de traders qui font confiance à notre expertise."
                    sectionId={3}
                    fieldName="content"
                    className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto block"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  className="flex flex-wrap justify-center gap-4 mb-10"
                >
                  <Button asChild size="lg" className="text-lg px-8 py-6">
                    <Link to="/services/formations">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Commencer la Formation
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                    <Link to="/services/signaux">
                      <Zap className="mr-2 h-5 w-5" />
                      Voir les Signaux
                    </Link>
                  </Button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                    <div className="text-sm text-muted-foreground">Traders Formés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">95%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">10+</div>
                    <div className="text-sm text-muted-foreground">Années d'Expérience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section ref={servicesRef} className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isServicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-16"
              >
                <EditableText
                  value="Nos Services d'Excellence"
                  sectionId={4}
                  fieldName="content"
                  className="text-3xl md:text-4xl font-bold mb-4 block"
                />
                <EditableText
                  value="Découvrez notre gamme complète de services conçus pour votre réussite en trading, du débutant à l'expert."
                  sectionId={5}
                  fieldName="content"
                  className="text-xl text-muted-foreground max-w-2xl mx-auto block"
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service, index) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 50 }}
                    animate={isServicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
                  >
                    <Card className={`h-full border-2 ${service.borderColor} bg-gradient-to-br ${service.color} hover:shadow-lg transition-all duration-300`}>
                      <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                          <service.icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <CardTitle className="text-xl">{service.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {service.badge}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <Button asChild className="w-full">
                          <Link to={service.link}>
                            Découvrir
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Philosophy Section */}
          <section ref={philosophyRef} className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isPhilosophyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-16"
              >
                <EditableText
                  value="Notre Philosophie"
                  sectionId={6}
                  fieldName="content"
                  className="text-3xl md:text-4xl font-bold mb-4 block"
                />
                <EditableText
                  value="Les valeurs qui guident notre approche du trading et notre engagement envers votre réussite."
                  sectionId={7}
                  fieldName="content"
                  className="text-xl text-muted-foreground max-w-2xl mx-auto block"
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {philosophy.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 50 }}
                    animate={isPhilosophyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    className="text-center"
                  >
                    <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section ref={testimonialsRef} className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isTestimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-16"
              >
                <EditableText
                  value="Ce Que Disent Nos Clients"
                  sectionId={8}
                  fieldName="content"
                  className="text-3xl md:text-4xl font-bold mb-4 block"
                />
                <EditableText
                  value="Découvrez les témoignages de traders qui ont transformé leur approche grâce à nos services."
                  sectionId={9}
                  fieldName="content"
                  className="text-xl text-muted-foreground max-w-2xl mx-auto block"
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 50 }}
                    animate={isTestimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <CardDescription className="text-base">
                          "{testimonial.content}"
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-semibold">{testimonial.name}</div>
                            <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section ref={ctaRef} className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center max-w-4xl mx-auto"
              >
                <EditableText
                  value="Prêt à Transformer Votre Trading ?"
                  sectionId={10}
                  fieldName="content"
                  className="text-3xl md:text-4xl font-bold mb-6 block"
                />
                <EditableText
                  value="Rejoignez des milliers de traders qui font confiance à Calmness Trading. Commencez votre parcours vers la réussite dès aujourd'hui."
                  sectionId={11}
                  fieldName="content"
                  className="text-xl text-muted-foreground mb-8 block"
                />
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="text-lg px-8 py-6">
                    <Link to="/services/formations">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Commencer Maintenant
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                    <Link to="/contact">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Nous Contacter
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </EditableLayout>
  );
};

export default Index;
