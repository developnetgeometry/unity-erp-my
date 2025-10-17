import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import HRDashboard from "./pages/hr/Dashboard";
import EmployeeManagement from "./pages/hr/EmployeeManagement";
import DepartmentManagement from "./pages/hr/DepartmentManagement";
import AttendanceManagement from "./pages/hr/AttendanceManagement";
import LeaveManagement from "./pages/hr/LeaveManagement";
import PayrollManagement from "./pages/hr/PayrollManagement";
import ComplianceDashboard from "./pages/hr/ComplianceDashboard";
import BulkImport from "./pages/hr/BulkImport";
import UserInvitations from "./pages/hr/UserInvitations";
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
                  
                  {/* People & HR Routes */}
                  <Route path="/hr/dashboard" element={<HRDashboard />} />
                  <Route path="/hr/employee-management" element={<EmployeeManagement />} />
                  <Route path="/hr/department-management" element={<DepartmentManagement />} />
                  <Route path="/hr/attendance-management" element={<AttendanceManagement />} />
                  <Route path="/hr/leave-management" element={<LeaveManagement />} />
                  <Route path="/hr/payroll-management" element={<PayrollManagement />} />
                  <Route path="/hr/compliance-dashboard" element={<ComplianceDashboard />} />
                  <Route path="/hr/bulk-import" element={<BulkImport />} />
                  <Route path="/hr/user-invitations" element={<UserInvitations />} />
                  
                  {/* Finance Routes */}
                  <Route path="/finance/dashboard" element={<FinanceDashboard />} />
                  
                  {/* Inventory Routes */}
                  <Route path="/inventory/items" element={<Inventory />} />
                  
                  {/* Project Routes */}
                  <Route path="/projects" element={<Projects />} />
                  
                  {/* Admin Routes */}
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
