import { usePayment } from "@/contexts/PaymentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function DebugLoading() {
  const { adminDashboard, fetchAdminDashboard, loading: paymentLoading } = usePayment();
  const { fetchWithAuth } = useAuth();

  const testAPI = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetchWithAuth(`${API_BASE}/api/auth/admin/overview/stats/`);
      console.log('API Response:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('API Data:', data);
      } else {
        const error = await response.text();
        console.log('API Error:', error);
      }
    } catch (error) {
      console.error('API Test Error:', error);
    }
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">Debug Loading</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Payment Loading:</span>
          <Badge variant={paymentLoading ? "default" : "secondary"}>
            {paymentLoading ? "Loading" : "Idle"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Admin Dashboard:</span>
          <span className="text-sm">
            {adminDashboard ? "Loaded" : "Not loaded"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Pending Payments:</span>
          <span className="text-sm">
            {adminDashboard?.pending_payments_count || 0}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Payment History:</span>
          <span className="text-sm">
            {adminDashboard?.payment_history?.length || 0}
          </span>
        </div>
        
        <div className="space-y-2">
          <Button onClick={testAPI} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Test API
          </Button>
          <Button onClick={fetchAdminDashboard} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
