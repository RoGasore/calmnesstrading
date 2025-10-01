import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TestAdmin() {
  const { user, isAuthenticated, isAdmin, login } = useAuth();

  const handleLogin = async () => {
    const success = await login("admin@calmnessfi.com", "calmness");
    console.log("Login result:", success);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Admin Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>User:</strong> {user ? user.email : "Not logged in"}
        </div>
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
        </div>
        <div>
          <strong>Is Admin:</strong> {isAdmin() ? "Yes" : "No"}
        </div>
        <div>
          <strong>User Staff:</strong> {user?.is_staff ? "Yes" : "No"}
        </div>
        
        {!isAuthenticated && (
          <Button onClick={handleLogin}>
            Login as Admin
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
