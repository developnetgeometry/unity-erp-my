import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  AlertCircle,
} from "lucide-react";

const recentInvoices = [
  {
    id: "INV-2024-0032",
    client: "Tech Solutions Sdn Bhd",
    amount: "RM 45,200",
    status: "Paid",
    date: "2024-03-15",
  },
  {
    id: "INV-2024-0031",
    client: "Global Traders",
    amount: "RM 28,500",
    status: "Pending",
    date: "2024-03-14",
  },
  {
    id: "INV-2024-0030",
    client: "ABC Manufacturing",
    amount: "RM 62,800",
    status: "Overdue",
    date: "2024-03-10",
  },
  {
    id: "INV-2024-0029",
    client: "Retail Plus",
    amount: "RM 15,300",
    status: "Paid",
    date: "2024-03-08",
  },
];

const FinanceDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your financial performance and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-primary hover:bg-primary/90">
            <FileText className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Revenue"
          value="RM 1,245,800"
          description="Current quarter"
          icon={DollarSign}
          variant="primary"
          trend={{ value: "15.3%", isPositive: true }}
        />
        <DashboardCard
          title="Outstanding AR"
          value="RM 185,400"
          description="Accounts receivable"
          icon={TrendingUp}
          variant="secondary"
          trend={{ value: "5.2%", isPositive: false }}
        />
        <DashboardCard
          title="Total Expenses"
          value="RM 842,300"
          description="Current quarter"
          icon={TrendingDown}
          variant="accent"
          trend={{ value: "3.1%", isPositive: false }}
        />
        <DashboardCard
          title="Net Profit"
          value="RM 403,500"
          description="Profit margin: 32.4%"
          icon={CreditCard}
          variant="default"
          trend={{ value: "8.7%", isPositive: true }}
        />
      </div>

      {/* Charts and Data */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cash Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Cash Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Inflow</span>
                <span className="font-semibold text-secondary">+RM 1.2M</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[70%] rounded-full bg-secondary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Outflow</span>
                <span className="font-semibold text-destructive">-RM 840K</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[50%] rounded-full bg-destructive" />
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Net Cash Flow</span>
                  <span className="text-lg font-bold text-primary">+RM 360K</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statutory Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-accent" />
              Statutory Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "SST Filing",
                  status: "Due in 7 days",
                  type: "warning",
                },
                {
                  name: "LHDN e-Invoice",
                  status: "Up to date",
                  type: "success",
                },
                {
                  name: "KWSP Contribution",
                  status: "Submitted",
                  type: "success",
                },
                {
                  name: "SOCSO Payment",
                  status: "Submitted",
                  type: "success",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium">{item.name}</span>
                  <Badge
                    variant={item.type === "success" ? "default" : "outline"}
                    className={
                      item.type === "success"
                        ? "bg-secondary text-secondary-foreground"
                        : "border-accent text-accent"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{invoice.amount}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                  <Badge
                    variant={
                      invoice.status === "Paid"
                        ? "default"
                        : invoice.status === "Overdue"
                        ? "destructive"
                        : "outline"
                    }
                    className={
                      invoice.status === "Paid"
                        ? "bg-secondary text-secondary-foreground"
                        : ""
                    }
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;
