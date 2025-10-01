import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Clock,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";

interface AnalyticsData {
  period: string;
  visitors: number;
  page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  new_users: number;
  returning_users: number;
}

interface DeviceData {
  device: string;
  percentage: number;
  icon: any;
}

export function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);

  // Données de démonstration
  useEffect(() => {
    const mockAnalyticsData: AnalyticsData[] = [
      {
        period: 'Mars 2024',
        visitors: 15420,
        page_views: 45680,
        bounce_rate: 42.5,
        avg_session_duration: 3.2,
        new_users: 8920,
        returning_users: 6500
      },
      {
        period: 'Février 2024',
        visitors: 12800,
        page_views: 38900,
        bounce_rate: 45.2,
        avg_session_duration: 2.8,
        new_users: 7200,
        returning_users: 5600
      },
      {
        period: 'Janvier 2024',
        visitors: 11200,
        page_views: 32100,
        bounce_rate: 48.1,
        avg_session_duration: 2.5,
        new_users: 6800,
        returning_users: 4400
      }
    ];

    const mockDeviceData: DeviceData[] = [
      { device: 'Desktop', percentage: 45, icon: Monitor },
      { device: 'Mobile', percentage: 40, icon: Smartphone },
      { device: 'Tablet', percentage: 15, icon: Globe }
    ];
    
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setDeviceData(mockDeviceData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const formatDuration = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}m ${secs}s`;
  };

  const currentMonth = analyticsData[0];
  const totalVisitors = analyticsData.reduce((sum, data) => sum + data.visitors, 0);
  const totalPageViews = analyticsData.reduce((sum, data) => sum + data.page_views, 0);
  const avgBounceRate = analyticsData.length > 0 ? 
    analyticsData.reduce((sum, data) => sum + data.bounce_rate, 0) / analyticsData.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">
            Analysez les performances de votre site
          </p>
        </div>
        <Button>
          <BarChart3 className="h-4 w-4 mr-2" />
          Exporter Rapport
        </Button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visiteurs ce Mois</p>
                <p className="text-2xl font-bold">{currentMonth ? formatNumber(currentMonth.visitors) : '0'}</p>
                <p className="text-sm text-green-600">+20.4% vs mois dernier</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pages Vues</p>
                <p className="text-2xl font-bold">{currentMonth ? formatNumber(currentMonth.page_views) : '0'}</p>
                <p className="text-sm text-green-600">+17.4% vs mois dernier</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de Rebond</p>
                <p className="text-2xl font-bold">{currentMonth ? currentMonth.bounce_rate.toFixed(1) : '0'}%</p>
                <p className="text-sm text-green-600">-2.7% vs mois dernier</p>
              </div>
              <MousePointer className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Durée Moyenne</p>
                <p className="text-2xl font-bold">{currentMonth ? formatDuration(currentMonth.avg_session_duration) : '0m'}</p>
                <p className="text-sm text-green-600">+14.3% vs mois dernier</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Évolution des visiteurs */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Visiteurs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {analyticsData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{data.period}</h3>
                    <p className="text-sm text-muted-foreground">
                      Nouveaux: {formatNumber(data.new_users)} • 
                      Retour: {formatNumber(data.returning_users)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatNumber(data.visitors)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(data.page_views)} pages vues
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Répartition par appareil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appareils Utilisés</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {deviceData.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <device.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${device.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{device.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pages Populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Page d'accueil</p>
                  <p className="text-sm text-muted-foreground">15,420 vues</p>
                </div>
                <Badge variant="default">32%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Services</p>
                  <p className="text-sm text-muted-foreground">8,920 vues</p>
                </div>
                <Badge variant="secondary">18%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tarifs</p>
                  <p className="text-sm text-muted-foreground">6,540 vues</p>
                </div>
                <Badge variant="outline">13%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Formations</p>
                  <p className="text-sm text-muted-foreground">4,320 vues</p>
                </div>
                <Badge variant="outline">9%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}