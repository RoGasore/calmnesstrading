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
import { Shield, AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const bankPaymentSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  iban: z.string().min(15, "IBAN invalide").max(34, "IBAN trop long"),
  bic: z.string().min(8, "BIC invalide").max(11, "BIC invalide"),
  bankName: z.string().min(2, "Nom de la banque requis"),
  country: z.string().min(2, "Pays requis"),
});

type BankPaymentData = z.infer<typeof bankPaymentSchema>;

interface BankPaymentFormProps {
  onSubmit: (data: BankPaymentData) => void;
  isProcessing: boolean;
  totalAmount: number;
}

const BankPaymentForm = ({ onSubmit, isProcessing, totalAmount }: BankPaymentFormProps) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BankPaymentData>({
    resolver: zodResolver(bankPaymentSchema),
  });

  const countries = [
    { code: "FR", name: "France" },
    { code: "DE", name: "Allemagne" },
    { code: "IT", name: "Italie" },
    { code: "ES", name: "Espagne" },
    { code: "BE", name: "Belgique" },
    { code: "NL", name: "Pays-Bas" },
    { code: "CH", name: "Suisse" },
    { code: "LU", name: "Luxembourg" },
  ];

  const handleFormSubmit = (data: BankPaymentData) => {
    setShowInstructions(true);
    onSubmit(data);
  };

  if (showInstructions) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Votre commande a été enregistrée. Veuillez effectuer le virement bancaire selon les instructions ci-dessous.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Instructions de virement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Bénéficiaire</Label>
                <p className="font-mono text-sm bg-muted p-2 rounded">TRADING ACADEMY SAS</p>
              </div>
              <div>
                <Label className="text-sm font-medium">IBAN</Label>
                <p className="font-mono text-sm bg-muted p-2 rounded">FR76 1234 5678 9012 3456 7890 123</p>
              </div>
              <div>
                <Label className="text-sm font-medium">BIC</Label>
                <p className="font-mono text-sm bg-muted p-2 rounded">BNPAFRPPXXX</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Montant</Label>
                <p className="font-mono text-sm bg-primary/10 p-2 rounded font-bold">€{totalAmount}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Référence obligatoire</Label>
              <p className="font-mono text-sm bg-primary/10 p-2 rounded font-bold">
                REF-{Date.now().toString().slice(-8)}
              </p>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Le virement doit être effectué dans les 7 jours</p>
              <p>• N'oubliez pas d'inclure la référence dans le libellé</p>
              <p>• Votre accès sera activé sous 24h après réception du paiement</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Informations de facturation</h3>
        <p className="text-sm text-muted-foreground">
          Sécurisé par cryptage SSL 256-bit
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Informations personnelles
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

        {/* Banking Information */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Informations bancaires
          </h4>
          
          <div>
            <Label htmlFor="iban">IBAN *</Label>
            <Input
              id="iban"
              {...register("iban")}
              className="mt-1 font-mono"
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              onChange={(e) => {
                // Format IBAN with spaces
                const value = e.target.value.replace(/\s/g, '').toUpperCase();
                const formatted = value.replace(/(.{4})/g, '$1 ').trim();
                e.target.value = formatted;
                setValue("iban", value);
              }}
            />
            {errors.iban && (
              <p className="text-sm text-destructive mt-1">{errors.iban.message}</p>
            )}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="bic">BIC/SWIFT *</Label>
              <Input
                id="bic"
                {...register("bic")}
                className="mt-1 font-mono"
                placeholder="BNPAFRPPXXX"
                onChange={(e) => setValue("bic", e.target.value.toUpperCase())}
              />
              {errors.bic && (
                <p className="text-sm text-destructive mt-1">{errors.bic.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="bankName">Nom de la banque *</Label>
              <Input
                id="bankName"
                {...register("bankName")}
                className="mt-1"
                placeholder="BNP Paribas"
              />
              {errors.bankName && (
                <p className="text-sm text-destructive mt-1">{errors.bankName.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="country">Pays *</Label>
            <Select onValueChange={(value) => setValue("country", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionnez votre pays" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
            )}
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Paiement sécurisé SSL</span>
          <Badge variant="secondary">256-bit</Badge>
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
              Traitement en cours...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Confirmer le virement - €{totalAmount}
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

export default BankPaymentForm;