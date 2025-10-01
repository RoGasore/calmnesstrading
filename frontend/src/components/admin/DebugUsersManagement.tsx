import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function DebugUsersManagement() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, fetchWithAuth } = useAuth();

  const runDebugTest = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // 1. Vérifier l'utilisateur actuel
      info.currentUser = user;
      info.isAdmin = user?.is_staff;

      // 2. Tester la connexion directe
      info.directLogin = await testDirectLogin();
      
      // 3. Tester avec fetchWithAuth
      info.fetchWithAuth = await testFetchWithAuth();
      
      // 4. Tester l'endpoint admin
      info.adminEndpoint = await testAdminEndpoint();

      setDebugInfo(info);
      
      toast({
        title: "Test de débogage terminé",
        description: "Vérifiez les informations ci-dessous"
      });

    } catch (error) {
      info.error = error instanceof Error ? error.message : 'Erreur inconnue';
      setDebugInfo(info);
      
      toast({
        title: "Erreur de débogage",
        description: "Une erreur s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectLogin = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@calmnessfi.com',
          password: 'calmness'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          hasToken: !!data.access,
          tokenLength: data.access?.length || 0
        };
      } else {
        return {
          success: false,
          status: response.status,
          statusText: response.statusText
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  };

  const testFetchWithAuth = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/auth/me/`);
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  };

  const testAdminEndpoint = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/auth/admin/users/`);
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          userCount: data.length,
          users: data.map((u: any) => ({ id: u.id, email: u.email, is_active: u.is_active }))
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          status: response.status,
          error: errorData.detail || 'Erreur inconnue'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Débogage - Gestion des Utilisateurs</h2>
          <p className="text-muted-foreground">
            Testez la connexion à l'API admin
          </p>
        </div>
        <Button onClick={runDebugTest} disabled={loading}>
          {loading ? "Test en cours..." : "Lancer le test"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de Débogage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Utilisateur Actuel</h3>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.currentUser, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Test de Connexion Directe</h3>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.directLogin, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Test fetchWithAuth</h3>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.fetchWithAuth, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Test Endpoint Admin</h3>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.adminEndpoint, null, 2)}
              </pre>
            </div>

            {debugInfo.error && (
              <div>
                <h3 className="font-medium mb-2 text-red-600">Erreur</h3>
                <pre className="bg-red-50 p-3 rounded text-sm overflow-auto text-red-600">
                  {debugInfo.error}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
