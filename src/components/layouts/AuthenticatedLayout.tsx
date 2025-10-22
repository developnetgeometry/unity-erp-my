import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SessionDebug } from "@/components/debug/SessionDebug";

const AuthenticatedLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-6 supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>
          <div className="container py-6">
            <SessionDebug />
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AuthenticatedLayout;
