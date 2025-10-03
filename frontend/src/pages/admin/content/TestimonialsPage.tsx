import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';

interface Testimonial {
  id: number;
  author_name: string;
  author_title?: string;
  author_photo?: string;
  rating: number;
  content: string;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

const TestimonialsPage: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_TESTIMONIALS);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des témoignages:', error);
    }
  };

  const saveTestimonial = async (testimonial: Testimonial) => {
    setLoading(true);
    try {
      const url = testimonial.id 
        ? `${API_URLS.CMS_TESTIMONIALS}${testimonial.id}/`
        : API_URLS.CMS_TESTIMONIALS;
      
      const method = testimonial.id ? 'PUT' : 'POST';
      
      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonial),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Témoignage sauvegardé",
        });
        loadTestimonials();
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le témoignage",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) return;
    
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_URLS.CMS_TESTIMONIALS}${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Témoignage supprimé",
        });
        loadTestimonials();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le témoignage",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Témoignages</h1>
          <p className="text-muted-foreground">
            Gérez les témoignages et avis clients
          </p>
        </div>

        <div className="space-y-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardHeader>
                <CardTitle>{testimonial.author_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${testimonial.id}`}>Nom de l'auteur</Label>
                      <Input
                        id={`name-${testimonial.id}`}
                        value={testimonial.author_name}
                        onChange={(e) => {
                          setTestimonials(prev => 
                            prev.map(t => t.id === testimonial.id ? {...t, author_name: e.target.value} : t)
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`title-${testimonial.id}`}>Titre de l'auteur</Label>
                      <Input
                        id={`title-${testimonial.id}`}
                        value={testimonial.author_title || ''}
                        onChange={(e) => {
                          setTestimonials(prev => 
                            prev.map(t => t.id === testimonial.id ? {...t, author_title: e.target.value} : t)
                          );
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`content-${testimonial.id}`}>Témoignage</Label>
                    <Textarea
                      id={`content-${testimonial.id}`}
                      value={testimonial.content}
                      onChange={(e) => {
                        setTestimonials(prev => 
                          prev.map(t => t.id === testimonial.id ? {...t, content: e.target.value} : t)
                        );
                      }}
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => saveTestimonial(testimonial)}
                        disabled={loading}
                      >
                        {loading ? "Sauvegarde..." : "Sauvegarder"}
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => deleteTestimonial(testimonial.id)}
                        disabled={loading}
                      >
                        Supprimer
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Note: {testimonial.rating}/5
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsPage;
