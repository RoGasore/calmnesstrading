import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';

interface ContentBlock {
  id: number;
  page_slug: string;
  block_key: string;
  title: string;
  content: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const FooterPage: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    loadFooterContent();
  }, []);

  const loadFooterContent = async () => {
    try {
      const response = await fetchWithAuth(`${API_URLS.CMS_PAGES}footer/content-blocks/`);
      if (response.ok) {
        const data = await response.json();
        setContentBlocks(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contenu:', error);
    }
  };

  const saveContent = async (blockId: number, content: string) => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_URLS.CMS_CONTENT_BLOCKS}${blockId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Contenu sauvegardé",
        });
        loadFooterContent();
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le contenu",
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
          <h1 className="text-3xl font-bold">Pied de Page</h1>
          <p className="text-muted-foreground">
            Gérez le contenu du pied de page et les liens rapides
          </p>
        </div>

        <div className="space-y-6">
          {contentBlocks.map((block) => (
            <Card key={block.id}>
              <CardHeader>
                <CardTitle>{block.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`content-${block.id}`}>Contenu</Label>
                    <Textarea
                      id={`content-${block.id}`}
                      value={block.content}
                      onChange={(e) => {
                        setContentBlocks(prev => 
                          prev.map(b => b.id === block.id ? {...b, content: e.target.value} : b)
                        );
                      }}
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={() => saveContent(block.id, block.content)}
                    disabled={loading}
                  >
                    {loading ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FooterPage;
