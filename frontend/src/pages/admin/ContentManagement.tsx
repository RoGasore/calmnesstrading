import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';
import { 
  Settings, 
  FileText, 
  Layout, 
  MessageSquare, 
  HelpCircle, 
  Package, 
  Eye, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  History, 
  Search,
  BarChart3,
  Globe,
  Users,
  Star,
  DollarSign
} from 'lucide-react';

interface GlobalSettings {
  id?: number;
  site_name: string;
  site_tagline: string;
  site_description: string;
  email_contact: string;
  phone_contact: string;
  address: string;
  social_networks: Record<string, string>;
  copyright_text: string;
}

interface Page {
  id: number;
  name: string;
  slug: string;
  title: string;
  description: string;
  category?: { id: number; name: string };
  is_active: boolean;
  is_public: boolean;
  content_blocks_count: number;
  updated_at: string;
}

interface ContentBlock {
  id: number;
  page: number;
  page_name: string;
  block_key: string;
  content_type: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  css_classes: string;
  order: number;
  is_visible: boolean;
  is_editable: boolean;
  updated_at: string;
}

interface Testimonial {
  id: number;
  client_name: string;
  client_initials: string;
  client_role: string;
  client_avatar: string;
  testimonial_text: string;
  rating: number;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  order: number;
  created_at: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  keywords: string;
  search_tags: string[];
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  order: number;
  views_count: number;
  created_at: string;
}

interface Offer {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  offer_type: string;
  price: number;
  currency: string;
  is_free: boolean;
  discount_percentage: number;
  final_price: number;
  features: string[];
  benefits: string[];
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_popular: boolean;
  order: number;
  image_url: string;
  icon: string;
  color_theme: string;
  created_at: string;
}

