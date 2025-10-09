import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ServiceLayout from "@/components/service/ServiceLayout";
import SupportDashboardNew from "./service/SupportDashboardNew";
import SupportPayments from "./service/SupportPayments";
import SupportMessages from "./service/SupportMessages";
import SupportClients from "./service/SupportClients";
import SupportRevenues from "./service/SupportRevenues";
import SupportOrders from "./service/SupportOrders";
import SupportInvoices from "./service/SupportInvoices";
import { useAuth } from "@/contexts/AuthContext";

const Support = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Protection de route : uniquement service client (vérifier UNIQUEMENT le rôle)
  useEffect(() => {
    if (user !== null) {
      console.log('[SUPPORT] User role:', user.role, 'is_staff:', user.is_staff);
      
      // PRIORITÉ 1: Si role est "admin", rediriger vers /admin
      if (user.role === 'admin') {
        console.log('[SUPPORT] → Redirecting to /admin (admin role)');
        navigate("/admin", { replace: true });
        return;
      }
      
      // PRIORITÉ 2: Si role est "customer_service", rester
      if (user.role === 'customer_service') {
        console.log('[SUPPORT] ✓ Staying on /support');
        return;
      }
      
      // Sinon, rediriger vers home
      console.log('[SUPPORT] → Redirecting to home (not customer_service)');
      navigate("/", { replace: true });
    } else if (user === null) {
      console.log('[SUPPORT] → Redirecting to /login (not logged in)');
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Afficher loader pendant vérification
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<ServiceLayout />}>
        <Route index element={<SupportDashboardNew />} />
        <Route path="payments" element={<SupportPayments />} />
        <Route path="messages" element={<SupportMessages />} />
        <Route path="clients" element={<SupportClients />} />
        <Route path="revenues" element={<SupportRevenues />} />
        <Route path="orders" element={<SupportOrders />} />
        <Route path="invoices" element={<SupportInvoices />} />
      </Route>
    </Routes>
  );
};

export default Support;

