import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings,
  Save,
  Globe,
  Mail,
  Bell,
  Palette,
  Database,
  Shield,
  Users,
  FileText
} from "lucide-react";

interface GeneralSetting {
  id: string;
  name: string;
  description: string;
  value: string | boolean;
  type: 'text' | 'email' | 'url' | 'textarea' | 'boolean';
  category: 'general' | 'email' | 'notifications' | 'appearance' | 'system';
}

export function GeneralSettings() {
  const [settings, setSettings] = useState<GeneralSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Données de démonstration
  useEffect(() => {
    const mockSettings: GeneralSetting[] = [
      {
        id: 'site_name',
        name: 'Nom du site',
        description: 'Le nom affiché sur votre plateforme',
        value: 'CALMNESS FI',
        type: 'text',
        category: 'general'
      },
      {
        id: 'site_description',
        name: 'Description du site',
        description: 'Description courte de votre plateforme',
        value: 'Plateforme de trading et formation financière professionnelle',
        type: 'textarea',
        category: 'general'
      },
      {
        id: 'contact_email',
        name: 'Email de contact',
        description: 'Adresse email pour les communications officielles',
        value: 'contact@calmnessfi.com',
        type: 'email',
        category: 'email'
      },
      {
        id: 'support_email',
        name: 'Email de support',
        description: 'Adresse email pour le support client',
        value: 'support@calmnessfi.com',
        type: 'email',
        category: 'email'
      },
      {
        id: 'email_notifications',
        name: 'Notifications par email',
        description: 'Activer les notifications par email pour les utilisateurs',
        value: true,
        type: 'boolean',
        category: 'notifications'
      },
      {
        id: 'push_notifications',
        name: 'Notifications push',
        description: 'Activer les notifications push dans le navigateur',
        value: true,
        type: 'boolean',
        category: 'notifications'
      },
      {
        id: 'maintenance_mode',
        name: 'Mode maintenance',
        description: 'Activer le mode maintenance pour les mises à jour',
        value: false,
        type: 'boolean',
        category: 'system'
      },
      {
        id: 'user_registration',
        name: 'Inscription utilisateurs',
        description: 'Permettre aux nouveaux utilisateurs de s\'inscrire',
        value: true,
        type: 'boolean',
        category: 'system'
      },
      {
        id: 'dark_mode',
        name: 'Mode sombre',
        description: 'Activer le mode sombre par défaut',
        value: false,
        type: 'boolean',
        category: 'appearance'
      },
      {
        id: 'analytics_tracking',
        name: 'Suivi analytique',
        description: 'Activer le suivi des performances et analytics',
        value: true,
        type: 'boolean',
        category: 'system'
      }
    ];
    
    setTimeout(() => {
      setSettings(mockSettings);
      setLoading(false);
    }, 1000);
  }, []);

  const getCategoryIcon = (category: string) => {
    const icons = {
      general: Settings,
      email: Mail,
      notifications: Bell,
      appearance: Palette,
      system: Database
    };
    const IconComponent = icons[category as keyof typeof icons] || Settings;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      general: { variant: 'default' as const, label: 'Général' },
      email: { variant: 'secondary' as const, label: 'Email' },
      notifications: { variant: 'outline' as const, label: 'Notifications' },
      appearance: { variant: 'destructive' as const, label: 'Apparence' },
      system: { variant: 'default' as const, label: 'Système' }
    };
    const config = variants[category as keyof typeof variants] || { variant: 'outline' as const, label: category };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSettingChange = (settingId: string, newValue: string | boolean) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, value: newValue }
        : setting
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Ici, vous enverriez les paramètres au backend
    console.log('Sauvegarde des paramètres:', settings);
    setHasChanges(false);
    // Afficher une notification de succès
  };

  const renderSettingInput = (setting: GeneralSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value as boolean}
            onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="min-h-[100px]"
          />
        );
      case 'email':
        return (
          <Input
            type="email"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
      case 'url':
        return (
          <Input
            type="url"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, GeneralSetting[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Paramètres Généraux</h2>
          <p className="text-muted-foreground">
            Configurez les paramètres généraux de votre plateforme
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>Modifications non sauvegardées</span>
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {getCategoryBadge(category)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {categorySettings.map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={setting.id} className="text-base font-medium">
                          {setting.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                      {setting.type === 'boolean' && renderSettingInput(setting)}
                    </div>
                    {setting.type !== 'boolean' && (
                      <div className="max-w-md">
                        {renderSettingInput(setting)}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Informations système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Informations Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Version de l'application</Label>
              <Input value="1.0.0" disabled />
            </div>
            <div className="space-y-2">
              <Label>Dernière mise à jour</Label>
              <Input value="2024-03-01" disabled />
            </div>
            <div className="space-y-2">
              <Label>Base de données</Label>
              <Input value="PostgreSQL 15" disabled />
            </div>
            <div className="space-y-2">
              <Label>Serveur</Label>
              <Input value="Django 5.2.6" disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}