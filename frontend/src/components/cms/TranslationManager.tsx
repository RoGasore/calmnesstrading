import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Languages, 
  Loader2, 
  Save, 
  RefreshCw, 
  Edit3, 
  CheckCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { cn } from '@/lib/utils';

interface TranslationManagerProps {
  sectionId: number;
  fieldName: string;
  sourceContent: string;
  className?: string;
}

interface Translation {
  id: number;
  language: string;
  language_display: string;
  translated_content: string;
  is_auto_generated: boolean;
  is_manual_override: boolean;
  updated_at: string;
}

export function TranslationManager({
  sectionId,
  fieldName,
  sourceContent,
  className = ""
}: TranslationManagerProps) {
  const { 
    translations, 
    isLoading, 
    generateTranslations, 
    getSectionTranslations, 
    updateTranslation, 
    regenerateTranslation 
  } = useTranslation();
  
  const { isEditMode, isPasswordVerified } = useEditMode();
  const [isOpen, setIsOpen] = useState(false);
  const [sectionTranslations, setSectionTranslations] = useState<Translation[]>([]);
  const [editingTranslations, setEditingTranslations] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canManage = isEditMode && isPasswordVerified;

  // Charger les traductions de la section quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && sectionId) {
      loadSectionTranslations();
    }
  }, [isOpen, sectionId]);

  const loadSectionTranslations = async () => {
    try {
      const translations = await getSectionTranslations(sectionId);
      setSectionTranslations(translations);
      
      // Initialiser les valeurs d'édition
      const editingValues: { [key: string]: string } = {};
      translations.forEach(t => {
        editingValues[t.language] = t.translated_content;
      });
      setEditingTranslations(editingValues);
    } catch (error) {
      console.error('Erreur lors du chargement des traductions:', error);
    }
  };

  const handleGenerateTranslations = async () => {
    if (!canManage) return;

    setIsGenerating(true);
    try {
      const success = await generateTranslations(sectionId, fieldName, sourceContent);
      if (success) {
        await loadSectionTranslations();
      }
    } catch (error) {
      console.error('Erreur lors de la génération des traductions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslationChange = (language: string, value: string) => {
    setEditingTranslations(prev => ({
      ...prev,
      [language]: value
    }));
  };

  const handleSaveTranslation = async (language: string) => {
    const translation = sectionTranslations.find(t => t.language === language);
    if (!translation) return;

    setIsSaving(true);
    try {
      const success = await updateTranslation(translation.id, editingTranslations[language]);
      if (success) {
        await loadSectionTranslations();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la traduction:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateTranslation = async (translationId: number) => {
    try {
      const success = await regenerateTranslation(translationId);
      if (success) {
        await loadSectionTranslations();
      }
    } catch (error) {
      console.error('Erreur lors de la régénération de la traduction:', error);
    }
  };

  const getLanguageFlag = (language: string) => {
    const flags: { [key: string]: string } = {
      'fr': '🇫🇷',
      'en': '🇺🇸',
      'es': '🇪🇸'
    };
    return flags[language] || '🌐';
  };

  if (!isEditMode) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "transition-all duration-200",
            canManage && "hover:bg-primary hover:text-primary-foreground",
            !canManage && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={!canManage}
        >
          <Languages className="h-4 w-4 mr-2" />
          Traductions
          {sectionTranslations.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {sectionTranslations.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Gestion des Traductions
          </DialogTitle>
          <DialogDescription>
            Gérez les traductions pour cette section. Les traductions sont générées automatiquement avec DeepL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contenu source */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Contenu Source (Français)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{sourceContent}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleGenerateTranslations}
              disabled={!canManage || isGenerating || isLoading}
              className="flex items-center gap-2"
            >
              {isGenerating || isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4" />
                  Générer toutes les traductions
                </>
              )}
            </Button>

            {!canManage && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Mot de passe admin requis
              </Badge>
            )}
          </div>

          {/* Traductions existantes */}
          {sectionTranslations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Traductions existantes</h3>
              
              {sectionTranslations.map((translation) => (
                <Card key={translation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getLanguageFlag(translation.language)}
                        {translation.language_display}
                        {translation.is_manual_override && (
                          <Badge variant="secondary" className="text-xs">
                            <Edit3 className="h-3 w-3 mr-1" />
                            Modifié manuellement
                          </Badge>
                        )}
                        {translation.is_auto_generated && !translation.is_manual_override && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Auto-généré
                          </Badge>
                        )}
                      </CardTitle>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateTranslation(translation.id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Régénérer
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <Textarea
                        value={editingTranslations[translation.language] || translation.translated_content}
                        onChange={(e) => handleTranslationChange(translation.language, e.target.value)}
                        placeholder="Contenu traduit..."
                        className="min-h-[100px]"
                      />
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleSaveTranslation(translation.language)}
                          disabled={isSaving}
                          size="sm"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sauvegarde...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Sauvegarder
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Message si aucune traduction */}
          {sectionTranslations.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Languages className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Aucune traduction</h3>
                <p className="text-muted-foreground mb-4">
                  Cliquez sur "Générer toutes les traductions" pour créer les traductions automatiquement.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
