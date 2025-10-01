import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Send,
  Bell,
  Mail,
  Smartphone,
  Calendar,
  Users,
  Target
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'email' | 'push' | 'sms';
  status: 'sent' | 'scheduled' | 'draft';
  target_audience: string;
  sent_at?: string;
  scheduled_at?: string;
  recipients: number;
  open_rate?: number;
}

export function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Données de démonstration
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: "Nouveau signal disponible",
        message: "Un nouveau signal de trading est disponible sur votre tableau de bord.",
        type: 'push',
        status: 'sent',
        target_audience: 'Abonnés actifs',
        sent_at: '2024-03-01T10:30:00',
        recipients: 1250,
        open_rate: 78.5
      },
      {
        id: 2,
        title: "Formation mise à jour",
        message: "La formation 'Analyse Technique' a été mise à jour avec de nouveaux contenus.",
        type: 'email',
        status: 'sent',
        target_audience: 'Étudiants formations',
        sent_at: '2024-02-28T14:15:00',
        recipients: 890,
        open_rate: 65.2
      },
      {
        id: 3,
        title: "Maintenance programmée",
        message: "Une maintenance est prévue ce soir de 22h à 23h.",
        type: 'email',
        status: 'scheduled',
        target_audience: 'Tous les utilisateurs',
        scheduled_at: '2024-03-02T22:00:00',
        recipients: 0
      },
      {
        id: 4,
        title: "Offre spéciale",
        message: "Profitez de 20% de réduction sur nos formations premium !",
        type: 'email',
        status: 'draft',
        target_audience: 'Prospects',
        recipients: 0
      }
    ];
    
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeIcon = (type: string) => {
    const icons = {
      email: Mail,
      push: Bell,
      sms: Smartphone
    };
    const IconComponent = icons[type as keyof typeof icons] || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      email: { variant: 'default' as const, label: 'Email' },
      push: { variant: 'secondary' as const, label: 'Push' },
      sms: { variant: 'destructive' as const, label: 'SMS' }
    };
    const config = variants[type as keyof typeof variants] || { variant: 'outline' as const, label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: { variant: 'default' as const, label: 'Envoyé' },
      scheduled: { variant: 'secondary' as const, label: 'Programmé' },
      draft: { variant: 'outline' as const, label: 'Brouillon' }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.target_audience.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sentCount = notifications.filter(n => n.status === 'sent').length;
  const scheduledCount = notifications.filter(n => n.status === 'scheduled').length;
  const draftCount = notifications.filter(n => n.status === 'draft').length;
  const totalRecipients = notifications.reduce((sum, n) => sum + n.recipients, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Notifications</h2>
          <p className="text-muted-foreground">
            Gérez vos communications avec les utilisateurs
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Notification
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notifications</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Envoyées</p>
                <p className="text-2xl font-bold">{sentCount}</p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Programmées</p>
                <p className="text-2xl font-bold">{scheduledCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Destinataires</p>
                <p className="text-2xl font-bold">{formatNumber(totalRecipients)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Notification</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Audience</th>
                    <th className="text-left p-2">Statut</th>
                    <th className="text-left p-2">Destinataires</th>
                    <th className="text-left p-2">Taux d'ouverture</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notification) => (
                    <tr key={notification.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-muted-foreground max-w-[300px] truncate">
                            {notification.message}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.type)}
                          {getTypeBadge(notification.type)}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Target className="h-3 w-3" />
                          {notification.target_audience}
                        </div>
                      </td>
                      <td className="p-2">
                        {getStatusBadge(notification.status)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          {formatNumber(notification.recipients)}
                        </div>
                      </td>
                      <td className="p-2">
                        {notification.open_rate ? (
                          <span className="text-sm font-medium">
                            {notification.open_rate.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {notification.sent_at ? 
                            formatDateTime(notification.sent_at) :
                            notification.scheduled_at ?
                            formatDateTime(notification.scheduled_at) :
                            'Non programmé'
                          }
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {notification.status === 'draft' && (
                            <Button variant="ghost" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}