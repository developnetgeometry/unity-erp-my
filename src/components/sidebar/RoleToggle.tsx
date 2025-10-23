import { UserCog, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <UserCog className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Employee View</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
      <UserCog className="h-4 w-4 text-primary" />
      <Select
        value={activeRole}
        onValueChange={(value) => switchRole(value as 'super_admin' | 'employee')}
      >
        <SelectTrigger className="border-0 h-auto p-0 focus:ring-0 text-sm font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="super_admin">Super Admin</SelectItem>
          <SelectItem value="employee">Employee</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
