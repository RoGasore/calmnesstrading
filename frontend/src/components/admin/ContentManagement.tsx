import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Image,
  Video,
  Calendar,
  Globe,
  Lock
} from "lucide-react";

interface ContentItem {
  id: number;
  title: string;
  type: 'page' | 'article' | 'video' | 'image';
  status: 'published' | 'draft' | 'archived';
  author: string;
  created_at: string;
  updated_at: string;
  views: number;
  category: string;
}

export function ContentManagement() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Données de démonstration
  useEffect(() => {
    const mockContent: ContentItem[] = [
      {
        id: 1,
        title: "Introduction au Trading Forex",
        type: 'article',
        status: 'published',
        author: "Admin",
        created_at: '2024-02-15',
        updated_at: '2024-02-20',
        views: 1250,
        category: "Formation"
      },
      {
        id: 2,
        title: "Page d'accueil",
        type: 'page',
        status: 'published',
        author: "Admin",
        created_at: '2024-01-10',
        updated_at: '2024-03-01',
        views: 15420,
        category: "Pages"
      },
      {
        id: 3,
        title: "Analyse Technique - Vidéo 1",
        type: 'video',
        status: 'draft',
        author: "Admin",
        created_at: '2024-02-28',
        updated_at: '2024-02-28',
        views: 0,
        category: "Vidéos"
      },
      {
        id: 4,
        title: "Graphique EUR/USD",
        type: 'image',
        status: 'published',
        author: "Admin",
        created_at: '2024-03-01',
        updated_at: '2024-03-01',
        views: 320,
        category: "Images"
      }
    ];
    
    setTimeout(() => {
      setContent(mockContent);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeIcon = (type: string) => {
    const icons = {
      page: FileText,
      article: FileText,
      video: Video,
      image: Image
    };
    const IconComponent = icons[type as keyof typeof icons] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      page: { variant: 'default' as const, label: 'Page' },
      article: { variant: 'secondary' as const, label: 'Article' },
      video: { variant: 'destructive' as const, label: 'Vidéo' },
      image: { variant: 'outline' as const, label: 'Image' }
    };
    const config = variants[type as keyof typeof variants] || { variant: 'outline' as const, label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: { variant: 'default' as const, label: 'Publié' },
      draft: { variant: 'secondary' as const, label: 'Brouillon' },
      archived: { variant: 'destructive' as const, label: 'Archivé' }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const publishedCount = content.filter(item => item.status === 'published').length;
  const draftCount = content.filter(item => item.status === 'draft').length;
  const totalViews = content.reduce((sum, item) => sum + item.views, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion du Contenu</h2>
          <p className="text-muted-foreground">
            Gérez vos pages, articles et médias
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Contenu
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contenu</p>
                <p className="text-2xl font-bold">{content.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publiés</p>
                <p className="text-2xl font-bold">{publishedCount}</p>
              </div>
              <Globe className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Brouillons</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vues Total</p>
                <p className="text-2xl font-bold">{formatNumber(totalViews)}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
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
              placeholder="Rechercher du contenu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau du contenu */}
      <Card>
        <CardHeader>
          <CardTitle>Contenu ({filteredContent.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Contenu</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Catégorie</th>
                    <th className="text-left p-2">Statut</th>
                    <th className="text-left p-2">Auteur</th>
                    <th className="text-left p-2">Vues</th>
                    <th className="text-left p-2">Modifié</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {item.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        {getTypeBadge(item.type)}
                      </td>
                      <td className="p-2">
                        <span className="text-sm">{item.category}</span>
                      </td>
                      <td className="p-2">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="p-2">
                        <span className="text-sm">{item.author}</span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="h-3 w-3" />
                          {formatNumber(item.views)}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.updated_at)}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}