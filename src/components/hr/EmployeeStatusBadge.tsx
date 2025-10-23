import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EmployeeStatusBadgeProps {
  status: string;
  className?: string;
}

export const EmployeeStatusBadge = ({ status, className }: EmployeeStatusBadgeProps) => {
  const statusStyles = {
    'Active': {
      bg: 'bg-[#22C55E]',
      text: 'text-white',
      label: 'Active'
    },
    'Inactive': {
      bg: 'bg-[#EF4444]',
      text: 'text-white',
      label: 'Inactive'
    }
  };

  // Handle legacy status values - map them to Active/Inactive
  const normalizedStatus = status.toLowerCase();
  let displayStatus: 'Active' | 'Inactive' = 'Active';
  
  if (normalizedStatus === 'inactive' || normalizedStatus === 'terminated' || normalizedStatus === 'deactivated') {
    displayStatus = 'Inactive';
  }

  const style = statusStyles[displayStatus];

  return (
    <Badge
      className={cn(
        'rounded-xl px-3 py-1 font-semibold text-[13px] capitalize shadow-sm',
        'inline-flex items-center justify-center min-w-[70px]',
        style.bg,
        style.text,
        className
      )}
    >
      {style.label}
    </Badge>
  );
};
