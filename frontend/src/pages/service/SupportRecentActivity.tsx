import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, User, MessageSquare, CreditCard, CheckCircle, UserPlus, LogIn, AlertCircle, Phone, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  type: string;
  message: string;
  user: string;
  email: string;
  timestamp: string;
  icon: string;
  status?: string;
}

interface ActivityData {
  activities: Activity[];
  recent_payments: Array<{
    id: number;
    user: {
      name: string;
      email: string;
    };
    offer: {
      name: string;
    };
    amount: string;
    currency: string;
    status: string;
    created_at: string;
  }>;
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    date_joined: string;
    is_verified: boolean;
    is_active: boolean;
  }>;
}

interface SupportRecentActivityProps {
  activityData?: ActivityData | null;
}

export function SupportRecentActivity({ activityData: propsActivityData }: SupportRecentActivityProps) {
  const [activityData, setActivityData] = useState<ActivityData | null>(propsActivityData || null);
  const [loading, setLoading] = useState(false);
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  // Mettre à jour activityData quand les props changent
  useEffect(() => {
    if (propsActivityData) {
      setActivityData(propsActivityData);
    }
  }, [propsActivityData]);

  const getTimeAgo = useCallback((timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }, []);

  const getIcon = useCallback((iconName: string) => {
    switch (iconName) {
      case 'user-plus':
        return UserPlus;
      case 'log-in':
        return LogIn;
      case 'message-square':
        return MessageSquare;
      case 'credit-card':
        return CreditCard;
      case 'check-circle':
        return CheckCircle;
      case 'alert-circle':
        return AlertCircle;
      case 'phone':
        return Phone;
      case 'mail':
        return Mail;
      default:
        return User;
    }
  }, []);

  const getColor = useCallback((type: string) => {
    switch (type) {
      case 'user_registered':
        return "text-blue-600";
      case 'user_login':
        return "text-green-600";
      case 'payment_received':
        return "text-green-600";
      case 'payment_pending':
        return "text-yellow-600";
      case 'payment_submitted':
        return "text-blue-600";
      case 'support_ticket':
        return "text-orange-600";
      case 'message_received':
        return "text-purple-600";
      case 'invoice_generated':
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">En attente</Badge>;
      case 'transaction_submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">À vérifier</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Confirmé</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Générer des activités récentes basées sur les données disponibles
  const generateRecentActivities = () => {
    const activities: Activity[] = [];
    
    if (activityData?.recent_payments) {
      activityData.recent_payments.forEach(payment => {
        activities.push({
          type: payment.status === 'transaction_submitted' ? 'payment_submitted' : 'payment_pending',
          message: `Paiement ${payment.status === 'transaction_submitted' ? 'soumis' : 'en attente'}: ${payment.offer.name}`,
          user: payment.user.name,
          email: payment.user.email,
          timestamp: payment.created_at,
          icon: payment.status === 'transaction_submitted' ? 'alert-circle' : 'credit-card',
          status: payment.status
        });
      });
    }
    
    if (activityData?.recent_users) {
      activityData.recent_users.forEach(user => {
        activities.push({
          type: 'user_registered',
          message: `Nouvel utilisateur inscrit: ${user.name}`,
          user: user.name,
          email: user.email,
          timestamp: user.date_joined,
          icon: 'user-plus'
        });
      });
    }
    
    // Ajouter quelques activités de support simulées
    activities.push({
      type: 'message_received',
      message: 'Nouveau message de support reçu',
      user: 'Client',
      email: 'client@example.com',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Il y a 30 minutes
      icon: 'message-square'
    });
    
    activities.push({
      type: 'invoice_generated',
      message: 'Facture générée et envoyée',
      user: 'Système',
      email: '',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2 heures
      icon: 'check-circle'
    });
    
    // Trier par timestamp (plus récent en premier)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const recentActivities = generateRecentActivities();

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune activité récente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivities.slice(0, 8).map((activity, index) => {
          const IconComponent = getIcon(activity.icon);
          const color = getColor(activity.type);
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-muted ${color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {activity.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activity.status && getStatusBadge(activity.status)}
                <Badge variant="outline" className="text-xs">
                  {activity.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
