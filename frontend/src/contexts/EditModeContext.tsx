import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EditModeContextType {
  isEditMode: boolean;
  isPasswordVerified: boolean;
  hasUnsavedChanges: boolean;
  currentPage: string | null;
  pendingChanges: ContentChange[];
  refreshTrigger: number;
  startEditMode: (pageSlug: string) => Promise<boolean>;
  endEditMode: () => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
  addChange: (change: Omit<ContentChange, 'id'>) => void;
  removeChange: (changeId: string) => void;
  saveChanges: () => Promise<boolean>;
  previewChanges: () => Promise<any>;
  clearChanges: () => void;
}

interface ContentChange {
  id: string;
  sectionId: number;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changeType: 'update' | 'create' | 'delete';
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://calmnesstrading.onrender.com';

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, fetchWithAuth } = useAuth();
  const { toast } = useToast();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<ContentChange[]>([]);
  const [editSessionId, setEditSessionId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Vérifier si l'utilisateur est admin
  const canEdit = isAdmin() && user;

  // Démarrer le mode édition
  const startEditMode = useCallback(async (pageSlug: string): Promise<boolean> => {
    if (!canEdit) {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent modifier le contenu",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Créer une session d'édition
      const response = await fetchWithAuth(`${API_BASE}/api/content/cms/edit-sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageSlug })
      });

      if (response.ok) {
        const sessionData = await response.json();
        setEditSessionId(sessionData.id);
        setCurrentPage(pageSlug);
        setIsEditMode(true);
        setHasUnsavedChanges(false);
        setPendingChanges([]);
        
        toast({
          title: "Mode édition activé",
          description: "Vous pouvez maintenant modifier le contenu de cette page"
        });
        return true;
      } else {
        throw new Error('Impossible de démarrer la session d\'édition');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'activer le mode édition",
        variant: "destructive"
      });
      return false;
    }
  }, [canEdit, fetchWithAuth, toast]);

  // Terminer le mode édition
  const endEditMode = useCallback(async (): Promise<void> => {
    if (!editSessionId) return;

    try {
      // Terminer la session d'édition
      await fetchWithAuth(`${API_BASE}/api/content/cms/edit-sessions/${editSessionId}/end/`, {
        method: 'POST'
      });

      // Réinitialiser l'état
      setIsEditMode(false);
      setIsPasswordVerified(false);
      setHasUnsavedChanges(false);
      setCurrentPage(null);
      setPendingChanges([]);
      setEditSessionId(null);

      toast({
        title: "Mode édition désactivé",
        description: "Les modifications non sauvegardées ont été perdues"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de terminer la session d'édition",
        variant: "destructive"
      });
    }
  }, [editSessionId, fetchWithAuth, toast]);

  // Vérifier le mot de passe admin
  const verifyPassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/content/cms/verify-admin-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setIsPasswordVerified(true);
        toast({
          title: "Mot de passe correct",
          description: "Vous pouvez maintenant modifier le contenu"
        });
        return true;
      } else {
        toast({
          title: "Mot de passe incorrect",
          description: "Veuillez réessayer",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le mot de passe",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchWithAuth, toast]);

  // Ajouter un changement
  const addChange = useCallback((change: Omit<ContentChange, 'id'>) => {
    const newChange: ContentChange = {
      ...change,
      id: `${change.sectionId}-${change.fieldName}-${Date.now()}`
    };

    setPendingChanges(prev => {
      // Remplacer le changement existant pour le même champ
      const filtered = prev.filter(c => !(c.sectionId === change.sectionId && c.fieldName === change.fieldName));
      return [...filtered, newChange];
    });

    setHasUnsavedChanges(true);
  }, []);

  // Supprimer un changement
  const removeChange = useCallback((changeId: string) => {
    setPendingChanges(prev => {
      const filtered = prev.filter(c => c.id !== changeId);
      setHasUnsavedChanges(filtered.length > 0);
      return filtered;
    });
  }, []);

  // Sauvegarder les changements
  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (!editSessionId || pendingChanges.length === 0) {
      return false;
    }

    try {
      const changesData = pendingChanges.map(change => ({
        section_id: change.sectionId,
        field_name: change.fieldName,
        new_value: change.newValue,
        change_type: change.changeType
      }));

      const response = await fetchWithAuth(`${API_BASE}/api/content/cms/bulk-update/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: changesData })
      });

      if (response.ok) {
        setPendingChanges([]);
        setHasUnsavedChanges(false);
        
        // Déclencher le rafraîchissement des composants
        setRefreshTrigger(prev => prev + 1);
        
        toast({
          title: "Changements sauvegardés",
          description: "Toutes les modifications ont été enregistrées avec succès"
        });
        return true;
      } else {
        throw new Error('Impossible de sauvegarder les changements');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les changements",
        variant: "destructive"
      });
      return false;
    }
  }, [editSessionId, pendingChanges, fetchWithAuth, toast]);

  // Prévisualiser les changements
  const previewChanges = useCallback(async (): Promise<any> => {
    if (!currentPage) return null;

    try {
      const response = await fetchWithAuth(`${API_BASE}/api/content/cms/preview/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: currentPage })
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Impossible de prévisualiser les changements');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de prévisualiser les changements",
        variant: "destructive"
      });
      return null;
    }
  }, [currentPage, fetchWithAuth, toast]);

  // Effacer les changements
  const clearChanges = useCallback(() => {
    setPendingChanges([]);
    setHasUnsavedChanges(false);
  }, []);

  // Nettoyer à la déconnexion
  useEffect(() => {
    if (!user) {
      setIsEditMode(false);
      setIsPasswordVerified(false);
      setHasUnsavedChanges(false);
      setCurrentPage(null);
      setPendingChanges([]);
      setEditSessionId(null);
    }
  }, [user]);

  // Avertir avant de quitter avec des changements non sauvegardés
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const value: EditModeContextType = {
    isEditMode,
    isPasswordVerified,
    hasUnsavedChanges,
    currentPage,
    pendingChanges,
    refreshTrigger,
    startEditMode,
    endEditMode,
    verifyPassword,
    addChange,
    removeChange,
    saveChanges,
    previewChanges,
    clearChanges
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};
