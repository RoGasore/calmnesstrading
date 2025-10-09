import { Outlet } from "react-router-dom";
import ServiceSidebar from "./ServiceSidebar";
import Header from "../Header";
import { SidebarProvider } from "@/components/ui/sidebar";

const ServiceLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex pt-16">
          <ServiceSidebar />
          <main className="flex-1 p-6 lg:ml-64">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ServiceLayout;

