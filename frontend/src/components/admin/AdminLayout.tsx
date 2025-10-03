import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <SidebarProvider>
          <div className="flex min-h-[calc(100vh-5rem)] w-full">
            <AdminSidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}