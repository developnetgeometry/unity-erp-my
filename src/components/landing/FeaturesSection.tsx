import { UserCog, Coins, Package, GitBranch } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: UserCog,
    title: "Human Resources (HR)",
    description: "Simplify employee management, attendance, leave, and payroll — fully compliant with KWSP, SOCSO, and PCB.",
  },
  {
    icon: Coins,
    title: "Finance & Accounting",
    description: "Automate your finances, from e-invoicing (LHDN) to expense management and SST compliance.",
  },
  {
    icon: Package,
    title: "Inventory & Procurement",
    description: "Track materials, suppliers, and stock levels with seamless purchase order and inventory integration.",
  },
  {
    icon: GitBranch,
    title: "Project Management",
    description: "Plan, monitor, and deliver projects efficiently — from task allocation to financial tracking.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            📦 What You'll Get with ERPOne
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
