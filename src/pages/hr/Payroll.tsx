import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, FileText, Calendar } from "lucide-react";

const Payroll = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Process payroll with KWSP, SOCSO, and PCB compliance</p>
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
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete payroll features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;
