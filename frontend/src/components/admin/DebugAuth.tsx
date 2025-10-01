import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DebugAuth() {
  const { user, isAuthenticated, isAdmin } = useAuth();

  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">Debug Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Authenticated:</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? "Yes" : "No"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Is Admin:</span>
          <Badge variant={isAdmin() ? "default" : "destructive"}>
            {isAdmin() ? "Yes" : "No"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">User:</span>
          <span className="text-sm">
            {user ? `${user.email} (staff: ${user.is_staff})` : "None"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Access Token:</span>
          <span className="text-sm">
            {localStorage.getItem('access_token') ? "Present" : "Missing"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Refresh Token:</span>
          <span className="text-sm">
            {localStorage.getItem('refresh_token') ? "Present" : "Missing"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
