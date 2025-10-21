import { 
  Users, 
  DollarSign, 
  Package, 
  FolderKanban, 
  Settings,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  User,
  UserCog,
  BadgeCheck,
  Building2,
  Clock,
  CalendarCheck,
  Wallet,
  ShieldCheck,
  Upload,
  Mail
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const modules = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "People & HR",
    icon: Users,
    items: [
      { title: "HR Dashboard", icon: UserCog, url: "/hr/dashboard" },
      { title: "Employee Management", icon: BadgeCheck, url: "/hr/employee-management" },
      { title: "Department Management", icon: Building2, url: "/hr/department-management" },
      { title: "Attendance Management", icon: Clock, url: "/hr/attendance-management" },
      { title: "Leave Management", icon: CalendarCheck, url: "/hr/leave-management" },
      { title: "Payroll Management", icon: Wallet, url: "/hr/payroll-management" },
      { title: "Compliance Dashboard", icon: ShieldCheck, url: "/hr/compliance-dashboard" },
      { title: "Bulk Import", icon: Upload, url: "/hr/bulk-import" },
      { title: "User Invitations", icon: Mail, url: "/hr/user-invitations" },
    ],
  },
  {
    title: "Finance & Accounting",
    icon: DollarSign,
    items: [
      { title: "Dashboard", url: "/finance/dashboard" },
      { title: "Invoices", url: "/finance/invoices" },
      { title: "Expenses", url: "/finance/expenses" },
      { title: "Bank Reconciliation", url: "/finance/bank" },
      { title: "SST Reports", url: "/finance/sst" },
    ],
  },
  {
    title: "Inventory & Procurement",
    icon: Package,
    items: [
      { title: "Inventory", url: "/inventory/items" },
      { title: "Purchase Orders", url: "/inventory/purchase-orders" },
      { title: "Suppliers", url: "/inventory/suppliers" },
      { title: "Stock Tracking", url: "/inventory/stock" },
    ],
  },
  {
    title: "Project Management",
    icon: FolderKanban,
    items: [
      { title: "Projects", url: "/projects" },
      { title: "Tasks", url: "/projects/tasks" },
      { title: "Time Tracking", url: "/projects/time" },
      { title: "Project Financials", url: "/projects/financials" },
    ],
  },
  {
    title: "System Administration",
    icon: Settings,
    items: [
      { title: "Company Settings", url: "/admin/company" },
      { title: "Branch Management", url: "/admin/branches" },
      { title: "User Roles", url: "/admin/roles" },
      { title: "Integrations", url: "/admin/integrations" },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logout functionality disabled (no authentication)
    toast.info("Logout functionality is disabled in demo mode");
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-lg font-bold text-sidebar-primary-foreground">E1</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">ERP One</h2>
              <p className="text-xs text-sidebar-foreground/70">SME Solutions</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {modules.map((module) => {
              if (!module.items) {
                return (
                  <SidebarMenuItem key={module.title}>
                    <SidebarMenuButton asChild tooltip={module.title}>
                      <NavLink
                        to={module.url}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/50"
                        }
                      >
                        <module.icon className="h-5 w-5" />
                        <span>{module.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible key={module.title} asChild defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={module.title}>
                        <module.icon className="h-5 w-5" />
                        <span>{module.title}</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {module.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink
                                to={item.url}
                                className={({ isActive }) =>
                                  isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-sidebar-accent/50"
                                }
                              >
                                {item.icon && <item.icon className="h-4 w-4" />}
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-sidebar-accent/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-sidebar-foreground">Admin User</span>
                  <span className="text-xs text-sidebar-foreground/70">Company Admin</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Logout" 
              className="hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
