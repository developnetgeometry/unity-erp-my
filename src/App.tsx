import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layouts/PublicLayout";
import AuthenticatedLayout from "./components/layouts/AuthenticatedLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import VerifyInstructions from "./pages/VerifyInstructions";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
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
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/verify-instructions" element={<VerifyInstructions />} />
            <Route path="/verify" element={<Verify />} />
          </Route>

          {/* Authenticated Routes */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* People & HR Routes */}
            <Route path="/hr/dashboard" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
            <Route path="/hr/employee-management" element={<ProtectedRoute><EmployeeManagement /></ProtectedRoute>} />
            <Route path="/hr/department-management" element={<ProtectedRoute><DepartmentManagement /></ProtectedRoute>} />
            <Route path="/hr/attendance-management" element={<ProtectedRoute><AttendanceManagement /></ProtectedRoute>} />
            <Route path="/hr/leave-management" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
            <Route path="/hr/payroll-management" element={<ProtectedRoute><PayrollManagement /></ProtectedRoute>} />
            <Route path="/hr/compliance-dashboard" element={<ProtectedRoute><ComplianceDashboard /></ProtectedRoute>} />
            <Route path="/hr/bulk-import" element={<ProtectedRoute><BulkImport /></ProtectedRoute>} />
            <Route path="/hr/user-invitations" element={<ProtectedRoute><UserInvitations /></ProtectedRoute>} />
            
            {/* Finance Routes */}
            <Route path="/finance/dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
            
            {/* Inventory Routes */}
            <Route path="/inventory/items" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            
            {/* Project Routes */}
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/company" element={<ProtectedRoute><Company /></ProtectedRoute>} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
