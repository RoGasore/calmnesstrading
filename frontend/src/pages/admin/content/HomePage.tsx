import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';
import { Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContentBlock {
  id: number;
  block_key: string;
  content: string;
  content_type: string;
  order: number;
  is_visible: boolean;
}

const HomePage: React.FC = () => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [homePageId, setHomePageId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBlocks, setSavingBlocks] = useState<Set<string>>(new Set());
  const [modifiedBlocks, setModifiedBlocks] = useState<Set<string>>(new Set());
  const [originalContent, setOriginalContent] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    loadHomeContent();
    loadHomePageId();
  }, []);

  const loadHomeContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URLS.PAGE_PUBLIC_CONTENT_BLOCKS('home'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Home content blocks loaded:', data);
      
      // Extraire les blocs de contenu de la réponse
      const blocks = data.content_blocks || data;
      
      // S'assurer que blocks est un tableau
      if (Array.isArray(blocks)) {
        console.log(`Chargé ${blocks.length} blocs de contenu`);
        setContentBlocks(blocks);
        
        // Initialiser le contenu original pour détecter les modifications
        const original: Record<string, string> = {};
        blocks.forEach(block => {
          original[block.block_key] = block.content;
        });
        setOriginalContent(original);
        setModifiedBlocks(new Set()); // Réinitialiser les modifications
      } else {
        console.warn('API returned non-array response:', data);
        setContentBlocks([]);
        setOriginalContent({});
        setModifiedBlocks(new Set());
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contenu:', error);
      setContentBlocks([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger le contenu de la page d'accueil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHomePageId = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_PAGES);
      if (response.ok) {
        const pages = await response.json();
        const homePage = pages.find((page: any) => page.slug === 'home');
        setHomePageId(homePage?.id || null);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID de la page home:', error);
    }
  };

  const getBlockContent = (key: string, defaultValue: string = '') => {
    if (!Array.isArray(contentBlocks)) {
      return defaultValue;
    }
    const block = contentBlocks.find(b => b.block_key === key);
    return block?.content || defaultValue;
  };

  const updateBlockContent = (key: string, content: string) => {
    setContentBlocks(prev => {
      if (!Array.isArray(prev)) {
        return [{
          id: Date.now(),
          block_key: key,
          content,
          content_type: 'text',
          order: 1,
          is_visible: true
        }];
      }
      
      const existingBlock = prev.find(b => b.block_key === key);
      if (existingBlock) {
        return prev.map(block => 
          block.block_key === key 
            ? { ...block, content }
            : block
        );
      } else {
        // Créer un nouveau bloc si il n'existe pas
        const newBlock: ContentBlock = {
          id: Date.now(), // ID temporaire
          block_key: key,
          content,
          content_type: 'text',
          order: prev.length + 1,
          is_visible: true
        };
        return [...prev, newBlock];
      }
    });

    // Détecter si le contenu a changé par rapport à l'original
    const originalContentForBlock = originalContent[key] || '';
    if (content !== originalContentForBlock) {
      setModifiedBlocks(prev => new Set(prev).add(key));
    } else {
      setModifiedBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const saveBlockContent = async (blockKey: string) => {
    const block = contentBlocks.find(b => b.block_key === blockKey);
    if (!block) {
      toast({
        title: "Erreur",
        description: `Bloc ${blockKey} non trouvé`,
        variant: "destructive"
      });
      return;
    }

    try {
      setSavingBlocks(prev => new Set(prev).add(blockKey));
      
      if (block.id && typeof block.id === 'number' && block.id > 10) {
        // Bloc existant - mise à jour
        console.log(`Mise à jour du bloc ${blockKey} (ID: ${block.id})`);
        const response = await fetchWithAuth(API_URLS.CMS_CONTENT_BLOCKS_UPDATE_CONTENT(block.id), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: block.content }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Erreur lors de la sauvegarde du bloc ${blockKey}:`, errorText);
          throw new Error(`Erreur lors de la sauvegarde: ${errorText}`);
        }
      } else {
        // Nouveau bloc - création
        if (!homePageId) {
          throw new Error('Page Home ID non trouvé');
        }
        
        console.log(`Création d'un nouveau bloc ${blockKey}`);
        const response = await fetchWithAuth(API_URLS.CMS_CONTENT_BLOCKS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page_id: homePageId,
            block_key: block.block_key,
            content: block.content,
            content_type: block.content_type,
            title: block.block_key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            order: block.order,
            is_visible: block.is_visible,
            is_editable: true
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Erreur lors de la création du bloc ${blockKey}:`, errorText);
          throw new Error(`Erreur lors de la création: ${errorText}`);
        }
      }

      // Mettre à jour le contenu original pour ce bloc
      setOriginalContent(prev => ({
        ...prev,
        [blockKey]: block.content
      }));

      // Retirer ce bloc de la liste des modifications
      setModifiedBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockKey);
        return newSet;
      });

      // Trouver le nom de la zone pour le message
      const zoneName = getZoneNameFromBlockKey(blockKey);
      toast({
        title: "Succès",
        description: `${zoneName} sauvegardé avec succès`,
      });

      // Recharger le contenu pour avoir les IDs à jour
      loadHomeContent();
      
      // Invalider le cache de la page d'accueil
      if ((window as any).invalidateHomepageCache) {
        (window as any).invalidateHomepageCache();
      }
      
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du bloc ${blockKey}:`, error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : `Impossible de sauvegarder ${blockKey}`,
        variant: "destructive"
      });
    } finally {
      setSavingBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockKey);
        return newSet;
      });
    }
  };

  // Fonction pour obtenir le nom de la zone à partir du block_key
  const getZoneNameFromBlockKey = (blockKey: string): string => {
    const block = contentSections.flatMap(section => section.blocks).find(b => b.key === blockKey);
    return block?.label || blockKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const contentSections = [
    {
      title: "Section Hero",
      description: "Titre principal et zone d'accroche de la page d'accueil",
      blocks: [
        { key: 'hero_main_title', label: 'Titre principal', defaultValue: 'Mange. Dors. Trade. Répète.' },
        { key: 'hero_subtitle', label: 'Sous-titre', defaultValue: 'La routine qui peut transformer votre vie.' },
        { key: 'hero_description', label: 'Description', defaultValue: 'Formez-vous. Copiez nos signaux. Confiez-nous votre compte.' },
        { key: 'hero_cta1', label: 'Bouton 1', defaultValue: 'Rejoindre notre communauté' },
        { key: 'hero_cta2', label: 'Bouton 2', defaultValue: 'Voir nos services' }
      ]
    },
    {
      title: "Section Solutions",
      description: "Présentation des 3 solutions principales",
      blocks: [
        { key: 'solutions_title', label: 'Titre de la section', defaultValue: 'Nos 3 solutions — Choisissez ce qui vous correspond' },
        { key: 'solution_formation_title', label: 'Titre Formation', defaultValue: 'Formation Trading — Devenez autonome' },
        { key: 'solution_formation_description', label: 'Description Formation', defaultValue: 'Vous voulez comprendre les marchés et trader par vous-même ?' },
        { key: 'solution_signaux_title', label: 'Titre Signaux', defaultValue: 'Signaux Premium — Copiez nos trades' },
        { key: 'solution_signaux_description', label: 'Description Signaux', defaultValue: 'Vous préférez copier nos trades sans effort ?' },
        { key: 'solution_gestion_title', label: 'Titre Gestion', defaultValue: 'Gestion de Comptes — Confiez-nous tout' },
        { key: 'solution_gestion_description', label: 'Description Gestion', defaultValue: 'Vous voulez des résultats sans vous en occuper ?' }
      ]
    },
    {
      title: "Section Comment ça marche",
      description: "Processus en 3 étapes",
      blocks: [
        { key: 'process_title', label: 'Titre de la section', defaultValue: 'Comment ça marche ?' },
        { key: 'process_step1_title', label: 'Étape 1 - Titre', defaultValue: 'Choisissez votre solution' },
        { key: 'process_step1_description', label: 'Étape 1 - Description', defaultValue: 'Formation, signaux ou gestion de compte' },
        { key: 'process_step2_title', label: 'Étape 2 - Titre', defaultValue: 'Suivez nos conseils' },
        { key: 'process_step2_description', label: 'Étape 2 - Description', defaultValue: 'Apprenez ou copiez nos stratégies' },
        { key: 'process_step3_title', label: 'Étape 3 - Titre', defaultValue: 'Gagnez régulièrement' },
        { key: 'process_step3_description', label: 'Étape 3 - Description', defaultValue: 'Voyez vos profits augmenter' }
      ]
    },
    {
      title: "Section Bénéfices",
      description: "Avantages et bénéfices pour les utilisateurs",
      blocks: [
        { key: 'benefits_title', label: 'Titre de la section', defaultValue: 'Les bénéfices pour vous' },
        { key: 'benefits_subtitle', label: 'Sous-titre', defaultValue: 'Pourquoi nous choisir ?' },
        { key: 'benefit_1_title', label: 'Bénéfice 1 - Titre', defaultValue: 'Gains réguliers' },
        { key: 'benefit_1_description', label: 'Bénéfice 1 - Description', defaultValue: 'Des profits constants et prévisibles' },
        { key: 'benefit_2_title', label: 'Bénéfice 2 - Titre', defaultValue: 'Formation complète' },
        { key: 'benefit_2_description', label: 'Bénéfice 2 - Description', defaultValue: 'Apprenez les techniques des pros' },
        { key: 'benefit_3_title', label: 'Bénéfice 3 - Titre', defaultValue: 'Support 24/7' },
        { key: 'benefit_3_description', label: 'Bénéfice 3 - Description', defaultValue: 'Une équipe à votre service' },
        { key: 'benefit_4_title', label: 'Bénéfice 4 - Titre', defaultValue: 'Communauté active' },
        { key: 'benefit_4_description', label: 'Bénéfice 4 - Description', defaultValue: 'Échangez avec d\'autres traders' }
      ]
    },
    {
      title: "Section Témoignages",
      description: "Avis et preuves sociales",
      blocks: [
        { key: 'testimonials_title', label: 'Titre de la section', defaultValue: 'Ce que disent nos clients' },
        { key: 'testimonial_1_name', label: 'Témoignage 1 - Nom', defaultValue: 'Marie L.' },
        { key: 'testimonial_1_text', label: 'Témoignage 1 - Texte', defaultValue: 'Grâce à leurs signaux, j\'ai enfin des gains réguliers.' },
        { key: 'testimonial_2_name', label: 'Témoignage 2 - Nom', defaultValue: 'Jean-Pierre M.' },
        { key: 'testimonial_2_text', label: 'Témoignage 2 - Texte', defaultValue: 'La formation m\'a permis de devenir autonome.' },
        { key: 'testimonial_3_name', label: 'Témoignage 3 - Nom', defaultValue: 'Sophie D.' },
        { key: 'testimonial_3_text', label: 'Témoignage 3 - Texte', defaultValue: 'Ils gèrent mon compte et je dors tranquille.' }
      ]
    },
    {
      title: "Section CTA Final",
      description: "Appel à l'action de fin de page",
      blocks: [
        { key: 'final_cta_title', label: 'Titre CTA', defaultValue: 'Prêt à transformer votre façon de trader ?' },
        { key: 'final_cta1', label: 'Bouton CTA 1', defaultValue: 'Commencer maintenant' },
        { key: 'final_cta2', label: 'Bouton CTA 2', defaultValue: 'Découvrir nos offres' }
      ]
    },
    {
      title: "Section Avertissement",
      description: "Disclaimer et mentions légales",
      blocks: [
        { key: 'disclaimer_title', label: 'Titre Avertissement', defaultValue: 'Avertissement' },
        { key: 'disclaimer_text', label: 'Texte Avertissement', defaultValue: 'Le trading comporte des risques. Les performances passées ne préjugent pas des résultats futurs.' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header avec navigation */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <SidebarTrigger className="lg:hidden" />
            <div className="h-6 w-px bg-border hidden lg:block" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Page d'Accueil
            </h1>
          </div>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-muted-foreground text-sm sm:text-base">
                Gérez le contenu de la page d'accueil - Sauvegardez chaque section individuellement
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">

        {/* Content Sections */}
        <div className="space-y-8">
          {contentSections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">{section.title}</CardTitle>
                    <p className="text-muted-foreground text-sm sm:text-base">{section.description}</p>
                  </div>
                  <Button 
                    onClick={() => {
                      // Sauvegarder tous les blocs modifiés de cette section
                      section.blocks.forEach(block => {
                        if (modifiedBlocks.has(block.key)) {
                          saveBlockContent(block.key);
                        }
                      });
                    }}
                    disabled={savingBlocks.size > 0}
                    size="sm"
                    className={`min-w-[100px] text-xs sm:text-sm ${
                      section.blocks.some(block => modifiedBlocks.has(block.key))
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-gray-400 hover:bg-gray-500 text-white'
                    }`}
                  >
                    {savingBlocks.size > 0 ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.blocks.map((block, blockIndex) => (
                    <div key={blockIndex} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          {block.label}
                        </label>
                        {modifiedBlocks.has(block.key) && (
                          <Button
                            onClick={() => saveBlockContent(block.key)}
                            disabled={savingBlocks.has(block.key)}
                            size="sm"
                            className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                          >
                            {savingBlocks.has(block.key) ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                <span className="text-xs">...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-3 w-3 mr-1" />
                                <span className="text-xs">✓</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      {block.key.includes('description') || block.key.includes('text') || block.key.includes('content') ? (
                        <Textarea
                          value={getBlockContent(block.key, block.defaultValue)}
                          onChange={(e) => updateBlockContent(block.key, e.target.value)}
                          placeholder={block.defaultValue}
                          className="min-h-[100px]"
                        />
                      ) : (
                        <Input
                          value={getBlockContent(block.key, block.defaultValue)}
                          onChange={(e) => updateBlockContent(block.key, e.target.value)}
                          placeholder={block.defaultValue}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
