import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface CommunityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  telegramUrl?: string;
  discordUrl?: string;
}

const CommunityPopup: React.FC<CommunityPopupProps> = ({
  isOpen,
  onClose,
  telegramUrl = 'https://t.me/calmnesstrading',
  discordUrl = 'https://discord.gg/calmnesstrading'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            Rejoignez notre communauté
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Rejoignez une communauté de traders passionnés pour échanger, apprendre et partager vos expériences
          </p>
          
          {/* Desktop Layout - Icons side by side */}
          <div className="hidden md:flex justify-center space-x-8">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-full w-24 h-24 transition-all duration-300 hover:scale-105"
              onClick={() => window.open(telegramUrl, '_blank')}
            >
              <i className="bi bi-telegram text-4xl"></i>
            </Button>
            
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-full w-24 h-24 transition-all duration-300 hover:scale-105"
              onClick={() => window.open(discordUrl, '_blank')}
            >
              <i className="bi bi-discord text-4xl"></i>
            </Button>
          </div>

          {/* Mobile Layout - Icons side by side */}
          <div className="md:hidden flex justify-center space-x-8">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-full w-20 h-20 transition-all duration-300 hover:scale-105"
              onClick={() => window.open(telegramUrl, '_blank')}
            >
              <i className="bi bi-telegram text-3xl"></i>
            </Button>
            
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-full w-20 h-20 transition-all duration-300 hover:scale-105"
              onClick={() => window.open(discordUrl, '_blank')}
            >
              <i className="bi bi-discord text-3xl"></i>
            </Button>
          </div>
          
          <div className="text-center">
            <Button variant="outline" onClick={onClose} className="w-full">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityPopup;
