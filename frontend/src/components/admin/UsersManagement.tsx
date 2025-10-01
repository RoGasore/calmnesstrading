import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserDetailsModal } from "./UserDetailsModal";
import { ConfirmActionDialog } from "./ConfirmActionDialog";

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
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'activate' | 'deactivate' | 'delete';
    userId: number;
    userName: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 [DEBUG] fetchUsers - Début');
      console.log('🔍 [DEBUG] API_BASE:', API_BASE);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const url = `${API_BASE}/api/auth/admin/users/?${params}`;
      console.log('🔍 [DEBUG] URL complète:', url);
      
      const response = await fetchWithAuth(url);
      console.log('🔍 [DEBUG] Response status:', response.status);
      console.log('🔍 [DEBUG] Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [DEBUG] Data reçue:', data);
        setUsers(data.results || data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔍 [DEBUG] Erreur API:', errorData);
        toast({
          title: "Erreur",
          description: errorData.detail || "Impossible de charger les utilisateurs",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('🔍 [DEBUG] Exception dans fetchUsers:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, statusFilter]);

  const handleActivateUser = async (userId: number) => {
    try {
      setIsProcessing(true);
      const response = await fetchWithAuth(`${API_BASE}/api/auth/admin/users/${userId}/activate/`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Succès",
          description: "Utilisateur activé avec succès"
        });
        await fetchUsers();
        setShowUserDetails(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Erreur",
          description: errorData.detail || "Impossible d'activer l'utilisateur",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    try {
      setIsProcessing(true);
      const response = await fetchWithAuth(`${API_BASE}/api/auth/admin/users/${userId}/deactivate/`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Succès",
          description: "Utilisateur désactivé avec succès"
        });
        await fetchUsers();
        setShowUserDetails(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Erreur",
          description: errorData.detail || "Impossible de désactiver l'utilisateur",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      setIsProcessing(true);
      const response = await fetchWithAuth(`${API_BASE}/api/auth/admin/users/${userId}/`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès"
        });
        await fetchUsers();
        setShowUserDetails(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Erreur",
          description: errorData.detail || "Impossible de supprimer l'utilisateur",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleConfirmAction = (type: 'activate' | 'deactivate' | 'delete', userId: number, userName: string) => {
    setConfirmAction({ type, userId, userName });
    setShowConfirmDialog(true);
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'activate':
        await handleActivateUser(confirmAction.userId);
        break;
      case 'deactivate':
        await handleDeactivateUser(confirmAction.userId);
        break;
      case 'delete':
        await handleDeleteUser(confirmAction.userId);
        break;
    }

    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Inactif</Badge>;
    }
    if (!user.is_verified) {
      return <Badge variant="secondary">Non vérifié</Badge>;
    }
    return <Badge variant="default">Actif</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
          <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
      </div>

      {/* Filtres et recherche */}
        <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
                placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="verified">Vérifiés</option>
              <option value="unverified">Non vérifiés</option>
            </select>
      </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            @{user.email}
                          </div>
                          {user.is_staff && (
                            <Badge variant="outline" className="mt-1">
                              Admin
                      </Badge>
                          )}
                    </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                        {user.phone}
                      </div>
                          )}
                          {user.telegram_username && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3" />
                              @{user.telegram_username}
                      </div>
                          )}
                      </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.created_at)}
                    </div>
                      </TableCell>
                      <TableCell>
                        {user.last_login ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.last_login)}
                  </div>
                        ) : (
                          <span className="text-muted-foreground">Jamais</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                  </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShowUserDetails(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            {!user.is_active ? (
                              <DropdownMenuItem 
                                onClick={() => handleConfirmAction('activate', user.id, user.full_name)}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activer
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleConfirmAction('deactivate', user.id, user.full_name)}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Désactiver
                              </DropdownMenuItem>
                            )}
                            {!user.is_staff && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleConfirmAction('delete', user.id, user.full_name)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </div>
          )}
            </CardContent>
          </Card>

          {/* Modals */}
          <UserDetailsModal
            user={selectedUser}
            isOpen={showUserDetails}
            onClose={() => setShowUserDetails(false)}
            onActivate={handleActivateUser}
            onDeactivate={handleDeactivateUser}
            onDelete={handleDeleteUser}
            isProcessing={isProcessing}
          />

          <ConfirmActionDialog
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={executeConfirmedAction}
            title={
              confirmAction?.type === 'activate' ? 'Activer l\'utilisateur' :
              confirmAction?.type === 'deactivate' ? 'Désactiver l\'utilisateur' :
              'Supprimer l\'utilisateur'
            }
            description={
              confirmAction?.type === 'activate' ? 'Êtes-vous sûr de vouloir activer ce compte utilisateur ?' :
              confirmAction?.type === 'deactivate' ? 'Êtes-vous sûr de vouloir désactiver ce compte utilisateur ?' :
              'Êtes-vous sûr de vouloir supprimer définitivement ce compte utilisateur ?'
            }
            actionType={confirmAction?.type || 'delete'}
            userName={confirmAction?.userName}
            isProcessing={isProcessing}
          />
    </div>
  );
}