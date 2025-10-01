import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, UserX, UserCheck } from "lucide-react";

interface ConfirmActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  actionType: 'activate' | 'deactivate' | 'delete';
  userName?: string;
  isProcessing?: boolean;
}

export function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionType,
  userName,
  isProcessing = false
}: ConfirmActionDialogProps) {
  const getActionIcon = () => {
    switch (actionType) {
      case 'activate':
        return <UserCheck className="h-4 w-4" />;
      case 'deactivate':
        return <UserX className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getActionButtonVariant = () => {
    switch (actionType) {
      case 'activate':
        return 'default';
      case 'deactivate':
        return 'outline';
      case 'delete':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getActionButtonClass = () => {
    switch (actionType) {
      case 'activate':
        return 'bg-green-600 hover:bg-green-700';
      case 'deactivate':
        return 'border-orange-300 text-orange-700 hover:bg-orange-50';
      case 'delete':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return '';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {getActionIcon()}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{description}</p>
            {userName && (
              <p className="font-medium text-foreground">
                Utilisateur concerné : <span className="text-primary">{userName}</span>
              </p>
            )}
            {actionType === 'delete' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Cette action est irréversible !
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Toutes les données de l'utilisateur seront définitivement supprimées.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isProcessing}
            className={`${getActionButtonClass()} ${getActionButtonVariant() === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Traitement...
              </>
            ) : (
              <>
                {getActionIcon()}
                <span className="ml-2">
                  {actionType === 'activate' && 'Activer'}
                  {actionType === 'deactivate' && 'Désactiver'}
                  {actionType === 'delete' && 'Supprimer'}
                </span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
