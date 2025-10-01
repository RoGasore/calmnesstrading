import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, BarChart3, Zap, Shield, Bell, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { EditableLayout } from "@/components/cms/EditableLayout";

const Signaux = () => {
  const currentSignals = [
    {
      id: 1,
      pair: "EUR/USD",
      type: "BUY",
      entry: 1.0850,
      target: 1.0920,
      stopLoss: 1.0800,
      risk: "Moyen",
      timeframe: "4H",
      status: "Actif",
      profit: "+45 pips",
      time: "Il y a 2h"
    },
    {
      id: 2,
      pair: "GBP/JPY",
      type: "SELL",
      entry: 185.20,
      target: 184.50,
      stopLoss: 185.80,
      risk: "Élevé",
      timeframe: "1H",
      status: "En cours",
      profit: "+25 pips",
      time: "Il y a 45min"
    },
    {
      id: 3,
      pair: "USD/CAD",
      type: "BUY",
      entry: 1.3650,
      target: 1.3720,
      stopLoss: 1.3600,
      risk: "Faible",
      timeframe: "Daily",
      status: "Nouveau",
      profit: "En attente",
      time: "Il y a 15min"
    }
  ];

  const recentHistory = [
    {
      id: 1,
      pair: "AUD/USD",
      type: "BUY",
      result: "Gagnant",
      profit: "+85 pips",
      date: "2024-03-15"
    },
    {
      id: 2,
      pair: "EUR/GBP",
      type: "SELL",
      result: "Gagnant",
      profit: "+62 pips",
      date: "2024-03-14"
    },
    {
      id: 3,
      pair: "USD/JPY",
      type: "BUY",
      result: "Perdant",
      profit: "-30 pips",
      date: "2024-03-13"
    }
  ];

  const stats = [
    {
      label: "Taux de Réussite",
      value: "87%",
      icon: Target,
      trend: "+2.5%"
    },
    {
      label: "Profit Moyen",
      value: "+65 pips",
      icon: DollarSign,
      trend: "+12%"
    },
    {
      label: "Signaux/Jour",
      value: "5-8",
      icon: BarChart3,
      trend: "Stable"
    },
    {
      label: "Temps Moyen",
      value: "6h",
      icon: Clock,
      trend: "-15%"
    }
  ];

  const plans = [
    {
      name: "Hebdomadaire",
      price: 30,
      period: "semaine",
      features: [
        {
          fr: "Accès à tous les signaux pendant 7 jours",
          en: "Access to all signals for 7 days"
        },
        {
          fr: "Historique consultable avec pagination",
          en: "Viewable signal history with pagination"
        },
        {
          fr: "Export de l'historique au format Excel",
          en: "Export history as Excel file"
        },
        {
          fr: "Accès à toutes les analyses (techniques et fondamentales)",
          en: "Access to all analyses (technical & fundamental)"
        },
        {
          fr: "Support par email",
          en: "Email support"
        }
      ],
      popular: false
    },
    {
      name: "Mensuel",
      price: 99,
      period: "mois",
      features: [
        {
          fr: "Accès à tous les signaux pendant 30 jours",
          en: "Access to all signals for 30 days"
        },
        {
          fr: "Historique consultable avec pagination",
          en: "Viewable signal history with pagination"
        },
        {
          fr: "Export de l'historique au format Excel",
          en: "Export history as Excel file"
        },
        {
          fr: "Accès à toutes les analyses (techniques et fondamentales)",
          en: "Access to all analyses (technical & fundamental)"
        },
        {
          fr: "Support prioritaire",
          en: "Priority support"
        }
      ],
      popular: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actif": return "default";
      case "En cours": return "secondary";
      case "Nouveau": return "outline";
      default: return "secondary";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Faible": return "text-green-500";
      case "Moyen": return "text-yellow-500";
      case "Élevé": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <EditableLayout pageSlug="signaux">
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Signaux Trading
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Recevez des signaux de trading professionnels en temps réel avec un taux de réussite de 87%
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge variant="secondary" className="px-4 py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Temps Réel
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  87% de Réussite
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications Instant
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.trend} depuis le mois dernier
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Historique des signaux */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Historique des Signaux</h2>
            {/* TODO: Ajouter la logique d'export Excel ici */}
            <Tabs defaultValue="history" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>
              <TabsContent value="history" className="space-y-6">
                <div className="grid gap-4">
                  {recentHistory.map((signal) => (
                    <Card key={signal.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              signal.type === 'BUY' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {signal.type === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium">{signal.pair}</p>
                              <p className="text-sm text-muted-foreground">{signal.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={signal.result === 'Gagnant' ? 'default' : 'destructive'}>
                              {signal.result}
                            </Badge>
                            <p className={`text-sm font-medium ${
                              signal.profit.includes('+') ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {signal.profit}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {/* Pagination */}
                <div className="flex justify-center mt-8">
                  {/* Pagination fictive, à remplacer par la vraie logique */}
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <a href="#" className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">&lt;</a>
                    <a href="#" className="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">1</a>
                    <a href="#" className="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">2</a>
                    <a href="#" className="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">3</a>
                    <span className="px-3 py-1 border border-gray-300 bg-white text-gray-400">...</span>
                    <a href="#" className="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">300</a>
                    <a href="#" className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">&gt;</a>
                  </nav>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nos Abonnements</h2>
            <div className="flex flex-col items-center">
              <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                {plans.map((plan) => (
                  <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        Plus Populaire
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="text-4xl font-bold">
                        ${plan.price}
                        <span className="text-lg text-muted-foreground">/{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 justify-center">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm">
                              {/* TODO: remplacer 'fr' par la langue dynamique */}
                              {feature.fr} <span className="text-muted-foreground">/ {feature.en}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        Choisir ce plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
        </main>

        <Footer />
      </div>
    </EditableLayout>
  );
};

export default Signaux;