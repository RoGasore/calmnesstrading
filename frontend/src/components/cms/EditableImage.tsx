import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditMode } from "@/contexts/EditModeContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableImageProps {
  src: string;
  alt: string;
  sectionId: number;
  fieldName: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onChange?: (newSrc: string) => void;
}

export function EditableImage({
  src,
  alt,
  sectionId,
  fieldName,
  className = "",
  width,
  height,
  objectFit = 'cover',
  onChange
}: EditableImageProps) {
  const { isEditMode, isPasswordVerified, addChange, refreshTrigger } = useEditMode();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(src);
  const [originalValue, setOriginalValue] = useState(src);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = isEditMode && isPasswordVerified;

  // Mettre à jour la valeur quand elle change
  useEffect(() => {
    setEditValue(src);
    setOriginalValue(src);
  }, [src]);

  // Rafraîchir les données après sauvegarde
  useEffect(() => {
    if (refreshTrigger > 0) {
      // Mettre à jour les valeurs avec les nouvelles données
      setOriginalValue(src);
      setEditValue(src);
    }
  }, [refreshTrigger, src, sectionId, fieldName]);

  const handleImageClick = () => {
    if (canEdit && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editValue !== originalValue) {
      addChange({
        sectionId,
        fieldName,
        oldValue: originalValue,
        newValue: editValue,
        changeType: 'update'
      });
      
      setOriginalValue(editValue);
      onChange?.(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(originalValue);
    setIsEditing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Type de fichier invalide",
        description: "Veuillez sélectionner une image",
        variant: "destructive"
      });
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Ici, vous devriez uploader le fichier vers votre serveur
      // Pour l'instant, on utilise une URL temporaire
      const formData = new FormData();
      formData.append('image', file);
      
      // Simuler l'upload (remplacer par votre logique d'upload)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditValue(result);
        setIsUploading(false);
        toast({
          title: "Image uploadée",
          description: "L'image a été uploadée avec succès"
        });
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader l'image",
        variant: "destructive"
      });
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  if (isEditing) {
    return (
      <div className="relative group">
        {/* Aperçu de l'image */}
        <div className="mb-4">
          {editValue ? (
            <img
              src={editValue}
              alt={alt}
              className={cn("rounded-lg border-2 border-dashed border-primary", className)}
              style={{ width, height, objectFit }}
              onError={() => {
                toast({
                  title: "Image invalide",
                  description: "L'URL de l'image n'est pas valide",
                  variant: "destructive"
                });
              }}
            />
          ) : (
            <div 
              className={cn(
                "flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50",
                className
              )}
              style={{ width, height }}
            >
              <div className="text-center text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Aucune image</p>
              </div>
            </div>
          )}
        </div>

        {/* Contrôles d'édition */}
        <div className="space-y-3">
          {/* Upload de fichier */}
          <div>
            <Label htmlFor="image-upload">Uploader une image</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? "Upload..." : "Choisir un fichier"}
              </Button>
            </div>
          </div>

          {/* URL de l'image */}
          <div>
            <Label htmlFor="image-url">Ou saisir une URL</Label>
            <Input
              id="image-url"
              type="url"
              value={editValue}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Valider
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <img
        src={editValue}
        alt={alt}
        className={cn(
          "transition-all duration-200",
          canEdit && "cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-primary hover:ring-opacity-50 rounded-lg",
          className
        )}
        style={{ width, height, objectFit }}
        onClick={handleImageClick}
        title={canEdit ? "Cliquez pour modifier l'image" : undefined}
      />
      
      {/* Indicateur d'édition */}
      {canEdit && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <Upload className="h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  );
}
