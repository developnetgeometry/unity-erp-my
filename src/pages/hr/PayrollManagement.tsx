import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, FileText, Calendar } from "lucide-react";

const PayrollManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground">
            Process payroll, salary components, EPF/SOCSO contributions, and payslip generation
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <DollarSign className="mr-2 h-4 w-4" />
          Run Payroll
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Total Payroll", value: "RM 485,200", icon: DollarSign },
          { title: "Employees", value: "248", icon: Users },
          { title: "Payslips", value: "248", icon: FileText },
          { title: "Pay Date", value: "25th Mar", icon: Calendar },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Salary</span>
                <span className="font-medium">RM 485,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">EPF Contribution</span>
                <span className="font-medium">RM 58,224</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SOCSO Contribution</span>
                <span className="font-medium">RM 4,852</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Net Payroll</span>
                <span className="font-semibold text-primary">RM 422,124</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statutory Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">EPF and SOCSO contribution details...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayrollManagement;
