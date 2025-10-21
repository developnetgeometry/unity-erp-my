import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  Package,
  FolderKanban,
  TrendingUp,
  Activity,
  Calendar,
  FileText,
} from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl">🚀</span>
          </div>
          <div>
            <h3 className="font-semibold text-primary">Demo Mode Active</h3>
            <p className="text-sm text-muted-foreground">
              You're exploring ERP One with sample data. No authentication required.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your business overview.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          Generate Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Employees"
          value="248"
          description="Active employees"
          icon={Users}
          variant="primary"
          trend={{ value: "12%", isPositive: true }}
        />
        <DashboardCard
          title="Monthly Revenue"
          value="RM 485,200"
          description="This month"
          icon={DollarSign}
          variant="secondary"
          trend={{ value: "8.3%", isPositive: true }}
        />
        <DashboardCard
          title="Inventory Value"
          value="RM 125,000"
          description="Current stock"
          icon={Package}
          variant="accent"
          trend={{ value: "2.1%", isPositive: false }}
        />
        <DashboardCard
          title="Active Projects"
          value="18"
          description="In progress"
          icon={FolderKanban}
          variant="default"
          trend={{ value: "3", isPositive: true }}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Q1 2025</span>
                <span className="font-semibold">RM 1.2M</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[75%] rounded-full bg-gradient-to-r from-primary to-secondary" />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Jan</p>
                  <p className="text-lg font-semibold">RM 380K</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Feb</p>
                  <p className="text-lg font-semibold">RM 425K</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mar</p>
                  <p className="text-lg font-semibold">RM 485K</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "New employee onboarded",
                  module: "HR",
                  time: "2 hours ago",
                  icon: Users,
                },
                {
                  action: "Invoice #INV-2024-0032 generated",
                  module: "Finance",
                  time: "4 hours ago",
                  icon: FileText,
                },
                {
                  action: "Purchase order approved",
                  module: "Procurement",
                  time: "5 hours ago",
                  icon: Package,
                },
                {
                  action: "Project milestone completed",
                  module: "Projects",
                  time: "1 day ago",
                  icon: FolderKanban,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="rounded-lg bg-muted p-2">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {item.module}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {item.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Upcoming Tasks & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="font-medium text-sm">Payroll Processing</p>
              <p className="text-xs text-muted-foreground mt-1">Due in 3 days</p>
            </div>
            <div className="rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="font-medium text-sm">SST Filing</p>
              <p className="text-xs text-muted-foreground mt-1">Due in 7 days</p>
            </div>
            <div className="rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="font-medium text-sm">Supplier Payment</p>
              <p className="text-xs text-muted-foreground mt-1">Due tomorrow</p>
            </div>
            <div className="rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="font-medium text-sm">Project Review</p>
              <p className="text-xs text-muted-foreground mt-1">Today, 3:00 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
