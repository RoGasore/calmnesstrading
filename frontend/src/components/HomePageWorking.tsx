import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Clock, 
  CheckCircle, 
  Trophy, 
  TrendingUp, 
  Shield,
  Award,
  Users,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URLS } from '@/config/api';
import CommunityPopup from '@/components/CommunityPopup';

const HomePageWorking: React.FC = () => {
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommunityPopup, setShowCommunityPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const blocksUrl = API_URLS.PAGE_PUBLIC_CONTENT_BLOCKS('home');
      const blocksResponse = await fetch(blocksUrl);
      
      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json();
        setContentBlocks(blocksData.content_blocks || []);
      } else {
        const errorText = await blocksResponse.text();
        setError(`API Error ${blocksResponse.status}: ${errorText}`);
      }
    } catch (error) {
      setError(`Network Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getBlockContent = (key: string, defaultValue: string = '') => {
    const block = contentBlocks.find(b => b.block_key === key);
    return block?.content || defaultValue;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToServices = () => {
    navigate('/services');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadContent}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pt-30">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {getBlockContent('hero_main_title', 'Mange. Dors. Trade. Répète.')}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {getBlockContent('hero_subtitle', 'La routine qui peut transformer votre vie.')}
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              {getBlockContent('hero_description', 'Formez-vous. Copiez nos signaux. Confiez-nous votre compte.')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg"
                onClick={() => setShowCommunityPopup(true)}
              >
                <Users className="h-5 w-5 mr-2" />
                {getBlockContent('hero_cta1', 'Rejoindre notre communauté')}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 text-lg"
                onClick={goToServices}
              >
                {getBlockContent('hero_cta2', 'Voir nos services')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {getBlockContent('solutions_title', 'Nos 3 solutions — Choisissez ce qui vous correspond')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {getBlockContent('solution_formation_title', '📚 Formation Trading — Devenez autonome')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {getBlockContent('solution_formation_description', 'Vous voulez comprendre les marchés et trader par vous-même ?')}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate('/services/formations')}
              >
                En savoir plus
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="text-center p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {getBlockContent('solution_signaux_title', '📈 Signaux Premium — Copiez et gagnez')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {getBlockContent('solution_signaux_description', 'Pas le temps ou l\'envie de suivre une formation complète ?')}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate('/services/signaux')}
              >
                En savoir plus
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="text-center p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {getBlockContent('solution_gestion_title', '💼 Gestion de compte — Vos gains, sans effort')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {getBlockContent('solution_gestion_description', 'Vous n\'avez ni le temps de vous former, ni de copier nos signaux ?')}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate('/services/gestion')}
              >
                En savoir plus
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {getBlockContent('how_it_works_title', 'Comment ça marche — 3 étapes simples')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Étape 1</h3>
              <p className="text-muted-foreground leading-relaxed">
                {getBlockContent('step_1', 'Choisissez votre solution : Formation, Signaux, ou Gestion.')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Étape 2</h3>
              <p className="text-muted-foreground leading-relaxed">
                {getBlockContent('step_2', 'Accédez à nos services : suivez, copiez, ou laissez-nous gérer pour vous.')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-warning" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Étape 3</h3>
              <p className="text-muted-foreground leading-relaxed">
                {getBlockContent('step_3', 'Profitez des résultats : compétences, gains, sérénité.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {getBlockContent('benefits_title', 'Les bénéfices pour vous')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {getBlockContent('benefit_1', 'Gagnez du temps, réduisez le stress')}
              </p>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {getBlockContent('benefit_2', 'Acquérez des compétences solides et durables')}
              </p>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {getBlockContent('benefit_3', 'Profitez de signaux précis ou de gains réguliers')}
              </p>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {getBlockContent('benefit_4', 'Liberté de choisir la solution adaptée à votre vie')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {getBlockContent('why_choose_title', 'Pourquoi choisir Calmness Trading ?')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {getBlockContent('advantage_1', 'Expertise éprouvée : analyses précises, méthodes fiables')}
              </p>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {getBlockContent('advantage_2', 'Flexibilité totale : apprenez, copiez ou déléguez')}
              </p>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {getBlockContent('advantage_3', 'Transparence et rigueur : pas de promesses irréalistes')}
              </p>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {getBlockContent('advantage_4', 'Vision long terme : profits durables plutôt que coups de chance')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              {getBlockContent('disclaimer_title', 'Avertissement / Disclaimer')}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {getBlockContent('disclaimer_text', 'Le trading comporte des risques.')}
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
                {getBlockContent('final_cta1', 'Commencer maintenant')}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={goToServices}
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
      />
    </div>
  );
};

export default HomePageWorking;
