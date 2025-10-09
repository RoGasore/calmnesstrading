import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  MessageSquare,
  Users,
  TrendingUp,
  Package,
  LogOut,
  DollarSign,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "../ui/button";

const ServiceSidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    {
      to: "/support",
      icon: LayoutDashboard,
      label: "Dashboard",
      end: true,
    },
    {
      to: "/support/payments",
      icon: CreditCard,
      label: "Paiements",
    },
    {
      to: "/support/messages",
      icon: MessageSquare,
      label: "Messages",
    },
    {
      to: "/support/clients",
      icon: Users,
      label: "Clients",
    },
    {
      to: "/support/revenues",
      icon: DollarSign,
      label: "Revenus",
    },
    {
      to: "/support/orders",
      icon: Package,
      label: "Commandes",
    },
    {
      to: "/support/invoices",
      icon: FileText,
      label: "Factures",
    },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card hidden lg:block overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h2 className="text-lg font-semibold" style={{ color: '#D4AF37' }}>
            Service Client
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestion des opérations
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default ServiceSidebar;

