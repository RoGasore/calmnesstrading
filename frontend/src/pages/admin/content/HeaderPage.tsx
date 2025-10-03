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

const HeaderPage: React.FC = () => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [headerPageId, setHeaderPageId] = useState<number | null>(null);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBlocks, setSavingBlocks] = useState<Set<string>>(new Set());
  const [modifiedBlocks, setModifiedBlocks] = useState<Set<string>>(new Set());
  const [originalContent, setOriginalContent] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    loadHeaderContent();
    loadHeaderPageId();
    loadGlobalSettings();
  }, []);

  const loadHeaderContent = async () => {
    try {
      setLoading(true);
      
      // Essayer d'abord l'endpoint admin pour récupérer tous les blocs
      const adminResponse = await fetchWithAuth(`${API_URLS.CMS_PAGES}header/content-blocks/`);
      if (adminResponse.ok) {
        const blocks = await adminResponse.json();
        console.log('Header content blocks loaded from admin:', blocks);
        
        if (Array.isArray(blocks)) {
          console.log(`Chargé ${blocks.length} blocs de contenu depuis l'admin`);
          setContentBlocks(blocks);
          
          // Initialiser le contenu original pour détecter les modifications
          const original: Record<string, string> = {};
          blocks.forEach(block => {
            original[block.block_key] = block.content;
          });
          setOriginalContent(original);
          setModifiedBlocks(new Set()); // Réinitialiser les modifications
          return;
        }
      }
      
      // Fallback vers l'endpoint public
      const response = await fetch(API_URLS.PAGE_PUBLIC_CONTENT_BLOCKS('header'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Header content blocks loaded from public:', data);
      
      // Extraire les blocs de contenu de la réponse
      const blocks = data.content_blocks || data;
      
      // S'assurer que blocks est un tableau
      if (Array.isArray(blocks)) {
        console.log(`Chargé ${blocks.length} blocs de contenu depuis le public`);
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
        description: "Impossible de charger le contenu de l'en-tête",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHeaderPageId = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_PAGES);
      if (response.ok) {
        const pages = await response.json();
        console.log('Pages disponibles:', pages);
        const headerPage = pages.find((page: any) => page.slug === 'header');
        console.log('Page header trouvée:', headerPage);
        setHeaderPageId(headerPage?.id || null);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID de la page header:', error);
    }
  };

  const loadGlobalSettings = async () => {
    try {
      const response = await fetch(API_URLS.GLOBAL_SETTINGS_PUBLIC);
      if (response.ok) {
        const data = await response.json();
        setGlobalSettings(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres globaux:', error);
    }
  };

  const getBlockContent = (key: string, defaultValue: string = '') => {
    if (!Array.isArray(contentBlocks)) {
      return defaultValue;
    }
    const block = contentBlocks.find(b => b.block_key === key);
    return block ? block.content : defaultValue;
  };

  // Fonction pour récupérer les valeurs des paramètres globaux
  const getGlobalValue = (key: string, defaultValue: string = '') => {
    return globalSettings[key] || defaultValue;
  };

  const updateBlockContent = (key: string, content: string) => {
    setContentBlocks(prev => {
      const existingBlock = prev.find(b => b.block_key === key);
      if (existingBlock) {
        return prev.map(b => 
          b.block_key === key ? { ...b, content } : b
        );
      } else {
        // Créer un nouveau bloc temporaire
        return [...prev, {
          id: 0, // ID temporaire
          block_key: key,
          content,
          content_type: 'text',
          order: prev.length + 1,
          is_visible: true
        }];
      }
    });

    // Marquer comme modifié si différent du contenu original
    if (content !== originalContent[key]) {
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

    console.log('Sauvegarde du bloc:', blockKey, 'HeaderPageId:', headerPageId);

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
        if (!headerPageId) {
          throw new Error('Page Header ID non trouvé');
        }
        
        console.log(`Création d'un nouveau bloc ${blockKey} pour la page ${headerPageId}`);
        const response = await fetchWithAuth(API_URLS.CMS_CONTENT_BLOCKS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: headerPageId,
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
      loadHeaderContent();
      
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
      title: "Navigation Principale",
      description: "Menu de navigation principal du site",
      blocks: [
        { key: 'nav_logo_text', label: 'Texte du logo', defaultValue: globalSettings.site_name || 'CALMNESS TRADING' },
        { key: 'nav_home', label: 'Lien Accueil', defaultValue: 'Accueil' },
        { key: 'nav_services', label: 'Lien Services', defaultValue: 'Services' },
        { key: 'nav_faq', label: 'Lien FAQ', defaultValue: 'FAQ' },
        { key: 'nav_contact', label: 'Lien Contact', defaultValue: 'Contact' },
        { key: 'nav_reviews', label: 'Lien Avis', defaultValue: 'Avis' }
      ]
    },
    {
      title: "Boutons d'Action",
      description: "Boutons d'action principaux dans l'en-tête",
      blocks: [
        { key: 'cta_primary', label: 'Bouton principal', defaultValue: 'Commencer' },
        { key: 'cta_secondary', label: 'Bouton secondaire', defaultValue: 'En savoir plus' }
      ]
    },
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
              En-tête & Navigation
            </h1>
          </div>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-muted-foreground text-sm sm:text-base">
                Gérez le menu de navigation et l'en-tête du site - Sauvegardez chaque section individuellement
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
                      <Input
                        value={getBlockContent(block.key, getGlobalValue('site_name', block.defaultValue))}
                        onChange={(e) => updateBlockContent(block.key, e.target.value)}
                        placeholder={getGlobalValue('site_name', block.defaultValue)}
                        className="border-primary/20 focus:border-primary/40"
                      />
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

export default HeaderPage;