import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  TrendingUp, 
  Briefcase, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Target,
  Shield,
  Award,
  Users,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';
import CommunityPopup from './CommunityPopup';

interface ContentBlock {
  id: number;
  block_key: string;
  title: string;
  content: string;
  content_type: string;
  order: number;
}

const HomePageNew: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCommunityPopup, setShowCommunityPopup] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  const heroRef = useRef(null);
  const solutionsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const benefitsRef = useRef(null);
  const whyChooseRef = useRef(null);
  const disclaimerRef = useRef(null);
  
  const isHeroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const isSolutionsInView = useInView(solutionsRef, { once: true, margin: "-100px" });
  const isHowItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const isBenefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });
  const isWhyChooseInView = useInView(whyChooseRef, { once: true, margin: "-100px" });

  useEffect(() => {
    // Vérifier le cache localStorage
    const cachedContent = localStorage.getItem('homepage_content');
    const cachedSettings = localStorage.getItem('homepage_settings');
    const cacheTime = localStorage.getItem('homepage_cache_time');
    
    const now = Date.now();
    const cacheAge = cacheTime ? now - parseInt(cacheTime) : Infinity;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    if (cachedContent && cachedSettings && cacheAge < CACHE_DURATION) {
      // Utiliser le cache
      // console.log('📦 Using cached content'); // Désactivé en production
      setContentBlocks(JSON.parse(cachedContent));
      setGlobalSettings(JSON.parse(cachedSettings));
      setLastFetchTime(parseInt(cacheTime || '0'));
      setLoading(false);
    } else {
      // Charger depuis l'API
      loadContent();
    }
  }, []);

  const loadContent = async () => {
    try {
      // console.log('🔄 Loading content from API...'); // Désactivé en production
      
      // Charger les blocs de contenu
      const blocksUrl = API_URLS.PAGE_PUBLIC_CONTENT_BLOCKS('home');
      const blocksResponse = await fetch(blocksUrl);
      
      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json();
        const contentBlocksData = blocksData.content_blocks || [];
        setContentBlocks(contentBlocksData);
        
        // Mettre en cache
        localStorage.setItem('homepage_content', JSON.stringify(contentBlocksData));
      } else {
        console.warn('Failed to load content blocks, using fallback');
        setContentBlocks([]);
      }
      
      // Charger les paramètres globaux
      const settingsUrl = API_URLS.GLOBAL_SETTINGS_PUBLIC;
      const settingsResponse = await fetch(settingsUrl);
      
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setGlobalSettings(settingsData);
        
        // Mettre en cache
        localStorage.setItem('homepage_settings', JSON.stringify(settingsData));
      } else {
        console.warn('Failed to load settings, using fallback');
        const fallbackSettings = {
          social_networks: {
            telegram: 'https://t.me/calmnesstrading',
            discord: 'https://discord.gg/calmnesstrading'
          }
        };
        setGlobalSettings(fallbackSettings);
        localStorage.setItem('homepage_settings', JSON.stringify(fallbackSettings));
      }
      
      // Marquer le temps de mise en cache
      const now = Date.now();
      setLastFetchTime(now);
      localStorage.setItem('homepage_cache_time', now.toString());
      
    } catch (error) {
      console.error('Error loading content:', error);
      
      // Utiliser des valeurs par défaut en cas d'erreur
      const fallbackBlocks: ContentBlock[] = [];
      const fallbackSettings = {
        social_networks: {
          telegram: 'https://t.me/calmnesstrading',
          discord: 'https://discord.gg/calmnesstrading'
        }
      };
      
      setContentBlocks(fallbackBlocks);
      setGlobalSettings(fallbackSettings);
      
      // Mettre en cache les valeurs par défaut
      localStorage.setItem('homepage_content', JSON.stringify(fallbackBlocks));
      localStorage.setItem('homepage_settings', JSON.stringify(fallbackSettings));
      localStorage.setItem('homepage_cache_time', Date.now().toString());
    } finally {
      setLoading(false);
    }
  };

  const getBlockContent = (key: string, defaultValue: string = '') => {
    const block = contentBlocks.find(b => b.block_key === key);
    return block?.content || defaultValue;
  };

  // Fonction pour invalider le cache
  const invalidateCache = () => {
    localStorage.removeItem('homepage_content');
    localStorage.removeItem('homepage_settings');
    localStorage.removeItem('homepage_cache_time');
    // console.log('🗑️ Cache invalidated'); // Désactivé en production
  };

  // Exposer la fonction pour qu'elle puisse être appelée depuis l'admin
  React.useEffect(() => {
    (window as any).invalidateHomepageCache = invalidateCache;
    return () => {
      delete (window as any).invalidateHomepageCache;
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Debug: afficher l'état du composant (désactivé en production)
  // console.log('🎯 HomePageNew render state:', {
  //   loading,
  //   contentBlocksCount: contentBlocks.length,
  //   globalSettings: !!globalSettings,
  //   firstBlock: contentBlocks[0]?.block_key,
  //   lastFetchTime
  // });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Debug: afficher si le contenu est vide (désactivé en production)
  // if (contentBlocks.length === 0) {
  //   console.warn('⚠️ No content blocks found, using fallback content');
  // }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {getBlockContent('hero_main_title', 'Mange. Dors. Trade. Répète.')}
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              {getBlockContent('hero_subtitle', 'La routine qui peut transformer votre vie.')}
            </motion.p>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              {getBlockContent('hero_description', 'Formez-vous. Copiez nos signaux. Confiez-nous votre compte.')}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            >
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setShowCommunityPopup(true)}
              >
                <Users className="h-5 w-5 mr-2" />
                {getBlockContent('hero_cta1', 'Rejoindre notre communauté')}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => scrollToSection('solutions')}
              >
                {getBlockContent('hero_cta2', 'Voir nos services')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" ref={solutionsRef} className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isSolutionsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {getBlockContent('solutions_title', 'Nos 3 solutions — Choisissez ce qui vous correspond')}
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Formation */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isSolutionsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group bg-card">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold text-card-foreground">
                    {getBlockContent('solution_formation_title', '📚 Formation Trading — Devenez autonome')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {getBlockContent('solution_formation_description', 'Vous voulez comprendre les marchés et trader par vous-même ?')}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Signaux */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isSolutionsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group bg-card">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-success/20 transition-colors">
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                  <CardTitle className="text-xl font-bold text-card-foreground">
                    {getBlockContent('solution_signaux_title', '📈 Signaux Premium — Copiez et gagnez')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {getBlockContent('solution_signaux_description', 'Pas le temps ou l\'envie de suivre une formation complète ?')}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Gestion */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isSolutionsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group bg-card">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-warning/20 transition-colors">
                    <Briefcase className="h-8 w-8 text-warning" />
                  </div>
                  <CardTitle className="text-xl font-bold text-card-foreground">
                    {getBlockContent('solution_gestion_title', '💼 Gestion de compte — Vos gains, sans effort')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {getBlockContent('solution_gestion_description', 'Vous n\'avez ni le temps de vous former, ni de copier nos signaux ?')}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {getBlockContent('how_it_works_title', 'Comment ça marche — 3 étapes simples')}
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { key: 'step_1', icon: Target, color: 'primary' },
              { key: 'step_2', icon: Clock, color: 'success' },
              { key: 'step_3', icon: CheckCircle, color: 'warning' }
            ].map((step, index) => (
              <motion.div
                key={step.key}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: 0.2 * index, ease: "easeOut" }}
              >
                <div className={`w-20 h-20 bg-${step.color}/10 rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <step.icon className={`h-10 w-10 text-${step.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Étape {index + 1}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {getBlockContent(step.key, `Étape ${index + 1}`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" ref={benefitsRef} className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {getBlockContent('benefits_title', 'Les bénéfices pour vous')}
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { key: 'benefit_1', icon: Clock },
              { key: 'benefit_2', icon: Award },
              { key: 'benefit_3', icon: TrendingUp },
              { key: 'benefit_4', icon: Shield }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.key}
                className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, x: -50 }}
                animate={isBenefitsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 * index, ease: "easeOut" }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {getBlockContent(benefit.key, `Bénéfice ${index + 1}`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section id="why-choose" ref={whyChooseRef} className="py-20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isWhyChooseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {getBlockContent('why_choose_title', 'Pourquoi choisir Calmness Trading ?')}
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { key: 'advantage_1', icon: Award },
              { key: 'advantage_2', icon: Shield },
              { key: 'advantage_3', icon: CheckCircle },
              { key: 'advantage_4', icon: Target }
            ].map((advantage, index) => (
              <motion.div
                key={advantage.key}
                className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, x: -50 }}
                animate={isWhyChooseInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 * index, ease: "easeOut" }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <advantage.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {getBlockContent(advantage.key, `Avantage ${index + 1}`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section id="disclaimer" ref={disclaimerRef} className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              {getBlockContent('disclaimer_title', 'Avertissement / Disclaimer')}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {getBlockContent('disclaimer_text', '⚠️ Le trading comporte des risques.')}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
              {getBlockContent('final_cta_title', 'Prêt à transformer votre façon de trader ?')}
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setShowCommunityPopup(true)}
              >
                <Users className="h-5 w-5 mr-2" />
                {getBlockContent('final_cta1', 'Commencer maintenant')}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => scrollToSection('solutions')}
              >
                {getBlockContent('final_cta2', 'Découvrir nos offres')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Popup */}
      <CommunityPopup
        isOpen={showCommunityPopup}
        onClose={() => setShowCommunityPopup(false)}
        telegramUrl={globalSettings?.telegram_url}
        discordUrl={globalSettings?.discord_url}
      />
    </div>
  );
};

export default HomePageNew;