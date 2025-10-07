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
  Globe,
  Smartphone,
  Monitor,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  DollarSign,
  UserPlus,
  Activity,
  Tablet
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AnalyticsData {
  period: string;
  visitors: number;
  page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  new_users: number;
  returning_users: number;
  conversion_rate: number;
  revenue: number;
}

interface DeviceData {
  device: string;
  percentage: number;
  count: number;
  icon: any;
  color: string;
}

interface PageData {
  page: string;
  views: number;
  unique_visitors: number;
  avg_time: number;
  bounce_rate: number;
}

interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
  conversion: number;
}

export function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [pageData, setPageData] = useState<PageData[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [activeTab, setActiveTab] = useState('overview');

  // Données de démonstration améliorées
  useEffect(() => {
    const mockAnalyticsData: AnalyticsData[] = [
      {
        period: 'Semaine 1 - Avril 2024',
        visitors: 18420,
        page_views: 52680,
        bounce_rate: 38.5,
        avg_session_duration: 4.2,
        new_users: 11920,
        returning_users: 6500,
        conversion_rate: 3.8,
        revenue: 15420
      },
      {
        period: 'Semaine 4 - Mars 2024',
        visitors: 15420,
        page_views: 45680,
        bounce_rate: 42.5,
        avg_session_duration: 3.2,
        new_users: 8920,
        returning_users: 6500,
        conversion_rate: 2.9,
        revenue: 12800
      },
      {
        period: 'Semaine 3 - Mars 2024',
        visitors: 12800,
        page_views: 38900,
        bounce_rate: 45.2,
        avg_session_duration: 2.8,
        new_users: 7200,
        returning_users: 5600,
        conversion_rate: 2.5,
        revenue: 9200
      },
      {
        period: 'Semaine 2 - Mars 2024',
        visitors: 11200,
        page_views: 32100,
        bounce_rate: 48.1,
        avg_session_duration: 2.5,
        new_users: 6800,
        returning_users: 4400,
        conversion_rate: 2.1,
        revenue: 7800
      }
    ];

    const mockDeviceData: DeviceData[] = [
      { device: 'Desktop', percentage: 48, count: 8842, icon: Monitor, color: 'bg-blue-500' },
      { device: 'Mobile', percentage: 38, count: 7000, icon: Smartphone, color: 'bg-green-500' },
      { device: 'Tablet', percentage: 14, count: 2578, icon: Tablet, color: 'bg-orange-500' }
    ];

    const mockPageData: PageData[] = [
      { page: 'Accueil', views: 18420, unique_visitors: 12340, avg_time: 2.5, bounce_rate: 35.2 },
      { page: 'Services / Formations', views: 12920, unique_visitors: 9820, avg_time: 4.8, bounce_rate: 28.5 },
      { page: 'Services / Signaux', views: 10540, unique_visitors: 8120, avg_time: 3.9, bounce_rate: 32.1 },
      { page: 'Services / Gestion', views: 8320, unique_visitors: 6540, avg_time: 5.2, bounce_rate: 25.8 },
      { page: 'Tarifs', views: 7650, unique_visitors: 5890, avg_time: 3.2, bounce_rate: 42.3 },
      { page: 'Contact', views: 5420, unique_visitors: 4120, avg_time: 1.8, bounce_rate: 55.2 },
      { page: 'FAQ', views: 4320, unique_visitors: 3280, avg_time: 2.1, bounce_rate: 48.9 },
      { page: 'Connexion', views: 3890, unique_visitors: 2940, avg_time: 1.2, bounce_rate: 38.5 },
    ];

    const mockTrafficSources: TrafficSource[] = [
      { source: 'Recherche Organique (Google)', visits: 8420, percentage: 45.7, conversion: 4.2 },
      { source: 'Direct', visits: 4820, percentage: 26.2, conversion: 3.8 },
      { source: 'Réseaux Sociaux', visits: 2940, percentage: 16.0, conversion: 2.1 },
      { source: 'Référence (Autres Sites)', visits: 1520, percentage: 8.3, conversion: 3.5 },
      { source: 'Publicité Payante', visits: 720, percentage: 3.9, conversion: 5.8 },
    ];
    
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setDeviceData(mockDeviceData);
      setPageData(mockPageData);
      setTrafficSources(mockTrafficSources);
      setLoading(false);
    }, 800);
  }, [selectedPeriod]);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDuration = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}m ${secs}s`;
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const currentMonth = analyticsData[0];
  const previousMonth = analyticsData[1];
  const totalVisitors = analyticsData.reduce((sum, data) => sum + data.visitors, 0);
  const totalPageViews = analyticsData.reduce((sum, data) => sum + data.page_views, 0);
  const avgBounceRate = analyticsData.length > 0 ? 
    analyticsData.reduce((sum, data) => sum + data.bounce_rate, 0) / analyticsData.length : 0;
  const totalRevenue = analyticsData.reduce((sum, data) => sum + data.revenue, 0);

  const visitorGrowth = previousMonth ? calculateGrowth(currentMonth?.visitors || 0, previousMonth.visitors) : 0;
  const pageViewsGrowth = previousMonth ? calculateGrowth(currentMonth?.page_views || 0, previousMonth.page_views) : 0;
  const bounceRateGrowth = previousMonth ? calculateGrowth(currentMonth?.bounce_rate || 0, previousMonth.bounce_rate) : 0;
  const conversionGrowth = previousMonth ? calculateGrowth(currentMonth?.conversion_rate || 0, previousMonth.conversion_rate) : 0;

  const StatCard = ({ title, value, growth, icon: Icon, iconColor, suffix = '' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{value}{suffix}</p>
              {growth !== undefined && (
                <div className={`flex items-center text-xs font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(growth).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">vs période précédente</p>
          </div>
          <div className={`p-3 rounded-lg ${iconColor}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Analytics
            </h2>
            <p className="text-muted-foreground mt-1">
              Analysez les performances et le comportement des visiteurs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
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
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="traffic">Trafic</TabsTrigger>
          <TabsTrigger value="behavior">Comportement</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Visiteurs Uniques"
              value={currentMonth ? formatNumber(currentMonth.visitors) : '0'}
              growth={visitorGrowth}
              icon={Users}
              iconColor="bg-blue-500"
            />
            <StatCard 
              title="Pages Vues"
              value={currentMonth ? formatNumber(currentMonth.page_views) : '0'}
              growth={pageViewsGrowth}
              icon={Eye}
              iconColor="bg-green-500"
            />
            <StatCard 
              title="Taux de Rebond"
              value={currentMonth ? currentMonth.bounce_rate.toFixed(1) : '0'}
              growth={-bounceRateGrowth}
              icon={MousePointer}
              iconColor="bg-orange-500"
              suffix="%"
            />
            <StatCard 
              title="Durée Moyenne"
              value={currentMonth ? formatDuration(currentMonth.avg_session_duration) : '0m'}
              growth={previousMonth ? calculateGrowth(currentMonth?.avg_session_duration || 0, previousMonth.avg_session_duration) : 0}
              icon={Clock}
              iconColor="bg-purple-500"
            />
          </div>

          {/* Métriques secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Nouveaux Visiteurs"
              value={currentMonth ? formatNumber(currentMonth.new_users) : '0'}
              growth={previousMonth ? calculateGrowth(currentMonth?.new_users || 0, previousMonth.new_users) : 0}
              icon={UserPlus}
              iconColor="bg-teal-500"
            />
            <StatCard 
              title="Visiteurs Fidèles"
              value={currentMonth ? formatNumber(currentMonth.returning_users) : '0'}
              growth={previousMonth ? calculateGrowth(currentMonth?.returning_users || 0, previousMonth.returning_users) : 0}
              icon={Activity}
              iconColor="bg-indigo-500"
            />
            <StatCard 
              title="Taux de Conversion"
              value={currentMonth ? currentMonth.conversion_rate.toFixed(1) : '0'}
              growth={conversionGrowth}
              icon={Target}
              iconColor="bg-pink-500"
              suffix="%"
            />
            <StatCard 
              title="Revenu Total"
              value={currentMonth ? formatCurrency(currentMonth.revenue) : '0 €'}
              growth={previousMonth ? calculateGrowth(currentMonth?.revenue || 0, previousMonth.revenue) : 0}
              icon={DollarSign}
              iconColor="bg-yellow-500"
            />
          </div>

          {/* Évolution des visiteurs */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Visiteurs</CardTitle>
              <CardDescription>Comparaison des visiteurs nouveaux et fidèles par période</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyticsData.map((data, index) => (
                    <div key={index} className="group hover:bg-muted/50 transition-colors p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{data.period}</h3>
                            <Badge variant="outline" className="text-xs">
                              Taux de rebond: {data.bounce_rate.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-muted-foreground">Nouveaux:</span>
                              <span className="font-medium">{formatNumber(data.new_users)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-muted-foreground">Fidèles:</span>
                              <span className="font-medium">{formatNumber(data.returning_users)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Durée:</span>
                              <span className="font-medium">{formatDuration(data.avg_session_duration)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatNumber(data.visitors)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(data.page_views)} pages vues
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Conv: {data.conversion_rate}% • {formatCurrency(data.revenue)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Barre de progression */}
                      <div className="mt-3 flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                        <div 
                          className="bg-blue-500" 
                          style={{ width: `${(data.new_users / data.visitors) * 100}%` }}
                          title={`Nouveaux: ${((data.new_users / data.visitors) * 100).toFixed(1)}%`}
                        ></div>
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${(data.returning_users / data.visitors) * 100}%` }}
                          title={`Fidèles: ${((data.returning_users / data.visitors) * 100).toFixed(1)}%`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Répartition par appareil */}
            <Card>
              <CardHeader>
                <CardTitle>Appareils Utilisés</CardTitle>
                <CardDescription>Répartition des visiteurs par type d'appareil</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deviceData.map((device, index) => (
                      <div key={index} className="group hover:bg-muted/50 transition-colors p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${device.color}`}>
                              <device.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold">{device.device}</p>
                              <p className="text-sm text-muted-foreground">{formatNumber(device.count)} visiteurs</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">{device.percentage}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`${device.color} h-2 rounded-full transition-all duration-500`} 
                            style={{ width: `${device.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sources de trafic */}
            <Card>
              <CardHeader>
                <CardTitle>Sources de Trafic</CardTitle>
                <CardDescription>D'où viennent vos visiteurs</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trafficSources.map((source, index) => (
                      <div key={index} className="group hover:bg-muted/50 transition-colors p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold">{source.source}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{formatNumber(source.visits)} visites</span>
                              <span>•</span>
                              <span>Conv: {source.conversion}%</span>
                            </div>
                          </div>
                          <Badge variant={index === 0 ? 'default' : 'secondary'}>
                            {source.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pages Populaires</CardTitle>
              <CardDescription>Performances détaillées de vos pages</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pageData.map((page, index) => (
                    <div key={index} className="group hover:bg-muted/50 transition-colors p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={index < 3 ? 'default' : 'outline'}>#{index + 1}</Badge>
                            <h3 className="font-semibold">{page.page}</h3>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Vues</p>
                              <p className="font-medium">{formatNumber(page.views)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Visiteurs uniques</p>
                              <p className="font-medium">{formatNumber(page.unique_visitors)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Temps moyen</p>
                              <p className="font-medium">{formatDuration(page.avg_time)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Rebond</p>
                              <p className={`font-medium ${page.bounce_rate < 40 ? 'text-green-600' : page.bounce_rate > 50 ? 'text-red-600' : 'text-orange-600'}`}>
                                {page.bounce_rate.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">342</p>
                  <p className="text-sm text-muted-foreground">
                    Taux: 2.8%
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+12.5% vs période précédente</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">128</p>
                  <p className="text-sm text-muted-foreground">
                    Taux: 1.2%
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+8.3% vs période précédente</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">89</p>
                  <p className="text-sm text-muted-foreground">
                    Taux: 0.7%
                  </p>
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <TrendingDown className="h-4 w-4" />
                    <span>-3.2% vs période précédente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Entonnoir de Conversion</CardTitle>
              <CardDescription>Parcours des utilisateurs jusqu'à la conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: 'Visiteurs du site', count: 18420, percentage: 100, color: 'bg-blue-500' },
                  { step: 'Pages de services consultées', count: 12920, percentage: 70, color: 'bg-blue-400' },
                  { step: 'Pages de tarifs consultées', count: 7650, percentage: 41, color: 'bg-blue-300' },
                  { step: 'Inscription créée', count: 342, percentage: 1.9, color: 'bg-green-500' },
                  { step: 'Paiement effectué', count: 128, percentage: 0.7, color: 'bg-green-600' },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.step}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{formatNumber(item.count)}</span>
                        <Badge variant="secondary">{item.percentage}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={`${item.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}