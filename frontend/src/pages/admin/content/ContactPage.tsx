import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';
import { Save, Loader2, Plus, Trash2, Edit, MoveUp, MoveDown, GripVertical, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ContactFormDynamic from '@/components/ContactFormDynamic';

interface ContactField {
  id: number;
  field_type: string;
  field_name: string;
  field_label: string;
  field_placeholder: string;
  is_required: boolean;
  order: number;
  is_visible: boolean;
  options?: string[];
  created_at: string;
  updated_at: string;
}

const ContactPage: React.FC = () => {
  const [contactFields, setContactFields] = useState<ContactField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<ContactField | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();

  const [newField, setNewField] = useState({
    field_type: 'text',
    field_name: '',
    field_label: '',
    field_placeholder: '',
    is_required: false,
    is_visible: true,
    options: [] as string[]
  });

  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = async () => {
    try {
      setLoading(true);
      // Utiliser l'endpoint public pour éviter les problèmes d'authentification
      const response = await fetch(API_URLS.CONTACT_FIELDS_ADMIN_PUBLIC);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Contact fields loaded:', data);
      setContactFields(data);
      setPreviewKey(prev => prev + 1);
    } catch (error) {
      console.error('Error loading contact fields:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les champs de contact",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createContactField = async () => {
    if (!newField.field_name.trim() || !newField.field_label.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetchWithAuth(API_URLS.CONTACT_FIELDS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newField,
          order: contactFields.length + 1
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de la création: ${errorText}`);
      }

      toast({
        title: "Succès",
        description: "Champ de contact créé avec succès",
      });

      setNewField({
        field_type: 'text',
        field_name: '',
        field_label: '',
        field_placeholder: '',
        is_required: false,
        is_visible: true,
        options: []
      });
      setIsCreateDialogOpen(false);
      loadContactData();
      invalidateServerCache();
    } catch (error) {
      console.error('Error creating contact field:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le champ de contact",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateContactField = async (field: ContactField) => {
    if (!field.field_name.trim() || !field.field_label.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetchWithAuth(`${API_URLS.CONTACT_FIELDS}${field.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(field),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de la mise à jour: ${errorText}`);
      }

      toast({
        title: "Succès",
        description: "Champ de contact mis à jour avec succès",
      });

      setEditingField(null);
      setIsEditDialogOpen(false);
      loadContactData();
      invalidateServerCache();
    } catch (error) {
      console.error('Error updating contact field:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le champ de contact",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteContactField = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce champ ?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_URLS.CONTACT_FIELDS}${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de la suppression: ${errorText}`);
      }

      toast({
        title: "Succès",
        description: "Champ de contact supprimé avec succès",
      });

      loadContactData();
      invalidateServerCache();
    } catch (error) {
      console.error('Error deleting contact field:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer le champ de contact",
        variant: "destructive"
      });
    }
  };

  const toggleFieldVisibility = async (field: ContactField) => {
    try {
      const response = await fetchWithAuth(`${API_URLS.CONTACT_FIELDS}${field.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_visible: !field.is_visible }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du changement de visibilité');
      }

      toast({
        title: "Succès",
        description: `Champ ${!field.is_visible ? 'affiché' : 'masqué'}`,
      });

      loadContactData();
      invalidateServerCache();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer la visibilité",
        variant: "destructive"
      });
    }
  };

  const moveField = async (field: ContactField, direction: 'up' | 'down') => {
    const currentIndex = contactFields.findIndex(f => f.id === field.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= contactFields.length) {
      return;
    }

    const updatedFields = [...contactFields];
    [updatedFields[currentIndex], updatedFields[targetIndex]] = [updatedFields[targetIndex], updatedFields[currentIndex]];
    
    // Mettre à jour les ordres
    updatedFields.forEach((f, index) => {
      f.order = index + 1;
    });

    setContactFields(updatedFields);

    // Sauvegarder les nouveaux ordres
    try {
      for (const f of updatedFields) {
        await fetchWithAuth(`${API_URLS.CONTACT_FIELDS}${f.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order: f.order }),
        });
      }
      
      toast({
        title: "Succès",
        description: "Ordre des champs mis à jour",
      });
      
      invalidateServerCache();
    } catch (error) {
      console.error('Error updating field order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'ordre des champs",
        variant: "destructive"
      });
      loadContactData(); // Recharger en cas d'erreur
    }
  };

  const invalidateServerCache = async () => {
    try {
      await fetchWithAuth(API_URLS.CLEAR_CONTACT_CACHE, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const fieldTypeOptions = [
    { value: 'text', label: 'Texte' },
    { value: 'email', label: 'Email' },
    { value: 'textarea', label: 'Zone de texte' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'checkbox', label: 'Case à cocher' },
    { value: 'radio', label: 'Boutons radio' },
    { value: 'number', label: 'Nombre' },
    { value: 'phone', label: 'Téléphone' },
    { value: 'url', label: 'URL' },
    { value: 'date', label: 'Date' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header avec navigation */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <SidebarTrigger className="lg:hidden" />
            <div className="h-6 w-px bg-border hidden lg:block" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Page Contact
            </h1>
          </div>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-muted-foreground text-sm sm:text-base">
                Gérez les champs de contact et les informations générales
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="border-primary/20 hover:bg-primary/5 hover:border-primary/40"
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Masquer l\'aperçu' : 'Afficher l\'aperçu'}
          </Button>
        </div>

        {/* Aperçu du formulaire */}
        {showPreview && (
          <Card className="mb-8 bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Aperçu du formulaire de contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContactFormDynamic key={previewKey} />
            </CardContent>
          </Card>
        )}

        {/* Bouton d'ajout */}
        <div className="mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un champ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouveau champ de contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Type de champ</Label>
                    <Select value={newField.field_type} onValueChange={(value) => setNewField(prev => ({ ...prev, field_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nom du champ (technique)</Label>
                    <Input
                      value={newField.field_name}
                      onChange={(e) => setNewField(prev => ({ ...prev, field_name: e.target.value }))}
                      placeholder="ex: nom, email, message"
                      className="opacity-60"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Nom technique utilisé dans le code (ne peut pas être modifié après création)
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Libellé du champ</Label>
                  <Input
                    value={newField.field_label}
                    onChange={(e) => setNewField(prev => ({ ...prev, field_label: e.target.value }))}
                    placeholder="ex: Votre nom, Votre email"
                  />
                </div>
                <div>
                  <Label>Texte d'aide (placeholder)</Label>
                  <Input
                    value={newField.field_placeholder}
                    onChange={(e) => setNewField(prev => ({ ...prev, field_placeholder: e.target.value }))}
                    placeholder="ex: Entrez votre nom complet"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_required"
                      checked={newField.is_required}
                      onCheckedChange={(checked) => setNewField(prev => ({ ...prev, is_required: !!checked }))}
                    />
                    <Label htmlFor="is_required">Champ obligatoire</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_visible"
                      checked={newField.is_visible}
                      onCheckedChange={(checked) => setNewField(prev => ({ ...prev, is_visible: !!checked }))}
                    />
                    <Label htmlFor="is_visible">Visible</Label>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={createContactField}
                    disabled={saving || !newField.field_name.trim() || !newField.field_label.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                  >
                    {saving ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" /> : <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />}
                    Créer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Liste des champs */}
        <div className="space-y-4">
          {contactFields.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground text-sm sm:text-base">Aucun champ de contact configuré</p>
              </CardContent>
            </Card>
          ) : (
            contactFields
              .sort((a, b) => a.order - b.order)
              .map((field) => (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{field.field_label}</h3>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                            {fieldTypeOptions.find(opt => opt.value === field.field_type)?.label}
                          </span>
                          {field.is_required && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                              Obligatoire
                            </span>
                          )}
                          {!field.is_visible && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                              Masqué
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          Ordre: {field.order} • {field.field_placeholder}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveField(field, 'up')}
                          disabled={field.order === 1}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveField(field, 'down')}
                          disabled={field.order === contactFields.length}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFieldVisibility(field)}
                          className={field.is_visible ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {field.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingField(field);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteContactField(field.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        {/* Dialog d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le champ</DialogTitle>
            </DialogHeader>
            {editingField && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Type de champ</Label>
                    <Select value={editingField.field_type} onValueChange={(value) => setEditingField(prev => prev ? { ...prev, field_type: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nom du champ (technique)</Label>
                    <Input
                      value={editingField.field_name}
                      disabled
                      className="opacity-60"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Le nom technique ne peut pas être modifié
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Libellé du champ</Label>
                  <Input
                    value={editingField.field_label}
                    onChange={(e) => setEditingField(prev => prev ? { ...prev, field_label: e.target.value } : null)}
                    placeholder="ex: Votre nom, Votre email"
                  />
                </div>
                <div>
                  <Label>Texte d'aide (placeholder)</Label>
                  <Input
                    value={editingField.field_placeholder}
                    onChange={(e) => setEditingField(prev => prev ? { ...prev, field_placeholder: e.target.value } : null)}
                    placeholder="ex: Entrez votre nom complet"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_is_required"
                      checked={editingField.is_required}
                      onCheckedChange={(checked) => setEditingField(prev => prev ? { ...prev, is_required: !!checked } : null)}
                    />
                    <Label htmlFor="edit_is_required">Champ obligatoire</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_is_visible"
                      checked={editingField.is_visible}
                      onCheckedChange={(checked) => setEditingField(prev => prev ? { ...prev, is_visible: !!checked } : null)}
                    />
                    <Label htmlFor="edit_is_visible">Visible</Label>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => editingField && updateContactField(editingField)}
                    disabled={saving || !editingField?.field_name.trim() || !editingField?.field_label.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                  >
                    {saving ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" /> : <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />}
                    Sauvegarder
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;