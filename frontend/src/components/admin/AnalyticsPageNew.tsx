import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointer,
  Clock,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  DollarSign,
  UserPlus,
  Activity,
  Trophy,
  Zap,
  Globe,
  Award,
  Coins
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Couleurs gold/noir/blanc
const COLORS = {
  gold: '#D4AF37',
  goldHover: '#C5A028',
  goldLight: '#F4E5B8',
  black: '#000000',
  grayDark: '#1F1F1F',
  grayMedium: '#6B6B6B',
  grayLight: '#E5E5E5',
  white: '#FFFFFF',
};

interface AnalyticsData {
  metrics: {
    visitors: { value: number; growth: number };
    page_views: { value: number; growth: number };
    bounce_rate: { value: number; growth: number };
    avg_duration: { value: number; growth: number };
    new_users: { value: number };
    returning_users: { value: number };
    conversion_rate: { value: number; growth: number };
    revenue: { value: number };
  };
}

interface TradingStats {
  global_stats: {
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    total_profit: number;
    total_loss: number;
    net_profit: number;
    total_pips_won: number;
    total_pips_lost: number;
    net_pips: number;
    profit_factor: number;
    trades_with_tp: number;
    trades_with_sl: number;
    active_traders: number;
  };
}

interface Trader {
  rank: number;
  user: {
    id: number;
    name: string;
    username: string;
  };
  stats: {
    total_trades: number;
    win_rate: number;
    profit_factor: number;
    net_profit: number;
    net_pips: number;
    max_consecutive_wins: number;
    ranking_score: number;
  };
}

