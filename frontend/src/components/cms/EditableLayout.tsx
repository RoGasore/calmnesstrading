import React from 'react';
import { EditModeToggle } from './EditModeToggle';
import { EditToolbar } from './EditToolbar';

interface EditableLayoutProps {
  children: React.ReactNode;
  pageSlug: string;
  className?: string;
}

export function EditableLayout({ children, pageSlug, className = "" }: EditableLayoutProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Bouton d'activation du mode édition */}
      <div className="fixed top-4 left-4 z-40">
        <EditModeToggle pageSlug={pageSlug} />
      </div>

      {/* Barre d'outils d'édition */}
      <EditToolbar />

      {/* Contenu principal */}
      {children}
    </div>
  );
}
