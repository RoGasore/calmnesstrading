import { Routes, Route, Navigate } from "react-router-dom";
import ServiceLayout from "@/components/service/ServiceLayout";
import ServiceDashboard from "./service/ServiceDashboard";
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

const Service = () => {
  const { user } = useAuth();

  // Vérifier si l'utilisateur est service client ou admin
  if (!user || (!user.is_customer_service && !user.is_staff)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route element={<ServiceLayout />}>
        <Route index element={<ServiceDashboard />} />
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

export default Service;

