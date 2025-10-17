import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle, CheckCircle, Clock } from "lucide-react";

const complianceItems = [
  { title: "KWSP Monthly Submission", dueDate: "15 Apr 2024", status: "Pending", type: "warning" },
  { title: "SOCSO Contribution", dueDate: "15 Apr 2024", status: "Pending", type: "warning" },
  { title: "PCB Deduction Report", dueDate: "10 Apr 2024", status: "Submitted", type: "success" },
  { title: "Annual Tax Filing", dueDate: "30 Apr 2024", status: "In Progress", type: "info" },
];

const ComplianceDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Compliance Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor KWSP, SOCSO, and PCB submission statuses and due dates
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Pending Submissions", value: "2", icon: AlertCircle, color: "text-accent" },
          { title: "Completed", value: "15", icon: CheckCircle, color: "text-secondary" },
          { title: "Overdue", value: "0", icon: Clock, color: "text-destructive" },
          { title: "Compliance Score", value: "98%", icon: ShieldCheck, color: "text-primary" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">Due: {item.dueDate}</p>
                  </div>
                </div>
                <Badge variant={
                  item.type === "success" ? "default" : 
                  item.type === "warning" ? "secondary" : 
                  "outline"
                }>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceDashboard;