const ContentManagement: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Debug: compter les re-renders
  const renderCount = React.useRef(0);
  renderCount.current++;
  console.log('🔄 ContentManagement render #', renderCount.current);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // États pour les données
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    site_name: 'CALMNESS FI',
    site_tagline: '',
    site_description: '',
    email_contact: '',
    phone_contact: '',
    address: '',
    social_networks: {},
    copyright_text: '© 2024 CALMNESS FI. Tous droits réservés.'
  });
  
  // État local pour éviter les rechargements intempestifs
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(() => globalSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFieldFocused, setIsFieldFocused] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  
  // États pour les statistiques
  const [stats, setStats] = useState({
    total_pages: 0,
    total_content_blocks: 0,
    total_testimonials: 0,
    total_faq_items: 0,
    total_offers: 0,
    published_pages: 0,
    published_testimonials: 0,
    published_faq_items: 0,
    published_offers: 0
  });
  
  // États pour les modales
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<FAQItem | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  
  // États pour les formulaires
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    loadAllData();
  }, []);
  

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGlobalSettings(),
        loadPages(),
        loadContentBlocks(),
        loadTestimonials(),
        loadFaqItems(),
        loadOffers(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalSettings = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_GLOBAL_SETTINGS);
      if (response.ok) {
        const data = await response.json();
        setGlobalSettings(data);
        // Ne pas écraser les modifications si un champ est en focus
        if (!isFieldFocused) {
          setLocalSettings(data);
          setHasUnsavedChanges(false);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres globaux:', error);
    }
  };

  const loadPages = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_PAGES);
      if (response.ok) {
        const data = await response.json();
        setPages(data.results || data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des pages:', error);
    }
  };

  const loadContentBlocks = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_CONTENT_BLOCKS);
      if (response.ok) {
        const data = await response.json();
        setContentBlocks(data.results || data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des blocs de contenu:', error);
    }
  };

  const loadTestimonials = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_TESTIMONIALS);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.results || data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des témoignages:', error);
    }
  };

  const loadFaqItems = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_FAQ);
      if (response.ok) {
        const data = await response.json();
        setFaqItems(data.results || data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des FAQ:', error);
    }
  };

  const loadOffers = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_OFFERS);
      if (response.ok) {
        const data = await response.json();
        setOffers(data.results || data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_STATS);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const saveGlobalSettings = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_GLOBAL_SETTINGS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localSettings)
      });
      
      if (response.ok) {
        setGlobalSettings(localSettings); // Synchroniser avec l'état principal
        setHasUnsavedChanges(false);
        toast({
          title: "Succès",
          description: "Paramètres globaux sauvegardés"
        });
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres globaux:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres globaux",
        variant: "destructive"
      });
    }
  };

  const startPreviewMode = async () => {
    setPreviewMode(true);
    toast({
      title: "Mode Aperçu",
      description: "Mode aperçu activé. Les modifications sont temporaires."
    });
  };

  const endPreviewMode = async () => {
    setPreviewMode(false);
    toast({
      title: "Mode Aperçu",
      description: "Mode aperçu désactivé."
    });
  };

  const applyChanges = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_PENDING_CHANGES_APPLY, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Succès",
          description: "Changements appliqués avec succès"
        });
        loadAllData();
        setPreviewMode(false);
      } else {
        throw new Error('Erreur lors de l\'application des changements');
      }
    } catch (error) {
      console.error('Erreur lors de l\'application des changements:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer les changements",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'published': 'default',
      'draft': 'secondary',
      'archived': 'outline'
    } as const;
    
    const labels = {
      'published': 'Publié',
      'draft': 'Brouillon',
      'archived': 'Archivé'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_pages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.published_pages} publiées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocs de contenu</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_content_blocks}</div>
            <p className="text-xs text-muted-foreground">
              Contenu dynamique
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Témoignages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_testimonials}</div>
            <p className="text-xs text-muted-foreground">
              {stats.published_testimonials} publiés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQ</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_faq_items}</div>
            <p className="text-xs text-muted-foreground">
              {stats.published_faq_items} publiées
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pages récentes</CardTitle>
            <CardDescription>Dernières pages modifiées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pages.slice(0, 5).map((page) => (
                <div key={page.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{page.title}</p>
                    <p className="text-sm text-muted-foreground">{page.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(page.is_active ? 'published' : 'draft')}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPage(page);
                        setActiveTab('pages');
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Opérations fréquentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab('global-settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres globaux
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab('pages')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Gérer les pages
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab('testimonials')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Ajouter un témoignage
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab('faq')}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Ajouter une FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const GlobalSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres globaux</CardTitle>
          <CardDescription>Configuration générale du site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Nom du site</Label>
              <Input
                id="site_name"
                value={localSettings.site_name}
                disabled={false}
                onChange={(e) => {
                  console.log('📝 Site name onChange:', e.target.value, 'Loading:', loading, 'Focused:', isFieldFocused);
                  setLocalSettings({...localSettings, site_name: e.target.value});
                  setHasUnsavedChanges(true);
                }}
                onFocus={() => {
                  console.log('🎯 Site name focused');
                  setIsFieldFocused('site_name');
                }}
                onBlur={() => {
                  console.log('👋 Site name blurred');
                  setIsFieldFocused(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_tagline">Slogan</Label>
              <Input
                id="site_tagline"
                value={localSettings.site_tagline}
                onChange={(e) => {
                  setLocalSettings({...localSettings, site_tagline: e.target.value});
                  setHasUnsavedChanges(true);
                }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site_description">Description du site</Label>
            <Textarea
              id="site_description"
              value={localSettings.site_description}
              onChange={(e) => {
                setLocalSettings({...localSettings, site_description: e.target.value});
                setHasUnsavedChanges(true);
              }}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email_contact">Email de contact</Label>
              <Input
                id="email_contact"
                type="email"
                value={localSettings.email_contact}
                onChange={(e) => {
                  setLocalSettings({...localSettings, email_contact: e.target.value});
                  setHasUnsavedChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_contact">Téléphone de contact</Label>
              <Input
                id="phone_contact"
                value={localSettings.phone_contact}
                onChange={(e) => {
                  setLocalSettings({...localSettings, phone_contact: e.target.value});
                  setHasUnsavedChanges(true);
                }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={localSettings.address}
              onChange={(e) => {
                setLocalSettings({...localSettings, address: e.target.value});
                setHasUnsavedChanges(true);
              }}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="copyright_text">Texte de copyright</Label>
            <Input
              id="copyright_text"
              value={localSettings.copyright_text}
              onChange={(e) => {
                setLocalSettings({...localSettings, copyright_text: e.target.value});
                setHasUnsavedChanges(true);
              }}
            />
          </div>
          
          <Separator />
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setLocalSettings(globalSettings);
                setHasUnsavedChanges(false);
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={saveGlobalSettings}
              disabled={!hasUnsavedChanges}
              variant={hasUnsavedChanges ? "default" : "outline"}
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
              {hasUnsavedChanges && <Badge variant="secondary" className="ml-2">Modifié</Badge>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PagesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Pages du site</h3>
          <p className="text-sm text-muted-foreground">
            Gérer les pages et leur contenu
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle page
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <Card key={page.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{page.title}</CardTitle>
                {getStatusBadge(page.is_active ? 'published' : 'draft')}
              </div>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{page.content_blocks_count} blocs</span>
                <span>{new Date(page.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPage(page);
                    setActiveTab('content-blocks');
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const TestimonialsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Témoignages</h3>
          <p className="text-sm text-muted-foreground">
            Gérer les avis clients
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau témoignage
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{testimonial.client_name}</CardTitle>
                {getStatusBadge(testimonial.status)}
              </div>
              <CardDescription>{testimonial.client_role}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {testimonial.testimonial_text}
              </p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTestimonial(testimonial)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const FAQTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">FAQ</h3>
          <p className="text-sm text-muted-foreground">
            Questions fréquemment posées
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle FAQ
        </Button>
      </div>
      
      <div className="space-y-4">
        {faqItems.map((faq) => (
          <Card key={faq.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{faq.question}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(faq.status)}
                  {faq.is_featured && (
                    <Badge variant="outline">Mis en avant</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {faq.answer}
              </p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{faq.category}</span>
                  <span>{faq.views_count} vues</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFaq(faq)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const OffersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Offres</h3>
          <p className="text-sm text-muted-foreground">
            Gérer les produits et services
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle offre
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{offer.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(offer.status)}
                  {offer.is_featured && (
                    <Badge variant="outline">Mis en avant</Badge>
                  )}
                </div>
              </div>
              <CardDescription>{offer.short_description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">
                  {offer.is_free ? 'Gratuit' : `${offer.final_price} ${offer.currency}`}
                </span>
                {offer.discount_percentage > 0 && (
                  <Badge variant="destructive">
                    -{offer.discount_percentage}%
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {offer.description}
              </p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOffer(offer)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion de contenu</h1>
          <p className="text-muted-foreground">
            Gérez tout le contenu statique et éditorial du site
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {previewMode ? (
            <>
              <Button variant="outline" onClick={endPreviewMode}>
                <X className="h-4 w-4 mr-2" />
                Quitter l'aperçu
              </Button>
              <Button onClick={applyChanges}>
                <Save className="h-4 w-4 mr-2" />
                Appliquer les changements
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={startPreviewMode}>
              <Eye className="h-4 w-4 mr-2" />
              Mode aperçu
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="global-settings">Paramètres</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="testimonials">Témoignages</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="offers">Offres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="global-settings">
          <GlobalSettingsTab />
        </TabsContent>

        <TabsContent value="pages">
          <PagesTab />
        </TabsContent>

        <TabsContent value="testimonials">
          <TestimonialsTab />
        </TabsContent>

        <TabsContent value="faq">
          <FAQTab />
        </TabsContent>

        <TabsContent value="offers">
          <OffersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
