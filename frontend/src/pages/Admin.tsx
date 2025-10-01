import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminOverview } from "@/components/admin/AdminOverview";
import AdminServices from "./admin/AdminServices";
import AdminPayments from "./admin/AdminPayments";
import AdminRevenue from "./admin/AdminRevenue";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { DebugUsersManagement } from "@/components/admin/DebugUsersManagement";
import { ReviewsManagement } from "@/components/admin/ReviewsManagement";
import { AnalyticsPage } from "@/components/admin/AnalyticsPage";
import { RevenueManagement } from "@/components/admin/RevenueManagement";
import { FormationsManagement } from "@/components/admin/FormationsManagement";
import { SignauxManagement } from "@/components/admin/SignauxManagement";
import { GestionManagement } from "@/components/admin/GestionManagement";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { NotificationsManagement } from "@/components/admin/NotificationsManagement";
import { SecuritySettings } from "@/components/admin/SecuritySettings";
import { GeneralSettings } from "@/components/admin/GeneralSettings";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Redirection si pas admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/");
    }
  }, [isAdmin, navigate]);



  if (!isAdmin()) {
    return null;
  }


  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route path="/debug-users" element={<DebugUsersManagement />} />
        <Route path="/services" element={<AdminServices />} />
        <Route path="/payments" element={<AdminPayments />} />
        <Route path="/revenue" element={<AdminRevenue />} />
        <Route path="/reviews" element={<ReviewsManagement />} />
        <Route path="/formations" element={<FormationsManagement />} />
        <Route path="/signaux" element={<SignauxManagement />} />
        <Route path="/gestion" element={<GestionManagement />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="/notifications" element={<NotificationsManagement />} />
        <Route path="/security" element={<SecuritySettings />} />
        <Route path="/settings" element={<GeneralSettings />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;