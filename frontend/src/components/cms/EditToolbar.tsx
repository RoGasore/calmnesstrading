import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Eye, 
  X, 
  AlertTriangle, 
  CheckCircle,
  Edit3,
  History
} from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditToolbarProps {
  className?: string;
}

export function EditToolbar({ className = "" }: EditToolbarProps) {
  const { 
    isEditMode, 
    hasUnsavedChanges, 
    pendingChanges, 
    saveChanges, 
    previewChanges, 
    endEditMode,
    clearChanges
  } = useEditMode();
  
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  if (!isEditMode) return null;

  const handleSave = async () => {
    if (pendingChanges.length === 0) {
      toast({
        title: "Aucun changement",
        description: "Il n'y a aucun changement à sauvegarder"
      });
      return;
    }

    setIsSaving(true);
    try {
      const success = await saveChanges();
      if (success) {
        toast({
          title: "Sauvegardé",
          description: `${pendingChanges.length} changement(s) sauvegardé(s) avec succès`
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const preview = await previewChanges();
      if (preview) {
        // Ici, vous pourriez ouvrir un modal de prévisualisation
        toast({
          title: "Prévisualisation",
          description: "Prévisualisation générée avec succès"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleEndEdit = async () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter le mode édition ?"
      );
      if (!confirmed) return;
    }

    await endEditMode();
  };

  const handleClearChanges = () => {
    if (pendingChanges.length === 0) return;
    
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir annuler tous les changements en cours ?"
    );
    if (confirmed) {
      clearChanges();
      toast({
        title: "Changements annulés",
        description: "Tous les changements en cours ont été annulés"
      });
    }
  };

  return (
    <TooltipProvider>
      <div className={`fixed top-4 right-4 z-[60] bg-background border rounded-lg shadow-lg p-3 ${className}`}>
        <div className="flex items-center gap-3">
          {/* Indicateur de mode édition */}
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Mode édition</span>
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Non sauvegardé
              </Badge>
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Compteur de changements */}
          {pendingChanges.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pendingChanges.length} changement{pendingChanges.length > 1 ? 's' : ''}
            </Badge>
          )}

          <Separator orientation="vertical" className="h-6" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Annuler les changements */}
            {pendingChanges.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChanges}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Annuler les changements</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Prévisualiser */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreview}
                  disabled={isPreviewing || pendingChanges.length === 0}
                  className="h-8 w-8 p-0"
                >
                  {isPreviewing ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Prévisualiser les changements</p>
              </TooltipContent>
            </Tooltip>

            {/* Sauvegarder */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || pendingChanges.length === 0}
                  className="h-8 px-3"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sauvegarder tous les changements</p>
              </TooltipContent>
            </Tooltip>

            {/* Quitter le mode édition */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEndEdit}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quitter le mode édition</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Message d'avertissement pour les changements non sauvegardés */}
        {hasUnsavedChanges && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Vous avez des modifications non sauvegardées</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
