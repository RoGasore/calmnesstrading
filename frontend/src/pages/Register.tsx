import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/config/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableLayout } from "@/components/cms/EditableLayout";

const Register = () => {
  const { language } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    telegramUsername: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });

  const translations = {
    'register.title': { fr: 'Inscription', en: 'Sign Up' },
    'register.subtitle': { fr: 'Créez votre compte trader', en: 'Create your trader account' },
    'register.name': { fr: 'Nom complet', en: 'Full name' },
    'register.email': { fr: 'Email', en: 'Email' },
    'register.phone': { fr: 'Numéro de téléphone', en: 'Phone number' },
    'register.telegram': { fr: 'Nom d\'utilisateur Telegram', en: 'Telegram username' },
    'register.telegramHelper': { fr: 'Sans le @, ex: monusername', en: 'Without @, ex: myusername' },
    'register.password': { fr: 'Mot de passe', en: 'Password' },
    'register.confirmPassword': { fr: 'Confirmer le mot de passe', en: 'Confirm password' },
    'register.showPassword': { fr: 'Afficher le mot de passe', en: 'Show password' },
    'register.hidePassword': { fr: 'Masquer le mot de passe', en: 'Hide password' },
    'register.terms': { fr: 'J\'accepte les conditions d\'utilisation', en: 'I accept the terms and conditions' },
    'register.submit': { fr: 'Créer mon compte', en: 'Create account' },
    'register.hasAccount': { fr: 'Vous avez déjà un compte ?', en: 'Already have an account?' },
    'register.login': { fr: 'Se connecter', en: 'Sign in' }
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailPattern.test(formData.email)) {
      toast({
        title: language === 'fr' ? 'Email invalide' : 'Invalid email',
        description: language === 'fr' ? "Veuillez saisir une adresse e-mail valide" : 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    if ((formData.password || '').length < 8) {
      toast({
        title: language === 'fr' ? 'Mot de passe trop court' : 'Password too short',
        description: language === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères' : 'Password must be at least 8 characters',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: language === 'fr' ? 'Mots de passe différents' : 'Passwords do not match',
        description: language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Please retype the same password',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: language === 'fr' ? "Conditions d'utilisation" : 'Terms and conditions',
        description: language === 'fr' ? 'Vous devez accepter les conditions d\'utilisation' : 'You must accept the terms and conditions',
        variant: 'destructive'
      });
      return;
    }

    const confirmUrl = `${API_CONFIG.BASE_URL.replace(/\/$/, '')}/api/auth/activate/`;
    
    // Générer un username unique basé sur l'email
    const username = formData.email.split('@')[0] + '_' + Date.now().toString().slice(-4);
    
    const ok = await register({
      username: username,
      email: formData.email,
      password: formData.password,
      first_name: formData.name.split(' ')[0] || '',
      last_name: formData.name.split(' ').slice(1).join(' ') || '',
      phone: formData.phone,
      telegram_username: formData.telegramUsername,
      confirm_url: confirmUrl
    });
    if (ok) {
      toast({
        title: language === 'fr' ? 'Inscription réussie' : 'Registration successful',
        description: language === 'fr' ? 'Vérifiez votre e-mail pour activer votre compte.' : 'Check your email to activate your account.'
      });
      navigate('/login');
    } else {
      toast({
        title: language === 'fr' ? "Inscription échouée" : 'Registration failed',
        description: language === 'fr' ? "Veuillez réessayer avec des informations valides." : 'Please try again with valid information.',
        variant: 'destructive'
      });
    }
  };

  return (
    <EditableLayout pageSlug="register">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                {t('register.title')}
              </CardTitle>
              <CardDescription>
                {t('register.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('register.name')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('register.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('register.phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram">{t('register.telegram')}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-muted-foreground">@</span>
                    <Input
                      id="telegram"
                      type="text"
                      placeholder="monusername"
                      value={formData.telegramUsername}
                      onChange={(e) => handleInputChange('telegramUsername', e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{t('register.telegramHelper')}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">{t('register.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      title={showPassword ? t('register.hidePassword') : t('register.showPassword')}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      title={showConfirmPassword ? t('register.hidePassword') : t('register.showPassword')}
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    {t('register.terms')}
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={!formData.acceptTerms}
                >
                  {t('register.submit')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('register.hasAccount')}{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    {t('register.login')}
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

export default Register;