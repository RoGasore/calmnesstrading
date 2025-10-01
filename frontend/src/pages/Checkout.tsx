import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, MessageCircle, Phone, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { usePayment, Offer, ContactChannel } from "@/contexts/PaymentContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { offers, contactChannels, fetchOffers, fetchContactChannels, createPendingPayment, loading } = usePayment();
  const { toast } = useToast();

  const offerId = searchParams.get('offer');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedContactMethod, setSelectedContactMethod] = useState<string>('');
  const [contactInfo, setContactInfo] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout' + (offerId ? `?offer=${offerId}` : ''));
      return;
    }

    fetchOffers();
    fetchContactChannels();
  }, [isAuthenticated, navigate, offerId, fetchOffers, fetchContactChannels]);

  useEffect(() => {
    if (offerId && offers.length > 0) {
      const offer = offers.find(o => o.id === parseInt(offerId));
      if (offer) {
        setSelectedOffer(offer);
      }
    }
  }, [offerId, offers]);

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'whatsapp':
        return <Phone className="h-5 w-5" />;
      case 'telegram':
      case 'discord':
        return <MessageCircle className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      default:
        return <MessageCircle className="h-5 w-5" />;
    }
  };

  const handleSubmit = async () => {
    if (!selectedOffer || !selectedContactMethod || !contactInfo.trim()) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const result = await createPendingPayment({
      offer: selectedOffer.id,
      contact_method: selectedContactMethod,
      contact_info: contactInfo,
      amount: selectedOffer.price,
      currency: selectedOffer.currency,
    });

    if (result) {
      setStep('success');
    }
  };

  const selectedChannel = contactChannels.find(c => c.channel_type === selectedContactMethod);

  if (!isAuthenticated) {
    return null;
  }

  if (loading && offers.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {step === 'success' ? 'Demande envoyée !' : 'Finaliser votre achat'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {step === 'success' 
                ? 'Notre équipe va traiter votre demande' 
                : 'Contactez notre service client pour finaliser votre paiement'}
            </p>
          </motion.div>

          {step === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-primary">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="h-16 w-16 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Demande de paiement enregistrée</CardTitle>
                  <CardDescription>
                    Votre demande a été envoyée avec succès. Notre équipe va vous contacter très bientôt.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Résumé de la demande */}
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Offre sélectionnée:</span>
                      <span className="font-medium">{selectedOffer?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant:</span>
                      <span className="font-medium">{selectedOffer?.price} {selectedOffer?.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Méthode de contact:</span>
                      <span className="font-medium capitalize">{selectedContactMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vos coordonnées:</span>
                      <span className="font-medium">{contactInfo}</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Prochaines étapes</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Notre équipe va vous contacter sur <strong>{selectedContactMethod}</strong> dans les plus brefs délais pour finaliser le paiement. 
                          Gardez vos coordonnées ({contactInfo}) à portée de main.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => navigate('/profile')}
                      variant="outline"
                      className="flex-1"
                    >
                      Voir mon profil
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      className="flex-1"
                    >
                      Retour à l'accueil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Récapitulatif de la commande */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Récapitulatif</CardTitle>
                    <CardDescription>Détails de votre offre</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedOffer ? (
                      <>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{selectedOffer.name}</h3>
                          <p className="text-muted-foreground">{selectedOffer.description}</p>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold">{selectedOffer.price}</span>
                          <span className="text-xl text-muted-foreground">{selectedOffer.currency}</span>
                        </div>

                        {selectedOffer.duration_days && (
                          <Badge variant="secondary" className="text-sm">
                            Accès pendant {selectedOffer.duration_days} jours
                          </Badge>
                        )}

                        <div className="border-t pt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Sous-total</span>
                            <span>{selectedOffer.price} {selectedOffer.currency}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{selectedOffer.price} {selectedOffer.currency}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Aucune offre sélectionnée</p>
                        <Button
                          onClick={() => navigate('/tarifs')}
                          className="mt-4"
                        >
                          Voir les offres
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Formulaire de contact */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Méthode de contact</CardTitle>
                    <CardDescription>
                      Choisissez comment vous souhaitez être contacté pour finaliser votre paiement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Choix du canal de contact */}
                    <div>
                      <Label className="mb-3 block">Canal de contact</Label>
                      <RadioGroup value={selectedContactMethod} onValueChange={setSelectedContactMethod}>
                        {contactChannels.map((channel) => (
                          <div key={channel.id} className="flex items-start space-x-3 border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors">
                            <RadioGroupItem value={channel.channel_type} id={`channel-${channel.id}`} />
                            <label htmlFor={`channel-${channel.id}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2 mb-1">
                                {getContactMethodIcon(channel.channel_type)}
                                <span className="font-medium capitalize">{channel.channel_type}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{channel.contact_info}</p>
                              {channel.instructions && (
                                <p className="text-xs text-muted-foreground mt-2">{channel.instructions}</p>
                              )}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Champ pour les coordonnées */}
                    <div>
                      <Label htmlFor="contact_info">
                        {selectedContactMethod === 'whatsapp' && 'Numéro WhatsApp'}
                        {selectedContactMethod === 'telegram' && 'Pseudo Telegram'}
                        {selectedContactMethod === 'discord' && 'Pseudo Discord'}
                        {selectedContactMethod === 'email' && 'Adresse email'}
                        {!selectedContactMethod && 'Vos coordonnées'}
                      </Label>
                      <Input
                        id="contact_info"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder={
                          selectedContactMethod === 'whatsapp' ? '+33 6 XX XX XX XX' :
                          selectedContactMethod === 'telegram' ? '@votre_pseudo' :
                          selectedContactMethod === 'discord' ? 'votre_pseudo#1234' :
                          selectedContactMethod === 'email' ? 'email@exemple.com' :
                          'Entrez vos coordonnées'
                        }
                        className="mt-2"
                      />
                    </div>

                    {/* Informations utilisateur */}
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold mb-2">Vos informations</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID Utilisateur:</span>
                          <span className="font-mono">{user?.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{user?.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bouton de confirmation */}
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedOffer || !selectedContactMethod || !contactInfo.trim() || loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        'Envoyer la demande'
                      )}
                    </Button>

                    {selectedChannel && (
                      <div className="text-center">
                        <a
                          href={selectedChannel.contact_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Ou contactez-nous directement sur {selectedChannel.channel_type}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
