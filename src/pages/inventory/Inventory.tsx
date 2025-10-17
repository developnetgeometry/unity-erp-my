import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingDown, AlertTriangle, BarChart } from "lucide-react";

const Inventory = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels and material movements</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Package className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Total Value", value: "RM 125,000", icon: BarChart },
          { title: "Total Items", value: "1,245", icon: Package },
          { title: "Low Stock", value: "23", icon: AlertTriangle },
          { title: "Out of Stock", value: "5", icon: TrendingDown },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete inventory features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
