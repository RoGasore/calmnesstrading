import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_URLS } from '@/config/api';
import { Button } from '@/components/ui/button';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  order: number;
  status: string;
}

const FAQ: React.FC = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadFAQItems();
  }, []);

  const loadFAQItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URLS.FAQ_PUBLIC);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.faq_items || []);
      
      // Les éléments sont déjà filtrés par le backend (status='published')
      // Il suffit de les trier par ordre
      const sortedItems = items.sort((a: FAQItem, b: FAQItem) => a.order - b.order);
      
      setFaqItems(sortedItems);
    } catch (error) {
      console.error('Erreur lors du chargement des FAQ:', error);
      setFaqItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
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
                Questions Fréquemment Posées
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Trouvez rapidement les réponses à vos questions
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Rechercher dans les FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {filteredItems.length === 0 && searchTerm ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      Aucune question ne correspond à votre recherche "{searchTerm}"
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSearchTerm('')}
                    >
                      Voir toutes les questions
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item, index) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleExpanded(item.id)}
                        >
                          <CardTitle className="text-lg pr-8">
                            {item.question}
                          </CardTitle>
                          <Button variant="ghost" size="sm" className="p-1">
                            {expandedItems.has(item.id) ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      {expandedItems.has(item.id) && (
                        <CardContent className="pt-0">
                          <div className="border-t pt-4">
                            <p className="text-muted-foreground leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
              
              {filteredItems.length === 0 && !searchTerm && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      Aucune question FAQ disponible pour le moment
                    </p>
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
                Vous ne trouvez pas votre réponse ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Notre équipe est là pour vous aider. Contactez-nous directement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="hero">
                  Nous contacter
                </Button>
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

export default FAQ;