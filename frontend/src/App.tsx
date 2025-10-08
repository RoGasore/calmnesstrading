import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { SupportWidget } from "@/components/SupportWidget";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Reviews from "./pages/Reviews";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import User from "./pages/User";
import Formation from "./pages/Formation";
import CourseContent from "./pages/CourseContent";
import Signaux from "./pages/Signaux";
// import Analyse from "./pages/Analyse";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import CheckoutNew from "./pages/CheckoutNew";
import PaymentSuccess from "./pages/PaymentSuccess";
import Services from "./components/ServicesCMS";
import ServicesFormations from "./pages/ServicesFormations";
import ServicesSignaux from "./pages/ServicesSignaux";
import ServicesGestion from "./pages/ServicesGestion";
import VerifyEmail from "./pages/VerifyEmail";

const queryClient = new QueryClient();

// Composant wrapper pour afficher le SupportWidget conditionnellement
function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/formation" element={<Formation />} />
        <Route path="/course/:courseId" element={<CourseContent />} />
        <Route path="/signaux" element={<Signaux />} />
        {/* <Route path="/analyse" element={<Analyse />} /> */}
        <Route path="/checkout" element={<CheckoutNew />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/user/*" element={<User />} />
        {/* Services Routes */}
        <Route path="/services" element={<Services />} />
        <Route path="/services/formations" element={<ServicesFormations />} />
        <Route path="/services/signaux" element={<ServicesSignaux />} />
        <Route path="/services/gestion" element={<ServicesGestion />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Support Widget - affiché sur toutes les pages sauf admin */}
      {!isAdminPage && <SupportWidget />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
  <ThemeProvider defaultTheme="light" storageKey="calmnessfi-theme">
      <LanguageProvider>
        <AuthProvider>
          <EditModeProvider>
            <TranslationProvider>
              <PaymentProvider>
                <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
                </TooltipProvider>
              </PaymentProvider>
            </TranslationProvider>
          </EditModeProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
