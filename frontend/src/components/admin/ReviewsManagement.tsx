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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Star,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  MessageSquare,
  User
} from "lucide-react";

interface Review {
  id: number;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  service_type: string;
}

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Données de démonstration
  useEffect(() => {
    const mockReviews: Review[] = [
      {
        id: 1,
        user_name: "Jean Dupont",
        user_email: "jean.dupont@email.com",
        rating: 5,
        title: "Excellent service de trading",
        content: "Les signaux sont très précis et m'ont permis de réaliser de bons profits. Je recommande vivement !",
        status: 'approved',
        created_at: '2024-02-28T10:30:00',
        service_type: 'signaux'
      },
      {
        id: 2,
        user_name: "Marie Martin",
        user_email: "marie.martin@email.com",
        rating: 4,
        title: "Formation très complète",
        content: "La formation m'a permis de comprendre les bases du trading. Le contenu est de qualité.",
        status: 'approved',
        created_at: '2024-02-25T14:15:00',
        service_type: 'formation'
      },
      {
        id: 3,
        user_name: "Pierre Durand",
        user_email: "pierre.durand@email.com",
        rating: 2,
        title: "Déçu par le service",
        content: "Les signaux ne sont pas toujours fiables et j'ai perdu de l'argent.",
        status: 'pending',
        created_at: '2024-03-01T09:20:00',
        service_type: 'signaux'
      }
    ];
    
    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'En attente' },
      approved: { variant: 'default' as const, label: 'Approuvé' },
      rejected: { variant: 'destructive' as const, label: 'Rejeté' }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getServiceBadge = (service: string) => {
    const variants = {
      signaux: { variant: 'default' as const, label: 'Signaux' },
      formation: { variant: 'secondary' as const, label: 'Formation' },
      gestion: { variant: 'outline' as const, label: 'Gestion' }
    };
    const config = variants[service as keyof typeof variants] || { variant: 'outline' as const, label: service };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
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

  const filteredReviews = reviews.filter(review =>
    review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageRating = reviews.length > 0 ? 
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Avis</h2>
          <p className="text-muted-foreground">
            Gérez les avis clients et modérez le contenu
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Avis</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Note Moyenne</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Attente</p>
                <p className="text-2xl font-bold">{reviews.filter(r => r.status === 'pending').length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approuvés</p>
                <p className="text-2xl font-bold">{reviews.filter(r => r.status === 'approved').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les avis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des avis */}
      <Card>
        <CardHeader>
          <CardTitle>Avis Clients ({filteredReviews.length})</CardTitle>
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
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Contenu</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{review.user_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {review.user_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getServiceBadge(review.service_type)}
                      </TableCell>
                      <TableCell>
                        {renderStars(review.rating)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium max-w-[200px] truncate">
                          {review.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate text-sm text-muted-foreground">
                          {review.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(review.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(review.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir complet
                            </DropdownMenuItem>
                            {review.status === 'pending' && (
                              <>
                                <DropdownMenuItem>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approuver
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Rejeter
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
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
    </div>
  );
}