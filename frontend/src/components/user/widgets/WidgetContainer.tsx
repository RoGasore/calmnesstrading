import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  X,
  GraduationCap,
  Zap,
  Bell,
  CreditCard,
  Clock,
  TrendingUp,
  Target,
  Award,
  DollarSign,
  Calendar,
  CheckCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";

interface Widget {
  id: string;
  type: string;
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  color: string;
  description?: string;
}

interface WidgetContainerProps {
  className?: string;
  dashboardData?: any;
}

const WIDGET_TYPES = {
  // Widgets formations
  'formations_active': {
    title: 'Formations Actives',
    icon: GraduationCap,
    color: 'text-blue-600',
    description: 'Formations en cours'
  },
  'formations_completed': {
    title: 'Formations Terminées',
    icon: Award,
    color: 'text-green-600',
    description: 'Formations complétées'
  },
  'formations_upcoming': {
    title: 'Formations À Venir',
    icon: Clock,
    color: 'text-orange-600',
    description: 'Formations planifiées'
  },
  
  // Widgets signaux
  'signaux_active': {
    title: 'Signaux Actifs',
    icon: Zap,
    color: 'text-yellow-600',
    description: 'Signaux de trading actifs'
  },
  'signaux_profit': {
    title: 'Profit Total',
    icon: DollarSign,
    color: 'text-green-600',
    description: 'Profit cumulé'
  },
  'signaux_winrate': {
    title: 'Win Rate',
    icon: Target,
    color: 'text-blue-600',
    description: 'Taux de réussite'
  },
  
  // Widgets notifications & abonnements
  'notifications_unread': {
    title: 'Notifications',
    icon: Bell,
    color: 'text-red-600',
    description: 'Notifications non lues'
  },
  'subscriptions_active': {
    title: 'Abonnements Actifs',
    icon: CheckCircle,
    color: 'text-green-600',
    description: 'Abonnements en cours'
  },
  'subscription_days_left': {
    title: 'Jours Restants',
    icon: Clock,
    color: 'text-orange-600',
    description: 'Avant expiration'
  },
  
  // Widgets paiements
  'payments_total': {
    title: 'Total Investi',
    icon: CreditCard,
    color: 'text-purple-600',
    description: 'Montant total dépensé'
  },
  'payments_month': {
    title: 'Ce Mois',
    icon: Calendar,
    color: 'text-blue-600',
    description: 'Dépenses du mois'
  }
};

const DEFAULT_WIDGETS = [
  'formations_active',
  'signaux_active',
  'notifications_unread',
  'subscriptions_active'
];

