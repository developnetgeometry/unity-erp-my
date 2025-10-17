import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

const HRDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">HR Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of employee statistics, attendance summary, and HR KPIs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Total Employees", value: "248", icon: Users, trend: "+12" },
          { title: "Active Today", value: "235", icon: UserCheck, trend: "+5" },
          { title: "On Leave", value: "8", icon: UserX, trend: "-2" },
          { title: "Turnover Rate", value: "3.2%", icon: TrendingUp, trend: "-0.5%" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-secondary mt-1">{stat.trend} this month</p>
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
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Recent HR activities will appear here...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Upcoming HR events and milestones...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;
