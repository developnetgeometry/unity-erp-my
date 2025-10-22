import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContainer } from "@/components/feedback/toast-container";
import { ModalContainer } from "@/components/overlay/modal-container";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PublicLayout from "./components/layouts/PublicLayout";
import AuthenticatedLayout from "./components/layouts/AuthenticatedLayout";
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
import MyAttendance from "./pages/attendance/MyAttendance";
import LeaveManagement from "./pages/hr/LeaveManagement";
import PayrollManagement from "./pages/hr/PayrollManagement";
import ComplianceDashboard from "./pages/hr/ComplianceDashboard";
import BulkImport from "./pages/hr/BulkImport";
import UserInvitations from "./pages/hr/UserInvitations";
import FinanceDashboard from "./pages/finance/Dashboard";
import Inventory from "./pages/inventory/Inventory";
import Projects from "./pages/projects/Projects";
import Company from "./pages/admin/Company";
import MobileDashboard from "./pages/MobileDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ToastContainer />
        <ModalContainer />
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/verify-instructions" element={<VerifyInstructions />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/mobile-dashboard" element={<MobileDashboard />} />
          </Route>

          {/* App Routes - No Auth Required */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* People & HR Routes */}
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/employee-management" element={<EmployeeManagement />} />
            <Route path="/hr/department-management" element={<DepartmentManagement />} />
            <Route path="/hr/attendance-management" element={<AttendanceManagement />} />
            <Route path="/attendance/my-attendance" element={<MyAttendance />} />
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
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
