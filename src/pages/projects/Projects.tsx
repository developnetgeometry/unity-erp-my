import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Clock, DollarSign, Users } from "lucide-react";

const Projects = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">Plan, execute, and monitor project delivery</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <FolderKanban className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Active Projects", value: "18", icon: FolderKanban },
          { title: "Total Hours", value: "2,450", icon: Clock },
          { title: "Project Value", value: "RM 850K", icon: DollarSign },
          { title: "Team Members", value: "64", icon: Users },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete project features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
