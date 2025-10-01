import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  CreditCard,
  Bell,
  Save,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserSubscriptions } from "@/components/user/UserSubscriptions";

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    name: `${user.first_name} ${user.last_name}`.trim() || "",
    email: user?.email || "",
    phone: "+33 6 12 34 56 78",
    location: "Paris, France",
    bio: "Trader passionné par les marchés financiers depuis 5 ans.",
    website: "https://monsite.com",
    linkedin: "https://linkedin.com/in/monprofil"
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    tradingAlerts: true,
    weeklyReport: true,
    language: "fr",
    timezone: "Europe/Paris",
    currency: "EUR"
  });

  const handleProfileSave = () => {
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    });
  };

  const handlePreferencesSave = () => {
    toast({
      title: "Préférences mises à jour",
      description: "Vos préférences ont été sauvegardées.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Accès refusé</CardTitle>
              <CardDescription>
                Vous devez être connecté pour accéder à votre profil.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et préférences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar avec info utilisateur */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">
                      {`${user.first_name} ${user.last_name}`.trim().split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{`${user.first_name} ${user.last_name}`.trim()}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  <Badge variant={isAdmin ? 'default' : 'secondary'}>
                    {isAdmin ? 'Administrateur' : 'Utilisateur'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Membre depuis Mars 2024
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Compte vérifié
                  </div>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Changer l'avatar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
                  <TabsTrigger value="preferences">Préférences</TabsTrigger>
                  <TabsTrigger value="security">Sécurité</TabsTrigger>
                  <TabsTrigger value="billing">Facturation</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations personnelles</CardTitle>
                      <CardDescription>
                        Mettez à jour vos informations de profil
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom complet</Label>
                          <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Localisation</Label>
                          <Input
                            id="location"
                            value={profile.location}
                            onChange={(e) => setProfile({...profile, location: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Biographie</Label>
                        <Textarea
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => setProfile({...profile, bio: e.target.value})}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="website">Site web</Label>
                          <Input
                            id="website"
                            value={profile.website}
                            onChange={(e) => setProfile({...profile, website: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={profile.linkedin}
                            onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                          />
                        </div>
                      </div>

                      <Button onClick={handleProfileSave} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder les modifications
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="subscriptions" className="space-y-6">
                  <UserSubscriptions />
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Préférences</CardTitle>
                      <CardDescription>
                        Configurez vos préférences d'utilisation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Notifications
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Notifications email</p>
                              <p className="text-sm text-muted-foreground">
                                Recevoir des emails pour les mises à jour importantes
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={preferences.emailNotifications}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                emailNotifications: e.target.checked
                              })}
                              className="rounded"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Notifications push</p>
                              <p className="text-sm text-muted-foreground">
                                Recevoir des notifications sur votre appareil
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={preferences.pushNotifications}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                pushNotifications: e.target.checked
                              })}
                              className="rounded"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Alertes de trading</p>
                              <p className="text-sm text-muted-foreground">
                                Recevoir des alertes pour les signaux de trading
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={preferences.tradingAlerts}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                tradingAlerts: e.target.checked
                              })}
                              className="rounded"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-4">Localisation</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="language">Langue</Label>
                            <select
                              id="language"
                              value={preferences.language}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                language: e.target.value
                              })}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="fr">Français</option>
                              <option value="en">English</option>
                              <option value="es">Español</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency">Devise</Label>
                            <select
                              id="currency"
                              value={preferences.currency}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                currency: e.target.value
                              })}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="USD">USD ($)</option>
                              <option value="GBP">GBP (£)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <Button onClick={handlePreferencesSave} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder les préférences
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sécurité</CardTitle>
                      <CardDescription>
                        Gérez la sécurité de votre compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Mot de passe</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Dernière modification : Il y a 30 jours
                          </p>
                          <Button variant="outline">
                            Changer le mot de passe
                          </Button>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Authentification à deux facteurs</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Ajoutez une couche de sécurité supplémentaire à votre compte
                          </p>
                          <Button variant="outline">
                            Activer 2FA
                          </Button>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Sessions actives</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Gérez les appareils connectés à votre compte
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 border rounded-md">
                              <div>
                                <p className="font-medium">Navigateur actuel</p>
                                <p className="text-sm text-muted-foreground">
                                  Chrome sur Windows • Paris, France
                                </p>
                              </div>
                              <Badge variant="secondary">Actuelle</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Facturation</CardTitle>
                      <CardDescription>
                        Gérez votre abonnement et méthodes de paiement
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Abonnement actuel
                        </h4>
                        <div className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg">Plan Premium</h3>
                              <p className="text-muted-foreground">
                                Accès complet aux signaux et analyses
                              </p>
                            </div>
                            <Badge>Actif</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold">$49/mois</span>
                            <Button variant="outline">Modifier le plan</Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-4">Méthodes de paiement</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 border rounded-md">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5" />
                              <div>
                                <p className="font-medium">•••• •••• •••• 4242</p>
                                <p className="text-sm text-muted-foreground">
                                  Expire 12/2025
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Modifier
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" className="mt-4">
                          Ajouter une méthode de paiement
                        </Button>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-4">Historique des factures</h4>
                        <div className="space-y-2">
                          {[
                            { date: "01/03/2024", amount: "$49", status: "Payée" },
                            { date: "01/02/2024", amount: "$49", status: "Payée" },
                            { date: "01/01/2024", amount: "$49", status: "Payée" },
                          ].map((invoice, index) => (
                            <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                              <div>
                                <p className="font-medium">{invoice.date}</p>
                                <p className="text-sm text-muted-foreground">
                                  Plan Premium
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{invoice.amount}</p>
                                <Badge variant="secondary">{invoice.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;