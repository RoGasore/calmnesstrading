import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  X, 
  Send, 
  Mail, 
  Phone,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Icônes pour les canaux de support
const WhatsAppIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
  </svg>
);

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
}

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'chat'>('channels');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      sender: 'admin',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const supportChannels = [
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      link: 'https://wa.me/33123456789',
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      description: 'Réponse rapide sous 5 minutes'
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      link: 'https://t.me/calmnesstrading',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Support 24/7 disponible'
    },
    {
      name: 'Discord',
      icon: DiscordIcon,
      link: 'https://discord.gg/calmnesstrading',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Communauté active'
    },
    {
      name: 'Email',
      icon: Mail,
      link: 'mailto:support@calmnesstrading.com',
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'Réponse sous 24h'
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simuler une réponse de l'admin
    setTimeout(() => {
      const adminResponse: Message = {
        id: messages.length + 2,
        text: "Merci pour votre message ! Un membre de notre équipe vous répondra dans les plus brefs délais.",
        sender: 'admin',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, adminResponse]);
    }, 1500);

    toast({
      title: "Message envoyé",
      description: "Notre équipe vous répondra rapidement.",
    });
  };

  return (
    <>
      {/* Bouton flottant */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-[#D4AF37] hover:bg-[#C5A028] text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {unreadCount > 0 && !isOpen && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Widget de support */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-2xl z-50 border-2 border-[#D4AF37]">
          <CardHeader className="bg-gradient-to-r from-black to-gray-900 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Support Client</CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Nous sommes là pour vous aider
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/10 text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <Button
                variant={activeTab === 'channels' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('channels')}
                className={activeTab === 'channels' ? 'bg-[#D4AF37] text-black hover:bg-[#C5A028]' : 'text-white hover:bg-white/10'}
              >
                <Phone className="h-4 w-4 mr-2" />
                Canaux
              </Button>
              <Button
                variant={activeTab === 'chat' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('chat')}
                className={activeTab === 'chat' ? 'bg-[#D4AF37] text-black hover:bg-[#C5A028]' : 'text-white hover:bg-white/10'}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 max-h-96 overflow-y-auto">
            {activeTab === 'channels' ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Choisissez votre canal de communication préféré :
                </p>
                {supportChannels.map((channel) => (
                  <a
                    key={channel.name}
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg ${channel.bg} hover:scale-105 transition-transform cursor-pointer group`}
                  >
                    <div className={`${channel.color}`}>
                      <channel.icon />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${channel.color}`}>{channel.name}</p>
                      <p className="text-xs text-muted-foreground">{channel.description}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </a>
                ))}

                <div className="mt-6 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    <strong>Horaires d'ouverture :</strong><br />
                    Lun-Ven : 9h-18h (GMT+1)<br />
                    Sam : 10h-14h
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Messages */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-[#D4AF37] text-black'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-[#D4AF37] hover:bg-[#C5A028] text-black"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Connectez-vous pour une expérience personnalisée
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
