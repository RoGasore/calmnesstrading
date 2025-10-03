import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Settings, 
  Home, 
  Menu, 
  Layout, 
  ShoppingBag, 
  MessageSquare, 
  BookOpen,
  Star,
  Edit,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';

interface ContentStats {
  offers_count: number;
  last_updated: string;
}

const ContentTable: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ContentStats>({
    offers_count: 0,
    last_updated: ''
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(API_URLS.CMS_STATS);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const contentSections = [
    {
      id: 'global',
      title: 'Paramètres Globaux',
      description: 'Nom du site, contact, réseaux sociaux, copyright',
      icon: Settings,
      route: '/admin/content/global',
      stats: 'Configuration principale',
      status: 'active',
      priority: 1
    },
    {
      id: 'home',
      title: 'Page d\'Accueil',
      description: 'Contenu principal de la page d\'accueil du site',
      icon: Home,
      route: '/admin/content/home',
      stats: 'Contenu principal',
      status: 'active',
      priority: 2
    },
    {
      id: 'services',
      title: 'Services Publics',
      description: 'Présentation des services disponibles sur le site',
      icon: ShoppingBag,
      route: '/admin/content/services',
      stats: 'Services disponibles',
      status: 'active',
      priority: 3
    },
    {
      id: 'faq',
      title: 'Questions Fréquentes',
      description: 'FAQ et réponses aux questions courantes',
      icon: BookOpen,
      route: '/admin/content/faq',
      stats: 'Questions & réponses',
      status: 'active',
      priority: 4
    },
    {
      id: 'contact',
      title: 'Page Contact',
      description: 'Gestion des champs de contact et informations générales',
      icon: MessageSquare,
      route: '/admin/content/contact',
      stats: 'Formulaire personnalisé',
      status: 'active',
      priority: 5
    },
    {
      id: 'reviews',
      title: 'Gestion Avis',
      description: 'Gérez les avis clients et leur publication',
      icon: Star,
      route: '/admin/content/reviews',
      stats: 'Avis clients',
      status: 'active',
      priority: 6
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
        </div>
      </div>


      {/* Tableau des sections */}
      <Card className="bg-gradient-to-br from-card to-accent/5 border-primary/10 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/10 border-b border-primary/10 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Sections de Contenu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-primary/10">
                  <TableHead className="font-semibold text-foreground text-xs sm:text-sm">Section</TableHead>
                  <TableHead className="font-semibold text-foreground text-xs sm:text-sm hidden sm:table-cell">Description</TableHead>
                  <TableHead className="font-semibold text-foreground text-xs sm:text-sm hidden md:table-cell">Statistiques</TableHead>
                  <TableHead className="font-semibold text-foreground text-xs sm:text-sm hidden xl:table-cell">Priorité</TableHead>
                  <TableHead className="text-right font-semibold text-foreground text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {contentSections
                .sort((a, b) => a.priority - b.priority)
                .map((section) => {
                  const IconComponent = section.icon;
                  return (
                      <TableRow 
                        key={section.id} 
                        className="hover:bg-primary/5 transition-colors duration-200 border-b border-border/50"
                      >
                        <TableCell className="py-3 sm:py-4">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-foreground text-sm sm:text-base truncate">{section.title}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                {section.route.replace('/admin/content/', '')}
                              </div>
                              {/* Informations mobiles */}
                              <div className="sm:hidden mt-1">
                                <div className="text-xs text-muted-foreground">{section.stats}</div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 sm:py-4 hidden sm:table-cell">
                          <div className="max-w-xs">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {section.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 sm:py-4 hidden md:table-cell">
                          <span className="text-sm font-medium text-primary">
                            {section.stats}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 sm:py-4 hidden xl:table-cell">
                          <span className="text-sm font-medium text-primary/70">
                            #{section.priority}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-3 sm:py-4">
                          <div className="flex justify-end space-x-1 sm:space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(section.route)}
                              className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-xs sm:text-sm"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Modifier</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Déterminer l'URL de la page correspondante
                                let targetUrl = '/';
                                switch(section.id) {
                                  case 'home':
                                    targetUrl = '/';
                                    break;
                                  case 'services':
                                    targetUrl = '/services';
                                    break;
                                  case 'faq':
                                    targetUrl = '/faq';
                                    break;
                                  case 'contact':
                                    targetUrl = '/contact';
                                    break;
                                  case 'header':
                                  case 'footer':
                                  case 'global':
                                    targetUrl = '/';
                                    break;
                                  default:
                                    targetUrl = '/';
                                }
                                window.open(targetUrl, '_blank');
                              }}
                              className="hover:bg-primary/5"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentTable;
