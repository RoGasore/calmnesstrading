import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminOverview } from "@/components/admin/AdminOverview";
import AdminServices from "./admin/AdminServices";
import AdminPayments from "./admin/AdminPayments";
import AdminRevenue from "./admin/AdminRevenue";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { ReviewsManagement } from "@/components/admin/ReviewsManagement";
import { AnalyticsPageNew } from "@/components/admin/AnalyticsPageNew";
import { RevenueManagement } from "@/components/admin/RevenueManagement";
import { FormationsManagement } from "@/components/admin/FormationsManagement";
import { SignauxManagement } from "@/components/admin/SignauxManagement";
import { GestionManagement } from "@/components/admin/GestionManagement";
import { ContentManagement } from "@/components/admin/ContentManagement";
import ContentManagementNew from "./admin/ContentManagement";
import ContentManagementUnified from "./admin/content/ContentManagement";
import GlobalSettings from "./admin/content/GlobalSettings";
import HomePage from "./admin/content/HomePage";
import HeaderPage from "./admin/content/HeaderPage";
import FooterPage from "./admin/content/FooterPage";
import ServicesPage from "./admin/content/ServicesPage";
import TestimonialsPage from "./admin/content/TestimonialsPage";
import FAQPage from "./admin/content/FAQPage";
import ContactPage from "./admin/content/ContactPage";
import ReviewsPage from "./admin/content/ReviewsPage";
import { NotificationsManagement } from "@/components/admin/NotificationsManagement";
import { SecuritySettings } from "@/components/admin/SecuritySettings";
import { GeneralSettings } from "@/components/admin/GeneralSettings";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Redirection si pas admin (vérifier le rôle spécifique)
  useEffect(() => {
    // Attendre que l'utilisateur soit chargé avant de vérifier
    if (user !== null) {
      setIsCheckingAuth(false);
      
      // PRIORITÉ 1: Si c'est un service client, rediriger vers /support
      if (user.role === 'customer_service' || user.is_customer_service) {
        console.log('User is customer_service, redirecting to /support');
        navigate("/support");
        return;
      }
      
      // PRIORITÉ 2: Si c'est un admin ou superuser ou staff (mais PAS service client)
      const isAdminUser = user.is_admin_user || user.role === 'admin' || user.is_superuser || user.is_staff;
      
      if (!isAdminUser) {
        console.log('User is not admin, redirecting to home');
        navigate("/");
        return;
      }
      
      console.log('User is admin, staying on /admin');
    }
  }, [user, navigate]);

  // Afficher un loader pendant la vérification d'authentification
  if (isCheckingAuth || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Ne pas rendre si l'utilisateur n'est pas admin
  if (!isAdmin()) {
    return null;
  }


  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route path="/services" element={<AdminServices />} />
        <Route path="/payments" element={<AdminPayments />} />
        <Route path="/revenue" element={<AdminRevenue />} />
        <Route path="/reviews" element={<ReviewsManagement />} />
        <Route path="/formations" element={<FormationsManagement />} />
        <Route path="/signaux" element={<SignauxManagement />} />
        <Route path="/gestion" element={<GestionManagement />} />
        <Route path="/analytics" element={<AnalyticsPageNew />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="/content-new" element={<ContentManagementNew />} />
        <Route path="/content-unified" element={<ContentManagementUnified />} />
        <Route path="/content/global" element={<GlobalSettings />} />
        <Route path="/content/home" element={<HomePage />} />
        <Route path="/content/header" element={<HeaderPage />} />
        <Route path="/content/footer" element={<FooterPage />} />
        <Route path="/content/services" element={<ServicesPage />} />
        <Route path="/content/testimonials" element={<TestimonialsPage />} />
        <Route path="/content/faq" element={<FAQPage />} />
        <Route path="/content/contact" element={<ContactPage />} />
        <Route path="/content/reviews" element={<ReviewsPage />} />
        <Route path="/notifications" element={<NotificationsManagement />} />
        <Route path="/security" element={<SecuritySettings />} />
        <Route path="/settings" element={<GeneralSettings />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;