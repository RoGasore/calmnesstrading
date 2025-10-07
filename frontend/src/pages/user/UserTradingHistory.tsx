import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  ArrowRight,
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function UserTradingHistory() {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [hasEA, setHasEA] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Filtres
  const [period, setPeriod] = useState('all');
  const [tradeStatus, setTradeStatus] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    // Vérifier si la fonctionnalité est activée
    const enabled = localStorage.getItem('trading_history_enabled') === 'true';
    setIsEnabled(enabled);
    
    if (enabled) {
      fetchAccounts();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && isEnabled) {
      fetchHistory();
    }
  }, [period, tradeStatus, resultFilter, selectedAccount, startDate, endDate]);

  const fetchAccounts = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/auth/user/trading/accounts/`);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        setHasEA(data.accounts?.some((a: any) => a.ea_installed) || false);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/auth/user/trading/history/?period=${period}&status=${tradeStatus}&result=${resultFilter}`;
      
      if (selectedAccount !== 'all') {
        url += `&account=${selectedAccount}`;
      }
      
      if (period === 'custom' && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }
      
      const response = await fetchWithAuth(url);
      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching trading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadEA = () => {
    // Télécharger le ZIP contenant l'EA et le README
    window.open(`${API_BASE}/static/ea/CalmnessFi_EA.zip`, '_blank');
    
    toast({
      title: "Téléchargement démarré",
      description: "Le script EA et le guide d'installation sont en cours de téléchargement.",
    });
  };

  const getTypeBadge = (type: string) => {
    return type === 'buy' ? (
      <Badge className="bg-green-500"><TrendingUp className="h-3 w-3 mr-1" />BUY</Badge>
    ) : (
      <Badge className="bg-red-500"><TrendingDown className="h-3 w-3 mr-1" />SELL</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'open' ? (
      <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Ouvert</Badge>
    ) : (
      <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" />Fermé</Badge>
    );
  };

  // Si la fonctionnalité n'est pas activée
  if (!isEnabled && !loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Historique de Trading</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Suivez tous vos trades MetaTrader en temps réel
            </p>
          </div>
        </div>

        <Card className="border-2 border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Fonctionnalité Désactivée</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              L'historique de trading MetaTrader est actuellement désactivé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Activez cette fonctionnalité</AlertTitle>
              <AlertDescription className="text-sm">
                Pour suivre vos trades MetaTrader sur votre dashboard, vous devez d'abord activer cette fonctionnalité dans vos paramètres.
              </AlertDescription>
            </Alert>

            <div className="bg-muted/50 p-4 sm:p-6 rounded-lg space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Qu'est-ce que l'historique de trading ?
              </h3>
              <p className="text-sm text-muted-foreground">
                L'historique de trading vous permet de <strong>synchroniser automatiquement tous vos trades</strong> depuis votre plateforme 
                MetaTrader 4 ou MetaTrader 5 vers votre tableau de bord Calmness Trading. Vous pourrez ainsi analyser vos performances, 
                suivre vos statistiques et améliorer votre stratégie de trading.
              </p>
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium text-sm">✨ Fonctionnalités incluses :</h4>
                <ul className="text-sm space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Synchronisation en temps réel</strong> - Vos trades apparaissent automatiquement sur votre dashboard toutes les 60 secondes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Statistiques avancées</strong> - Win Rate, Profit Factor, Drawdown, Profit/Perte total, nombre de trades gagnants/perdants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Filtres puissants</strong> - Filtrez vos trades par période (jour, semaine, mois, personnalisé), statut (ouvert/fermé), résultat (gagnant/perdant), symbole</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Export Excel</strong> - Téléchargez votre historique complet au format Excel pour une analyse approfondie hors ligne</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Accessible partout</strong> - Consultez votre historique depuis n'importe quel appareil : ordinateur, tablette ou smartphone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Graphiques visuels</strong> - Visualisez vos performances avec des graphiques interactifs et des courbes d'évolution</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sécurité et confidentialité
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>✓ L'Expert Advisor est en <strong>lecture seule</strong></li>
                <li>✓ Il ne peut <strong>PAS</strong> ouvrir, modifier ou fermer vos trades</li>
                <li>✓ Il lit uniquement votre historique pour l'afficher sur le dashboard</li>
                <li>✓ Vos données sont sécurisées et privées</li>
                <li>✓ Vous pouvez désactiver à tout moment</li>
              </ul>
            </div>

            <Button className="w-full" size="lg" onClick={() => navigate('/user/settings')}>
              <Settings className="mr-2 h-5 w-5" />
              Activer dans les Paramètres
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-xs sm:text-sm text-center text-muted-foreground">
              Une fois activé, suivez les instructions pour installer l'Expert Advisor
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si activé mais pas d'EA installé
  if (isEnabled && !hasEA && !loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Historique de Trading</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Suivez tous vos trades MetaTrader en temps réel
            </p>
          </div>
        </div>

        <Alert className="border-blue-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fonctionnalité activée</AlertTitle>
          <AlertDescription>
            L'historique de trading est activé. Suivez les étapes ci-dessous pour installer l'Expert Advisor.
          </AlertDescription>
        </Alert>

        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Installez l'Expert Advisor</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Pour que vos trades apparaissent automatiquement sur votre dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 sm:p-6 rounded-lg space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Installation en 5 étapes simples
              </h3>
              <ol className="text-sm space-y-3">
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  <div>
                    <strong>Téléchargez</strong> le script Expert Advisor (EA) en cliquant sur le bouton ci-dessous
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  <div>
                    <strong>Installez-le</strong> sur votre MetaTrader 4 ou 5 en suivant le guide PDF inclus
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                  <div>
                    <strong>Configurez</strong> votre clé API unique (fournie dans les Paramètres)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                  <div>
                    <strong>Activez</strong> l'EA sur un graphique dans MetaTrader (bouton Auto Trading)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">5</span>
                  <div>
                    <strong>C'est tout !</strong> Vos trades apparaîtront automatiquement dans 1-2 minutes
                  </div>
                </li>
              </ol>
            </div>

            <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-900 dark:text-yellow-100">Important</AlertTitle>
              <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <p>• L'EA doit rester <strong>ACTIVÉ</strong> dans votre MetaTrader pour que la synchronisation fonctionne</p>
                <p>• Si vous fermez MetaTrader, la synchronisation s'arrêtera jusqu'à sa réouverture</p>
                <p>• L'EA <strong>NE PREND AUCUN TRADE</strong> - Il lit uniquement votre historique (sécurité garantie)</p>
                <p>• Vous pouvez désactiver cette fonctionnalité dans les Paramètres à tout moment</p>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1" size="lg" onClick={downloadEA}>
                <Download className="mr-2 h-5 w-5" />
                Télécharger le Script EA
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/user/settings')}>
                <Settings className="mr-2 h-5 w-5" />
                Paramètres
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-center text-muted-foreground">
              Le fichier ZIP contient l'Expert Advisor (.mq4) et un guide d'installation complet en PDF
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Historique de Trading</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Analyse complète de vos performances MetaTrader
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadEA}>
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Télécharger EA</span>
            <span className="sm:hidden">EA</span>
          </Button>
          <Button variant="outline" size="sm" onClick={fetchHistory}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Trades</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.total_trades}</div>
              <p className="text-xs text-muted-foreground">trades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.win_rate}%</div>
              <p className="text-xs text-muted-foreground">{stats.winning_trades}/{stats.total_trades}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Profit Net</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${stats.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.net_profit >= 0 ? '+' : ''}{stats.net_profit?.toFixed(2)}$
              </div>
              <p className="text-xs text-muted-foreground">net</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Profit Factor</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.profit_factor?.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">ratio</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period" className="text-sm">Période</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout le temps</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm">Statut</Label>
              <Select value={tradeStatus} onValueChange={setTradeStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="open">Ouverts</SelectItem>
                  <SelectItem value="closed">Fermés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result" className="text-sm">Résultat</Label>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger id="result">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="profit">Gains</SelectItem>
                  <SelectItem value="loss">Pertes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account" className="text-sm">Compte</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger id="account">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les comptes</SelectItem>
                  {accounts.map((acc: any) => (
                    <SelectItem key={acc.id} value={acc.id.toString()}>
                      {acc.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {period === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start" className="text-sm">Date début</Label>
                  <Input
                    id="start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end" className="text-sm">Date fin</Label>
                  <Input
                    id="end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tableau des trades */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base sm:text-lg">Historique des Trades</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Exporter Excel</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun trade trouvé pour ces filtres</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Ticket</TableHead>
                    <TableHead className="min-w-[80px]">Symbole</TableHead>
                    <TableHead className="min-w-[70px]">Type</TableHead>
                    <TableHead className="min-w-[80px] text-right">Volume</TableHead>
                    <TableHead className="min-w-[100px] text-right">Ouverture</TableHead>
                    <TableHead className="min-w-[100px] text-right">Clôture</TableHead>
                    <TableHead className="min-w-[90px] text-right">Profit</TableHead>
                    <TableHead className="min-w-[80px]">Statut</TableHead>
                    <TableHead className="min-w-[150px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade: any) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-mono text-sm">{trade.ticket}</TableCell>
                      <TableCell className="font-semibold">{trade.symbol}</TableCell>
                      <TableCell>{getTypeBadge(trade.type)}</TableCell>
                      <TableCell className="text-right">{trade.volume}</TableCell>
                      <TableCell className="text-right">{trade.open_price?.toFixed(5)}</TableCell>
                      <TableCell className="text-right">
                        {trade.close_price ? trade.close_price.toFixed(5) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.profit >= 0 ? '+' : ''}{trade.profit?.toFixed(2)}$
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(trade.status)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {new Date(trade.open_time).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

