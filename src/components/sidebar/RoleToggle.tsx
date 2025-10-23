import { UserCog, Loader2, ShieldCheck, User } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <UserCog className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">View As</span>
      </div>
      <ToggleGroup 
        type="single" 
        value={activeRole}
        onValueChange={(value) => {
          if (value) switchRole(value as 'super_admin' | 'employee');
        }}
        className="grid grid-cols-2 gap-2"
      >
        <ToggleGroupItem 
          value="super_admin" 
          aria-label="Super Admin View"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <ShieldCheck className="h-4 w-4 mr-2" />
          <span className="text-xs">Admin</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="employee" 
          aria-label="Employee View"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <User className="h-4 w-4 mr-2" />
          <span className="text-xs">Employee</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
