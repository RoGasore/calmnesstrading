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

          {/* Instructions et clé API */}
          {tradingHistoryEnabled && (
            <div className="space-y-6 border-t pt-6 mt-4">
              {/* Clé API - Section principale */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <Key className="h-5 w-5 text-primary" />
                  Votre Clé API Unique
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cette clé permet de connecter votre MetaTrader à votre compte Calmness Trading de manière sécurisée. 
                  Vous devrez la copier et la coller dans les paramètres de l'Expert Advisor.
                </p>
                {apiKey ? (
                  <div className="bg-muted p-4 rounded-lg border-2 border-primary/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Votre clé API :</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Active</Badge>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-background border rounded-lg">
                      <Key className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <code className="text-sm flex-1 font-mono break-all">{apiKey}</code>
                      <Button size="sm" variant="default" onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        toast({ 
                          title: "✓ Copié !", 
                          description: "Clé API copiée dans le presse-papiers. Collez-la dans votre EA." 
                        });
                      }}>
                        <Download className="mr-2 h-3 w-3" />
                        Copier
                      </Button>
                    </div>
                    <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
                        <strong>Ne partagez jamais cette clé !</strong> Elle permet d'accéder à votre historique de trading.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-lg border-2 border-dashed space-y-2">
                    <p className="text-sm text-muted-foreground">Aucune clé API générée pour le moment.</p>
                    <Button size="sm" variant="outline" onClick={async () => {
                      // Appel API pour générer une clé
                      const newApiKey = `CT-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
                      setApiKey(newApiKey);
                      toast({ 
                        title: "Clé API générée !", 
                        description: "Votre clé API unique a été créée. Copiez-la pour la configurer dans votre EA." 
                      });
                    }}>
                      <Key className="mr-2 h-4 w-4" />
                      Générer ma clé API
                    </Button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Installation de l'Expert Advisor (EA)
                </h3>
                
                <div className="bg-muted p-5 rounded-lg space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Pour que vos trades MetaTrader apparaissent automatiquement sur votre dashboard, suivez ces étapes :
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-sm">Téléchargez l'Expert Advisor</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Cliquez sur le bouton ci-dessous pour télécharger le script EA et le guide d'installation PDF
                        </p>
                        <Button size="sm" variant="default" onClick={downloadEA}>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger le Script EA (.zip)
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-sm">Installez l'EA sur MetaTrader 4 ou 5</p>
                        <p className="text-xs text-muted-foreground">
                          Décompressez le fichier ZIP et suivez le guide PDF inclus. En résumé : copiez le fichier .mq4 (ou .ex4) 
                          dans le dossier <code className="bg-background px-1 rounded">MQL4/Experts</code> de MetaTrader, puis redémarrez MetaTrader.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-sm">Configurez votre clé API dans l'EA</p>
                        <p className="text-xs text-muted-foreground">
                          Glissez-déposez l'EA sur un graphique MetaTrader. Dans la fenêtre qui s'ouvre, allez dans l'onglet "Entrées" (Inputs) 
                          et collez votre clé API (affichée ci-dessus) dans le champ prévu à cet effet.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        4
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-sm">Activez l'EA dans MetaTrader</p>
                        <p className="text-xs text-muted-foreground">
                          Assurez-vous que le bouton "Auto Trading" (ou "Trading Algo") dans la barre d'outils de MetaTrader est activé (doit être vert). 
                          Un smiley souriant devrait apparaître dans le coin du graphique.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        5
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-sm">Vérifiez la synchronisation</p>
                        <p className="text-xs text-muted-foreground">
                          Retournez dans <strong>"Historique Trading"</strong> sur votre dashboard. Vos trades devraient apparaître automatiquement 
                          dans 1 à 2 minutes. La synchronisation se fait toutes les 60 secondes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm">⚠️ Points importants</AlertTitle>
                  <AlertDescription className="text-xs space-y-1.5 mt-2">
                    <p>• L'EA doit rester <strong>ACTIVÉ</strong> sur votre MetaTrader pour que la synchronisation continue de fonctionner</p>
                    <p>• Si vous fermez MetaTrader, la synchronisation s'arrêtera temporairement (elle reprendra au redémarrage)</p>
                    <p>• L'EA ne prend <strong>AUCUN TRADE AUTOMATIQUE</strong> - Il fonctionne en <strong>lecture seule</strong> et lit uniquement votre historique</p>
                    <p>• Vous pouvez désactiver cette fonctionnalité à tout moment en désactivant le switch en haut de cette page</p>
                  </AlertDescription>
                </Alert>
              </div>
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

