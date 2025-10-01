import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Translation {
  id: number;
  section_id: number;
  field_name: string;
  language: string;
  language_display: string;
  translated_content: string;
  is_auto_generated: boolean;
  is_manual_override: boolean;
  created_at: string;
  updated_at: string;
}

interface TranslationContextType {
  translations: Translation[];
  isLoading: boolean;
  generateTranslations: (sectionId: number, fieldName: string, sourceContent: string) => Promise<boolean>;
  getSectionTranslations: (sectionId: number) => Promise<Translation[]>;
  updateTranslation: (translationId: number, content: string) => Promise<boolean>;
  regenerateTranslation: (translationId: number) => Promise<boolean>;
  getTranslationStats: () => Promise<any>;
  clearTranslations: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();

  const generateTranslations = useCallback(async (
    sectionId: number, 
    fieldName: string, 
    sourceContent: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('https://calmnesstrading.onrender.com/api/content/cms/translations/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_id: sectionId,
          field_name: fieldName,
          source_content: sourceContent,
          source_language: 'fr',
          target_languages: ['en', 'es']
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Traductions générées",
          description: data.message,
        });
        return true;
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la génération des traductions",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la génération des traductions:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors de la génération des traductions",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, toast]);

  const getSectionTranslations = useCallback(async (sectionId: number): Promise<Translation[]> => {
    try {
      const response = await fetchWithAuth(`https://calmnesstrading.onrender.com/api/content/cms/translations/section/${sectionId}/`);
      
      if (response.ok) {
        const data = await response.json();
        setTranslations(data.translations);
        return data.translations;
      } else {
        console.error('Erreur lors de la récupération des traductions');
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des traductions:', error);
      return [];
    }
  }, [fetchWithAuth]);

  const updateTranslation = useCallback(async (translationId: number, content: string): Promise<boolean> => {
    try {
      const response = await fetchWithAuth(`https://calmnesstrading.onrender.com/api/content/cms/translations/${translationId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translated_content: content,
          is_manual_override: true
        }),
      });

      if (response.ok) {
        toast({
          title: "Traduction mise à jour",
          description: "La traduction a été modifiée avec succès",
        });
        return true;
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la mise à jour de la traduction",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la traduction:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors de la mise à jour",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchWithAuth, toast]);

  const regenerateTranslation = useCallback(async (translationId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`https://calmnesstrading.onrender.com/api/content/cms/translations/${translationId}/regenerate/`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Traduction régénérée",
          description: data.message,
        });
        return true;
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la régénération de la traduction",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la régénération de la traduction:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors de la régénération",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, toast]);

  const getTranslationStats = useCallback(async () => {
    try {
      const response = await fetchWithAuth('https://calmnesstrading.onrender.com/api/content/cms/translations/stats/');
      
      if (response.ok) {
        return await response.json();
      } else {
        console.error('Erreur lors de la récupération des statistiques');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }, [fetchWithAuth]);

  const clearTranslations = useCallback(() => {
    setTranslations([]);
  }, []);

  const value: TranslationContextType = {
    translations,
    isLoading,
    generateTranslations,
    getSectionTranslations,
    updateTranslation,
    regenerateTranslation,
    getTranslationStats,
    clearTranslations,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
