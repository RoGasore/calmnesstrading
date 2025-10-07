import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  Bell,
  DollarSign,
  FileText,
  Shield,
  BookOpen,
  CreditCard,
  ShoppingBag,
  Zap,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const adminMenuSections = [
  {
    label: "Tableau de bord",
    items: [
      { title: "Vue d'ensemble", url: "/admin", icon: Home, exact: true },
      { title: "Analytiques", url: "/admin/analytics", icon: TrendingUp },
    ]
  },
  {
    label: "Commerce",
    items: [
      { title: "Paiements", url: "/admin/payments", icon: CreditCard },
      { title: "Revenus", url: "/admin/revenue", icon: DollarSign },
    ]
  },
  {
    label: "Utilisateurs & Contenu",
    items: [
      { title: "Utilisateurs", url: "/admin/users", icon: Users },
      { title: "Nos Services", url: "/admin/services", icon: ShoppingBag },
      { title: "Gestion Contenu", url: "/admin/content-unified", icon: FileText },
    ]
  },
  {
    label: "Système",
    items: [
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
      { title: "Sécurité", url: "/admin/security", icon: Shield },
      { title: "Paramètres", url: "/admin/settings", icon: Settings },
    ]
  }
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string, exact?: boolean) => 
    exact ? currentPath === path : currentPath.startsWith(path);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Sidebar
      collapsible="icon"
    >
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <SidebarTrigger />
          <h2 className="font-bold text-base text-primary">Admin Panel</h2>
        </div>
      </div>

      <SidebarContent>
        {adminMenuSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{!collapsed && section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.exact}
                        className={({ isActive }) => getNavCls({ isActive })}
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Déconnexion */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Déconnexion</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}