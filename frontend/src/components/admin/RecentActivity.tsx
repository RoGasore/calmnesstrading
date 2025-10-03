import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, User, MessageSquare, CreditCard, Settings, UserPlus, LogIn, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  type: string;
  message: string;
  user: string;
  email: string;
  timestamp: string;
  icon: string;
}

interface ActivityData {
  activities: Activity[];
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    date_joined: string;
    is_verified: boolean;
    is_active: boolean;
  }>;
}

interface RecentActivityProps {
  activityData?: ActivityData | null;
}

export function RecentActivity({ activityData: propsActivityData }: RecentActivityProps) {
  const [activityData, setActivityData] = useState<ActivityData | null>(propsActivityData || null);
  const [loading, setLoading] = useState(false); // Pas de chargement, on utilise les props
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
      case 'settings':
        return Settings;
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
      case 'review_submitted':
        return "text-purple-600";
      case 'payment_received':
        return "text-green-600";
      case 'payment_pending':
        return "text-yellow-600";
      case 'admin_action':
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  }, []);

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

  if (!activityData || activityData.activities.length === 0) {
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
        {activityData.activities.map((activity, index) => {
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
              <Badge variant="outline" className="text-xs">
                {activity.type.replace('_', ' ')}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}