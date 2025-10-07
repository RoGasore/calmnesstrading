import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  TrendingUp,
  CreditCard,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  read_at: string | null;
}

export function UserNotifications() {
  const { fetchWithAuth } = useAuth();
  const { unreadCount, refresh } = useNotifications();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'read'>('all');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? `${API_BASE}/api/auth/user/notifications/`
        : `${API_BASE}/api/auth/user/notifications/?status=${filter}`;
        
      const response = await fetchWithAuth(url);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/auth/user/notifications/${notificationId}/read/`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        fetchNotifications();
        refresh(); // Rafraîchir le compteur
        toast({
          title: "Notification marquée comme lue",
          description: "La notification a été marquée comme lue.",
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/auth/user/notifications/read-all/`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        fetchNotifications();
        refresh();
        toast({
          title: "Toutes les notifications ont été lues",
          description: "Toutes vos notifications ont été marquées comme lues.",
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'subscription_expiring':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'subscription_expired':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'payment_received':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'payment_pending':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'subscription_expiring':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'subscription_expired':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'payment_received':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'payment_pending':
        return 'bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 sm:h-8 sm:w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gérez vos notifications et alertes
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" className="w-full sm:w-auto" size="sm">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Tout marquer comme lu</span>
            <span className="sm:hidden">Tout lire</span>
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Toutes
        </Button>
        <Button 
          variant={filter === 'sent' ? 'default' : 'outline'}
          onClick={() => setFilter('sent')}
          size="sm"
        >
          Non lues
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-white text-primary">
              {unreadCount}
            </Badge>
          )}
        </Button>
        <Button 
          variant={filter === 'read' ? 'default' : 'outline'}
          onClick={() => setFilter('read')}
          size="sm"
        >
          Lues
        </Button>
      </div>

      {/* Liste des notifications */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
            <p className="text-muted-foreground text-center">
              {filter === 'sent' 
                ? 'Vous n\'avez aucune notification non lue'
                : filter === 'read'
                ? 'Vous n\'avez aucune notification lue'
                : 'Vous n\'avez encore reçu aucune notification'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`${
                notification.status === 'sent' 
                  ? 'border-l-4 border-l-primary' 
                  : 'opacity-60'
              } hover:shadow-lg transition-all`}
            >
              <CardHeader className={getNotificationBg(notification.type)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">
                          {notification.title}
                        </CardTitle>
                        {notification.status === 'sent' && (
                          <Badge variant="default" className="text-xs">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {notification.status === 'sent' && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Marquer lu
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm">{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

