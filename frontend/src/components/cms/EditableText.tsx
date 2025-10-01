import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEditMode } from "@/contexts/EditModeContext";
import { TranslationButton } from "./TranslationButton";
import { TranslationManager } from "./TranslationManager";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  sectionId: number;
  fieldName: string;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  rows?: number;
}

export function EditableText({
  value,
  sectionId,
  fieldName,
  multiline = false,
  placeholder = "",
  className = "",
  onChange,
  maxLength,
  rows = 3
}: EditableTextProps) {
  const { isEditMode, isPasswordVerified, addChange, refreshTrigger } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [originalValue, setOriginalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const canEdit = isEditMode && isPasswordVerified;

  // Mettre à jour la valeur quand elle change
  useEffect(() => {
    setEditValue(value);
    setOriginalValue(value);
  }, [value]);

  // Rafraîchir les données après sauvegarde
  useEffect(() => {
    if (refreshTrigger > 0) {
      // Mettre à jour les valeurs avec les nouvelles données
      setOriginalValue(value);
      setEditValue(value);
    }
  }, [refreshTrigger, value, sectionId, fieldName]);

  // Focus sur l'input quand on entre en mode édition
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Placer le curseur à la fin du texte au lieu de tout sélectionner
      inputRef.current.setSelectionRange(editValue.length, editValue.length);
    }
  }, [isEditing, editValue]);

  const handleDoubleClick = () => {
    if (canEdit) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Délai pour permettre aux événements de clic de se déclencher
    setTimeout(() => {
      handleSave();
    }, 100);
  };

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input;
    
    return (
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={multiline ? rows : undefined}
        className={cn(
          "border-primary bg-primary/5 focus:ring-primary",
          className
        )}
      />
    );
  }

  // Déterminer si c'est un élément de bloc basé sur les classes
  const isBlockElement = className?.includes('block') || className?.includes('text-') && className?.includes('font-');
  const Element = isBlockElement ? 'div' : 'span';
  
  return (
    <Element
      className={cn(
        "relative group",
        canEdit && "cursor-pointer hover:bg-primary/10 rounded px-1 py-0.5 transition-colors",
        className
      )}
      onDoubleClick={handleDoubleClick}
      title={canEdit ? "Double-cliquez pour modifier" : undefined}
    >
      {value || placeholder}
      
      {/* Indicateur d'édition */}
      {canEdit && (
        <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-2 w-2 bg-primary rounded-full" />
        </span>
      )}
      
      {/* Boutons de traduction */}
      {canEdit && (
        <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <TranslationButton
            sectionId={sectionId}
            fieldName={fieldName}
            sourceContent={value}
            size="sm"
            variant="ghost"
          />
          <TranslationManager
            sectionId={sectionId}
            fieldName={fieldName}
            sourceContent={value}
          />
        </div>
      )}
    </Element>
  );
}
