import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Shield,
  Lock,
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Globe,
  Database
} from "lucide-react";

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'authentication' | 'authorization' | 'data' | 'network';
}

interface SecurityEvent {
  id: number;
  type: 'login' | 'failed_login' | 'password_change' | 'admin_action';
  user: string;
  ip_address: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export function SecuritySettings() {
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Données de démonstration
  useEffect(() => {
    const mockSettings: SecuritySetting[] = [
      {
        id: 'two_factor_auth',
        name: 'Authentification à deux facteurs',
        description: 'Exiger une vérification supplémentaire pour les connexions admin',
        enabled: true,
        category: 'authentication'
      },
      {
        id: 'password_policy',
        name: 'Politique de mots de passe',
        description: 'Exiger des mots de passe complexes (8+ caractères, majuscules, chiffres)',
        enabled: true,
        category: 'authentication'
      },
      {
        id: 'session_timeout',
        name: 'Déconnexion automatique',
        description: 'Déconnecter automatiquement après 30 minutes d\'inactivité',
        enabled: true,
        category: 'authentication'
      },
      {
        id: 'ip_whitelist',
        name: 'Liste blanche IP',
        description: 'Restreindre l\'accès admin aux adresses IP autorisées',
        enabled: false,
        category: 'network'
      },
      {
        id: 'rate_limiting',
        name: 'Limitation de taux',
        description: 'Limiter le nombre de tentatives de connexion par IP',
        enabled: true,
        category: 'network'
      },
      {
        id: 'audit_logs',
        name: 'Journaux d\'audit',
        description: 'Enregistrer toutes les actions administratives',
        enabled: true,
        category: 'data'
      }
    ];

    const mockEvents: SecurityEvent[] = [
      {
        id: 1,
        type: 'login',
        user: 'admin@calmnessfi.com',
        ip_address: '192.168.1.100',
        timestamp: '2024-03-01T10:30:00',
        status: 'success'
      },
      {
        id: 2,
        type: 'failed_login',
        user: 'unknown@email.com',
        ip_address: '192.168.1.200',
        timestamp: '2024-03-01T09:15:00',
        status: 'error'
      },
      {
        id: 3,
        type: 'password_change',
        user: 'admin@calmnessfi.com',
        ip_address: '192.168.1.100',
        timestamp: '2024-02-28T16:45:00',
        status: 'success'
      },
      {
        id: 4,
        type: 'admin_action',
        user: 'admin@calmnessfi.com',
        ip_address: '192.168.1.100',
        timestamp: '2024-02-28T14:20:00',
        status: 'success'
      }
    ];
    
    setTimeout(() => {
      setSettings(mockSettings);
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const getCategoryIcon = (category: string) => {
    const icons = {
      authentication: Lock,
      authorization: Key,
      data: Database,
      network: Globe
    };
    const IconComponent = icons[category as keyof typeof icons] || Shield;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      authentication: { variant: 'default' as const, label: 'Authentification' },
      authorization: { variant: 'secondary' as const, label: 'Autorisation' },
      data: { variant: 'outline' as const, label: 'Données' },
      network: { variant: 'destructive' as const, label: 'Réseau' }
    };
    const config = variants[category as keyof typeof variants] || { variant: 'outline' as const, label: category };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEventIcon = (type: string) => {
    const icons = {
      login: CheckCircle,
      failed_login: AlertTriangle,
      password_change: Key,
      admin_action: Shield
    };
    const IconComponent = icons[type as keyof typeof icons] || Shield;
    return <IconComponent className="h-4 w-4" />;
  };

  const getEventStatusColor = (status: string) => {
    const colors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600'
    };
    return colors[status as keyof typeof colors] || 'text-muted-foreground';
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

  const handleSettingToggle = (settingId: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, enabled: !setting.enabled }
        : setting
    ));
  };

  const enabledCount = settings.filter(s => s.enabled).length;
  const recentEvents = events.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Paramètres de Sécurité</h2>
          <p className="text-muted-foreground">
            Configurez les paramètres de sécurité de votre plateforme
          </p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Test de Sécurité
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paramètres Actifs</p>
                <p className="text-2xl font-bold">{enabledCount}/{settings.length}</p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Sécurité</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Événements 24h</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tentatives Échouées</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'error').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paramètres de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(setting.category)}
                      {getCategoryBadge(setting.category)}
                    </div>
                    <div>
                      <h3 className="font-medium">{setting.name}</h3>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => handleSettingToggle(setting.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Événements de sécurité récents */}
      <Card>
        <CardHeader>
          <CardTitle>Événements de Sécurité Récents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`${getEventStatusColor(event.status)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <h3 className="font-medium capitalize">
                        {event.type.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {event.user} • {event.ip_address}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDateTime(event.timestamp)}
                    </p>
                    <Badge 
                      variant={event.status === 'success' ? 'default' : 
                              event.status === 'warning' ? 'secondary' : 'destructive'}
                    >
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}