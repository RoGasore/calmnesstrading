import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Monitor, 
  Moon, 
  Sun, 
  Volume2, 
  Bell, 
  Globe,
  Eye,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Shield,
  Key,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // Apparence
    theme: "light",
    fontSize: 16,
    compactMode: false,
    showAnimations: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    tradingAlerts: true,
    priceAlerts: true,
    newsAlerts: false,
    
    // Audio
    soundEnabled: true,
    alertVolume: 70,
    
    // Trading
    defaultTimeframe: "1h",
    autoRefresh: true,
    refreshInterval: 30,
    showConfirmations: true,
    
    // Données
    dataRetention: 90,
    exportFormat: "csv",
    
    // Confidentialité
    analyticsEnabled: true,
    cookiesEnabled: true,
    
    // Sécurité
    sessionTimeout: 30,
    autoLogout: true,
  });

  const handleSave = (section: string) => {
    toast({
      title: "Paramètres sauvegardés",
      description: `Les paramètres de ${section} ont été mis à jour.`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export en cours",
      description: "Vos données sont en cours d'exportation...",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import réussi",
      description: "Vos données ont été importées avec succès.",
    });
  };

  const handleDeleteData = () => {
    toast({
      title: "Données supprimées",
      description: "Toutes vos données ont été supprimées.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground">
              Configurez l'application selon vos préférences
            </p>
          </div>

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="appearance">Apparence</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="data">Données</TabsTrigger>
              <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Apparence et affichage
                  </CardTitle>
                  <CardDescription>
                    Personnalisez l'apparence de l'interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Thème</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choisissez le thème de couleur de l'application
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: "light", name: "Clair", icon: Sun },
                        { id: "dark", name: "Sombre", icon: Moon },
                        { id: "system", name: "Système", icon: Monitor },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSettings({...settings, theme: theme.id})}
                          className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                            settings.theme === theme.id 
                              ? "border-primary bg-primary/10" 
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <theme.icon className="h-6 w-6" />
                          <span className="font-medium">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Taille de police</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ajustez la taille du texte : {settings.fontSize}px
                    </p>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={(value) => setSettings({...settings, fontSize: value[0]})}
                      min={12}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Mode compact</Label>
                        <p className="text-sm text-muted-foreground">
                          Affichage plus dense pour plus d'informations
                        </p>
                      </div>
                      <Switch
                        checked={settings.compactMode}
                        onCheckedChange={(checked) => setSettings({...settings, compactMode: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Animations</Label>
                        <p className="text-sm text-muted-foreground">
                          Activer les animations d'interface
                        </p>
                      </div>
                      <Switch
                        checked={settings.showAnimations}
                        onCheckedChange={(checked) => setSettings({...settings, showAnimations: checked})}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave("apparence")} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les paramètres d'apparence
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Configurez vos préférences de notification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Notifications email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir des emails pour les mises à jour importantes
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Notifications push</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications en temps réel sur votre navigateur
                        </p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Alertes de trading</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications pour les nouveaux signaux
                        </p>
                      </div>
                      <Switch
                        checked={settings.tradingAlerts}
                        onCheckedChange={(checked) => setSettings({...settings, tradingAlerts: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Alertes de prix</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications quand les prix atteignent vos seuils
                        </p>
                      </div>
                      <Switch
                        checked={settings.priceAlerts}
                        onCheckedChange={(checked) => setSettings({...settings, priceAlerts: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Alertes actualités</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications pour les actualités importantes
                        </p>
                      </div>
                      <Switch
                        checked={settings.newsAlerts}
                        onCheckedChange={(checked) => setSettings({...settings, newsAlerts: checked})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Volume des alertes
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Volume sonore des notifications : {settings.alertVolume}%
                    </p>
                    <Slider
                      value={[settings.alertVolume]}
                      onValueChange={(value) => setSettings({...settings, alertVolume: value[0]})}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <Button onClick={() => handleSave("notifications")} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les paramètres de notification
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trading" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de trading</CardTitle>
                  <CardDescription>
                    Configurez vos préférences pour l'analyse technique
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeframe">Timeframe par défaut</Label>
                      <select
                        id="timeframe"
                        value={settings.defaultTimeframe}
                        onChange={(e) => setSettings({...settings, defaultTimeframe: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="1m">1 minute</option>
                        <option value="5m">5 minutes</option>
                        <option value="15m">15 minutes</option>
                        <option value="1h">1 heure</option>
                        <option value="4h">4 heures</option>
                        <option value="1d">1 jour</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refresh">Intervalle de rafraîchissement (secondes)</Label>
                      <Input
                        id="refresh"
                        type="number"
                        value={settings.refreshInterval}
                        onChange={(e) => setSettings({...settings, refreshInterval: parseInt(e.target.value)})}
                        min="5"
                        max="300"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Rafraîchissement automatique</Label>
                        <p className="text-sm text-muted-foreground">
                          Mettre à jour automatiquement les données de marché
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoRefresh}
                        onCheckedChange={(checked) => setSettings({...settings, autoRefresh: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Confirmations d'actions</Label>
                        <p className="text-sm text-muted-foreground">
                          Demander confirmation avant les actions importantes
                        </p>
                      </div>
                      <Switch
                        checked={settings.showConfirmations}
                        onCheckedChange={(checked) => setSettings({...settings, showConfirmations: checked})}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave("trading")} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les paramètres de trading
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Gestion des données
                  </CardTitle>
                  <CardDescription>
                    Exportez, importez ou supprimez vos données
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Rétention des données</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Durée de conservation des données historiques : {settings.dataRetention} jours
                    </p>
                    <Slider
                      value={[settings.dataRetention]}
                      onValueChange={(value) => setSettings({...settings, dataRetention: value[0]})}
                      min={30}
                      max={365}
                      step={30}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Export des données</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Téléchargez vos données dans différents formats
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportData}>
                          <Download className="h-4 w-4 mr-2" />
                          Exporter en CSV
                        </Button>
                        <Button variant="outline" onClick={handleExportData}>
                          <Download className="h-4 w-4 mr-2" />
                          Exporter en JSON
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Import des données</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Importez vos données depuis un fichier
                      </p>
                      <Button variant="outline" onClick={handleImportData}>
                        <Upload className="h-4 w-4 mr-2" />
                        Importer des données
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-destructive">Zone de danger</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Supprimez définitivement toutes vos données
                      </p>
                      <Button variant="destructive" onClick={handleDeleteData}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer toutes les données
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Confidentialité
                  </CardTitle>
                  <CardDescription>
                    Contrôlez vos données personnelles et leur utilisation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Analytiques</Label>
                        <p className="text-sm text-muted-foreground">
                          Autoriser la collecte de données d'usage anonymes
                        </p>
                      </div>
                      <Switch
                        checked={settings.analyticsEnabled}
                        onCheckedChange={(checked) => setSettings({...settings, analyticsEnabled: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Cookies</Label>
                        <p className="text-sm text-muted-foreground">
                          Autoriser l'utilisation de cookies pour améliorer l'expérience
                        </p>
                      </div>
                      <Switch
                        checked={settings.cookiesEnabled}
                        onCheckedChange={(checked) => setSettings({...settings, cookiesEnabled: checked})}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Vos droits</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger mes données personnelles
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Eye className="h-4 w-4 mr-2" />
                        Consulter la politique de confidentialité
                      </Button>
                      <Button variant="destructive" className="w-full justify-start">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer mon compte
                      </Button>
                    </div>
                  </div>

                  <Button onClick={() => handleSave("confidentialité")} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les paramètres de confidentialité
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sécurité
                  </CardTitle>
                  <CardDescription>
                    Configurez les paramètres de sécurité de votre session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Délai d'expiration de session</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Durée d'inactivité avant déconnexion automatique : {settings.sessionTimeout} minutes
                    </p>
                    <Slider
                      value={[settings.sessionTimeout]}
                      onValueChange={(value) => setSettings({...settings, sessionTimeout: value[0]})}
                      min={5}
                      max={120}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Déconnexion automatique</Label>
                        <p className="text-sm text-muted-foreground">
                          Se déconnecter automatiquement après inactivité
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoLogout}
                        onCheckedChange={(checked) => setSettings({...settings, autoLogout: checked})}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Actions de sécurité</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Key className="h-4 w-4 mr-2" />
                        Changer le mot de passe
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Configurer l'authentification à deux facteurs
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Monitor className="h-4 w-4 mr-2" />
                        Voir les sessions actives
                      </Button>
                    </div>
                  </div>

                  <Button onClick={() => handleSave("sécurité")} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les paramètres de sécurité
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;