export function AnalyticsPageNew() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [trafficSources, setTrafficSources] = useState<any>(null);
  const [pagePerformance, setPagePerformance] = useState<any[]>([]);
  const [demographics, setDemographics] = useState<any>(null);
  const [conversionFunnel, setConversionFunnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [activeTab, setActiveTab] = useState('overview');
  
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Essayer de charger les données réelles
      const [
        overviewRes,
        tradingRes,
        rankingsRes,
        trafficRes,
        pagesRes,
        demoRes,
        funnelRes
      ] = await Promise.all([
        fetchWithAuth(`/api/analytics/overview/?period=${selectedPeriod}`).catch(() => null),
        fetchWithAuth(`/api/analytics/trading/overview/?period=${selectedPeriod}`).catch(() => null),
        fetchWithAuth(`/api/analytics/trading/rankings/?limit=10`).catch(() => null),
        fetchWithAuth(`/api/analytics/traffic/?period=${selectedPeriod}`).catch(() => null),
        fetchWithAuth(`/api/analytics/pages/?period=${selectedPeriod}`).catch(() => null),
        fetchWithAuth(`/api/analytics/demographics/`).catch(() => null),
        fetchWithAuth(`/api/analytics/conversions/funnel/?period=${selectedPeriod}`).catch(() => null)
      ]);

      // Charger les données réelles si disponibles, sinon utiliser des données de démo
      let hasRealData = false;

      if (overviewRes && overviewRes.ok) {
        try {
          setAnalyticsData(await overviewRes.json());
          hasRealData = true;
        } catch (e) {
          console.log('Using demo data for overview');
        }
      }
      
      if (tradingRes && tradingRes.ok) {
        try {
          setTradingStats(await tradingRes.json());
          hasRealData = true;
        } catch (e) {
          console.log('Using demo data for trading');
        }
      }
      
      if (rankingsRes && rankingsRes.ok) {
        try {
          setTopTraders(await rankingsRes.json());
          hasRealData = true;
        } catch (e) {
          console.log('Using demo data for rankings');
        }
      }
      
      if (trafficRes && trafficRes.ok) {
        try {
          setTrafficSources(await trafficRes.json());
          hasRealData = true;
        } catch (e) {
          console.log('Using demo data for traffic');
        }
      }
      
      if (pagesRes && pagesRes.ok) {
        try {
          setPagePerformance(await pagesRes.json());
          hasRealData = true;
        } catch (e) {
          console.log('Using demo data for pages');
        }
      }
      
      if (demoRes && demoRes.ok) {
        try {
          setDemographics(await demoRes.json());
          hasRealData = true;
        } catch (e) {
          console.log('Using demo data for demographics');
        }
      }
      
      if (funnelRes && funnelRes.ok) {
        try {
          setConversionFunnel(await funnelRes.json());
          hasRealData = true;
        } catch (e) {
          console.log('Using demo data for funnel');
        }
      }

      // Si aucune donnée réelle n'est disponible, charger les données de démo
      if (!hasRealData) {
        loadDemoData();
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Charger les données de démo en cas d'erreur
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    // Données de démonstration complètes
    setAnalyticsData({
      metrics: {
        visitors: { value: 18420, growth: 20.4 },
        page_views: { value: 52680, growth: 17.4 },
        bounce_rate: { value: 38.5, growth: -2.7 },
        avg_duration: { value: 252, growth: 14.3 },
        new_users: { value: 11920 },
        returning_users: { value: 6500 },
        conversion_rate: { value: 3.8, growth: 0.9 },
        revenue: { value: 15420 }
      }
    });

    setTradingStats({
      global_stats: {
        total_trades: 1847,
        winning_trades: 1125,
        losing_trades: 682,
        win_rate: 60.9,
        total_profit: 125420.50,
        total_loss: 48920.30,
        net_profit: 76500.20,
        total_pips_won: 3842.5,
        total_pips_lost: 1523.8,
        net_pips: 2318.7,
        profit_factor: 2.56,
        trades_with_tp: 1456,
        trades_with_sl: 1702,
        active_traders: 42
      }
    });

    setTopTraders([
      { rank: 1, user: { id: 1, name: 'Jean Dupont', username: 'jeandupont' }, stats: { total_trades: 245, win_rate: 72.5, profit_factor: 3.2, net_profit: 18420.50, net_pips: 842.3, max_consecutive_wins: 12, ranking_score: 8420 }},
      { rank: 2, user: { id: 2, name: 'Marie Martin', username: 'mariemartin' }, stats: { total_trades: 198, win_rate: 68.2, profit_factor: 2.8, net_profit: 15240.30, net_pips: 723.4, max_consecutive_wins: 10, ranking_score: 7540 }},
      { rank: 3, user: { id: 3, name: 'Pierre Durand', username: 'pierredurand' }, stats: { total_trades: 212, win_rate: 65.1, profit_factor: 2.5, net_profit: 12840.20, net_pips: 654.2, max_consecutive_wins: 9, ranking_score: 6890 }},
      { rank: 4, user: { id: 4, name: 'Sophie Bernard', username: 'sophiebernard' }, stats: { total_trades: 176, win_rate: 63.8, profit_factor: 2.3, net_profit: 10420.10, net_pips: 542.1, max_consecutive_wins: 8, ranking_score: 5920 }},
      { rank: 5, user: { id: 5, name: 'Luc Moreau', username: 'lucmoreau' }, stats: { total_trades: 189, win_rate: 61.4, profit_factor: 2.1, net_profit: 9840.50, net_pips: 498.7, max_consecutive_wins: 7, ranking_score: 5340 }},
      { rank: 6, user: { id: 6, name: 'Claire Leroy', username: 'claireleroy' }, stats: { total_trades: 154, win_rate: 59.7, profit_factor: 1.9, net_profit: 8420.40, net_pips: 432.5, max_consecutive_wins: 7, ranking_score: 4780 }},
      { rank: 7, user: { id: 7, name: 'Thomas Roux', username: 'thomasroux' }, stats: { total_trades: 143, win_rate: 58.3, profit_factor: 1.8, net_profit: 7240.30, net_pips: 387.9, max_consecutive_wins: 6, ranking_score: 4120 }},
      { rank: 8, user: { id: 8, name: 'Emma Blanc', username: 'emmablanc' }, stats: { total_trades: 132, win_rate: 56.8, profit_factor: 1.7, net_profit: 6540.20, net_pips: 342.6, max_consecutive_wins: 6, ranking_score: 3680 }},
      { rank: 9, user: { id: 9, name: 'Nicolas Simon', username: 'nicolassimon' }, stats: { total_trades: 128, win_rate: 55.5, profit_factor: 1.6, net_profit: 5920.10, net_pips: 312.4, max_consecutive_wins: 5, ranking_score: 3240 }},
      { rank: 10, user: { id: 10, name: 'Laura Petit', username: 'laurapetit' }, stats: { total_trades: 115, win_rate: 54.2, profit_factor: 1.5, net_profit: 5240.50, net_pips: 287.3, max_consecutive_wins: 5, ranking_score: 2890 }}
    ]);

    setTrafficSources({
      devices: [
        { device_type: 'desktop', count: 8842, percentage: 48 },
        { device_type: 'mobile', count: 7000, percentage: 38 },
        { device_type: 'tablet', count: 2578, percentage: 14 }
      ],
      countries: [
        { country: 'France', visitors: 8420, percentage: 45.7 },
        { country: 'Belgique', visitors: 2940, percentage: 16.0 },
        { country: 'Suisse', visitors: 2120, percentage: 11.5 },
        { country: 'Canada', visitors: 1820, percentage: 9.9 },
        { country: 'Luxembourg', visitors: 1240, percentage: 6.7 },
        { country: 'Monaco', visitors: 920, percentage: 5.0 },
        { country: 'Sénégal', visitors: 520, percentage: 2.8 },
        { country: 'Côte d\'Ivoire', visitors: 320, percentage: 1.7 }
      ]
    });

    setPagePerformance([
      { page_url: '/accueil', views: 18420, unique_visitors: 12340, avg_time: 150, bounce_rate: 35.2 },
      { page_url: '/services/formations', views: 12920, unique_visitors: 9820, avg_time: 288, bounce_rate: 28.5 },
      { page_url: '/services/signaux', views: 10540, unique_visitors: 8120, avg_time: 234, bounce_rate: 32.1 },
      { page_url: '/services/gestion', views: 8320, unique_visitors: 6540, avg_time: 312, bounce_rate: 25.8 },
      { page_url: '/tarifs', views: 7650, unique_visitors: 5890, avg_time: 192, bounce_rate: 42.3 },
      { page_url: '/contact', views: 5420, unique_visitors: 4120, avg_time: 108, bounce_rate: 55.2 },
      { page_url: '/faq', views: 4320, unique_visitors: 3280, avg_time: 126, bounce_rate: 48.9 },
      { page_url: '/login', views: 3890, unique_visitors: 2940, avg_time: 72, bounce_rate: 38.5 }
    ]);

    setDemographics({
      gender_distribution: [
        { gender: 'M', count: 28 },
        { gender: 'F', count: 14 }
      ],
      age_distribution: [
        { age_range: '25-34', count: 18 },
        { age_range: '35-44', count: 12 },
        { age_range: '45-54', count: 8 },
        { age_range: '18-24', count: 4 }
      ],
      performance_by_gender: [
        { gender: 'Homme', user_count: 28, avg_win_rate: 62.3, avg_profit: 8420.50, avg_pips: 342.1 },
        { gender: 'Femme', user_count: 14, avg_win_rate: 58.7, avg_profit: 7240.30, avg_pips: 298.4 }
      ]
    });

    setConversionFunnel([
      { step: 'Visiteurs du site', count: 18420, percentage: 100, color: 'bg-blue-500' },
      { step: 'Pages de services consultées', count: 12920, percentage: 70.1, color: 'bg-blue-400' },
      { step: 'Pages de tarifs consultées', count: 7650, percentage: 41.5, color: 'bg-blue-300' },
      { step: 'Inscription créée', count: 342, percentage: 1.9, color: 'bg-green-500' },
      { step: 'Paiement effectué', count: 128, percentage: 0.7, color: 'bg-green-600' }
    ]);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const StatCard = ({ title, value, growth, icon: Icon, suffix = '', prefix = '' }: any) => (
    <Card className="border-2 hover:border-[#D4AF37] transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">
                {prefix}{value}{suffix}
              </p>
              {growth !== undefined && (
                <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                  growth >= 0 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {growth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {Math.abs(growth).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">vs période précédente</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.gold}20` }}>
            <Icon className="h-8 w-8" style={{ color: COLORS.gold }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8" style={{ color: COLORS.gold }} />
              <span className="bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent dark:from-white dark:via-gray-300 dark:to-white">
                Analytics Avancées
              </span>
            </h2>
            <p className="text-muted-foreground mt-1">
              Analyses en temps réel · Performances trading · Classements
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px] border-2 hover:border-[#D4AF37]">
              <Calendar className="h-4 w-4 mr-2" style={{ color: COLORS.gold }} />
              <SelectValue placeholder="Sélectionner période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="90days">90 derniers jours</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={loadAnalyticsData}
            className="border-2 hover:border-[#D4AF37]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            style={{ backgroundColor: COLORS.gold, color: COLORS.black }}
            className="hover:opacity-90"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto" 
                 style={{ borderTopColor: COLORS.gold }}></div>
            <p className="text-muted-foreground">Chargement des analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 bg-muted p-2">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Vue d'ensemble</span>
                <span className="sm:hidden">Vue</span>
              </TabsTrigger>
              <TabsTrigger 
                value="trading"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Trading</span>
                <span className="sm:hidden">Trade</span>
              </TabsTrigger>
              <TabsTrigger 
                value="traffic"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
              >
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Trafic</span>
                <span className="sm:hidden">Traf</span>
              </TabsTrigger>
              <TabsTrigger 
                value="behavior"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
              >
                <Activity className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Comportement</span>
                <span className="sm:hidden">Comp</span>
              </TabsTrigger>
              <TabsTrigger 
                value="demographics"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
              >
                <Globe className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Démographie</span>
                <span className="sm:hidden">Démo</span>
              </TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6">
              {analyticsData && (
                <>
                  {/* Métriques principales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                      title="Visiteurs Uniques"
                      value={formatNumber(analyticsData.metrics.visitors.value)}
                      growth={analyticsData.metrics.visitors.growth}
                      icon={Users}
                    />
                    <StatCard 
                      title="Pages Vues"
                      value={formatNumber(analyticsData.metrics.page_views.value)}
                      growth={analyticsData.metrics.page_views.growth}
                      icon={Eye}
                    />
                    <StatCard 
                      title="Taux de Rebond"
                      value={analyticsData.metrics.bounce_rate.value.toFixed(1)}
                      growth={-analyticsData.metrics.bounce_rate.growth}
                      icon={MousePointer}
                      suffix="%"
                    />
                    <StatCard 
                      title="Durée Moyenne"
                      value={formatDuration(analyticsData.metrics.avg_duration.value)}
                      growth={analyticsData.metrics.avg_duration.growth}
                      icon={Clock}
                    />
                  </div>

                  {/* Métriques secondaires */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                      title="Nouveaux Visiteurs"
                      value={formatNumber(analyticsData.metrics.new_users.value)}
                      icon={UserPlus}
                    />
                    <StatCard 
                      title="Visiteurs Fidèles"
                      value={formatNumber(analyticsData.metrics.returning_users.value)}
                      icon={Activity}
                    />
                    <StatCard 
                      title="Taux de Conversion"
                      value={analyticsData.metrics.conversion_rate.value.toFixed(2)}
                      growth={analyticsData.metrics.conversion_rate.growth}
                      icon={Target}
                      suffix="%"
                    />
                    <StatCard 
                      title="Revenu Total"
                      value={formatCurrency(analyticsData.metrics.revenue.value)}
                      icon={DollarSign}
                    />
                  </div>

                  {/* Entonnoir de conversion */}
                  {conversionFunnel.length > 0 && (
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" style={{ color: COLORS.gold }} />
                          Entonnoir de Conversion
                        </CardTitle>
                        <CardDescription>
                          Parcours des utilisateurs jusqu'à la conversion
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {conversionFunnel.map((step, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                    style={{ backgroundColor: COLORS.gold }}
                                  >
                                    {index + 1}
                                  </div>
                                  <span className="font-medium">{step.step}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-muted-foreground">
                                    {formatNumber(step.count)}
                                  </span>
                                  <Badge 
                                    variant="secondary"
                                    style={{ 
                                      backgroundColor: `${COLORS.gold}20`,
                                      color: COLORS.gold
                                    }}
                                  >
                                    {step.percentage.toFixed(1)}%
                                  </Badge>
                                </div>
                              </div>
                              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                <div 
                                  className="h-3 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${step.percentage}%`,
                                    backgroundColor: COLORS.gold
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Trading Performance */}
            <TabsContent value="trading" className="space-y-6">
              {tradingStats && (
                <>
                  {/* Stats globales trading */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                      title="Total Trades"
                      value={formatNumber(tradingStats.global_stats.total_trades)}
                      icon={BarChart3}
                    />
                    <StatCard 
                      title="Win Rate"
                      value={tradingStats.global_stats.win_rate.toFixed(1)}
                      icon={Target}
                      suffix="%"
                    />
                    <StatCard 
                      title="Profit Net"
                      value={formatCurrency(tradingStats.global_stats.net_profit)}
                      icon={DollarSign}
                    />
                    <StatCard 
                      title="Profit Factor"
                      value={tradingStats.global_stats.profit_factor.toFixed(2)}
                      icon={TrendingUp}
                    />
                  </div>

                  {/* Pips & TP/SL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-2 hover:border-green-500 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground uppercase">Pips Gagnés</p>
                            <p className="text-2xl font-bold text-green-600">
                              +{formatNumber(tradingStats.global_stats.total_pips_won)}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-red-500 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground uppercase">Pips Perdus</p>
                            <p className="text-2xl font-bold text-red-600">
                              -{formatNumber(tradingStats.global_stats.total_pips_lost)}
                            </p>
                          </div>
                          <TrendingDown className="h-8 w-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-[#D4AF37] transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground uppercase">Trades avec TP</p>
                            <p className="text-2xl font-bold" style={{ color: COLORS.gold }}>
                              {formatNumber(tradingStats.global_stats.trades_with_tp)}
                            </p>
                          </div>
                          <Target className="h-8 w-8" style={{ color: COLORS.gold }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-[#D4AF37] transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground uppercase">Trades avec SL</p>
                            <p className="text-2xl font-bold" style={{ color: COLORS.gold }}>
                              {formatNumber(tradingStats.global_stats.trades_with_sl)}
                            </p>
                          </div>
                          <Activity className="h-8 w-8" style={{ color: COLORS.gold }} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Classement des Top Traders */}
                  {topTraders.length > 0 && (
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5" style={{ color: COLORS.gold }} />
                          Top 10 Meilleurs Traders
                        </CardTitle>
                        <CardDescription>
                          Classement basé sur performances globales (profit, pips, win rate, profit factor)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {topTraders.map((trader, index) => (
                            <div 
                              key={trader.user.id}
                              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:scale-[1.02] ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-[#D4AF37]' :
                                index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-400' :
                                index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-400' :
                                'hover:border-[#D4AF37]'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {/* Rang */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                  index === 0 ? 'bg-[#D4AF37] text-black' :
                                  index === 1 ? 'bg-gray-400 text-white' :
                                  index === 2 ? 'bg-orange-400 text-white' :
                                  'bg-muted text-foreground'
                                }`}>
                                  {trader.rank}
                                  {index === 0 && <Award className="h-4 w-4 absolute -top-1 -right-1" />}
                                </div>

                                {/* Nom */}
                                <div className="flex-1">
                                  <p className="font-semibold text-lg">{trader.user.name}</p>
                                  <p className="text-sm text-muted-foreground">@{trader.user.username}</p>
                                </div>

                                {/* Stats */}
                                <div className="hidden md:flex items-center gap-6 text-sm">
                                  <div className="text-center">
                                    <p className="text-muted-foreground text-xs">Trades</p>
                                    <p className="font-bold">{trader.stats.total_trades}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-muted-foreground text-xs">Win Rate</p>
                                    <p className="font-bold text-green-600">{trader.stats.win_rate.toFixed(1)}%</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-muted-foreground text-xs">PF</p>
                                    <p className="font-bold" style={{ color: COLORS.gold }}>
                                      {trader.stats.profit_factor.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-muted-foreground text-xs">Profit Net</p>
                                    <p className="font-bold text-green-600">
                                      {formatCurrency(trader.stats.net_profit)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-muted-foreground text-xs">Pips</p>
                                    <p className="font-bold">{formatNumber(trader.stats.net_pips)}</p>
                                  </div>
                                </div>

                                {/* Score */}
                                <Badge 
                                  className="px-3 py-1"
                                  style={{ 
                                    backgroundColor: `${COLORS.gold}20`,
                                    color: COLORS.gold,
                                    border: `2px solid ${COLORS.gold}`
                                  }}
                                >
                                  <Coins className="h-3 w-3 mr-1" />
                                  {trader.stats.ranking_score.toFixed(0)} pts
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Traffic */}
            <TabsContent value="traffic" className="space-y-6">
              {trafficSources && (
                <>
                  {/* Par appareil */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" style={{ color: COLORS.gold }} />
                        Appareils Utilisés
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {trafficSources.devices?.map((device: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium capitalize">{device.device_type}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {formatNumber(device.count)}
                                </span>
                                <Badge style={{ backgroundColor: `${COLORS.gold}20`, color: COLORS.gold }}>
                                  {device.percentage.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${device.percentage}%`,
                                  backgroundColor: COLORS.gold
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Par pays */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" style={{ color: COLORS.gold }} />
                        Top Pays
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {trafficSources.countries?.map((country: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                            <span className="font-medium">{country.country}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {formatNumber(country.visitors)} visiteurs
                              </span>
                              <Badge style={{ backgroundColor: `${COLORS.gold}20`, color: COLORS.gold }}>
                                {country.percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Comportement */}
            <TabsContent value="behavior" className="space-y-6">
              {pagePerformance.length > 0 && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" style={{ color: COLORS.gold }} />
                      Pages Populaires
                    </CardTitle>
                    <CardDescription>
                      Performances détaillées de vos pages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pagePerformance.slice(0, 15).map((page: any, index: number) => (
                        <div key={index} className="p-4 border-2 rounded-lg hover:border-[#D4AF37] transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge 
                                variant={index < 3 ? 'default' : 'outline'}
                                style={index < 3 ? { backgroundColor: COLORS.gold, color: COLORS.black } : {}}
                              >
                                #{index + 1}
                              </Badge>
                              <h3 className="font-semibold">{page.page_url}</h3>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Vues</p>
                              <p className="font-bold">{formatNumber(page.views)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Visiteurs uniques</p>
                              <p className="font-bold">{formatNumber(page.unique_visitors)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Temps moyen</p>
                              <p className="font-bold">{formatDuration(page.avg_time)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Rebond</p>
                              <p className={`font-bold ${
                                page.bounce_rate < 40 ? 'text-green-600' : 
                                page.bounce_rate > 60 ? 'text-red-600' : 
                                'text-orange-600'
                              }`}>
                                {page.bounce_rate.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Démographie */}
            <TabsContent value="demographics" className="space-y-6">
              {demographics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Par genre */}
                    {demographics.gender_distribution?.length > 0 && (
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle>Répartition par Genre</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {demographics.gender_distribution.map((item: any, index: number) => (
                              <div key={index} className="flex items-center justify-between">
                                <span>{item.gender}</span>
                                <Badge style={{ backgroundColor: `${COLORS.gold}20`, color: COLORS.gold }}>
                                  {item.count} utilisateurs
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Par âge */}
                    {demographics.age_distribution?.length > 0 && (
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle>Répartition par Âge</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {demographics.age_distribution.map((item: any, index: number) => (
                              <div key={index} className="flex items-center justify-between">
                                <span>{item.age_range}</span>
                                <Badge style={{ backgroundColor: `${COLORS.gold}20`, color: COLORS.gold }}>
                                  {item.count} utilisateurs
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Performance par démographie */}
                  {demographics.performance_by_gender?.length > 0 && (
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5" style={{ color: COLORS.gold }} />
                          Performances par Genre
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {demographics.performance_by_gender.map((item: any, index: number) => (
                            <div key={index} className="p-4 border-2 rounded-lg hover:border-[#D4AF37]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{item.gender}</span>
                                <Badge variant="outline">{item.user_count} traders</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Win Rate Moyen</p>
                                  <p className="font-bold text-green-600">{item.avg_win_rate}%</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Profit Moyen</p>
                                  <p className="font-bold">{formatCurrency(item.avg_profit)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Pips Moyens</p>
                                  <p className="font-bold">{item.avg_pips.toFixed(0)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
