import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Mail, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Commande confirmée !</h1>
              <p className="text-xl text-muted-foreground">
                Merci pour votre confiance
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Prochaines étapes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Confirmation par email</h3>
                      <p className="text-sm text-muted-foreground">
                        Vous recevrez un email de confirmation avec tous les détails de votre commande dans les prochaines minutes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Traitement du paiement</h3>
                      <p className="text-sm text-muted-foreground">
                        Nous vérifions votre paiement. Cela peut prendre de quelques minutes à 24h selon la méthode choisie.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Activation de votre accès</h3>
                      <p className="text-sm text-muted-foreground">
                        Une fois le paiement confirmé, votre accès aux formations et signaux sera automatiquement activé.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 p-4 bg-success/5 border border-success/20 rounded-lg">
                  <Mail className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium">
                    Surveillez votre boîte email pour les prochaines étapes
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Informations utiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Support client</p>
                      <p className="text-sm text-muted-foreground">24/7 disponible</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium">Garantie</p>
                      <p className="text-sm text-muted-foreground">30 jours satisfait ou remboursé</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Besoin d'aide ?</strong> Contactez notre équipe support à{" "}
                    <a href="mailto:support@trading-academy.com" className="text-primary hover:underline">
                      support@trading-academy.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <Button 
                onClick={() => navigate("/")} 
                className="w-full md:w-auto"
                size="lg"
              >
                Retour à l'accueil
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Numéro de commande : #{Date.now().toString().slice(-8)}
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;