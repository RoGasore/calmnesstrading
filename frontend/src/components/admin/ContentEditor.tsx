import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  History, 
  Move, 
  Copy,
  Settings,
  Image,
  Video,
  FileText,
  Layout,
  MessageSquare,
  HelpCircle,
  Package,
  Star,
  DollarSign,
  Clock,
  User
} from 'lucide-react';

interface ContentBlock {
  id: number;
  page: number;
  page_name: string;
  block_key: string;
  content_type: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  css_classes: string;
  order: number;
  is_visible: boolean;
  is_editable: boolean;
  updated_at: string;
}

interface ContentVersion {
  id: number;
  version_number: number;
  title: string;
  content: string;
  metadata: Record<string, any>;
  change_summary: string;
  created_at: string;
  created_by_username: string;
}

interface Page {
  id: number;
  name: string;
  slug: string;
  title: string;
  description: string;
  is_active: boolean;
  is_public: boolean;
}

interface ContentEditorProps {
  page?: Page;
  onClose?: () => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ page, onClose }) => {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  
  // États
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  
  // États pour les formulaires
  const [editForm, setEditForm] = useState({
    block_key: '',
    content_type: 'text',
    title: '',
    content: '',
    metadata: {} as Record<string, any>,
    css_classes: '',
    order: 0,
    is_visible: true,
    is_editable: true
  });

  const contentTypes = [
    { value: 'text', label: 'Texte', icon: FileText },
    { value: 'heading', label: 'Titre', icon: FileText },
    { value: 'paragraph', label: 'Paragraphe', icon: FileText },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'video', label: 'Vidéo', icon: Video },
    { value: 'button', label: 'Bouton', icon: Layout },
    { value: 'card', label: 'Carte', icon: Layout },
    { value: 'list', label: 'Liste', icon: FileText },
    { value: 'quote', label: 'Citation', icon: MessageSquare },
    { value: 'hero', label: 'Section Hero', icon: Layout },
    { value: 'features', label: 'Fonctionnalités', icon: Layout },
    { value: 'testimonial', label: 'Témoignage', icon: MessageSquare },
    { value: 'stats', label: 'Statistiques', icon: Package },
    { value: 'pricing', label: 'Tarifs', icon: DollarSign },
    { value: 'faq', label: 'FAQ', icon: HelpCircle },
    { value: 'contact_form', label: 'Formulaire de contact', icon: Layout },
    { value: 'social_links', label: 'Liens sociaux', icon: Layout },
    { value: 'custom_html', label: 'HTML personnalisé', icon: FileText }
  ];

  // Charger les blocs de contenu
  useEffect(() => {
    if (page) {
      loadContentBlocks();
    }
  }, [page]);

  const loadContentBlocks = async () => {
    if (!page) return;
    
    setLoading(true);
    try {
      const response = await fetchWithAuth(`/api/content/comprehensive-cms/content-blocks/?page_id=${page.id}`);
      if (response.ok) {
        const data = await response.json();
        setContentBlocks(data.results || data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des blocs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les blocs de contenu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async (blockId: number) => {
    try {
      const response = await fetchWithAuth(`/api/content/comprehensive-cms/content-blocks/${blockId}/versions/`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.results || data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des versions:', error);
    }
  };

  const startEditSession = async () => {
    if (!page) return;
    
    try {
      const response = await fetchWithAuth('/api/content/comprehensive-cms/edit-sessions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: page.id })
      });
      
      if (response.ok) {
        setIsEditing(true);
        toast({
          title: "Session d'édition",
          description: "Session d'édition démarrée"
        });
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de la session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session d'édition",
        variant: "destructive"
      });
    }
  };

  const endEditSession = async () => {
    try {
      // Trouver la session active
      const response = await fetchWithAuth('/api/content/comprehensive-cms/edit-sessions/');
      if (response.ok) {
        const data = await response.json();
        const activeSession = data.results?.find((session: any) => session.is_active) || data.find((session: any) => session.is_active);
        
        if (activeSession) {
          await fetchWithAuth(`/api/content/comprehensive-cms/edit-sessions/${activeSession.id}/end/`, {
            method: 'POST'
          });
        }
      }
      
      setIsEditing(false);
      setPreviewMode(false);
      toast({
        title: "Session d'édition",
        description: "Session d'édition terminée"
      });
    } catch (error) {
      console.error('Erreur lors de la fin de session:', error);
    }
  };

  const createContentBlock = async () => {
    if (!page) return;
    
    try {
      const response = await fetchWithAuth('/api/content/comprehensive-cms/content-blocks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          page: page.id
        })
      });
      
      if (response.ok) {
        toast({
          title: "Succès",
          description: "Bloc de contenu créé"
        });
        loadContentBlocks();
        resetForm();
        setIsCreating(false);
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur lors de la création du bloc:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le bloc de contenu",
        variant: "destructive"
      });
    }
  };

  const updateContentBlock = async () => {
    if (!selectedBlock) return;
    
    try {
      const response = await fetchWithAuth(`/api/content/comprehensive-cms/content-blocks/${selectedBlock.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        toast({
          title: "Succès",
          description: "Bloc de contenu mis à jour"
        });
        loadContentBlocks();
        setSelectedBlock(null);
        resetForm();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bloc:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le bloc de contenu",
        variant: "destructive"
      });
    }
  };

  const deleteContentBlock = async (blockId: number) => {
    try {
      const response = await fetchWithAuth(`/api/content/comprehensive-cms/content-blocks/${blockId}/`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Succès",
          description: "Bloc de contenu supprimé"
        });
        loadContentBlocks();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du bloc:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le bloc de contenu",
        variant: "destructive"
      });
    }
  };

  const restoreVersion = async (versionId: number) => {
    try {
      const response = await fetchWithAuth(`/api/content/comprehensive-cms/content-versions/${versionId}/restore/`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Succès",
          description: "Version restaurée"
        });
        loadContentBlocks();
        setShowVersions(false);
      } else {
        throw new Error('Erreur lors de la restauration');
      }
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de restaurer la version",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setEditForm({
      block_key: '',
      content_type: 'text',
      title: '',
      content: '',
      metadata: {},
      css_classes: '',
      order: 0,
      is_visible: true,
      is_editable: true
    });
  };

  const openEditForm = (block: ContentBlock) => {
    setSelectedBlock(block);
    setEditForm({
      block_key: block.block_key,
      content_type: block.content_type,
      title: block.title,
      content: block.content,
      metadata: block.metadata,
      css_classes: block.css_classes,
      order: block.order,
      is_visible: block.is_visible,
      is_editable: block.is_editable
    });
  };

  const openCreateForm = () => {
    resetForm();
    setEditForm(prev => ({
      ...prev,
      order: contentBlocks.length
    }));
    setIsCreating(true);
  };

  const getContentTypeIcon = (type: string) => {
    const contentType = contentTypes.find(ct => ct.value === type);
    return contentType?.icon || FileText;
  };

  const getContentTypeLabel = (type: string) => {
    const contentType = contentTypes.find(ct => ct.value === type);
    return contentType?.label || type;
  };

  if (!page) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Aucune page sélectionnée</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{page.title}</h2>
          <p className="text-muted-foreground">{page.description}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button onClick={startEditSession}>
              <Edit className="h-4 w-4 mr-2" />
              Commencer l'édition
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={endEditSession}>
                <X className="h-4 w-4 mr-2" />
                Terminer l'édition
              </Button>
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Masquer l\'aperçu' : 'Aperçu'}
              </Button>
            </>
          )}
          
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Liste des blocs de contenu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panneau de gauche - Liste des blocs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Blocs de contenu</h3>
            {isEditing && (
              <Button size="sm" onClick={openCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {contentBlocks.map((block) => {
                const Icon = getContentTypeIcon(block.content_type);
                return (
                  <Card 
                    key={block.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedBlock?.id === block.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedBlock(block)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{block.block_key}</p>
                            <p className="text-xs text-muted-foreground">
                              {getContentTypeLabel(block.content_type)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {!block.is_visible && (
                            <Badge variant="outline" className="text-xs">
                              Masqué
                            </Badge>
                          )}
                          
                          {isEditing && (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditForm(block);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadVersions(block.id);
                                  setShowVersions(true);
                                }}
                              >
                                <History className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteContentBlock(block.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Panneau central - Contenu du bloc sélectionné */}
        <div className="lg:col-span-2">
          {selectedBlock ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {React.createElement(getContentTypeIcon(selectedBlock.content_type), {
                        className: "h-5 w-5"
                      })}
                      <span>{selectedBlock.block_key}</span>
                    </CardTitle>
                    <CardDescription>
                      {getContentTypeLabel(selectedBlock.content_type)} • Ordre: {selectedBlock.order}
                    </CardDescription>
                  </div>
                  
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(selectedBlock)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {selectedBlock.title && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Titre</h4>
                    <p className="text-sm">{selectedBlock.title}</p>
                  </div>
                )}
                
                {selectedBlock.content && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Contenu</h4>
                    <div className="text-sm whitespace-pre-wrap">
                      {selectedBlock.content}
                    </div>
                  </div>
                )}
                
                {selectedBlock.metadata && Object.keys(selectedBlock.metadata).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Métadonnées</h4>
                    <pre className="text-xs bg-muted p-2 rounded">
                      {JSON.stringify(selectedBlock.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedBlock.css_classes && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Classes CSS</h4>
                    <p className="text-sm">{selectedBlock.css_classes}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Modifié le {new Date(selectedBlock.updated_at).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-4">
                    <span>Visible: {selectedBlock.is_visible ? 'Oui' : 'Non'}</span>
                    <span>Éditable: {selectedBlock.is_editable ? 'Oui' : 'Non'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Sélectionnez un bloc de contenu</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modale d'édition/création */}
      <Dialog open={isCreating || !!selectedBlock} onOpenChange={() => {
        setIsCreating(false);
        setSelectedBlock(null);
        resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Nouveau bloc de contenu' : 'Modifier le bloc de contenu'}
            </DialogTitle>
            <DialogDescription>
              {isCreating 
                ? 'Créez un nouveau bloc de contenu pour cette page'
                : 'Modifiez les propriétés de ce bloc de contenu'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block_key">Clé du bloc</Label>
                <Input
                  id="block_key"
                  value={editForm.block_key}
                  onChange={(e) => setEditForm({...editForm, block_key: e.target.value})}
                  placeholder="ex: hero_title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content_type">Type de contenu</Label>
                <Select
                  value={editForm.content_type}
                  onValueChange={(value) => setEditForm({...editForm, content_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                placeholder="Titre du bloc"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                value={editForm.content}
                onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                placeholder="Contenu du bloc"
                rows={6}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Ordre</Label>
                <Input
                  id="order"
                  type="number"
                  value={editForm.order}
                  onChange={(e) => setEditForm({...editForm, order: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="css_classes">Classes CSS</Label>
                <Input
                  id="css_classes"
                  value={editForm.css_classes}
                  onChange={(e) => setEditForm({...editForm, css_classes: e.target.value})}
                  placeholder="ex: text-center bg-primary"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_visible"
                  checked={editForm.is_visible}
                  onChange={(e) => setEditForm({...editForm, is_visible: e.target.checked})}
                />
                <Label htmlFor="is_visible">Visible</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_editable"
                  checked={editForm.is_editable}
                  onChange={(e) => setEditForm({...editForm, is_editable: e.target.checked})}
                />
                <Label htmlFor="is_editable">Éditable</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setSelectedBlock(null);
              resetForm();
            }}>
              Annuler
            </Button>
            <Button onClick={isCreating ? createContentBlock : updateContentBlock}>
              <Save className="h-4 w-4 mr-2" />
              {isCreating ? 'Créer' : 'Sauvegarder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale des versions */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historique des versions</DialogTitle>
            <DialogDescription>
              Restaurez une version précédente de ce bloc de contenu
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {versions.map((version) => (
                <Card key={version.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">Version {version.version_number}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(version.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {version.change_summary && (
                          <p className="text-sm mb-2">{version.change_summary}</p>
                        )}
                        
                        {version.title && (
                          <p className="text-sm font-medium mb-1">{version.title}</p>
                        )}
                        
                        {version.content && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {version.content}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          Par {version.created_by_username}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreVersion(version.id)}
                      >
                        <History className="h-4 w-4 mr-2" />
                        Restaurer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentEditor;
