import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Users } from "lucide-react";

const departments = [
  { name: "Information Technology", employees: 45, manager: "Ahmad Hassan" },
  { name: "Human Resources", employees: 12, manager: "Siti Nurhaliza" },
  { name: "Finance & Accounting", employees: 28, manager: "Lee Wei Ming" },
  { name: "Operations", employees: 67, manager: "Raj Kumar" },
  { name: "Sales & Marketing", employees: 52, manager: "Nurul Ain" },
];

const DepartmentManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
          <p className="text-muted-foreground">
            Manage departments, reporting lines, and team structures
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {departments.map((dept, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{dept.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Manager</span>
                  <span className="text-sm font-medium">{dept.manager}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Employees</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{dept.employees}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartmentManagement;
