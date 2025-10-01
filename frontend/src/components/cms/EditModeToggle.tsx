import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Edit3, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { AdminPasswordDialog } from "./AdminPasswordDialog";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditModeToggleProps {
  pageSlug: string;
  className?: string;
}

export function EditModeToggle({ pageSlug, className = "" }: EditModeToggleProps) {
  const { isAdmin, isAuthenticated } = useAuth();
  const { isEditMode, isPasswordVerified, startEditMode } = useEditMode();
  const { toast } = useToast();
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Ne pas afficher le bouton si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return null;
  }

  const handleToggleEditMode = async () => {
    if (isEditMode) {
      // Le mode édition est déjà activé, on peut le désactiver via la toolbar
      return;
    }

    if (!isPasswordVerified) {
      // Demander le mot de passe admin
      setShowPasswordDialog(true);
      return;
    }

    // Démarrer le mode édition
    const success = await startEditMode(pageSlug);
    if (!success) {
      toast({
        title: "Erreur",
        description: "Impossible d'activer le mode édition",
        variant: "destructive"
      });
    }
  };

  const handlePasswordSuccess = async () => {
    // Le mot de passe a été vérifié avec succès, démarrer le mode édition
    const success = await startEditMode(pageSlug);
    if (!success) {
      toast({
        title: "Erreur",
        description: "Impossible d'activer le mode édition",
        variant: "destructive"
      });
    }
  };

  return (
    <TooltipProvider>
      <div className={className}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={handleToggleEditMode}
              className={`h-8 px-3 ${
                isEditMode 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              {isEditMode ? (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Mode édition actif
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Modifier
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isEditMode 
                ? "Mode édition activé - Utilisez la barre d'outils pour sauvegarder" 
                : "Cliquez pour activer le mode édition"
              }
            </p>
          </TooltipContent>
        </Tooltip>

        <AdminPasswordDialog
          isOpen={showPasswordDialog}
          onClose={() => setShowPasswordDialog(false)}
          onSuccess={handlePasswordSuccess}
        />
      </div>
    </TooltipProvider>
  );
}
