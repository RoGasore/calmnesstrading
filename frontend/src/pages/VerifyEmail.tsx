import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Mail, Clock, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

import { API_CONFIG, API_URLS } from '@/config/api';

const API_BASE = API_CONFIG.BASE_URL;

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [status, setStatus] = useState<"pending" | "success" | "error" | "registered" | "unverified">("pending");
  const [message, setMessage] = useState<string>("Validation en cours...");
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = params.get("token");
    const emailParam = params.get("email");
    const statusParam = params.get("status");
    
    // Si c'est une redirection après inscription
    if (statusParam === "registered" && emailParam) {
      setStatus("registered");
      setEmail(emailParam);
      setMessage("Votre compte a été créé avec succès !");
      return;
    }
    
    // Si c'est une redirection après tentative de connexion avec compte non vérifié
    if (statusParam === "unverified" && emailParam) {
      setStatus("unverified");
      setEmail(emailParam);
      setMessage("Votre compte existe mais n'est pas encore vérifié.");
      return;
    }
    
    // Si c'est une activation par token
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
          
          if (data.user) {
            setEmail(data.user.email || "");
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

  const goToLogin = () => {
    navigate("/login");
  };

  const resendEmail = async () => {
    if (!email || isResending) return;
    
    setIsResending(true);
    try {
      const response = await fetch(API_URLS.RESEND_ACTIVATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Email de vérification renvoyé ! Vérifiez votre boîte de réception.");
      } else {
        setMessage(data.detail || "Erreur lors du renvoi de l'email. Veuillez réessayer.");
      }
    } catch (error) {
      setMessage("Erreur lors du renvoi de l'email. Veuillez réessayer.");
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-16 w-16 text-green-600" />;
      case "error":
        return <XCircle className="h-16 w-16 text-red-600" />;
      case "registered":
        return <Mail className="h-16 w-16 text-blue-600" />;
      case "unverified":
        return <Mail className="h-16 w-16 text-amber-600" />;
      default:
        return <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "success":
        return language === 'fr' ? "Compte activé !" : "Account Activated!";
      case "error":
        return language === 'fr' ? "Erreur d'activation" : "Activation Error";
      case "registered":
        return language === 'fr' ? "Inscription réussie !" : "Registration Successful!";
      case "unverified":
        return language === 'fr' ? "Email non vérifié" : "Email Not Verified";
      default:
        return language === 'fr' ? "Vérification en cours..." : "Verifying...";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "success":
        return language === 'fr' ? "Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter." : "Your account has been successfully activated. You can now log in.";
      case "error":
        return language === 'fr' ? "Le lien d'activation est invalide ou expiré." : "The activation link is invalid or expired.";
      case "registered":
        return language === 'fr' ? "Un email de vérification a été envoyé à votre adresse email." : "A verification email has been sent to your email address.";
      case "unverified":
        return language === 'fr' ? "Votre compte existe mais votre email n'est pas encore vérifié. Vérifiez votre boîte de réception." : "Your account exists but your email is not yet verified. Check your inbox.";
      default:
        return language === 'fr' ? "Vérification de votre email en cours..." : "Verifying your email...";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">{getStatusTitle()}</CardTitle>
              <CardDescription className="text-lg">{getStatusDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                {getStatusIcon()}
                
                <div className="space-y-4 w-full">
                  <p className="text-sm text-muted-foreground text-center">{message}</p>
                  
                  {(status === "registered" || status === "unverified") && email && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm font-medium">Email envoyé à :</span>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-mono">{email}</p>
                    </div>
                  )}
                  
                  {(status === "registered" || status === "unverified") && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Prochaines étapes :</span>
                      </div>
                      <ul className="text-sm text-amber-600 dark:text-amber-400 mt-2 space-y-1 text-left">
                        <li>• Vérifiez votre boîte de réception</li>
                        <li>• Cliquez sur le lien d'activation dans l'email</li>
                        <li>• Votre compte sera activé automatiquement</li>
                        <li>• Vous pourrez ensuite vous connecter</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                  {status === "success" && (
                    <>
                      <Button onClick={goToLogin} className="w-full">
                        {language === 'fr' ? 'Se connecter' : 'Log In'}
                      </Button>
                      <Button onClick={goToHome} variant="outline" className="w-full">
                        {language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
                      </Button>
                    </>
                  )}
                  
                  {(status === "registered" || status === "unverified") && (
                    <>
                      <Button 
                        onClick={resendEmail} 
                        disabled={isResending}
                        variant="outline" 
                        className="w-full"
                      >
                        {isResending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {language === 'fr' ? 'Envoi en cours...' : 'Sending...'}
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            {language === 'fr' ? 'Renvoyer l\'email' : 'Resend Email'}
                          </>
                        )}
                      </Button>
                      <Button onClick={goToHome} variant="outline" className="w-full">
                        {language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
                      </Button>
                    </>
                  )}
                  
                  {status === "error" && (
                    <>
                      <Button onClick={goToLogin} className="w-full">
                        {language === 'fr' ? 'Se connecter' : 'Log In'}
                      </Button>
                      <Button onClick={goToHome} variant="outline" className="w-full">
                        {language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        {language === 'fr' ? 'Problème persistant ?' : 'Still having issues?'}{" "}
                        <Link to="/register" className="text-primary underline">
                          {language === 'fr' ? 'Réinscrivez-vous' : 'Register again'}
                        </Link>
                      </p>
                    </>
                  )}
                </div>
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


