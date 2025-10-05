import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OfferFormDialog } from "@/components/admin/OfferFormDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  GraduationCap,
  Zap,
  Users,
  TrendingUp,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Offer {
  id: number;
  name: string;
  description: string;
  offer_type: 'formation' | 'signal' | 'account' | 'subscription';
  price: string;
  currency: string;
  duration_days: number | null;
  is_active: boolean;
  metadata: any;
}

const AdminServices = () => {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Partial<Offer> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const services = [
    {
      type: 'formation',
      title: 'Formations',
      description: 'Gérer les programmes de formation et leurs tarifs',
      icon: GraduationCap,
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-600'
    },
    {
      type: 'signal',
      title: 'Signaux de Trading',
      description: 'Gérer les abonnements aux signaux et leurs plans',
      icon: Zap,
      color: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/30',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-600'
    },
    {
      type: 'account',
      title: 'Gestion de Comptes',
      description: 'Gérer les offres de gestion de comptes clients',
      icon: Users,
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-600'
    }
  ];

  const fetchOffersByType = async (type: string) => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://calmnesstrading.onrender.com';
      const response = await fetchWithAuth(`${API_BASE}/api/payments/admin/offers/?type=${type}`);
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      setOffers(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedService) {
      fetchOffersByType(selectedService);
    }
  }, [selectedService]);

  const handleSaveOffer = async () => {
    if (!currentOffer) return;
    
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://calmnesstrading.onrender.com';
      const url = isEditing && currentOffer.id
        ? `${API_BASE}/api/payments/admin/offers/${currentOffer.id}/`
        : `${API_BASE}/api/payments/admin/offers/`;
      
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentOffer),
      });
      
      if (!response.ok) throw new Error('Erreur de sauvegarde');
      
      toast({
        title: isEditing ? "Offre modifiée" : "Offre créée",
        description: "L'offre a été sauvegardée avec succès.",
      });
      
      setEditDialogOpen(false);
      setCurrentOffer(null);
      if (selectedService) fetchOffersByType(selectedService);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async () => {
    if (!currentOffer?.id) return;
    
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://calmnesstrading.onrender.com';
      const response = await fetchWithAuth(`${API_BASE}/api/payments/admin/offers/${currentOffer.id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erreur de suppression');
      
      toast({
        title: "Offre supprimée",
        description: "L'offre a été supprimée avec succès.",
      });
      
      setDeleteDialogOpen(false);
      setCurrentOffer(null);
      if (selectedService) fetchOffersByType(selectedService);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (offer?: Offer) => {
    if (offer) {
      setCurrentOffer(offer);
      setIsEditing(true);
    } else {
      setCurrentOffer({
        name: '',
        description: '',
        offer_type: selectedService as any || 'formation',
        price: '0.00',
        currency: 'USD',
        duration_days: null,
        is_active: true,
        metadata: {},
      });
      setIsEditing(false);
    }
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (offer: Offer) => {
    setCurrentOffer(offer);
    setDeleteDialogOpen(true);
  };

  const currentServiceInfo = services.find(s => s.type === selectedService);

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Nos Services</h1>
          <p className="text-muted-foreground mt-2">
            {selectedService 
              ? "Gérez les offres de ce service" 
              : "Sélectionnez un service pour gérer ses offres"}
          </p>
        </div>

        {/* Vue principale : Sélection du service */}
        {!selectedService ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer hover:shadow-xl transition-all border-2 ${service.borderColor} bg-gradient-to-br ${service.color}`}
                  onClick={() => setSelectedService(service.type)}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${service.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <service.icon className={`w-8 h-8 ${service.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="outline" className="w-full">
                      Voir les offres
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Vue détaillée : Gestion des offres du service sélectionné */
          <div className="space-y-6">
            {/* Bouton retour + Actions */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setSelectedService(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux services
              </Button>
              <Button onClick={() => openEditDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle offre
              </Button>
            </div>

            {/* Header du service */}
            {currentServiceInfo && (
              <Card className={`border-2 ${currentServiceInfo.borderColor} bg-gradient-to-br ${currentServiceInfo.color}`}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${currentServiceInfo.iconBg} rounded-full flex items-center justify-center`}>
                      <currentServiceInfo.icon className={`w-6 h-6 ${currentServiceInfo.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{currentServiceInfo.title}</CardTitle>
                      <CardDescription>{currentServiceInfo.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Tableau des offres */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des offres ({offers.length})</CardTitle>
                <CardDescription>Cliquez sur Modifier pour éditer une offre</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">Aucune offre pour ce service</p>
                    <Button onClick={() => openEditDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer la première offre
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{offer.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {offer.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {offer.price} {offer.currency}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {offer.duration_days ? `${offer.duration_days} jours` : 'Illimité'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                              {offer.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(offer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDeleteDialog(offer)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      {/* Dialog d'édition/création */}
      <OfferFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        offer={currentOffer}
        onOfferChange={setCurrentOffer}
        onSave={handleSaveOffer}
        loading={loading}
        isEditing={isEditing}
      />

      {/* ANCIEN DIALOG - À SUPPRIMER */}
      {false && (
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl">
              {isEditing ? '✏️ Modifier l\'offre' : '➕ Nouvelle offre'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifiez les informations de l\'offre. Les changements seront visibles immédiatement sur le site.' : 'Créez une nouvelle offre qui sera affichée sur le site'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            {/* Section: Informations de base */}
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
              <h3 className="text-base font-semibold text-primary">📝 Informations de base</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'offre *</Label>
                <Input
                  id="name"
                  value={currentOffer?.name || ''}
                  onChange={(e) => setCurrentOffer({ ...currentOffer, name: e.target.value })}
                  placeholder="Ex: Formation Elite"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={currentOffer?.description || ''}
                  onChange={(e) => setCurrentOffer({ ...currentOffer, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Description détaillée de l'offre"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Prix</Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={currentOffer?.price || '0.00'}
                    onChange={(e) => setCurrentOffer({ ...currentOffer, price: e.target.value })}
                    className="flex-1"
                    placeholder="0.00"
                  />
                  <Select
                    value={currentOffer?.currency || 'USD'}
                    onValueChange={(value) => setCurrentOffer({ ...currentOffer, currency: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration_days" className="text-right">Durée (jours)</Label>
                <Input
                  id="duration_days"
                  type="number"
                  value={currentOffer?.duration_days || ''}
                  onChange={(e) => setCurrentOffer({ ...currentOffer, duration_days: e.target.value ? parseInt(e.target.value) : null })}
                  className="col-span-3"
                  placeholder="Laisser vide pour accès illimité"
                />
              </div>

              <div className="col-span-4 border-t pt-4 mt-4">
                <h4 className="font-semibold mb-4">Informations affichées (avec icônes)</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Ces informations seront affichées avec des icônes sur le site
                </p>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meta_features" className="text-right">✓ Fonctionnalités</Label>
                <Textarea
                  id="meta_features"
                  value={(currentOffer?.metadata as any)?.features || ''}
                  onChange={(e) => setCurrentOffer({ 
                    ...currentOffer, 
                    metadata: { ...(currentOffer?.metadata || {}), features: e.target.value }
                  })}
                  className="col-span-3"
                  placeholder="Une fonctionnalité par ligne&#10;Ex:&#10;Videos HD illimitees&#10;Certificat de formation&#10;Support par email&#10;Mises a jour gratuites"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meta_duration" className="text-right">⏱️ Durée du contenu</Label>
                <Input
                  id="meta_duration"
                  value={(currentOffer?.metadata as any)?.duration || ''}
                  onChange={(e) => setCurrentOffer({ 
                    ...currentOffer, 
                    metadata: { ...(currentOffer?.metadata || {}), duration: e.target.value }
                  })}
                  className="col-span-3"
                  placeholder="Ex: 4h, 12h, 2 jours"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meta_lessons" className="text-right">📚 Nombre de leçons</Label>
                <Input
                  id="meta_lessons"
                  value={(currentOffer?.metadata as any)?.lessons || ''}
                  onChange={(e) => setCurrentOffer({ 
                    ...currentOffer, 
                    metadata: { ...(currentOffer?.metadata || {}), lessons: e.target.value }
                  })}
                  className="col-span-3"
                  placeholder="Ex: 15 leçons, 40 leçons"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meta_students" className="text-right">👥 Nombre d'étudiants</Label>
                <Input
                  id="meta_students"
                  value={(currentOffer?.metadata as any)?.students || ''}
                  onChange={(e) => setCurrentOffer({ 
                    ...currentOffer, 
                    metadata: { ...(currentOffer?.metadata || {}), students: e.target.value }
                  })}
                  className="col-span-3"
                  placeholder="Ex: 1200+, 5000+"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meta_rating" className="text-right">⭐ Note</Label>
                <Input
                  id="meta_rating"
                  value={(currentOffer?.metadata as any)?.rating || ''}
                  onChange={(e) => setCurrentOffer({ 
                    ...currentOffer, 
                    metadata: { ...(currentOffer?.metadata || {}), rating: e.target.value }
                  })}
                  className="col-span-3"
                  placeholder="Ex: 4.9/5, 5.0/5"
                />
              </div>

              {/* Champs spécifiques pour les signaux */}
              {currentOffer?.offer_type === 'signal' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meta_signals_per_day" className="text-right">📊 Signaux/jour</Label>
                    <Input
                      id="meta_signals_per_day"
                      value={(currentOffer?.metadata as any)?.signals_per_day || ''}
                      onChange={(e) => setCurrentOffer({ 
                        ...currentOffer, 
                        metadata: { ...(currentOffer?.metadata || {}), signals_per_day: e.target.value }
                      })}
                      className="col-span-3"
                      placeholder="Ex: 5-8, 8-12, Illimités"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meta_pairs" className="text-right">💱 Paires tradées</Label>
                    <Input
                      id="meta_pairs"
                      value={(currentOffer?.metadata as any)?.pairs || ''}
                      onChange={(e) => setCurrentOffer({ 
                        ...currentOffer, 
                        metadata: { ...(currentOffer?.metadata || {}), pairs: e.target.value }
                      })}
                      className="col-span-3"
                      placeholder="Ex: Majeures, Toutes"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meta_support" className="text-right">💬 Support</Label>
                    <Input
                      id="meta_support"
                      value={(currentOffer?.metadata as any)?.support || ''}
                      onChange={(e) => setCurrentOffer({ 
                        ...currentOffer, 
                        metadata: { ...(currentOffer?.metadata || {}), support: e.target.value }
                      })}
                      className="col-span-3"
                      placeholder="Ex: Email, Prioritaire 24/7"
                    />
                  </div>
                </>
              )}

              {/* Champs spécifiques pour la gestion de compte */}
              {currentOffer?.offer_type === 'account' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meta_max_capital" className="text-right">💰 Capital max</Label>
                    <Input
                      id="meta_max_capital"
                      value={(currentOffer?.metadata as any)?.max_capital || ''}
                      onChange={(e) => setCurrentOffer({ 
                        ...currentOffer, 
                        metadata: { ...(currentOffer?.metadata || {}), max_capital: e.target.value }
                      })}
                      className="col-span-3"
                      placeholder="Ex: 5000 USD, 50000+ USD"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meta_reports" className="text-right">📈 Rapports</Label>
                    <Input
                      id="meta_reports"
                      value={(currentOffer?.metadata as any)?.reports || ''}
                      onChange={(e) => setCurrentOffer({ 
                        ...currentOffer, 
                        metadata: { ...(currentOffer?.metadata || {}), reports: e.target.value }
                      })}
                      className="col-span-3"
                      placeholder="Ex: Mensuel, Hebdomadaire, Quotidien"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meta_strategy" className="text-right">🎯 Stratégie</Label>
                    <Input
                      id="meta_strategy"
                      value={(currentOffer?.metadata as any)?.strategy || ''}
                      onChange={(e) => setCurrentOffer({ 
                        ...currentOffer, 
                        metadata: { ...(currentOffer?.metadata || {}), strategy: e.target.value }
                      })}
                      className="col-span-3"
                      placeholder="Ex: Standard, Avancée, Institutionnelle"
                    />
                  </div>
                </>
              )}

              <div className="col-span-4 border-t pt-4 mt-4">
                <h4 className="font-semibold mb-4">Apparence</h4>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color_theme" className="text-right">Couleur</Label>
                <Select
                  value={(currentOffer as any)?.color_theme || 'gold'}
                  onValueChange={(value) => setCurrentOffer({ ...currentOffer, color_theme: value } as any)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right">Statut</Label>
                <Select
                  value={currentOffer?.is_active ? 'true' : 'false'}
                  onValueChange={(value) => setCurrentOffer({ ...currentOffer, is_active: value === 'true' })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveOffer} disabled={loading || !currentOffer?.name}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                isEditing ? 'Modifier' : 'Créer'
              )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
      )}

    {/* Dialog de confirmation de suppression */}
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer l'offre "{currentOffer?.name}" ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDeleteOffer} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default AdminServices;

