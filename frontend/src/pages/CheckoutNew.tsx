import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  UserCheck,
  CreditCard,
  Send,
  Clock,
  Mail,
  MessageSquare,
  CheckCircle,
  Info
} from "lucide-react";
import { usePayment, Offer } from "@/contexts/PaymentContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type PaymentStep = 'verify-info' | 'payment-pending' | 'enter-transaction' | 'success';

const CheckoutNew = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, fetchWithAuth } = useAuth();
  const { offers, fetchOffers, loading: paymentLoading } = usePayment();
  const { toast } = useToast();

  const offerId = searchParams.get('offer');
  const offerType = searchParams.get('type');
  const planName = searchParams.get('plan');

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [currentStep, setCurrentStep] = useState<PaymentStep>('verify-info');
  const [loading, setLoading] = useState(false);

  // Informations utilisateur à vérifier
  const [userInfo, setUserInfo] = useState({
    full_name: '',
    email: '',
    phone: '',
    telegram_username: '',
    whatsapp_number: '',
    discord_username: ''
  });

  // ID de transaction
  const [transactionId, setTransactionId] = useState('');
  const [paymentId, setPaymentId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      const redirectUrl = '/checkout' + 
        (offerId ? `?offer=${offerId}` : '') +
        (offerType ? `&type=${offerType}` : '') +
        (planName ? `&plan=${planName}` : '');
      navigate('/login?redirect=' + encodeURIComponent(redirectUrl));
      return;
    }

    fetchOffers();
    loadUserInfo();
  }, [isAuthenticated]);

  useEffect(() => {
    if (offers.length > 0) {
      let offer: Offer | undefined;
      
      if (offerId) {
        offer = offers.find(o => o.id === parseInt(offerId));
      }
      
      if (!offer && offerType) {
        offer = offers.find(o => {
          const matchesType = o.offer_type === offerType || o.offer_type === offerType + 's';
          if (planName) {
            const matchesName = o.name.toLowerCase().includes(planName.toLowerCase());
            return matchesType && matchesName;
          }
          return matchesType;
        });
      }
      
      if (offer) {
        setSelectedOffer(offer);
      }
    }
  }, [offerId, offerType, planName, offers]);

  const loadUserInfo = async () => {
    if (!user) return;
    
    // Pré-remplir avec les informations du profil utilisateur
    setUserInfo({
      full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
      email: user.email || '',
      phone: user.phone || '',
      telegram_username: user.telegram_username || '',
      whatsapp_number: user.whatsapp_number || '',
      discord_username: user.discord_username || ''
    });
  };

  const handleVerifyAndContinue = async () => {
    // Valider les informations
    if (!userInfo.full_name || !userInfo.email) {
      toast({
        title: "Informations incomplètes",
        description: "Le nom complet et l'email sont obligatoires.",
        variant: "destructive"
      });
      return;
    }

    if (!userInfo.telegram_username && !userInfo.whatsapp_number && !userInfo.discord_username) {
      toast({
        title: "Méthode de contact requise",
        description: "Veuillez renseigner au moins Telegram, WhatsApp ou Discord pour être contacté.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Créer le paiement en attente
      const response = await fetchWithAuth('/api/payments/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer: selectedOffer?.id,
          user_info: userInfo,
          status: 'pending'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentId(data.id);
        setCurrentStep('payment-pending');
        
        toast({
          title: "Demande envoyée !",
          description: "Notre équipe va vous contacter pour finaliser le paiement."
        });
      } else {
        throw new Error('Erreur lors de la création du paiement');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande de paiement.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCompleted = () => {
    setCurrentStep('enter-transaction');
  };

  const handleSubmitTransaction = async () => {
    if (!transactionId.trim()) {
      toast({
        title: "ID de transaction requis",
        description: "Veuillez entrer votre ID de transaction.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetchWithAuth(`/api/payments/${paymentId}/submit-transaction/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: transactionId
        })
      });

      if (response.ok) {
        setCurrentStep('success');
        toast({
          title: "Transaction soumise !",
          description: "Nous vérifions votre paiement. Vous recevrez votre facture sous peu."
        });
      } else {
        throw new Error('Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la transaction.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedOffer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Aucune offre sélectionnée</h2>
              <p className="text-muted-foreground mb-6">
                Veuillez sélectionner un service pour continuer.
              </p>
              <Button onClick={() => navigate('/services')}>
                Voir nos services
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { step: 'verify-info', label: 'Vérification', icon: UserCheck },
              { step: 'payment-pending', label: 'En attente', icon: Clock },
              { step: 'enter-transaction', label: 'Transaction', icon: CreditCard },
              { step: 'success', label: 'Confirmé', icon: CheckCircle }
            ].map((item, index) => {
              const isActive = currentStep === item.step;
              const isCompleted = ['verify-info', 'payment-pending', 'enter-transaction', 'success'].indexOf(currentStep) > index;
              
              return (
                <div key={item.step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                      ${isCompleted ? 'bg-green-500 text-white' : 
                        isActive ? 'bg-[#D4AF37] text-black' : 
                        'bg-muted text-muted-foreground'}
                    `}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <item.icon className="h-5 w-5" />}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.label}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className={`h-0.5 flex-1 transition-all ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Vérification des informations */}
          {currentStep === 'verify-info' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" style={{ color: '#D4AF37' }} />
                    Vérifiez vos informations
                  </CardTitle>
                  <CardDescription>
                    Ces informations seront utilisées pour vous contacter et finaliser le paiement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Récapitulatif offre */}
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Offre sélectionnée</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">{selectedOffer.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedOffer.description}</p>
                      </div>
                      <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                        {selectedOffer.price}€
                      </p>
                    </div>
                  </div>

                  {/* Formulaire */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="full_name">Nom complet *</Label>
                        <Input
                          id="full_name"
                          value={userInfo.full_name}
                          onChange={(e) => setUserInfo({ ...userInfo, full_name: e.target.value })}
                          placeholder="Jean Dupont"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userInfo.email}
                          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                          placeholder="jean@example.com"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={userInfo.phone}
                          onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>

                      <div>
                        <Label htmlFor="telegram">Telegram * (recommandé)</Label>
                        <Input
                          id="telegram"
                          value={userInfo.telegram_username}
                          onChange={(e) => setUserInfo({ ...userInfo, telegram_username: e.target.value })}
                          placeholder="@username"
                        />
                      </div>

                      <div>
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          type="tel"
                          value={userInfo.whatsapp_number}
                          onChange={(e) => setUserInfo({ ...userInfo, whatsapp_number: e.target.value })}
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>

                      <div>
                        <Label htmlFor="discord">Discord</Label>
                        <Input
                          id="discord"
                          value={userInfo.discord_username}
                          onChange={(e) => setUserInfo({ ...userInfo, discord_username: e.target.value })}
                          placeholder="username#1234"
                        />
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Pourquoi ces informations ?</AlertTitle>
                      <AlertDescription className="text-sm space-y-1">
                        <p>• <strong>Email</strong> : Pour recevoir votre facture et les liens d'accès</p>
                        <p>• <strong>Telegram</strong> : Pour être ajouté au canal des signaux (obligatoire pour signaux)</p>
                        <p>• <strong>WhatsApp/Discord</strong> : Méthodes de contact alternatives</p>
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleVerifyAndContinue}
                    disabled={loading}
                    style={{ backgroundColor: '#D4AF37', color: '#000000' }}
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi en cours...</>
                    ) : (
                      <>J'accepte, je veux payer <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Paiement en attente */}
          {currentStep === 'payment-pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-12 text-center">
                  {/* Animation de chargement */}
                  <div className="mb-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#D4AF3720', border: '3px solid #D4AF37' }}
                    >
                      <Clock className="h-12 w-12" style={{ color: '#D4AF37' }} />
                    </motion.div>
                  </div>

                  <h2 className="text-2xl font-bold mb-4">Demande envoyée avec succès !</h2>
                  
                  <div className="max-w-md mx-auto space-y-4 text-left mb-8">
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Demande reçue</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Notre service client a bien reçu votre demande de paiement
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Contact imminent</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Vous allez être contacté sous 5-15 minutes via {userInfo.telegram_username ? 'Telegram' : userInfo.whatsapp_number ? 'WhatsApp' : 'Discord'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <CreditCard className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">Informations de paiement</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Notre équipe vous enverra les coordonnées bancaires pour effectuer le virement
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Une fois votre paiement effectué</AlertTitle>
                    <AlertDescription>
                      Cliquez sur le bouton ci-dessous pour soumettre votre ID de transaction. 
                      Cela nous permettra de vérifier rapidement votre paiement et de vous envoyer votre facture.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    className="w-full max-w-md" 
                    size="lg"
                    onClick={handlePaymentCompleted}
                    style={{ backgroundColor: '#D4AF37', color: '#000000' }}
                  >
                    J'ai effectué le paiement <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <p className="text-xs text-muted-foreground mt-4">
                    Vous pouvez aussi revenir sur cette page plus tard pour soumettre votre transaction
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Saisie ID transaction */}
          {currentStep === 'enter-transaction' && (
            <motion.div
              key="transaction"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" style={{ color: '#D4AF37' }} />
                    Saisissez votre ID de transaction
                  </CardTitle>
                  <CardDescription>
                    Pour finaliser votre commande et recevoir votre facture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <p className="font-semibold">Commande #{paymentId}</p>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium">{selectedOffer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant</span>
                      <span className="font-bold text-lg" style={{ color: '#D4AF37' }}>
                        {selectedOffer.price}€
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transaction">ID de Transaction *</Label>
                    <Input
                      id="transaction"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Ex: TXN123456789"
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Cet ID vous a été fourni par votre banque lors du virement. Il apparaîtra sur votre facture.
                    </p>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Vérification automatique</AlertTitle>
                    <AlertDescription className="text-sm">
                      Une fois l'ID soumis, notre équipe vérifiera votre paiement et vous enverra votre facture 
                      par email et {userInfo.telegram_username ? 'Telegram' : 'WhatsApp'} dans les 24 heures.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubmitTransaction}
                    disabled={loading || !transactionId.trim()}
                    style={{ backgroundColor: '#D4AF37', color: '#000000' }}
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Vérification...</>
                    ) : (
                      <>Soumettre la transaction <Send className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Succès */}
          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardContent className="p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    <div 
                      className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#D4AF3720' }}
                    >
                      <CheckCircle className="h-16 w-16" style={{ color: '#10B981' }} />
                    </div>
                  </motion.div>

                  <h2 className="text-3xl font-bold mb-2">Transaction soumise !</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Votre ID de transaction a été enregistré avec succès
                  </p>

                  <div className="max-w-md mx-auto space-y-4 text-left mb-8">
                    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Paiement en cours de vérification</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Notre équipe vérifie actuellement votre transaction <strong>{transactionId}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Facture à venir</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Dès validation, votre facture sera envoyée à <strong>{userInfo.email}</strong>
                          {userInfo.telegram_username && <> et sur <strong>Telegram</strong></>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">Délai de traitement</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Validation sous 24 heures (généralement 2-4 heures)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate('/user')} variant="outline">
                      Retour au dashboard
                    </Button>
                    <Button 
                      onClick={() => navigate('/user/payments')}
                      style={{ backgroundColor: '#D4AF37', color: '#000000' }}
                    >
                      Voir mes paiements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutNew;
