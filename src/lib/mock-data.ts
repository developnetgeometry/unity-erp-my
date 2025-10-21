// Mock data for development without Supabase

export const mockCompany = {
  id: "mock-company-id",
  company_name: "Demo Corporation Sdn Bhd",
  registration_no: "202301234567",
  email: "info@democorp.com.my",
  phone: "+60123456789",
  address: "123, Jalan Merdeka, 50000 Kuala Lumpur",
  business_type: "Technology Services",
  status: "active",
  created_at: new Date().toISOString(),
};

export const mockProfile = {
  id: "mock-user-id",
  company_id: mockCompany.id,
  full_name: "Admin User",
  email: "admin@democorp.com.my",
  status: "active",
  email_verified: true,
  verified_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockEmployees = [
  {
    id: "emp-1",
    full_name: "Sarah Tan",
    email: "sarah.tan@democorp.com.my",
    department: "Human Resources",
    position: "HR Manager",
    status: "active",
    joined_date: "2023-01-15",
  },
  {
    id: "emp-2",
    full_name: "Ahmad Ibrahim",
    email: "ahmad.ibrahim@democorp.com.my",
    department: "Finance",
    position: "Finance Manager",
    status: "active",
    joined_date: "2023-02-20",
  },
  {
    id: "emp-3",
    full_name: "Lim Wei Chen",
    email: "lim.weichen@democorp.com.my",
    department: "IT",
    position: "Senior Developer",
    status: "active",
    joined_date: "2023-03-10",
  },
  {
    id: "emp-4",
    full_name: "Priya Devi",
    email: "priya.devi@democorp.com.my",
    department: "Marketing",
    position: "Marketing Executive",
    status: "active",
    joined_date: "2023-04-05",
  },
  {
    id: "emp-5",
    full_name: "Kumar Raj",
    email: "kumar.raj@democorp.com.my",
    department: "Operations",
    position: "Operations Manager",
    status: "active",
    joined_date: "2023-05-12",
  },
];

export const mockLeaveRequests = [
  {
    id: "leave-1",
    employee_id: "emp-1",
    employee_name: "Sarah Tan",
    leave_type: "annual",
    start_date: "2024-12-23",
    end_date: "2024-12-27",
    days: 5,
    status: "pending",
    reason: "Year-end holiday",
    created_at: new Date().toISOString(),
  },
  {
    id: "leave-2",
    employee_id: "emp-3",
    employee_name: "Lim Wei Chen",
    leave_type: "sick",
    start_date: "2024-12-18",
    end_date: "2024-12-19",
    days: 2,
    status: "approved",
    reason: "Medical certificate attached",
    created_at: new Date().toISOString(),
  },
];

export const mockExpenses = [
  {
    id: "exp-1",
    employee_id: "emp-2",
    employee_name: "Ahmad Ibrahim",
    amount: 350.50,
    category: "Travel",
    description: "Client meeting transportation",
    status: "pending",
    date: "2024-12-15",
    receipt_url: null,
  },
  {
    id: "exp-2",
    employee_id: "emp-4",
    employee_name: "Priya Devi",
    amount: 125.00,
    category: "Meals",
    description: "Team lunch with clients",
    status: "approved",
    date: "2024-12-14",
    receipt_url: null,
  },
];

export const mockProjects = [
  {
    id: "proj-1",
    name: "ERP System Implementation",
    client: "ABC Manufacturing Sdn Bhd",
    status: "in_progress",
    budget: 150000,
    spent: 85000,
    start_date: "2024-01-15",
    end_date: "2025-06-30",
    progress: 65,
  },
  {
    id: "proj-2",
    name: "Website Redesign",
    client: "XYZ Retail Sdn Bhd",
    status: "in_progress",
    budget: 50000,
    spent: 30000,
    start_date: "2024-10-01",
    end_date: "2025-02-28",
    progress: 45,
  },
];

export const mockDashboardMetrics = {
  totalEmployees: mockEmployees.length,
  activeProjects: mockProjects.filter(p => p.status === "in_progress").length,
  pendingApprovals: mockLeaveRequests.filter(l => l.status === "pending").length + 
                    mockExpenses.filter(e => e.status === "pending").length,
  monthlyRevenue: 285000,
  cashPosition: 450000,
  complianceScore: 94,
};

export const mockComplianceDeadlines = [
  {
    id: "comp-1",
    title: "EPF Contribution",
    type: "epf",
    due_date: "2025-01-15",
    status: "upcoming",
    priority: "high",
  },
  {
    id: "comp-2",
    title: "SOCSO Submission",
    type: "socso",
    due_date: "2025-01-15",
    status: "upcoming",
    priority: "high",
  },
  {
    id: "comp-3",
    title: "Monthly Tax Filing",
    type: "lhdn",
    due_date: "2025-01-31",
    status: "pending",
    priority: "medium",
  },
];
