import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  X, 
  Settings, 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  LogIn, 
  Calendar,
  Clock,
  CheckCircle,
  DollarSign,
  CreditCard,
  TrendingUp,
  Target,
  Star,
  Eye,
  MessageSquare
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/contexts/PaymentContext";
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
  statsData?: any;
  adminDashboard?: any;
}

const WIDGET_TYPES = {
  // Widgets utilisateurs essentiels
  'users_total': {
    title: 'Utilisateurs Total',
    icon: Users,
    color: 'text-blue-600',
    description: 'Nombre total d\'utilisateurs inscrits'
  },
  'users_active': {
    title: 'Utilisateurs Actifs',
    icon: UserCheck,
    color: 'text-green-600',
    description: 'Utilisateurs avec compte actif'
  },
  'users_new_today': {
    title: 'Nouveaux Aujourd\'hui',
    icon: Calendar,
    color: 'text-orange-600',
    description: 'Inscriptions du jour'
  },
  
  // Widgets paiements
  'payments_pending': {
    title: 'Paiements en Attente',
    icon: Clock,
    color: 'text-yellow-600',
    description: 'En attente de validation'
  },
  'payments_completed': {
    title: 'Paiements Validés',
    icon: CheckCircle,
    color: 'text-green-600',
    description: 'Total des paiements validés'
  },
  'revenue_month': {
    title: 'Revenu ce Mois',
    icon: DollarSign,
    color: 'text-blue-600',
    description: 'Revenus du mois en cours'
  },
  'subscriptions_active': {
    title: 'Abonnements Actifs',
    icon: Users,
    color: 'text-purple-600',
    description: 'Utilisateurs avec abonnement actif'
  },
  
  // Widgets performance
  'conversion_rate': {
    title: 'Taux de Conversion',
    icon: TrendingUp,
    color: 'text-purple-600',
    description: 'Pourcentage de conversion'
  },
  'retention_rate': {
    title: 'Taux de Rétention',
    icon: Target,
    color: 'text-green-600',
    description: 'Pourcentage d\'utilisateurs actifs'
  }
};

const DEFAULT_WIDGETS = [
  'users_total',
  'users_active', 
  'payments_pending',
  'revenue_month'
];

export function WidgetContainer({ className = "", statsData: propsStatsData, adminDashboard: propsAdminDashboard }: WidgetContainerProps) {
  const { fetchWithAuth } = useAuth();
  const { adminDashboard: contextAdminDashboard, fetchAdminDashboard } = usePayment();
  const { toast } = useToast();
  
  // Utiliser les props si disponibles, sinon le contexte
  const adminDashboard = propsAdminDashboard || contextAdminDashboard;
  
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Pas de chargement, on utilise les props
  const [statsData, setStatsData] = useState<any>(propsStatsData);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const loadWidgets = () => {
    const savedWidgets = localStorage.getItem('admin_widgets');
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
    localStorage.setItem('admin_widgets', JSON.stringify(newWidgets));
  };

  useEffect(() => {
    loadWidgets();
  }, []); // Se déclenche une seule fois au montage
  
  // Mettre à jour statsData quand les props changent
  useEffect(() => {
    if (propsStatsData) {
      setStatsData(propsStatsData);
    }
  }, [propsStatsData]);

  const getWidgetValue = useCallback((type: string): { value: string | number; change?: string } => {
    if (!statsData || !adminDashboard) {
      return { value: 0 };
    }

    switch (type) {
      case 'users_total':
        return { 
          value: statsData.users.total.toLocaleString(),
          change: `+${statsData.users.new_this_week} cette semaine`
        };
      case 'users_active':
        return { 
          value: statsData.users.active.toLocaleString(),
          change: `${Math.round((statsData.users.active / statsData.users.total) * 100)}% du total`
        };
      case 'users_new_today':
        return { 
          value: statsData.users.new_today.toLocaleString(),
          change: 'Inscriptions du jour'
        };
      case 'payments_pending':
        return { 
          value: adminDashboard.pending_payments_count || 0,
          change: 'En attente de validation'
        };
      case 'payments_completed':
        return { 
          value: adminDashboard.payment_history?.length || 0,
          change: 'Total validés'
        };
      case 'revenue_month':
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthRevenue = adminDashboard.payment_history
          ?.filter((p: any) => {
            const date = new Date(p.created_at);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          ?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;
        return { 
          value: `$${monthRevenue.toFixed(2)}`,
          change: 'Ce mois'
        };
      case 'subscriptions_active':
        return { 
          value: adminDashboard.active_subscriptions_count || 0,
          change: 'Utilisateurs actifs'
        };
      case 'conversion_rate':
        const totalUsers = statsData.users.total || 1;
        const totalPayments = adminDashboard.payment_history?.length || 0;
        const rate = Math.round((totalPayments / totalUsers) * 100);
        return { 
          value: `${rate}%`,
          change: 'Taux de conversion'
        };
      case 'retention_rate':
        const activeUsers = statsData.users.active || 0;
        const totalUsersForRetention = statsData.users.total || 1;
        const retention = Math.round((activeUsers / totalUsersForRetention) * 100);
        return { 
          value: `${retention}%`,
          change: 'Taux de rétention'
        };
      default:
        return { value: 0 };
    }
  }, [statsData, adminDashboard]);

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

  // Mémoriser les widgets rendus pour éviter les re-renders
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
  }, [widgets, statsData, adminDashboard]);

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
