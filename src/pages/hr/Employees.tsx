import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, Filter, MoreVertical, Mail, Phone } from "lucide-react";

const employees = [
  {
    id: 1,
    name: "Ahmad Hassan",
    position: "Senior Developer",
    department: "IT",
    email: "ahmad.hassan@company.com",
    phone: "+60 12-345 6789",
    status: "Active",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    position: "HR Manager",
    department: "Human Resources",
    email: "siti.n@company.com",
    phone: "+60 12-876 5432",
    status: "Active",
  },
  {
    id: 3,
    name: "Lee Wei Ming",
    position: "Accountant",
    department: "Finance",
    email: "lee.wm@company.com",
    phone: "+60 12-234 5678",
    status: "Active",
  },
  {
    id: 4,
    name: "Raj Kumar",
    position: "Project Manager",
    department: "Operations",
    email: "raj.k@company.com",
    phone: "+60 12-456 7890",
    status: "On Leave",
  },
];

const Employees = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Directory</h1>
          <p className="text-muted-foreground">
            Manage your workforce and employee information
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees by name, email, or department..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {employees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {employee.position}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <Badge variant="secondary">{employee.department}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{employee.phone}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={employee.status === "Active" ? "default" : "outline"}
                    className={
                      employee.status === "Active"
                        ? "bg-secondary text-secondary-foreground"
                        : ""
                    }
                  >
                    {employee.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">248</p>
              <p className="text-sm text-muted-foreground mt-1">Total Employees</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">12</p>
              <p className="text-sm text-muted-foreground mt-1">New This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">8</p>
              <p className="text-sm text-muted-foreground mt-1">On Leave</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">15</p>
              <p className="text-sm text-muted-foreground mt-1">Departments</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Employees;
