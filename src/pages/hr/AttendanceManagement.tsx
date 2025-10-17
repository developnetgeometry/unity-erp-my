import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const attendanceData = [
  { name: "Ahmad Hassan", time: "08:45 AM", status: "On Time", type: "success" },
  { name: "Siti Nurhaliza", time: "09:15 AM", status: "Late", type: "warning" },
  { name: "Lee Wei Ming", time: "08:30 AM", status: "On Time", type: "success" },
  { name: "Raj Kumar", time: "-", status: "Absent", type: "error" },
];

const AttendanceManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground">
          Track and monitor employee attendance, late logs, and working hours
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Present Today", value: "235", icon: CheckCircle, color: "text-secondary" },
          { title: "Late Arrivals", value: "8", icon: AlertCircle, color: "text-accent" },
          { title: "Absent", value: "5", icon: XCircle, color: "text-destructive" },
          { title: "Avg. Hours", value: "8.5", icon: Clock, color: "text-primary" },
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
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceData.map((record, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{record.name}</p>
                    <p className="text-sm text-muted-foreground">{record.time}</p>
                  </div>
                </div>
                <Badge variant={record.type === "success" ? "default" : record.type === "warning" ? "secondary" : "destructive"}>
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;
