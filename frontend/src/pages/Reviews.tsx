import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MessageSquare, Send, Calendar, Search, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URLS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Review {
  id: number;
  author_name: string;
  author_email: string;
  author_phone?: string;
  service_name: string;
  service_type: string;
  title: string;
  content: string;
  rating: number;
  status: string;
  is_public: boolean;
  created_at: string;
  approved_at?: string;
}

interface Service {
  id: number;
  name: string;
  type: string;
}

interface ReviewForm {
  author_name: string;
  author_email: string;
  service_name: string;
  service_type: string;
  content: string;
  rating: number;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ReviewForm>({
    author_name: '',
    author_email: '',
    service_name: 'Tous nos services',
    service_type: 'all',
    content: '',
    rating: 5
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadReviews();
    loadServices();
  }, []);

  // Fonction pour vérifier si un email existe déjà (utilisateur inscrit)
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/auth/check-email/?email=${encodeURIComponent(email)}`);
      return response.ok;
    } catch {
      return false;
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(API_URLS.REVIEWS_PUBLIC);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch(API_URLS.SERVICES_FOR_REVIEWS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // L'API retourne directement un array de services
      if (Array.isArray(data)) {
      setServices(data);
      } else {
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      // Fallback vers les services hardcodés si l'API échoue
      setServices([
        { id: 1, name: 'Formation Trading', type: 'Formation' },
        { id: 2, name: 'Signaux Trading', type: 'Signal' },
        { id: 3, name: 'Gestion de Compte', type: 'Gestion' },
        { id: 4, name: 'Analyse Technique', type: 'Analyse' },
        { id: 5, name: 'Support Client', type: 'Support' }
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'rating' ? parseInt(value) : value)
    }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedService = services.find(service => service.name === e.target.value);
      setFormData(prev => ({
        ...prev,
      service_name: e.target.value,
      service_type: selectedService ? selectedService.type : 'all'
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!formData.content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le contenu de votre avis.",
        variant: "destructive",
      });
      return;
    }

    // Validation spécifique selon le statut utilisateur
    if (!isAuthenticated && !formData.author_email.trim()) {
      toast({
        title: "Erreur",
        description: "L'adresse email est obligatoire pour soumettre un avis.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Préparer les données selon le statut utilisateur
      const reviewData = {
        ...formData,
        // Pour les utilisateurs connectés, utiliser leurs informations
        author_name: isAuthenticated && user ? (user.first_name || user.username || '') : formData.author_name,
        author_email: isAuthenticated && user ? user.email : formData.author_email,
        // Ajouter des métadonnées pour le backend
        user_status: isAuthenticated ? 'authenticated' : 'unauthenticated',
        user_id: isAuthenticated && user ? user.id : null,
        // Préférences email activées par défaut côté backend
        email_notifications: true,
        newsletter_subscription: true,
      };

      const response = await fetch(API_URLS.REVIEWS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Messages de confirmation selon le statut utilisateur
      if (isAuthenticated) {
      toast({
          title: "Succès !",
          description: "Votre avis a été soumis avec succès. Merci pour votre retour !",
        });
      } else {
        // Vérifier si l'utilisateur est inscrit (email existe)
        const emailExists = await checkEmailExists(formData.author_email);
        
        if (emailExists) {
          toast({
            title: "Succès !",
            description: "Votre avis a été soumis. Un email de confirmation vous a été envoyé. Connectez-vous pour consulter votre dashboard.",
          });
        } else {
          toast({
            title: "Succès !",
            description: "Votre avis a été soumis. Un email de confirmation vous a été envoyé. Rejoignez notre communauté pour profiter de nos services !",
          });
        }
      }

      // Réinitialiser le formulaire
      setFormData({
        author_name: '',
        author_email: '',
        service_name: 'Tous nos services',
        service_type: 'all',
        content: '',
        rating: 5
      });
      
      setIsDialogOpen(false);
      setSubmitted(true);
      
      // Recharger les avis
      await loadReviews();
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre avis. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
            <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
              }`}
            />
    ));
  };

  const filteredReviews = reviews.filter(review =>
    review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.service_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleJoinServices = () => {
    navigate('/register');
  };

  const handleGoToDashboard = () => {
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
      {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Avis Clients
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
                Découvrez ce que pensent nos clients de nos services
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Rechercher dans les avis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>

              {/* Bouton Laisser un avis */}
              <div className="mt-8">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="hero" className="px-8 py-4 text-lg">
                      <MessageSquare className="w-5 h-5 mr-2" />
              Laisser un avis
            </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="text-center pb-6">
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Partagez votre expérience
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        Votre avis nous aide à améliorer nos services
                      </p>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Email - seulement si pas connecté */}
                      {!isAuthenticated && (
                        <div className="space-y-2">
                          <Label htmlFor="author_email" className="flex items-center space-x-2 text-sm">
                            <Mail className="w-3 h-3" />
                            <span>Adresse email *</span>
                          </Label>
                        <Input
                          id="author_email"
                            name="author_email"
                          type="email"
                          value={formData.author_email}
                            onChange={handleInputChange}
                            required
                            className="text-sm py-2.5"
                          placeholder="votre@email.com"
                          />
                          <div className="flex items-start space-x-2 p-2.5 bg-blue-50/50 rounded-md border border-blue-200/50">
                            <AlertCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-700">
                              <p className="font-medium">Email obligatoire</p>
                              <p>Un email de confirmation vous sera envoyé.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Utilisateur connecté - afficher ses informations */}
                      {isAuthenticated && (
                        <div className="flex items-center space-x-3 p-3 bg-green-50/50 rounded-lg border border-green-200/50">
                          <div className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-green-800 truncate">
                              Connecté en tant que {user?.first_name || user?.username}
                            </p>
                            <p className="text-xs text-green-700 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Section Service et Évaluation */}
                      <div className="space-y-3">
                        
                        <div className="space-y-2">
                          <Label htmlFor="service_name" className="text-sm">Service concerné</Label>
                          <select
                            id="service_name"
                            value={formData.service_name}
                            onChange={handleServiceChange}
                            className="w-full px-3 py-2.5 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          >
                            <option value="Tous nos services">Tous nos services</option>
                            {services.map((service) => (
                              <option key={service.id} value={service.name}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Note */}
                        <div className="space-y-2">
                          <Label className="text-sm">Note *</Label>
                          <div className="flex space-x-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleInputChange({ target: { name: 'rating', value: i + 1 } } as any)}
                                className="focus:outline-none transform transition-transform hover:scale-105"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    i < formData.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">
                            {formData.rating === 1 && "Très décevant"}
                            {formData.rating === 2 && "Décevant"}
                            {formData.rating === 3 && "Correct"}
                            {formData.rating === 4 && "Très bien"}
                            {formData.rating === 5 && "Excellent"}
                          </p>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="space-y-2">
                        <Label htmlFor="content" className="text-sm">Votre avis *</Label>
                        <Textarea
                          id="content"
                          name="content"
                          value={formData.content}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className="text-sm py-2.5 resize-none"
                          placeholder="Décrivez votre expérience avec nos services..."
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.content.length} caractères
                        </p>
                      </div>


                      <div className="pt-2">
                      <Button
                        type="submit"
                          size="lg"
                          variant="hero"
                          className="w-full py-3 text-sm font-semibold"
                        disabled={submitting}
                      >
                        {submitting ? (
                            <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Envoi en cours...
                            </>
                        ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Publier mon avis
                            </>
                        )}
                      </Button>
                    </div>
                  </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {submitted && (
                <Card className="mb-8 border-green-200 bg-green-50">
                  <CardContent className="text-center py-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                      Merci pour votre avis !
              </h3>
                    {isAuthenticated ? (
                      <p className="text-green-600 mb-6">
                        Votre avis a été soumis avec succès. Merci pour votre retour !
                      </p>
                    ) : (
                      <p className="text-green-600 mb-6">
                        Votre avis a été soumis avec succès. Un email de confirmation vous a été envoyé.
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {isAuthenticated ? (
                        <Button onClick={handleGoToDashboard} variant="hero" size="lg">
                          Voir mon dashboard
                        </Button>
          ) : (
            <>
                          <Button onClick={() => navigate('/login')} variant="hero" size="lg">
                            Se connecter
                          </Button>
                          <Button onClick={handleJoinServices} variant="outline" size="lg">
                            Rejoindre nos services
                          </Button>
                        </>
                      )}
                </div>
                  </CardContent>
                </Card>
              )}

              {filteredReviews.length === 0 && searchTerm ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      Aucun avis ne correspond à votre recherche "{searchTerm}"
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSearchTerm('')}
                    >
                      Voir tous les avis
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.filter(review => review.is_public).map((review, index) => (
                    <Card key={review.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleExpanded(review.id)}
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">{review.service_name}</span>
                        </div>
                              <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                            </div>
                            <CardTitle className="text-lg">
                              {review.author_name}
                            </CardTitle>
                          </div>
                          <Button variant="ghost" size="sm" className="p-1">
                            {expandedItems.has(review.id) ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </Button>
                      </div>
                    </CardHeader>
                      {expandedItems.has(review.id) && (
                        <CardContent className="pt-0">
                          <div className="border-t pt-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {review.content}
                        </p>
                      </div>
                    </CardContent>
                      )}
                  </Card>
                ))}
              </div>
              )}
              
              {filteredReviews.filter(review => review.is_public).length === 0 && !searchTerm && (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-6">
                      Aucun avis public disponible pour le moment
                    </p>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="hero" size="lg">
                          Laisser le premier avis
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                Vous avez une expérience à partager ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Votre avis compte pour nous et pour la communauté. Partagez votre expérience avec nos services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="hero">
                      Laisser un avis
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Button size="lg" variant="outline">
                  Rejoindre notre communauté
                </Button>
              </div>
            </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;