export function WidgetContainer({ className = "", dashboardData }: WidgetContainerProps) {
  const { fetchWithAuth } = useAuth();
  const { unreadCount } = useNotifications();
  const { toast } = useToast();
  
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadWidgets = () => {
    const savedWidgets = localStorage.getItem('user_widgets');
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      // Widgets par défaut
      setWidgets(DEFAULT_WIDGETS.map(id => ({
        id,
        type: id,
        title: WIDGET_TYPES[id as keyof typeof WIDGET_TYPES].title,
        value: 0,
        icon: WIDGET_TYPES[id as keyof typeof WIDGET_TYPES].icon,
        color: WIDGET_TYPES[id as keyof typeof WIDGET_TYPES].color,
        description: WIDGET_TYPES[id as keyof typeof WIDGET_TYPES].description
      })));
    }
  };

  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem('user_widgets', JSON.stringify(newWidgets));
  };

  useEffect(() => {
    loadWidgets();
  }, []);

  const getWidgetValue = useCallback((type: string): { value: string | number; change?: string } => {
    if (!dashboardData) {
      return { value: 0 };
    }

    switch (type) {
      case 'formations_active':
        return { 
          value: dashboardData.stats?.formations_actives || 0,
          change: 'en cours'
        };
      case 'formations_completed':
        return { 
          value: dashboardData.stats?.formations_completees || 0,
          change: 'terminées'
        };
      case 'formations_upcoming':
        const upcomingCount = dashboardData.formations?.filter((f: any) => f.status === 'upcoming')?.length || 0;
        return { 
          value: upcomingCount,
          change: 'à venir'
        };
      case 'signaux_active':
        return { 
          value: dashboardData.stats?.signaux_actifs || 0,
          change: 'signaux en cours'
        };
      case 'signaux_profit':
        return { 
          value: `${dashboardData.stats?.profit_total || 0}€`,
          change: 'profit cumulé'
        };
      case 'signaux_winrate':
        return { 
          value: `${dashboardData.stats?.win_rate || 0}%`,
          change: 'taux de réussite'
        };
      case 'notifications_unread':
        return { 
          value: unreadCount,
          change: unreadCount > 1 ? 'non lues' : 'non lue'
        };
      case 'subscriptions_active':
        return { 
          value: dashboardData.active_subscriptions?.length || 0,
          change: 'abonnements actifs'
        };
      case 'subscription_days_left':
        const subscriptions = dashboardData.active_subscriptions || [];
        if (subscriptions.length === 0) return { value: 0, change: 'aucun abonnement' };
        const nearestExpiry = Math.min(...subscriptions.map((s: any) => s.days_remaining || 0));
        return { 
          value: nearestExpiry,
          change: nearestExpiry > 1 ? 'jours restants' : 'jour restant'
        };
      case 'payments_total':
        return { 
          value: `${dashboardData.stats?.total_spent?.toFixed(2) || 0}€`,
          change: 'total investi'
        };
      case 'payments_month':
        // Calculer les paiements du mois en cours
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthPayments = dashboardData.recent_payments?.filter((p: any) => {
          const date = new Date(p.paid_at);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }) || [];
        const monthTotal = monthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        return { 
          value: `${monthTotal.toFixed(2)}€`,
          change: 'ce mois'
        };
      default:
        return { value: 0 };
    }
  }, [dashboardData, unreadCount]);

  const addWidget = (type: string) => {
    const widgetConfig = WIDGET_TYPES[type as keyof typeof WIDGET_TYPES];
    const { value, change } = getWidgetValue(type);
    
    const newWidget: Widget = {
      id: `${type}_${Date.now()}`,
      type,
      title: widgetConfig.title,
      value,
      change,
      icon: widgetConfig.icon,
      color: widgetConfig.color,
      description: widgetConfig.description
    };

    const newWidgets = [...widgets, newWidget];
    saveWidgets(newWidgets);
    setAddWidgetOpen(false);
    
    toast({
      title: "Widget ajouté",
      description: `${widgetConfig.title} a été ajouté à votre tableau de bord.`,
    });
  };

  const removeWidget = (widgetId: string) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    saveWidgets(newWidgets);
    
    toast({
      title: "Widget supprimé",
      description: "Le widget a été retiré de votre tableau de bord.",
    });
  };

  const availableWidgets = useMemo(() => {
    const usedTypes = widgets.map(w => w.type);
    return Object.keys(WIDGET_TYPES).filter(type => !usedTypes.includes(type));
  }, [widgets]);

  const renderedWidgets = useMemo(() => {
    return widgets.map((widget) => {
      const config = WIDGET_TYPES[widget.type as keyof typeof WIDGET_TYPES];
      const IconComponent = config.icon;
      const { value, change } = getWidgetValue(widget.type);
      
      return {
        ...widget,
        config,
        IconComponent,
        value,
        change
      };
    });
  }, [widgets, dashboardData, unreadCount]);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {renderedWidgets.map((widget) => {
          const { value, change, IconComponent } = widget;
          
          return (
            <Card key={widget.id} className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-6 w-6 p-0"
                onClick={() => removeWidget(widget.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {widget.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${widget.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {change}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {/* Bouton d'ajout */}
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setAddWidgetOpen(true)}>
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[120px]">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Ajouter un widget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialog d'ajout de widget */}
      <Dialog open={addWidgetOpen} onOpenChange={setAddWidgetOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un widget</DialogTitle>
            <DialogDescription>
              Choisissez un widget à ajouter à votre tableau de bord
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {availableWidgets.map((type) => {
              const config = WIDGET_TYPES[type as keyof typeof WIDGET_TYPES];
              const IconComponent = config.icon;
              const { value } = getWidgetValue(type);
              
              return (
                <Card 
                  key={type} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addWidget(type)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {config.title}
                    </CardTitle>
                    <IconComponent className={`h-4 w-4 ${config.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold mb-1">{value}</div>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {availableWidgets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tous les widgets disponibles sont déjà ajoutés
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

