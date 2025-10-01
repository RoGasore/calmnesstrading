import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield } from "lucide-react";

const TestCredentials = () => {
  return (
    <Card className="max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Comptes de Test
        </CardTitle>
        <CardDescription>
          Utilisez ces identifiants pour tester l'application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="default">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Email:</strong> admin@calmnessfi.com<br />
            <strong>Mot de passe:</strong> admin123
          </p>
        </div>
        
        <div className="space-y-2">
          <Badge variant="secondary">Utilisateur</Badge>
          <p className="text-sm text-muted-foreground">
            <strong>Email:</strong> user@test.com<br />
            <strong>Mot de passe:</strong> user123
          </p>
        </div>
        
        <div className="space-y-2">
          <Badge variant="secondary">Utilisateur</Badge>
          <p className="text-sm text-muted-foreground">
            <strong>Email:</strong> marie@test.com<br />
            <strong>Mot de passe:</strong> marie123
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCredentials;