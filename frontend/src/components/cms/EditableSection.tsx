import React from 'react';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditableSectionProps {
  sectionId: number;
  title: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  className?: string;
}

export function EditableSection({
  sectionId,
  title,
  content,
  imageUrl,
  imageAlt = "Image de section",
  className = ""
}: EditableSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <EditableText
            value={title}
            sectionId={sectionId}
            fieldName="title"
            placeholder="Titre de la section"
            className="text-2xl font-bold"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl && (
          <EditableImage
            src={imageUrl}
            alt={imageAlt}
            sectionId={sectionId}
            fieldName="imageUrl"
            className="w-full h-48 object-cover rounded-lg"
            width="100%"
            height="200px"
          />
        )}
        
        <div className="prose max-w-none">
          <EditableText
            value={content}
            sectionId={sectionId}
            fieldName="content"
            multiline
            rows={4}
            placeholder="Contenu de la section..."
            className="text-muted-foreground leading-relaxed"
          />
        </div>
      </CardContent>
    </Card>
  );
}
