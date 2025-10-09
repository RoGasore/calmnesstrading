import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ServiceLayout from "@/components/service/ServiceLayout";
import SupportDashboardNew from "./service/SupportDashboardNew";
import AdminPayments from "./admin/AdminPayments"; // Réutiliser la page paiements admin
import { useAuth } from "@/contexts/AuthContext";

// Pages placeholder
const ServiceMessages = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Messages</h1>
    <p className="text-muted-foreground">Système de messagerie intégré (en cours de développement)</p>
  </div>
);

const ServiceClients = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Gestion des Clients</h1>
    <p className="text-muted-foreground">Liste et gestion des clients (en cours de développement)</p>
  </div>
);

const ServiceRevenues = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Revenus</h1>
    <p className="text-muted-foreground">Analyse des revenus et statistiques (en cours de développement)</p>
  </div>
);

const ServiceOrders = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Commandes</h1>
    <p className="text-muted-foreground">Gestion des commandes (en cours de développement)</p>
  </div>
);

const ServiceInvoices = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Factures</h1>
    <p className="text-muted-foreground">Gestion des factures (en cours de développement)</p>
  </div>
);

const Support = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Protection de route : uniquement service client
  useEffect(() => {
    if (user !== null) {
      console.log('Support page - User:', { role: user.role, is_customer_service: user.is_customer_service, is_admin_user: user.is_admin_user });
      
      // PRIORITÉ 1: Si c'est un admin (PAS service client), rediriger vers /admin
      if ((user.role === 'admin' || user.is_admin_user) && user.role !== 'customer_service') {
        console.log('User is admin, redirecting to /admin');
        navigate("/admin");
        return;
      }
      
      // PRIORITÉ 2: Si ce n'est pas service client, rediriger vers home
      if (!user.is_customer_service && user.role !== 'customer_service') {
        console.log('User is not customer_service, redirecting to home');
        navigate("/");
        return;
      }
      
      console.log('User is customer_service, staying on /support');
    } else if (user === null) {
      // Si pas connecté, rediriger vers login
      console.log('User not logged in, redirecting to /login');
      navigate("/login");
      return;
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
        <Route path="payments" element={<AdminPayments />} />
        <Route path="messages" element={<ServiceMessages />} />
        <Route path="clients" element={<ServiceClients />} />
        <Route path="revenues" element={<ServiceRevenues />} />
        <Route path="orders" element={<ServiceOrders />} />
        <Route path="invoices" element={<ServiceInvoices />} />
      </Route>
    </Routes>
  );
};

export default Support;

