import { Routes, Route, Navigate } from "react-router-dom";
import { UserLayout } from "@/components/user/UserLayout";
import { UserDashboard } from "./user/UserDashboard";
import { UserProfile } from "./user/UserProfile";
import { UserFormations } from "./user/UserFormations";
import { UserSignaux } from "./user/UserSignaux";
import { UserPayments } from "./user/UserPayments";
import { UserNotifications } from "./user/UserNotifications";
import { UserTradingHistory } from "./user/UserTradingHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function User() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers login si non authentifié
    if (!isAuthenticated) {
      navigate('/login?redirect=/user');
    }
    
    // Rediriger vers admin si l'utilisateur est un admin
    if (user?.is_staff) {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.is_staff) {
    return null;
  }

  return (
    <UserLayout>
      <Routes>
        <Route index element={<UserDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="formations" element={<UserFormations />} />
        <Route path="signaux" element={<UserSignaux />} />
        <Route path="payments" element={<UserPayments />} />
        <Route path="notifications" element={<UserNotifications />} />
        <Route path="trading-history" element={<UserTradingHistory />} />
        <Route path="gestion" element={<UserDashboard />} /> {/* TODO: Créer la page UserGestion */}
        <Route path="wallet" element={<UserDashboard />} /> {/* TODO: Créer la page UserWallet */}
        <Route path="settings" element={<UserDashboard />} /> {/* TODO: Créer la page UserSettings */}
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    </UserLayout>
  );
}

