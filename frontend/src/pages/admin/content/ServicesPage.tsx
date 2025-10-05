import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URLS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

interface ContentBlock {
  id: number;
  block_key: string;
  content: string;
  content_type: string;
  order: number;
  is_visible: boolean;
}

const ServicesPage: React.FC = () => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [servicesPageId, setServicesPageId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingBlocks, setSavingBlocks] = useState<Set<string>>(new Set());
  const [modifiedBlocks, setModifiedBlocks] = useState<Set<string>>(new Set());
  const [originalContent, setOriginalContent] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();

  // Fonction pour obtenir le nom de la zone à partir du block_key
  const getZoneNameFromBlockKey = (blockKey: string): string => {
    const block = contentSections.flatMap(section => section.blocks).find(b => b.key === blockKey);
    return block?.label || blockKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  useEffect(() => {
    loadServicesContent();
    loadServicesPageId();
  }, []);

  const loadServicesContent = async () => {
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
      
      // S'assurer que blocks est un tableau
      if (Array.isArray(blocks)) {
        console.log(`Chargé ${blocks.length} blocs de contenu`);
        // Afficher quelques exemples d'IDs pour debug
        const sampleIds = blocks.slice(0, 5).map(b => ({ id: b.id, key: b.block_key }));
        console.log('Exemples d\'IDs de blocs:', sampleIds);
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
      setContentBlocks([]); // Initialiser avec un tableau vide en cas d'erreur
      toast({
        title: "Erreur",
        description: "Impossible de charger le contenu des services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadServicesPageId = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_PAGES);
      if (response.ok) {
        const pages = await response.json();
        const servicesPage = pages.find((page: any) => page.slug === 'services');
        setServicesPageId(servicesPage?.id || null);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID de la page services:', error);
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
          id: 0, // ID temporaire pour nouveau bloc
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
          id: 0, // ID temporaire pour nouveau bloc // ID temporaire
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
      
      if (block.id && typeof block.id === 'number' && block.id > 0) {
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
        if (!servicesPageId) {
          throw new Error('Page Services ID non trouvé');
        }
        
        console.log(`Création d'un nouveau bloc ${blockKey}`);
        const response = await fetchWithAuth(API_URLS.CMS_CONTENT_BLOCKS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: servicesPageId,
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
      loadServicesContent();
      
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

  const saveContent = async () => {
    try {
      setSaving(true);
      let hasErrors = false;

      if (!Array.isArray(contentBlocks)) {
        toast({
          title: "Erreur",
          description: "Aucun contenu à sauvegarder",
          variant: "destructive"
        });
        return;
      }

      for (const block of contentBlocks) {
        if (block.id && typeof block.id === 'number' && block.id > 0) { // Bloc existant (IDs réels de la DB)
          console.log(`Mise à jour du bloc existant ${block.block_key} (ID: ${block.id})`);
          const response = await fetchWithAuth(API_URLS.CMS_CONTENT_BLOCKS_UPDATE_CONTENT(block.id), {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: block.content }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erreur lors de la sauvegarde du bloc ${block.block_key}:`, errorText);
            hasErrors = true;
          } else {
            console.log(`Bloc ${block.block_key} mis à jour avec succès`);
          }
        } else {
          // Créer un nouveau bloc
          console.log(`Création d'un nouveau bloc ${block.block_key} (ID temporaire: ${block.id})`);
          const response = await fetchWithAuth(API_URLS.CMS_CONTENT_BLOCKS, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              page: servicesPageId, // ID de la page
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
            console.error(`Erreur lors de la création du bloc ${block.block_key}:`, errorText);
            hasErrors = true;
          } else {
            console.log(`Bloc ${block.block_key} créé avec succès`);
          }
        }
      }

      if (hasErrors) {
        toast({
          title: "Erreur",
          description: "Certains contenus n'ont pas pu être sauvegardés",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Succès",
          description: "Contenu sauvegardé avec succès",
        });
        setHasUnsavedChanges(false);
        loadServicesContent(); // Recharger pour avoir les vrais IDs
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le contenu",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const contentSections = [
    {
      title: "Section Hero",
      description: "Titre principal et description de la page services",
      blocks: [
        { key: 'hero_title', label: 'Titre principal', defaultValue: 'Nos Services de Trading' },
        { key: 'hero_subtitle', label: 'Sous-titre', defaultValue: 'Des solutions complètes pour votre réussite en trading' },
        { key: 'hero_description', label: 'Description', defaultValue: 'Vous souhaitez enfin comprendre le marché et prendre des décisions éclairées sans stress ? Nous sommes là pour vous guider.' },
        { key: 'hero_stat_1', label: 'Statistique 1', defaultValue: '2000+ Traders formés' },
        { key: 'hero_stat_2', label: 'Statistique 2', defaultValue: '87% Taux de réussite' },
        { key: 'hero_stat_3', label: 'Statistique 3', defaultValue: '+25% ROI moyen' }
      ]
    },
    {
      title: "Grille des Services",
      description: "Titre de la section et contenu des services",
      blocks: [
        { key: 'services_grid_title', label: 'Titre de la grille', defaultValue: 'Nos Solutions' },
        { key: 'features_title', label: 'Titre des fonctionnalités', defaultValue: 'Ce que vous obtenez' },
        { key: 'learn_more_button', label: 'Texte du bouton', defaultValue: 'En savoir plus' }
      ]
    },
    {
      title: "Service Général",
      description: "Contenu du service général",
      blocks: [
        { key: 'services_title', label: 'Titre', defaultValue: 'Nos Services' },
        { key: 'services_description', label: 'Description', defaultValue: 'Découvrez notre gamme complète de services de trading professionnels' },
        { key: 'services_price', label: 'Prix', defaultValue: 'Complet' },
        { key: 'services_badge', label: 'Badge', defaultValue: 'Complet' },
        { key: 'services_stat_1', label: 'Stat 1', defaultValue: '3+' },
        { key: 'services_stat_2', label: 'Stat 2', defaultValue: '2000+' },
        { key: 'services_stat_3', label: 'Stat 3', defaultValue: '4.9/5' },
        { key: 'services_feature_1', label: 'Fonctionnalité 1', defaultValue: 'Signaux en temps réel' },
        { key: 'services_feature_2', label: 'Fonctionnalité 2', defaultValue: 'Formations structurées' },
        { key: 'services_feature_3', label: 'Fonctionnalité 3', defaultValue: 'Gestion de comptes' },
        { key: 'services_feature_4', label: 'Fonctionnalité 4', defaultValue: 'Analyses intégrées' }
      ]
    },
    {
      title: "Service Formations",
      description: "Contenu du service formations",
      blocks: [
        { key: 'formations_title', label: 'Titre', defaultValue: 'Formations Trading' },
        { key: 'formations_description', label: 'Description', defaultValue: 'Devenez autonome avec nos formations structurées' },
        { key: 'formations_price', label: 'Prix', defaultValue: '150$ - 1500$' },
        { key: 'formations_badge', label: 'Badge', defaultValue: 'Populaire' },
        { key: 'formations_stat_1', label: 'Stat 1', defaultValue: '+2000' },
        { key: 'formations_stat_2', label: 'Stat 2', defaultValue: '4.8/5' },
        { key: 'formations_stat_3', label: 'Stat 3', defaultValue: '12+' },
        { key: 'formations_feature_1', label: 'Fonctionnalité 1', defaultValue: 'Analyse technique' },
        { key: 'formations_feature_2', label: 'Fonctionnalité 2', defaultValue: 'Gestion du risque' },
        { key: 'formations_feature_3', label: 'Fonctionnalité 3', defaultValue: 'Psychologie du trading' },
        { key: 'formations_feature_4', label: 'Fonctionnalité 4', defaultValue: 'Stratégies rentables' }
      ]
    },
    {
      title: "Service Signaux",
      description: "Contenu du service signaux",
      blocks: [
        { key: 'signaux_title', label: 'Titre', defaultValue: 'Signaux Premium' },
        { key: 'signaux_description', label: 'Description', defaultValue: 'Copiez nos signaux et gagnez sans effort' },
        { key: 'signaux_price', label: 'Prix', defaultValue: '87% Réussite' },
        { key: 'signaux_badge', label: 'Badge', defaultValue: 'Recommandé' },
        { key: 'signaux_stat_1', label: 'Stat 1', defaultValue: '87%' },
        { key: 'signaux_stat_2', label: 'Stat 2', defaultValue: '5-8/jour' },
        { key: 'signaux_stat_3', label: 'Stat 3', defaultValue: '+65 pips' },
        { key: 'signaux_feature_1', label: 'Fonctionnalité 1', defaultValue: 'Signaux quotidiens' },
        { key: 'signaux_feature_2', label: 'Fonctionnalité 2', defaultValue: 'Points d\'entrée/sortie' },
        { key: 'signaux_feature_3', label: 'Fonctionnalité 3', defaultValue: 'Ratio risque/récompense' },
        { key: 'signaux_feature_4', label: 'Fonctionnalité 4', defaultValue: 'Performance suivie' }
      ]
    },
    {
      title: "Service Gestion",
      description: "Contenu du service gestion de comptes",
      blocks: [
        { key: 'gestion_title', label: 'Titre', defaultValue: 'Gestion de Comptes' },
        { key: 'gestion_description', label: 'Description', defaultValue: 'Confiez votre trading à nos experts' },
        { key: 'gestion_price', label: 'Prix', defaultValue: 'Sur mesure' },
        { key: 'gestion_badge', label: 'Badge', defaultValue: 'Premium' },
        { key: 'gestion_stat_1', label: 'Stat 1', defaultValue: '+25%' },
        { key: 'gestion_stat_2', label: 'Stat 2', defaultValue: 'Sécurisé' },
        { key: 'gestion_stat_3', label: 'Stat 3', defaultValue: '10+ ans' },
        { key: 'gestion_feature_1', label: 'Fonctionnalité 1', defaultValue: 'Stratégies éprouvées' },
        { key: 'gestion_feature_2', label: 'Fonctionnalité 2', defaultValue: 'Gestion des risques' },
        { key: 'gestion_feature_3', label: 'Fonctionnalité 3', defaultValue: 'Performance suivie' },
        { key: 'gestion_feature_4', label: 'Fonctionnalité 4', defaultValue: 'Équipe d\'experts' }
      ]
    },
    {
      title: "Section Pourquoi Nous Choisir",
      description: "Contenu de la section avantages",
      blocks: [
        { key: 'why_choose_title', label: 'Titre de la section', defaultValue: 'Pourquoi nous choisir ?' },
        { key: 'why_choose_1_title', label: 'Avantage 1 - Titre', defaultValue: 'Expertise éprouvée' },
        { key: 'why_choose_1_description', label: 'Avantage 1 - Description', defaultValue: 'Plus de 10 ans d\'expérience' },
        { key: 'why_choose_2_title', label: 'Avantage 2 - Titre', defaultValue: 'Communauté active' },
        { key: 'why_choose_2_description', label: 'Avantage 2 - Description', defaultValue: 'Plus de 2000 traders' },
        { key: 'why_choose_3_title', label: 'Avantage 3 - Titre', defaultValue: 'Résultats prouvés' },
        { key: 'why_choose_3_description', label: 'Avantage 3 - Description', defaultValue: '87% de réussite' }
      ]
    },
    {
      title: "Section CTA Final",
      description: "Contenu de l'appel à l'action final",
      blocks: [
        { key: 'cta_title', label: 'Titre CTA', defaultValue: 'Prêt à commencer ?' },
        { key: 'cta_subtitle', label: 'Sous-titre CTA', defaultValue: 'Choisissez votre solution et commencez dès aujourd\'hui' },
        { key: 'cta_formations_button', label: 'Bouton Formations', defaultValue: 'Commencer les formations' },
        { key: 'cta_signaux_button', label: 'Bouton Signaux', defaultValue: 'Voir les signaux' }
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
              Page Services
            </h1>
          </div>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-muted-foreground text-sm sm:text-base">
                Gérez le contenu de la page services - Sauvegardez chaque section individuellement
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
                      {block.key.includes('description') || block.key.includes('content') ? (
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

export default ServicesPage;