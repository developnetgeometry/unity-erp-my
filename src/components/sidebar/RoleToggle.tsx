import { Loader2, ShieldCheck, User } from "lucide-react";
import { PillToggle } from "@/components/ui/pill-toggle";
import { useRole } from "@/contexts/RoleContext";

export function RoleToggle() {
  const { activeRole, switchRole, canAccessAdminFeatures, loading } = useRole();

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Loading roles...</span>
      </div>
    );
  }

  // If user only has employee role, don't show toggle
  if (!canAccessAdminFeatures) {
    return (
      <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
        <User className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Employee View</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-3">
      <PillToggle
        value={activeRole}
        onChange={(value) => switchRole(value as 'super_admin' | 'employee')}
        options={[
          {
            label: "Admin",
            value: "super_admin",
            icon: <ShieldCheck className="h-4 w-4" />
          },
          {
            label: "Employee",
            value: "employee",
            icon: <User className="h-4 w-4" />
          }
        ]}
      />
    </div>
  );
}
