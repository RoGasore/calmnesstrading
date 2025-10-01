import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Calendar, Eye, Download, Share2, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Analyse = () => {
  const marketData = [
    { name: 'Jan', eurusd: 1.0850, gbpusd: 1.2650, usdjpy: 148.50 },
    { name: 'Fév', eurusd: 1.0780, gbpusd: 1.2580, usdjpy: 149.20 },
    { name: 'Mar', eurusd: 1.0920, gbpusd: 1.2720, usdjpy: 147.80 },
    { name: 'Avr', eurusd: 1.0890, gbpusd: 1.2680, usdjpy: 148.90 },
    { name: 'Mai', eurusd: 1.0950, gbpusd: 1.2750, usdjpy: 147.20 },
    { name: 'Juin', eurusd: 1.0820, gbpusd: 1.2620, usdjpy: 149.50 },
  ];

  const analyses = [
    {
      id: 1,
      title: "Analyse Technique EUR/USD - Cassure Haussière",
      description: "L'EUR/USD montre des signes de force avec une cassure au-dessus de la résistance clé à 1.0900",
      author: "Marc Dubois",
      date: "2024-03-15",
      type: "Technique",
      timeframe: "Daily",
      views: 1250,
      likes: 89,
      pair: "EUR/USD",
      sentiment: "Haussier",
      targets: ["1.0950", "1.1000"],
      support: "1.0850"
    },
    {
      id: 2,
      title: "Analyse Fondamentale GBP/USD - Impact BoE",
      description: "La décision de la Banque d'Angleterre pourrait créer de la volatilité sur le GBP/USD",
      author: "Sophie Martin",
      date: "2024-03-14",
      type: "Fondamentale",
      timeframe: "Weekly",
      views: 980,
      likes: 67,
      pair: "GBP/USD",
      sentiment: "Neutre",
      targets: ["1.2700", "1.2750"],
      support: "1.2600"
    },
    {
      id: 3,
      title: "USD/JPY - Attention à la Résistance 150",
      description: "L'USD/JPY approche du niveau psychologique de 150, une zone historiquement importante",
      author: "Jean Leroy",
      date: "2024-03-13",
      type: "Technique",
      timeframe: "4H",
      views: 750,
      likes: 45,
      pair: "USD/JPY",
      sentiment: "Baissier",
      targets: ["148.50", "147.00"],
      support: "149.00"
    }
  ];

  const marketOverview = [
    {
      pair: "EUR/USD",
      price: 1.0892,
      change: "+0.0025",
      changePercent: "+0.23%",
      sentiment: "Haussier",
      volume: "High"
    },
    {
      pair: "GBP/USD",
      price: 1.2685,
      change: "-0.0012",
      changePercent: "-0.09%",
      sentiment: "Neutre",
      volume: "Medium"
    },
    {
      pair: "USD/JPY",
      price: 148.75,
      change: "+0.45",
      changePercent: "+0.30%",
      sentiment: "Haussier",
      volume: "High"
    },
    {
      pair: "AUD/USD",
      price: 0.6720,
      change: "-0.0035",
      changePercent: "-0.52%",
      sentiment: "Baissier",
      volume: "Low"
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Haussier": return "text-green-600";
      case "Baissier": return "text-red-600";
      case "Neutre": return "text-yellow-600";
      default: return "text-muted-foreground";
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "Haussier": return "default";
      case "Baissier": return "destructive";
      case "Neutre": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Analyses de Marché
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Analyses techniques et fondamentales détaillées pour vous aider à prendre les meilleures décisions
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge variant="secondary" className="px-4 py-2">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyses Quotidiennes
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Target className="w-4 h-4 mr-2" />
                  Précision 85%
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Mis à Jour 24/7
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Market Overview */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Vue d'Ensemble du Marché</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {marketOverview.map((market) => (
                <Card key={market.pair}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{market.pair}</CardTitle>
                      <Badge variant={getSentimentBadge(market.sentiment)} className="text-xs">
                        {market.sentiment}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{market.price}</div>
                      <div className={`text-sm font-medium ${
                        market.change.includes('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {market.change} ({market.changePercent})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Volume: {market.volume}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Chart Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Évolution des Principales Paires</h2>
            <Card className="max-w-6xl mx-auto">
              <CardHeader>
                <CardTitle>Graphique Multi-Paires (6 mois)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="eurusd" stroke="#8884d8" strokeWidth={2} name="EUR/USD" />
                    <Line type="monotone" dataKey="gbpusd" stroke="#82ca9d" strokeWidth={2} name="GBP/USD" />
                    <Line type="monotone" dataKey="usdjpy" stroke="#ffc658" strokeWidth={2} name="USD/JPY" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Analyses Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Dernières Analyses</h2>
            
            <Tabs defaultValue="all" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="technique">Techniques</TabsTrigger>
                <TabsTrigger value="fondamentale">Fondamentales</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-6">
                <div className="grid gap-6">
                  {analyses.map((analysis) => (
                    <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{analysis.type}</Badge>
                              <Badge variant="outline">{analysis.timeframe}</Badge>
                              <Badge variant="outline">{analysis.pair}</Badge>
                              <Badge variant={getSentimentBadge(analysis.sentiment)}>
                                {analysis.sentiment}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl mb-2">{analysis.title}</CardTitle>
                            <p className="text-muted-foreground">{analysis.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Objectifs</p>
                            <div className="flex gap-2">
                              {analysis.targets.map((target, index) => (
                                <Badge key={index} variant="secondary">{target}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Support</p>
                            <Badge variant="outline">{analysis.support}</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Auteur</p>
                            <p className="font-medium">{analysis.author}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {analysis.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {analysis.likes}
                            </div>
                            <span>{analysis.date}</span>
                          </div>
                          <Button>Lire l'analyse complète</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="technique" className="space-y-6">
                <div className="grid gap-6">
                  {analyses.filter(a => a.type === 'Technique').map((analysis) => (
                    <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{analysis.type}</Badge>
                              <Badge variant="outline">{analysis.timeframe}</Badge>
                              <Badge variant="outline">{analysis.pair}</Badge>
                              <Badge variant={getSentimentBadge(analysis.sentiment)}>
                                {analysis.sentiment}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl mb-2">{analysis.title}</CardTitle>
                            <p className="text-muted-foreground">{analysis.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button>Lire l'analyse complète</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="fondamentale" className="space-y-6">
                <div className="grid gap-6">
                  {analyses.filter(a => a.type === 'Fondamentale').map((analysis) => (
                    <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{analysis.type}</Badge>
                              <Badge variant="outline">{analysis.timeframe}</Badge>
                              <Badge variant="outline">{analysis.pair}</Badge>
                              <Badge variant={getSentimentBadge(analysis.sentiment)}>
                                {analysis.sentiment}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl mb-2">{analysis.title}</CardTitle>
                            <p className="text-muted-foreground">{analysis.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button>Lire l'analyse complète</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Analyse;