import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { API_CONFIG } from '@/config/api';

const API_BASE = API_CONFIG.BASE_URL;

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState<string>("Validation en cours...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide: token manquant.");
      return;
    }
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/activate/?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("success");
          setMessage(data.detail || "Compte activé avec succès ! Vous pouvez maintenant vous connecter.");
          
          // Mettre à jour l'utilisateur dans le contexte si les données sont disponibles
          if (data.user) {
            // Optionnel: mettre à jour le contexte d'authentification
          }
        } else {
          setStatus("error");
          setMessage(data.detail || "Le lien d'activation est invalide ou expiré.");
        }
      } catch {
        setStatus("error");
        setMessage("Impossible de valider votre e-mail pour le moment. Veuillez réessayer plus tard.");
      }
    };
    run();
  }, [params]);

  const goToHome = () => {
    navigate("/");
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">Vérification de l'e-mail</CardTitle>
              <CardDescription>Finalisez l'activation de votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                {status === "success" ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                ) : status === "error" ? (
                  <XCircle className="h-12 w-12 text-red-600" />
                ) : (
                  <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                <p className="text-sm text-muted-foreground text-center">{message}</p>
                
                {status === "success" && (
                  <div className="flex flex-col gap-2 w-full">
                    <Button onClick={goToHome} variant="outline" className="w-full">
                      Rester sur le site
                    </Button>
                    <Button onClick={goToProfile} className="w-full">
                      Aller vers mon profil
                    </Button>
                  </div>
                )}
                
                {status === "error" && (
                  <div className="flex flex-col gap-2 w-full">
                    <Button onClick={goToLogin} className="w-full">
                      Se connecter
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Problème persistant ? <Link to="/register" className="text-primary underline">Réinscrivez-vous</Link>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;


