import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TestAPI() {
  const { fetchWithAuth } = useAuth();
  const [results, setResults] = useState<any>({});

  const testStatsAPI = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://calmnesstrading.onrender.com';
      console.log('Testing API with base:', API_BASE);
      
      const response = await fetchWithAuth(`${API_BASE}/api/auth/admin/overview/stats/`);
      console.log('Stats API Response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        setResults(prev => ({ ...prev, stats: { success: true, data } }));
      } else {
        const error = await response.text();
        setResults(prev => ({ ...prev, stats: { success: false, error } }));
      }
    } catch (error) {
      console.error('Stats API Error:', error);
      setResults(prev => ({ ...prev, stats: { success: false, error: error.message } }));
    }
  };

  const testPaymentsAPI = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://calmnesstrading.onrender.com';
      console.log('Testing Payments API with base:', API_BASE);
      
      const response = await fetchWithAuth(`${API_BASE}/api/payments/admin/dashboard/`);
      console.log('Payments API Response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        setResults(prev => ({ ...prev, payments: { success: true, data } }));
      } else {
        const error = await response.text();
        setResults(prev => ({ ...prev, payments: { success: false, error } }));
      }
    } catch (error) {
      console.error('Payments API Error:', error);
      setResults(prev => ({ ...prev, payments: { success: false, error: error.message } }));
    }
  };

  const testActivityAPI = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://calmnesstrading.onrender.com';
      console.log('Testing Activity API with base:', API_BASE);
      
      const response = await fetchWithAuth(`${API_BASE}/api/auth/admin/overview/activity/`);
      console.log('Activity API Response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        setResults(prev => ({ ...prev, activity: { success: true, data } }));
      } else {
        const error = await response.text();
        setResults(prev => ({ ...prev, activity: { success: false, error } }));
      }
    } catch (error) {
      console.error('Activity API Error:', error);
      setResults(prev => ({ ...prev, activity: { success: false, error: error.message } }));
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Test API Calls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testStatsAPI} variant="outline">
            Test Stats API
          </Button>
          <Button onClick={testPaymentsAPI} variant="outline">
            Test Payments API
          </Button>
          <Button onClick={testActivityAPI} variant="outline">
            Test Activity API
          </Button>
        </div>
        
        <div className="space-y-2">
          <div>
            <strong>Stats API:</strong>
            {results.stats ? (
              <Badge variant={results.stats.success ? "default" : "destructive"}>
                {results.stats.success ? "Success" : "Error"}
              </Badge>
            ) : (
              <span className="text-muted-foreground">Not tested</span>
            )}
            {results.stats && (
              <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-32">
                {JSON.stringify(results.stats, null, 2)}
              </pre>
            )}
          </div>
          
          <div>
            <strong>Payments API:</strong>
            {results.payments ? (
              <Badge variant={results.payments.success ? "default" : "destructive"}>
                {results.payments.success ? "Success" : "Error"}
              </Badge>
            ) : (
              <span className="text-muted-foreground">Not tested</span>
            )}
            {results.payments && (
              <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-32">
                {JSON.stringify(results.payments, null, 2)}
              </pre>
            )}
          </div>
          
          <div>
            <strong>Activity API:</strong>
            {results.activity ? (
              <Badge variant={results.activity.success ? "default" : "destructive"}>
                {results.activity.success ? "Success" : "Error"}
              </Badge>
            ) : (
              <span className="text-muted-foreground">Not tested</span>
            )}
            {results.activity && (
              <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-32">
                {JSON.stringify(results.activity, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
