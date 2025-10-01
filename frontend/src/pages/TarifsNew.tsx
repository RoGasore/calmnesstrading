import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Headphones } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { EditableLayout } from "@/components/cms/EditableLayout";
import { OffersGrid } from "@/components/payment/OffersGrid";

const Tarifs = () => {
  return (
    <EditableLayout pageSlug="tarifs">
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Nos Tarifs
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Choisissez le plan qui correspond à vos objectifs de trading
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Badge variant="secondary" className="px-4 py-2">
                    <Shield className="w-4 h-4 mr-2" />
                    Sans Engagement
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2">
                    <Zap className="w-4 h-4 mr-2" />
                    Accès Immédiat
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2">
                    <Headphones className="w-4 h-4 mr-2" />
                    Support 24/7
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section - Dynamic Offers */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <OffersGrid />
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 bg-muted/50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Questions Fréquentes</h2>
              <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Puis-je changer de plan à tout moment ?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements sont immédiats.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Comment fonctionne le paiement ?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Après avoir sélectionné votre offre, vous serez redirigé vers une page de contact pour finaliser le paiement avec notre équipe.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Les signaux sont-ils garantis ?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Le trading comporte des risques. Nos signaux sont basés sur des analyses expertes, mais nous ne garantissons pas les profits.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Puis-je annuler mon abonnement ?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Oui, vous pouvez annuler à tout moment. Aucun engagement n'est requis.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </EditableLayout>
  );
};

export default Tarifs;

