import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Globe
} from "lucide-react";

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate?: (userId: number) => void;
  onDeactivate?: (userId: number) => void;
  onDelete?: (userId: number) => void;
  isProcessing?: boolean;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  telegram_username?: string;
  is_active: boolean;
  is_verified: boolean;
  is_staff: boolean;
  created_at: string;
  last_login?: string;
  date_joined?: string;
}

export function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onActivate,
  onDeactivate,
  onDelete,
  isProcessing = false
}: UserDetailsModalProps) {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    if (!user.is_active) {
      return <Badge variant="destructive">Désactivé</Badge>;
    }
    if (!user.is_verified) {
      return <Badge variant="secondary">Non vérifié</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>;
  };

  const getRoleBadge = () => {
    if (user.is_staff) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Administrateur</Badge>;
    }
    return <Badge variant="outline">Utilisateur</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Détails de l'utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{user.full_name}</h3>
              <div className="flex gap-2">
                {getStatusBadge()}
                {getRoleBadge()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}

              {user.telegram_username && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">@{user.telegram_username}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informations de compte */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Informations du compte
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Inscription</p>
                  <p>{formatDate(user.date_joined || user.created_at)}</p>
                </div>
              </div>

              {user.last_login && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Dernière connexion</p>
                    <p>{formatDate(user.last_login)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {user.is_verified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <p className="text-muted-foreground">Email vérifié</p>
                  <p>{user.is_verified ? 'Oui' : 'Non'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {user.is_active ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <p className="text-muted-foreground">Compte actif</p>
                  <p>{user.is_active ? 'Oui' : 'Non'}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-4">
            <h4 className="font-medium">Actions</h4>
            
            <div className="flex flex-wrap gap-2">
              {!user.is_active && onActivate && (
                <Button
                  onClick={() => onActivate(user.id)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activer le compte
                </Button>
              )}

              {user.is_active && onDeactivate && (
                <Button
                  onClick={() => onDeactivate(user.id)}
                  disabled={isProcessing}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Désactiver le compte
                </Button>
              )}

              {onDelete && !user.is_staff && (
                <Button
                  onClick={() => onDelete(user.id)}
                  disabled={isProcessing}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Supprimer le compte
                </Button>
              )}
            </div>

            {user.is_staff && (
              <p className="text-sm text-muted-foreground">
                ⚠️ Les comptes administrateur ne peuvent pas être supprimés
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
