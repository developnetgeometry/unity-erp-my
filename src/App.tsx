import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Employees from "./pages/hr/Employees";
import Payroll from "./pages/hr/Payroll";
import FinanceDashboard from "./pages/finance/Dashboard";
import Inventory from "./pages/inventory/Inventory";
import Projects from "./pages/projects/Projects";
import Company from "./pages/admin/Company";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-auto">
              <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-6 supports-[backdrop-filter]:bg-background/60">
                <SidebarTrigger />
                <div className="flex-1" />
              </header>
              <div className="container py-6">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/hr/employees" element={<Employees />} />
                  <Route path="/hr/payroll" element={<Payroll />} />
                  <Route path="/finance/dashboard" element={<FinanceDashboard />} />
                  <Route path="/inventory/items" element={<Inventory />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/admin/company" element={<Company />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
