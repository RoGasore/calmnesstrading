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
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Users,
  Clock,
  Star
} from "lucide-react";

interface Formation {
  id: number;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // en heures
  price: number;
  students_count: number;
  rating: number;
  is_published: boolean;
  created_at: string;
}

export function FormationsManagement() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Données de démonstration
  useEffect(() => {
    const mockFormations: Formation[] = [
      {
        id: 1,
        title: "Introduction au Trading",
        description: "Apprenez les bases du trading financier",
        level: 'beginner',
        duration: 8,
        price: 99,
        students_count: 245,
        rating: 4.8,
        is_published: true,
        created_at: '2024-01-15'
      },
      {
        id: 2,
        title: "Analyse Technique Avancée",
        description: "Maîtrisez l'analyse technique professionnelle",
        level: 'advanced',
        duration: 16,
        price: 299,
        students_count: 89,
        rating: 4.9,
        is_published: true,
        created_at: '2024-02-01'
      },
      {
        id: 3,
        title: "Gestion des Risques",
        description: "Protégez votre capital avec une gestion optimale",
        level: 'intermediate',
        duration: 12,
        price: 199,
        students_count: 156,
        rating: 4.7,
        is_published: false,
        created_at: '2024-02-15'
      }
    ];
    
    setTimeout(() => {
      setFormations(mockFormations);
      setLoading(false);
    }, 1000);
  }, []);

  const getLevelBadge = (level: string) => {
    const variants = {
      beginner: { variant: 'secondary' as const, label: 'Débutant' },
      intermediate: { variant: 'default' as const, label: 'Intermédiaire' },
      advanced: { variant: 'destructive' as const, label: 'Avancé' }
    };
    const config = variants[level as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredFormations = formations.filter(formation =>
    formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Formations</h2>
          <p className="text-muted-foreground">
            Gérez vos formations et leur contenu
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Formation
        </Button>
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
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des formations */}
      <Card>
        <CardHeader>
          <CardTitle>Formations ({filteredFormations.length})</CardTitle>
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
                    <TableHead>Formation</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Étudiants</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFormations.map((formation) => (
                    <TableRow key={formation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formation.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formation.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLevelBadge(formation.level)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3" />
                          {formation.duration}h
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${formation.price}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-3 w-3" />
                          {formation.students_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-3 w-3" />
                          {formation.rating}/5
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={formation.is_published ? "default" : "secondary"}>
                          {formation.is_published ? "Publié" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(formation.created_at)}
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
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
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
