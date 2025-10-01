import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  FileText, 
  CheckCircle, 
  BarChart3, 
  Palette, 
  Clock, 
  BookOpen, 
  Users, 
  Star,
  TrendingUp,
  DollarSign,
  Target
} from "lucide-react";

interface Offer {
  id?: number;
  name: string;
  description: string;
  offer_type: 'formation' | 'signal' | 'account' | 'subscription';
  price: string;
  currency: string;
  duration_days: number | null;
  color_theme: string;
  is_active: boolean;
  metadata: {
    duration?: string;
    lessons?: string;
    students?: string;
    rating?: string;
    features?: string;
    signals_per_day?: string;
    pairs?: string;
    support?: string;
    max_capital?: string;
    reports?: string;
    strategy?: string;
  };
}

interface OfferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: Partial<Offer> | null;
  onOfferChange: (offer: Partial<Offer>) => void;
  onSave: () => void;
  loading: boolean;
  isEditing: boolean;
}

export function OfferFormDialog({
  open,
  onOpenChange,
  offer,
  onOfferChange,
  onSave,
  loading,
  isEditing
}: OfferFormDialogProps) {
  
  const updateField = (field: string, value: any) => {
    onOfferChange({ ...offer, [field]: value });
  };

  const updateMetadata = (field: string, value: any) => {
    onOfferChange({
      ...offer,
      metadata: { ...(offer?.metadata || {}), [field]: value }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl">
            {isEditing ? 'Modifier l\'offre' : 'Nouvelle offre'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifiez les informations. Les changements seront visibles immédiatement sur le site.' 
              : 'Créez une nouvelle offre qui sera affichée sur le site'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Section 1: Informations de base */}
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-primary flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informations de base
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'offre *</Label>
                <Input
                  id="name"
                  value={offer?.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ex: Formation Elite"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer_type">Type *</Label>
                <Select
                  value={offer?.offer_type || 'formation'}
                  onValueChange={(value) => updateField('offer_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formation">📚 Formation</SelectItem>
                    <SelectItem value="signal">⚡ Signal</SelectItem>
                    <SelectItem value="account">👥 Gestion</SelectItem>
                    <SelectItem value="subscription">📈 Abonnement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={offer?.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Description détaillée"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={offer?.price || '0.00'}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={offer?.currency || 'USD'}
                  onValueChange={(value) => updateField('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">💵 USD</SelectItem>
                    <SelectItem value="EUR">💶 EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_days">Durée (jours)</Label>
                <Input
                  id="duration_days"
                  type="number"
                  value={offer?.duration_days || ''}
                  onChange={(e) => updateField('duration_days', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Vide = illimité"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Fonctionnalités (uniquement pour Formations) */}
          {offer?.offer_type === 'formation' && (
          <div className="space-y-4 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Fonctionnalités (affichées sur le site)
            </h3>
            <p className="text-sm text-muted-foreground">Une fonctionnalité par ligne</p>
            
            <div className="space-y-2">
              <Label htmlFor="meta_features">Liste des fonctionnalités</Label>
              <Textarea
                id="meta_features"
                value={offer?.metadata?.features || ''}
                onChange={(e) => updateMetadata('features', e.target.value)}
                placeholder="Videos HD illimitees&#10;Certificat de formation&#10;Support par email&#10;Mises a jour gratuites"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
          )}

          {/* Section 3: Statistiques (uniquement pour Formations) */}
          {offer?.offer_type === 'formation' && (
          <div className="space-y-4 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Statistiques (affichées avec icônes)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meta_duration" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Durée du contenu
                </Label>
                <Input
                  id="meta_duration"
                  value={offer?.metadata?.duration || ''}
                  onChange={(e) => updateMetadata('duration', e.target.value)}
                  placeholder="Ex: 4h, 12h"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_lessons" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Nombre de leçons
                </Label>
                <Input
                  id="meta_lessons"
                  value={offer?.metadata?.lessons || ''}
                  onChange={(e) => updateMetadata('lessons', e.target.value)}
                  placeholder="Ex: 15 leçons"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_students" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Nombre d'étudiants
                </Label>
                <Input
                  id="meta_students"
                  value={offer?.metadata?.students || ''}
                  onChange={(e) => updateMetadata('students', e.target.value)}
                  placeholder="Ex: 1200+"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_rating" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Note
                </Label>
                <Input
                  id="meta_rating"
                  value={offer?.metadata?.rating || ''}
                  onChange={(e) => updateMetadata('rating', e.target.value)}
                  placeholder="Ex: 4.9/5"
                />
              </div>
            </div>
          </div>
          )}

          {/* Section: Ce qu'on offre (pour Signaux) */}
          {offer?.offer_type === 'signal' && (
            <div className="space-y-4 bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
              <h3 className="text-base font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ce qu'on offre (affichée sur le site)
              </h3>
              <p className="text-sm text-muted-foreground">Décrivez ce qui est inclus dans ce plan de signaux</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_signals_per_day" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Signaux/jour
                  </Label>
                  <Input
                    id="meta_signals_per_day"
                    value={offer?.metadata?.signals_per_day || ''}
                    onChange={(e) => updateMetadata('signals_per_day', e.target.value)}
                    placeholder="Ex: 5-8, Illimités"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_pairs" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Paires tradées
                  </Label>
                  <Input
                    id="meta_pairs"
                    value={offer?.metadata?.pairs || ''}
                    onChange={(e) => updateMetadata('pairs', e.target.value)}
                    placeholder="Ex: Majeures, Toutes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_support" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Support
                  </Label>
                  <Input
                    id="meta_support"
                    value={offer?.metadata?.support || ''}
                    onChange={(e) => updateMetadata('support', e.target.value)}
                    placeholder="Ex: Email, Prioritaire 24/7"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Ce qu'on offre (pour Gestion de compte) */}
          {offer?.offer_type === 'account' && (
            <div className="space-y-4 bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
              <h3 className="text-base font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Ce qu'on offre (affiché sur le site)
              </h3>
              <p className="text-sm text-muted-foreground">Décrivez ce qui est inclus dans ce plan de gestion</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_max_capital" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Capital max
                  </Label>
                  <Input
                    id="meta_max_capital"
                    value={offer?.metadata?.max_capital || ''}
                    onChange={(e) => updateMetadata('max_capital', e.target.value)}
                    placeholder="Ex: 5000 USD"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_reports" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Rapports
                  </Label>
                  <Input
                    id="meta_reports"
                    value={offer?.metadata?.reports || ''}
                    onChange={(e) => updateMetadata('reports', e.target.value)}
                    placeholder="Ex: Mensuel, Hebdomadaire"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_strategy" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Stratégie
                  </Label>
                  <Input
                    id="meta_strategy"
                    value={offer?.metadata?.strategy || ''}
                    onChange={(e) => updateMetadata('strategy', e.target.value)}
                    placeholder="Ex: Standard, Avancée"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Apparence */}
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-primary flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Apparence
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color_theme">Couleur du bouton</Label>
                <Select
                  value={offer?.color_theme || 'gold'}
                  onValueChange={(value) => updateField('color_theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Gold (Jaune/Doré)</SelectItem>
                    <SelectItem value="black">Black (Noir)</SelectItem>
                    <SelectItem value="white">White (Blanc)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Statut</Label>
                <Select
                  value={offer?.is_active ? 'true' : 'false'}
                  onValueChange={(value) => updateField('is_active', value === 'true')}
                >
                  <SelectTrigger>
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
        </div>

        <DialogFooter className="border-t pt-4 mt-6 flex-col sm:flex-row gap-4">
          <div className="flex-1 text-left">
            <p className="text-sm text-muted-foreground">
              {offer?.name ? `Édition: ${offer.name}` : 'Tous les champs marqués * sont obligatoires'}
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={onSave} disabled={loading || !offer?.name}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  {isEditing ? <CheckCircle className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                  {isEditing ? 'Enregistrer' : 'Créer'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

