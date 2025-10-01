import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bitcoin, Shield, Copy, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const cryptoPaymentSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  cryptocurrency: z.string().min(1, "Sélectionnez une cryptomonnaie"),
  walletAddress: z.string().min(26, "Adresse de portefeuille invalide"),
});

type CryptoPaymentData = z.infer<typeof cryptoPaymentSchema>;

interface CryptoPaymentFormProps {
  onSubmit: (data: CryptoPaymentData) => void;
  isProcessing: boolean;
  totalAmount: number;
}

const CryptoPaymentForm = ({ onSubmit, isProcessing, totalAmount }: CryptoPaymentFormProps) => {
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin");
  const [showPaymentAddress, setShowPaymentAddress] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CryptoPaymentData>({
    resolver: zodResolver(cryptoPaymentSchema),
  });

  const cryptocurrencies = [
    {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      rate: 0.0000234, // Example rate: 1 EUR = 0.0000234 BTC
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      icon: "₿",
      color: "text-orange-500"
    },
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "ETH",
      rate: 0.000234,
      address: "0x742C4c4e1c8aF3E4b9bF2D3E5a2b8c9D1E2F3A4B5C6D",
      icon: "Ξ",
      color: "text-blue-500"
    },
    {
      id: "usdt",
      name: "Tether",
      symbol: "USDT",
      rate: 0.92, // 1 EUR ≈ 0.92 USDT
      address: "TEpbJGfMpirqy9xMLEy4qNxJMtJSTbP7A6",
      icon: "₮",
      color: "text-green-500"
    }
  ];

  const selectedCryptoData = cryptocurrencies.find(c => c.id === selectedCrypto);
  const cryptoAmount = selectedCryptoData ? (totalAmount * selectedCryptoData.rate).toFixed(8) : "0";

  const handleFormSubmit = (data: CryptoPaymentData) => {
    setShowPaymentAddress(true);
    onSubmit(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    toast.success("Adresse copiée !");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  if (showPaymentAddress && selectedCryptoData) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Votre commande a été enregistrée. Envoyez le montant exact à l'adresse indiquée ci-dessous.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5" />
              Instructions de paiement {selectedCryptoData.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
                <span className={selectedCryptoData.color}>{selectedCryptoData.icon}</span>
                {cryptoAmount} {selectedCryptoData.symbol}
              </div>
              <p className="text-muted-foreground">≈ €{totalAmount}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Adresse de paiement</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={selectedCryptoData.address}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedCryptoData.address)}
                  >
                    {copiedAddress ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Montant exact à envoyer</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={`${cryptoAmount} ${selectedCryptoData.symbol}`}
                    readOnly
                    className="font-mono text-sm bg-primary/10 font-bold"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(cryptoAmount)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-semibold text-destructive mb-2">⚠️ Important</h4>
              <div className="text-sm space-y-1">
                <p>• Envoyez exactement le montant indiqué</p>
                <p>• Utilisez uniquement le réseau {selectedCryptoData.name}</p>
                <p>• Le paiement doit être effectué dans les 30 minutes</p>
                <p>• Votre accès sera activé après 3 confirmations</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button variant="outline" className="w-full">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                En attente du paiement...
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Paiement par cryptomonnaie</h3>
        <p className="text-sm text-muted-foreground">
          Paiement sécurisé et anonyme
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Informations de contact
          </h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                className="mt-1"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                className="mt-1"
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1"
              placeholder="john.doe@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Cryptocurrency Selection */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Bitcoin className="w-4 h-4 text-primary" />
            Choisissez votre cryptomonnaie
          </h4>
          
          <RadioGroup value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <div className="grid gap-4">
              {cryptocurrencies.map((crypto) => (
                <Label
                  key={crypto.id}
                  htmlFor={crypto.id}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={crypto.id} id={crypto.id} />
                    <span className={`text-2xl ${crypto.color}`}>{crypto.icon}</span>
                    <div>
                      <div className="font-medium">{crypto.name}</div>
                      <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {(totalAmount * crypto.rate).toFixed(crypto.id === 'usdt' ? 2 : 8)} {crypto.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">≈ €{totalAmount}</div>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Wallet Address */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="walletAddress">Votre adresse de portefeuille *</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Adresse pour recevoir les confirmations et reçus
            </p>
            <Input
              id="walletAddress"
              {...register("walletAddress")}
              className="mt-1 font-mono"
              placeholder="Entrez votre adresse de portefeuille..."
              onChange={(e) => setValue("walletAddress", e.target.value)}
            />
            {errors.walletAddress && (
              <p className="text-sm text-destructive mt-1">{errors.walletAddress.message}</p>
            )}
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Transaction sécurisée sur blockchain</span>
          <Badge variant="secondary">Anonyme</Badge>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12" 
          size="lg"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Génération de l'adresse...
            </>
          ) : (
            <>
              <Bitcoin className="w-4 h-4 mr-2" />
              Continuer avec {selectedCryptoData?.name} - €{totalAmount}
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </p>
      </form>
    </div>
  );
};

export default CryptoPaymentForm;