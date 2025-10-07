import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Settings,
  BarChart3,
  Shield,
  Bell,
  Download,
  AlertCircle,
  CheckCircle2,
  Key,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function UserSettings() {
  const { toast } = useToast();
  const [tradingHistoryEnabled, setTradingHistoryEnabled] = useState(false);
  const [hasEA, setHasEA] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Charger les préférences depuis localStorage
    const enabled = localStorage.getItem('trading_history_enabled') === 'true';
    setTradingHistoryEnabled(enabled);
    
    // Vérifier si l'utilisateur a un compte MetaTrader configuré
    checkTradingAccount();
  }, []);

  const checkTradingAccount = async () => {
    // TODO: Appeler l'API pour vérifier si un compte existe
    // Pour l'instant, vérifier le localStorage
    const hasAccount = localStorage.getItem('has_trading_account') === 'true';
    const storedKey = localStorage.getItem('trading_api_key');
    setHasEA(hasAccount);
    setApiKey(storedKey);
  };

  const toggleTradingHistory = (enabled: boolean) => {
    if (enabled && !hasEA) {
      toast({
        title: "Configuration requise",
        description: "Vous devez d'abord créer un compte MetaTrader et installer l'EA.",
        variant: "destructive"
      });
      return;
    }

    setTradingHistoryEnabled(enabled);
    localStorage.setItem('trading_history_enabled', enabled.toString());
    
    toast({
      title: enabled ? "Historique activé" : "Historique désactivé",
      description: enabled 
        ? "L'historique de trading est maintenant activé. Vos trades MetaTrader seront synchronisés."
        : "L'historique de trading est désactivé. La synchronisation est arrêtée.",
    });
  };

  const downloadEA = () => {
    window.open('/static/ea/CalmnessFi_EA.zip', '_blank');
    toast({
      title: "Téléchargement démarré",
      description: "Le script EA et le guide d'installation sont en cours de téléchargement.",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
            Paramètres
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configurez vos préférences et fonctionnalités
          </p>
        </div>
      </div>

      {/* Historique de Trading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Historique de Trading MetaTrader
          </CardTitle>
          <CardDescription>
            Synchronisez vos trades MetaTrader avec votre dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activation/Désactivation */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="trading-history" className="text-base font-semibold cursor-pointer">
                  Activer l'historique de trading
                </Label>
                {tradingHistoryEnabled && hasEA && (
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Activé
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Synchronisez automatiquement vos trades depuis MetaTrader 4/5
              </p>
            </div>
            <Switch
              id="trading-history"
              checked={tradingHistoryEnabled}
              onCheckedChange={toggleTradingHistory}
            />
          </div>

          {/* Alerte informative */}
          {!tradingHistoryEnabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fonctionnalité désactivée</AlertTitle>
              <AlertDescription className="text-sm">
                L'historique de trading est actuellement désactivé. Vos trades MetaTrader ne seront pas synchronisés avec votre dashboard.
              </AlertDescription>
            </Alert>
          )}

          {tradingHistoryEnabled && !hasEA && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Expert Advisor non installé</AlertTitle>
              <AlertDescription className="text-sm">
                La fonctionnalité est activée mais l'Expert Advisor n'est pas encore installé sur votre MetaTrader. Suivez les étapes ci-dessous pour l'installer.
              </AlertDescription>
            </Alert>
          )}

          {tradingHistoryEnabled && hasEA && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900 dark:text-green-100">Synchronisation active</AlertTitle>
              <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                Votre Expert Advisor est installé et synchronise vos trades toutes les 60 secondes. Consultez votre historique dans "Historique Trading".
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions d'activation */}
          {tradingHistoryEnabled && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Comment activer la synchronisation ?
              </h3>
              
              <div className="bg-muted p-4 rounded-lg space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Téléchargez l'Expert Advisor</p>
                      <p className="text-sm text-muted-foreground">
                        Téléchargez le script qui enverra vos trades à votre dashboard
                      </p>
                      <Button size="sm" className="mt-2" onClick={downloadEA}>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger le Script EA
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Installez-le sur MetaTrader</p>
                      <p className="text-sm text-muted-foreground">
                        Suivez le guide PDF inclus dans le ZIP pour installer l'EA sur votre MT4/MT5
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Configurez votre clé API</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Copiez votre clé API unique et collez-la dans les paramètres de l'EA
                      </p>
                      {apiKey && (
                        <div className="flex items-center gap-2 p-2 bg-background border rounded">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <code className="text-xs flex-1 font-mono">{apiKey}</code>
                          <Button size="sm" variant="outline" onClick={() => {
                            navigator.clipboard.writeText(apiKey);
                            toast({ title: "Copié !", description: "Clé API copiée dans le presse-papiers" });
                          }}>
                            Copier
                          </Button>
                        </div>
                      )}
                      {!apiKey && (
                        <Button size="sm" variant="outline" className="mt-2">
                          <Key className="mr-2 h-4 w-4" />
                          Générer ma clé API
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Activez l'EA dans MetaTrader</p>
                      <p className="text-sm text-muted-foreground">
                        Glissez-déposez l'EA sur un graphique et assurez-vous que le bouton "Auto Trading" est activé (vert)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      5
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Vérifiez la synchronisation</p>
                      <p className="text-sm text-muted-foreground">
                        Retournez dans "Historique Trading" et vos trades apparaîtront automatiquement dans 1-2 minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription className="text-sm space-y-2">
                  <p>• L'EA doit rester <strong>ACTIVÉ</strong> sur votre MetaTrader pour que la synchronisation fonctionne</p>
                  <p>• Si vous fermez MetaTrader, la synchronisation s'arrêtera</p>
                  <p>• L'EA ne prend <strong>AUCUN TRADE</strong> - Il lit uniquement votre historique</p>
                  <p>• Vous pouvez désactiver cette fonctionnalité à tout moment depuis cette page</p>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Autres paramètres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Gérez vos préférences de notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="email-notif" className="text-base font-medium">
                Notifications par email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des emails pour les événements importants
              </p>
            </div>
            <Switch id="email-notif" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="expiry-notif" className="text-base font-medium">
                Alertes d'expiration
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications avant l'expiration de vos abonnements
              </p>
            </div>
            <Switch id="expiry-notif" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="trade-notif" className="text-base font-medium">
                Alertes de trades
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications lorsqu'un trade est ouvert/fermé (nécessite EA activé)
              </p>
            </div>
            <Switch id="trade-notif" disabled={!tradingHistoryEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Gérez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base font-medium">Clé API MetaTrader</p>
              <p className="text-sm text-muted-foreground">
                Régénérez votre clé API si vous pensez qu'elle a été compromise
              </p>
            </div>
            <Button variant="outline" size="sm" disabled={!hasEA}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Régénérer
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Après régénération, vous devrez mettre à jour la clé dans votre Expert Advisor MetaTrader.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

