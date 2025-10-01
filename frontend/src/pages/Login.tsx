import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TestCredentials from "@/components/TestCredentials";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditableLayout } from "@/components/cms/EditableLayout";

const Login = () => {
  const { language } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const translations = {
    'login.title': { fr: 'Connexion', en: 'Login' },
    'login.subtitle': { fr: 'Connectez-vous à votre compte', en: 'Sign in to your account' },
    'login.email': { fr: 'Email', en: 'Email' },
    'login.password': { fr: 'Mot de passe', en: 'Password' },
    'login.showPassword': { fr: 'Afficher le mot de passe', en: 'Show password' },
    'login.hidePassword': { fr: 'Masquer le mot de passe', en: 'Hide password' },
    'login.submit': { fr: 'Se connecter', en: 'Sign in' },
    'login.noAccount': { fr: "Vous n'avez pas de compte ?", en: "Don't have an account?" },
    'login.register': { fr: "S'inscrire", en: 'Sign up' },
    'login.forgotPassword': { fr: 'Mot de passe oublié ?', en: 'Forgot password?' }
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <EditableLayout pageSlug="login">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
          <TestCredentials />
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                {t('login.title')}
              </CardTitle>
              <CardDescription>
                {t('login.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('login.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">{t('login.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      title={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    {t('login.forgotPassword')}
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Connexion..." : t('login.submit')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('login.noAccount')}{" "}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    {t('login.register')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </main>
        <Footer />
      </div>
    </EditableLayout>
  );
};

export default Login;