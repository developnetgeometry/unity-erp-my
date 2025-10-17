import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "secondary" | "accent";
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: DashboardCardProps) {
  const variants = {
    default: "border-border",
    primary: "border-primary/20 bg-primary/5",
    secondary: "border-secondary/20 bg-secondary/5",
    accent: "border-accent/20 bg-accent/5",
  };

  const iconVariants = {
    default: "text-muted-foreground",
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", variants[variant])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", iconVariants[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-secondary" : "text-destructive"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
