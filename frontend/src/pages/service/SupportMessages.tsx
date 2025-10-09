import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  MessageSquare, 
  Send, 
  Clock, 
  User, 
  Mail, 
  Phone,
  MessageCircle,
  Loader2,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/config/api";

interface Message {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    telegram_username?: string;
    phone?: string;
  };
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  replies?: Reply[];
}

interface Reply {
  id: number;
  message: string;
  is_from_support: boolean;
  created_at: string;
  created_by: {
    name: string;
    role: string;
  };
}

const SupportMessages = () => {
  const { toast } = useToast();
  const { fetchWithAuth } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // Simuler des données pour le moment
      const mockMessages: Message[] = [
        {
          id: 1,
          user: {
            id: 1,
            name: "Jean Dupont",
            email: "jean@example.com",
            telegram_username: "@jeandupont",
            phone: "+33123456789"
          },
          subject: "Problème avec mon abonnement",
          message: "Bonjour, j'ai un problème avec mon abonnement aux signaux. Je ne reçois plus les notifications Telegram.",
          status: "unread",
          priority: "high",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          replies: []
        },
        {
          id: 2,
          user: {
            id: 2,
            name: "Marie Martin",
            email: "marie@example.com",
            phone: "+33987654321"
          },
          subject: "Question sur la formation",
          message: "Salut ! J'aimerais savoir quand aura lieu la prochaine session de formation sur l'analyse technique.",
          status: "read",
          priority: "medium",
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          replies: [
            {
              id: 1,
              message: "Bonjour Marie, la prochaine session aura lieu mercredi prochain à 19h. Je vous envoie le lien par email.",
              is_from_support: true,
              created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              created_by: {
                name: "Service Client",
                role: "customer_service"
              }
            }
          ]
        },
        {
          id: 3,
          user: {
            id: 3,
            name: "Pierre Durand",
            email: "pierre@example.com",
            telegram_username: "@pierredurand"
          },
          subject: "Demande de remboursement",
          message: "Je souhaite annuler mon abonnement et obtenir un remboursement. Le service ne correspond pas à mes attentes.",
          status: "replied",
          priority: "urgent",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          replies: [
            {
              id: 2,
              message: "Bonjour Pierre, nous comprenons votre demande. Pouvez-vous nous préciser la raison exacte de votre insatisfaction ?",
              is_from_support: true,
              created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              created_by: {
                name: "Service Client",
                role: "customer_service"
              }
            }
          ]
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  const handleReply = async () => {
    if (!selectedMessage || !newMessage.trim()) return;
    
    try {
      // Simuler l'envoi de réponse
      const reply: Reply = {
        id: Date.now(),
        message: newMessage,
        is_from_support: true,
        created_at: new Date().toISOString(),
        created_by: {
          name: "Service Client",
          role: "customer_service"
        }
      };
      
      // Mettre à jour le message
      setMessages(prev => prev.map(msg => 
        msg.id === selectedMessage.id 
          ? { 
              ...msg, 
              replies: [...(msg.replies || []), reply],
              status: 'replied' as const,
              updated_at: new Date().toISOString()
            }
          : msg
      ));
      
      setNewMessage("");
      setReplyDialogOpen(false);
      setViewDialogOpen(false);
      
      toast({
        title: "Réponse envoyée",
        description: "Votre réponse a été envoyée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la réponse",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500"><AlertCircle className="w-3 h-3 mr-1" />Non lu</Badge>;
      case 'read':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500"><Eye className="w-3 h-3 mr-1" />Lu</Badge>;
      case 'replied':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500"><CheckCircle className="w-3 h-3 mr-1" />Répondu</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-500"><MessageCircle className="w-3 h-3 mr-1" />Fermé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Faible</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Moyen</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Élevé</Badge>;
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    replied: messages.filter(m => m.status === 'replied').length,
    urgent: messages.filter(m => m.priority === 'urgent').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages Support</h1>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non Lus</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Répondus</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgents</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.urgent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Rechercher par sujet, nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="unread">Non lus</option>
                <option value="read">Lus</option>
                <option value="replied">Répondus</option>
                <option value="closed">Fermés</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des messages */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Gérez les messages de support client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun message trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{message.user.name}</div>
                        <div className="text-sm text-muted-foreground">{message.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{message.subject}</div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(message.priority)}</TableCell>
                    <TableCell>{getStatusBadge(message.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMessage(message)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de visualisation */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message de {selectedMessage?.user.name}</DialogTitle>
            <DialogDescription>
              {selectedMessage?.subject}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">
              {/* Informations du client */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nom</Label>
                      <div className="font-medium">{selectedMessage.user.name}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="font-medium">{selectedMessage.user.email}</div>
                    </div>
                    {selectedMessage.user.telegram_username && (
                      <div>
                        <Label className="text-muted-foreground">Telegram</Label>
                        <div className="font-medium">{selectedMessage.user.telegram_username}</div>
                      </div>
                    )}
                    {selectedMessage.user.phone && (
                      <div>
                        <Label className="text-muted-foreground">Téléphone</Label>
                        <div className="font-medium">{selectedMessage.user.phone}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Message original */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Message Original</CardTitle>
                  <div className="flex gap-2">
                    {getPriorityBadge(selectedMessage.priority)}
                    {getStatusBadge(selectedMessage.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Envoyé le {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                  </p>
                </CardContent>
              </Card>

              {/* Réponses */}
              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Conversation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedMessage.replies.map((reply) => (
                      <div key={reply.id} className={`p-4 rounded-lg ${
                        reply.is_from_support 
                          ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' 
                          : 'bg-gray-50 dark:bg-gray-900/20 mr-8'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">
                            {reply.created_by.name} ({reply.created_by.role})
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(reply.created_at).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Formulaire de réponse */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Répondre</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reply-message">Votre réponse</Label>
                      <Textarea
                        id="reply-message"
                        placeholder="Tapez votre réponse ici..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fermer
            </Button>
            <Button 
              onClick={() => setReplyDialogOpen(true)}
              disabled={!newMessage.trim()}
              style={{ backgroundColor: '#D4AF37', color: '#000000' }}
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer la réponse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de réponse */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'envoi</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir envoyer cette réponse ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleReply}
              style={{ backgroundColor: '#D4AF37', color: '#000000' }}
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportMessages;
