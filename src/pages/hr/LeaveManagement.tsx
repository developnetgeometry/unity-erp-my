import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, X } from "lucide-react";

const leaveRequests = [
  { employee: "Ahmad Hassan", type: "Annual Leave", dates: "20-24 Mar 2024", days: 5, status: "Pending" },
  { employee: "Siti Nurhaliza", type: "Sick Leave", dates: "18 Mar 2024", days: 1, status: "Approved" },
  { employee: "Lee Wei Ming", type: "Emergency Leave", dates: "22 Mar 2024", days: 1, status: "Pending" },
];

const LeaveManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
        <p className="text-muted-foreground">
          Approve, reject, and review leave applications and balances
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Pending Requests", value: "12" },
          { title: "Approved Today", value: "5" },
          { title: "Total on Leave", value: "8" },
          { title: "Avg. Leave Days", value: "14.2" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaveRequests.map((request, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{request.employee}</p>
                    <p className="text-sm text-muted-foreground">{request.type} • {request.dates} • {request.days} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={request.status === "Approved" ? "default" : "secondary"}>
                    {request.status}
                  </Badge>
                  {request.status === "Pending" && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagement;
