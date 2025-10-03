import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const FAQPage: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);

  useEffect(() => {
    loadFAQItems();
  }, []);

  const loadFAQItems = async () => {
    try {
      const response = await fetchWithAuth(API_URLS.CMS_FAQ);
      if (response.ok) {
        const data = await response.json();
        setFaqItems(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des FAQ:', error);
    }
  };

  const saveFAQItem = async (faqItem: FAQItem) => {
    setLoading(true);
    try {
      const url = faqItem.id 
        ? `${API_URLS.CMS_FAQ}${faqItem.id}/`
        : API_URLS.CMS_FAQ;
      
      const method = faqItem.id ? 'PUT' : 'POST';
      
      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqItem),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Question FAQ sauvegardée",
        });
        loadFAQItems();
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la question FAQ",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFAQItem = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question FAQ ?')) return;
    
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_URLS.CMS_FAQ}${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Question FAQ supprimée",
        });
        loadFAQItems();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la question FAQ",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Questions Fréquentes (FAQ)</h1>
          <p className="text-muted-foreground">
            Gérez les questions et réponses fréquentes
          </p>
        </div>

        <div className="space-y-6">
          {faqItems.map((faqItem) => (
            <Card key={faqItem.id}>
              <CardHeader>
                <CardTitle>Question #{faqItem.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${faqItem.id}`}>Question</Label>
                    <Input
                      id={`question-${faqItem.id}`}
                      value={faqItem.question}
                      onChange={(e) => {
                        setFaqItems(prev => 
                          prev.map(f => f.id === faqItem.id ? {...f, question: e.target.value} : f)
                        );
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`answer-${faqItem.id}`}>Réponse</Label>
                    <Textarea
                      id={`answer-${faqItem.id}`}
                      value={faqItem.answer}
                      onChange={(e) => {
                        setFaqItems(prev => 
                          prev.map(f => f.id === faqItem.id ? {...f, answer: e.target.value} : f)
                        );
                      }}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`category-${faqItem.id}`}>Catégorie</Label>
                      <Input
                        id={`category-${faqItem.id}`}
                        value={faqItem.category}
                        onChange={(e) => {
                          setFaqItems(prev => 
                            prev.map(f => f.id === faqItem.id ? {...f, category: e.target.value} : f)
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`order-${faqItem.id}`}>Ordre d'affichage</Label>
                      <Input
                        id={`order-${faqItem.id}`}
                        type="number"
                        value={faqItem.order_index}
                        onChange={(e) => {
                          setFaqItems(prev => 
                            prev.map(f => f.id === faqItem.id ? {...f, order_index: parseInt(e.target.value) || 0} : f)
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      onClick={() => saveFAQItem(faqItem)}
                      disabled={loading}
                    >
                      {loading ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => deleteFAQItem(faqItem.id)}
                      disabled={loading}
                    >
                      Supprimer
                    </Button>
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

export default FAQPage;
