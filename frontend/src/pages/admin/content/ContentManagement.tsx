import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Settings, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ContentTable from './ContentTable';

const ContentManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
        <div className="bg-gradient-to-br from-background via-background to-accent/5">
          {/* Header avec navigation */}
          <div className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center space-x-4 mb-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="h-6 w-px bg-border hidden lg:block" />
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Gestion de Contenu
                </h1>
              </div>
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="text-center lg:text-left">
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Gérez tous les contenus du site depuis un seul endroit
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Sélecteur de vue avec style gold */}
                  
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-3 sm:px-6 py-6">
            <div className="max-w-7xl mx-auto">

              {/* Contenu en mode tableau uniquement */}
              <ContentTable />
            </div>
          </div>
        </div>
  );
};

export default ContentManagement;
