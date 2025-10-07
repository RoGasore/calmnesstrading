import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "./UserSidebar";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <SidebarProvider>
          <div className="flex min-h-[calc(100vh-5rem)] w-full">
            <UserSidebar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}

