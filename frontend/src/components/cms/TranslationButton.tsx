import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { cn } from '@/lib/utils';

interface TranslationButtonProps {
  sectionId: number;
  fieldName: string;
  sourceContent: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

export function TranslationButton({
  sectionId,
  fieldName,
  sourceContent,
  className = "",
  size = "sm",
  variant = "outline"
}: TranslationButtonProps) {
  const { generateTranslations, isLoading } = useTranslation();
  const { isEditMode, isPasswordVerified } = useEditMode();
  const [isGenerating, setIsGenerating] = useState(false);

  const canTranslate = isEditMode && isPasswordVerified && sourceContent.trim();

  const handleGenerateTranslations = async () => {
    if (!canTranslate) return;

    setIsGenerating(true);
    try {
      const success = await generateTranslations(sectionId, fieldName, sourceContent);
      if (success) {
        // Optionnel: recharger les traductions de la section
      }
    } catch (error) {
      console.error('Erreur lors de la génération des traductions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isEditMode) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        onClick={handleGenerateTranslations}
        disabled={!canTranslate || isGenerating || isLoading}
        size={size}
        variant={variant}
        className={cn(
          "transition-all duration-200",
          canTranslate && "hover:bg-primary hover:text-primary-foreground",
          !canTranslate && "opacity-50 cursor-not-allowed"
        )}
      >
        {isGenerating || isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Génération...
          </>
        ) : (
          <>
            <Languages className="h-4 w-4 mr-2" />
            Générer traduction
          </>
        )}
      </Button>

      {/* Indicateurs de statut */}
      {!isPasswordVerified && (
        <Badge variant="secondary" className="text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          Mot de passe requis
        </Badge>
      )}

      {!sourceContent.trim() && (
        <Badge variant="secondary" className="text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          Contenu vide
        </Badge>
      )}

      {canTranslate && (
        <Badge variant="default" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Prêt
        </Badge>
      )}
    </div>
  );
}
