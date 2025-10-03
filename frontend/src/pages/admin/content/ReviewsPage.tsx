import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';
import { 
  Save, Loader2, Plus, Trash2, Edit, CheckCircle, XCircle, 
  Star, Eye, EyeOff, Filter, Search, Info 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Review {
  id: number;
  author_name: string;
  author_email: string;
  author_phone: string;
  service_name: string;
  service_type: string;
  title: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  status_display: string;
  is_featured: boolean;
  is_public: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: number;
  approved_by_name?: string;
}

interface ReviewForm {
  author_name: string;
  author_email: string;
  author_phone: string;
  service_name: string;
  service_type: string;
  title: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  is_featured: boolean;
  is_public: boolean;
  order: number;
}

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();

  const [newReview, setNewReview] = useState<ReviewForm>({
    author_name: '',
    author_email: '',
    author_phone: '',
    service_name: '',
    service_type: '',
    title: '',
    content: '',
    rating: 5,
    status: 'pending',
    is_featured: false,
    is_public: false,
    order: 0
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(API_URLS.REVIEWS);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les avis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReview = async () => {
    if (!newReview.author_name.trim() || !newReview.author_email.trim() || 
        !newReview.service_name || !newReview.title.trim() || !newReview.content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetchWithAuth(API_URLS.REVIEWS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de la création: ${errorText}`);
      }

      toast({
        title: "Succès",
        description: "Avis créé avec succès",
      });

      setNewReview({
        author_name: '',
        author_email: '',
        author_phone: '',
        service_name: '',
        service_type: '',
        title: '',
        content: '',
        rating: 5,
        status: 'pending',
        is_featured: false,
        is_public: false,
        order: 0
      });
      setIsCreateDialogOpen(false);
      loadReviews();
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer l'avis",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateReview = async (review: Review) => {
    try {
      setSaving(true);
      const response = await fetchWithAuth(`${API_URLS.REVIEWS}${review.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author_name: review.author_name,
          author_email: review.author_email,
          author_phone: review.author_phone,
          service_name: review.service_name,
          service_type: review.service_type,
          title: review.title,
          content: review.content,
          rating: review.rating,
          status: review.status,
          is_featured: review.is_featured,
          is_public: review.is_public,
          order: review.order
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de la mise à jour: ${errorText}`);
      }

      toast({
        title: "Succès",
        description: "Avis mis à jour avec succès",
      });

      setEditingReview(null);
      setIsEditDialogOpen(false);
      loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour l'avis",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_URLS.REVIEWS}${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de la suppression: ${errorText}`);
      }

      toast({
        title: "Succès",
        description: "Avis supprimé avec succès",
      });

      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer l'avis",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (review: Review, newStatus: 'approved' | 'rejected' | 'archived') => {
    try {
      const response = await fetchWithAuth(`${API_URLS.REVIEWS}${review.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du changement de statut');
      }

      toast({
        title: "Succès",
        description: `Avis ${newStatus === 'approved' ? 'approuvé' : newStatus === 'rejected' ? 'rejeté' : 'archivé'}`,
      });

      loadReviews();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut",
        variant: "destructive"
      });
    }
  };

  const toggleFeature = async (review: Review) => {
    try {
      const response = await fetchWithAuth(`${API_URLS.REVIEWS}${review.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_featured: !review.is_featured }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du changement de mise en avant');
      }

      toast({
        title: "Succès",
        description: `Avis ${!review.is_featured ? 'mis en avant' : 'retiré de la mise en avant'}`,
      });

      loadReviews();
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer la mise en avant",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: '⏳' },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: '✅' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: '❌' },
      archived: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: '📦' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${config.color}`}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              Page Avis
            </h1>
          </div>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-muted-foreground text-sm sm:text-base">
                Gérez les avis clients et leur publication
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
        {/* Header avec recherche et bouton d'ajout */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un avis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Ajouter un avis</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvel avis</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nom de l'auteur</Label>
                    <Input
                      value={newReview.author_name}
                      onChange={(e) => setNewReview(prev => ({ ...prev, author_name: e.target.value }))}
                      placeholder="Nom complet"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={newReview.author_email}
                      onChange={(e) => setNewReview(prev => ({ ...prev, author_email: e.target.value }))}
                      placeholder="email@example.com"
                      type="email"
                    />
                  </div>
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={newReview.author_phone}
                    onChange={(e) => setNewReview(prev => ({ ...prev, author_phone: e.target.value }))}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nom du service</Label>
                    <Input
                      value={newReview.service_name}
                      onChange={(e) => setNewReview(prev => ({ ...prev, service_name: e.target.value }))}
                      placeholder="Nom du service"
                    />
                  </div>
                  <div>
                    <Label>Type de service</Label>
                    <Input
                      value={newReview.service_type}
                      onChange={(e) => setNewReview(prev => ({ ...prev, service_type: e.target.value }))}
                      placeholder="Formation, Signal, etc."
                    />
                  </div>
                </div>
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={newReview.title}
                    onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre de l'avis"
                  />
                </div>
                <div>
                  <Label>Contenu</Label>
                  <Textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contenu de l'avis"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Note (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={newReview.rating}
                      onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Select value={newReview.status} onValueChange={(value: any) => setNewReview(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvé</SelectItem>
                        <SelectItem value="rejected">Rejeté</SelectItem>
                        <SelectItem value="archived">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ordre</Label>
                    <Input
                      type="number"
                      value={newReview.order}
                      onChange={(e) => setNewReview(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    />
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
                    onClick={createReview}
                    disabled={saving || !newReview.author_name.trim() || !newReview.author_email.trim() || !newReview.title.trim() || !newReview.content.trim()}
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

        <div className="grid gap-4">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground text-sm sm:text-base">Aucun avis trouvé</p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg line-clamp-2">{review.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Par {review.author_name} • {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingReview(review);
                          setIsEditDialogOpen(true);
                        }}
                        className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                      >
                        <Info className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Détails</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteReview(review.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm h-8 px-2 sm:px-3"
                      >
                        <Trash2 className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Details Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de l'avis</DialogTitle>
            </DialogHeader>
            {editingReview && (
              <div className="space-y-6">
                {/* Titre et badges */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-2">{editingReview.title}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                      {editingReview.service_type}
                    </span>
                    {getStatusBadge(editingReview.status)}
                    {editingReview.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                        ⭐ En vedette
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {renderStars(editingReview.rating)}
                    </span>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Auteur</Label>
                      <p className="text-sm">{editingReview.author_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-sm">{editingReview.author_email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Téléphone</Label>
                      <p className="text-sm">{editingReview.author_phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                      <p className="text-sm">{editingReview.service_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Date de création</Label>
                      <p className="text-sm">{new Date(editingReview.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Dernière modification</Label>
                      <p className="text-sm">{new Date(editingReview.updated_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                </div>

                {/* Contenu de l'avis */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contenu de l'avis</Label>
                  <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{editingReview.content}</p>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="border-t pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(editingReview, editingReview.status === 'approved' ? 'archived' : 'approved')}
                      className={editingReview.status === 'approved' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {editingReview.status === 'approved' ? <EyeOff className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      {editingReview.status === 'approved' ? 'Archiver' : 'Approuver'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeature(editingReview)}
                      className={editingReview.is_featured ? 'text-orange-600 hover:text-orange-700' : 'text-blue-600 hover:text-blue-700'}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      {editingReview.is_featured ? 'Retirer des vedettes' : 'Mettre en vedette'}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Fermer
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

export default ReviewsPage;
