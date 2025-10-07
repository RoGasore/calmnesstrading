import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  User, 
  BookOpen, 
  Zap, 
  CreditCard, 
  Settings,
  Bell,
  GraduationCap,
  TrendingUp,
  Wallet,
  Target
} from "lucide-react";
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

const userMenuSections = [
  {
    label: "Tableau de bord",
    items: [
      { title: "Vue d'ensemble", url: "/user", icon: Home, exact: true },
      { title: "Mon Profil", url: "/user/profile", icon: User },
    ]
  },
  {
    label: "Mes Services",
    items: [
      { title: "Mes Formations", url: "/user/formations", icon: GraduationCap },
      { title: "Mes Signaux", url: "/user/signaux", icon: Zap },
      { title: "Gestion de Compte", url: "/user/gestion", icon: Target },
    ]
  },
  {
    label: "Finances",
    items: [
      { title: "Mes Paiements", url: "/user/payments", icon: CreditCard },
      { title: "Mon Portefeuille", url: "/user/wallet", icon: Wallet },
    ]
  },
  {
    label: "Paramètres",
    items: [
      { title: "Notifications", url: "/user/notifications", icon: Bell },
      { title: "Paramètres", url: "/user/settings", icon: Settings },
    ]
  }
];

export function UserSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string, exact?: boolean) => 
    exact ? currentPath === path : currentPath.startsWith(path);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  return (
    <Sidebar
      collapsible="icon"
    >
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <SidebarTrigger />
          <h2 className="font-bold text-base text-primary">Mon Espace</h2>
        </div>
      </div>

      <SidebarContent>
        {userMenuSections.map((section) => (
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
      </SidebarContent>
    </Sidebar>
  );
}

