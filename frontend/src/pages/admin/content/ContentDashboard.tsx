import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Eye,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';

interface ContentStats {
  offers_count: number;
  last_updated: string;
}

const ContentDashboard: React.FC = () => {
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
      status: 'active'
    },
    {
      id: 'home',
      title: 'Page d\'Accueil',
      description: 'Contenu principal de la page d\'accueil du site',
      icon: Home,
      route: '/admin/content/home',
      stats: 'Contenu principal',
      status: 'active'
    },
    {
      id: 'header',
      title: 'En-tête & Navigation',
      description: 'Menu de navigation et en-tête du site',
      icon: Menu,
      route: '/admin/content/header',
      stats: 'Menu principal',
      status: 'active'
    },
    {
      id: 'footer',
      title: 'Pied de Page',
      description: 'Liens rapides, informations de contact, réseaux sociaux',
      icon: Layout,
      route: '/admin/content/footer',
      stats: 'Liens et contacts',
      status: 'active'
    },
    {
      id: 'services',
      title: 'Page Services',
      description: 'Présentation des services disponibles sur le site',
      icon: ShoppingBag,
      route: '/admin/content/services',
      stats: 'Services disponibles',
      status: 'active'
    },
    {
      id: 'testimonials',
      title: 'Témoignages',
      description: 'Avis clients et témoignages d\'utilisateurs',
      icon: MessageSquare,
      route: '/admin/content/testimonials',
      stats: 'Avis clients',
      status: 'active'
    },
    {
      id: 'faq',
      title: 'Questions Fréquentes',
      description: 'FAQ et réponses aux questions courantes',
      icon: BookOpen,
      route: '/admin/content/faq',
      stats: 'Questions & réponses',
      status: 'active'
    },
    {
      id: 'contact',
      title: 'Page Contact',
      description: 'Gestion des champs de contact et informations générales',
      icon: MessageSquare,
      route: '/admin/content/contact',
      stats: 'Formulaire personnalisé',
      status: 'active'
    },
    {
      id: 'reviews',
      title: 'Gestion Avis',
      description: 'Gérez les avis clients et leur publication',
      icon: Star,
      route: '/admin/content/reviews',
      stats: 'Avis clients',
      status: 'active'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Sections de contenu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {contentSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card 
              key={section.id} 
              className="group bg-gradient-to-br from-card to-accent/5 border-primary/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(section.route)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                        {section.title}
                      </CardTitle>
                      <Badge 
                        variant={section.status === 'active' ? 'default' : 'secondary'}
                        className="mt-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      >
                        {section.status === 'active' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Actif</>
                        ) : (
                          <><AlertCircle className="h-3 w-3 mr-1" /> Inactif</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {section.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary/70">
                    {section.stats}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(section.route);
                      }}
                      className="border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
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
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
};

export default ContentDashboard;
