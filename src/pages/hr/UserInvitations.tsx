import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Send, Clock, CheckCircle } from "lucide-react";

const invitations = [
  { email: "new.employee@company.com", role: "Employee", status: "Pending", sentDate: "18 Mar 2024" },
  { email: "manager@company.com", role: "Manager", status: "Accepted", sentDate: "15 Mar 2024" },
  { email: "hr.assistant@company.com", role: "HR Staff", status: "Pending", sentDate: "17 Mar 2024" },
];

const UserInvitations = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Invitations</h1>
          <p className="text-muted-foreground">
            Invite new users and assign roles within the HR system
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Send Invitation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite New User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="Enter email address" className="flex-1" />
            <Button className="bg-primary hover:bg-primary/90">
              <Send className="mr-2 h-4 w-4" />
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Total Invitations", value: "24", icon: Mail },
          { title: "Pending", value: "8", icon: Clock },
          { title: "Accepted", value: "16", icon: CheckCircle },
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invitations.map((invite, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{invite.email}</p>
                    <p className="text-sm text-muted-foreground">{invite.role} • Sent {invite.sentDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={invite.status === "Accepted" ? "default" : "secondary"}>
                    {invite.status}
                  </Badge>
                  {invite.status === "Pending" && (
                    <Button size="sm" variant="outline">
                      Resend
                    </Button>
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

export default UserInvitations;
