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
    'Deactivated': {
      bg: 'bg-[#EF4444]',
      text: 'text-white',
      label: 'Deactivated'
    },
    'Terminated': {
      bg: 'bg-[#EF4444]',
      text: 'text-white',
      label: 'Terminated'
    },
    'On Leave': {
      bg: 'bg-amber-500',
      text: 'text-white',
      label: 'On Leave'
    },
    'Probation': {
      bg: 'bg-blue-500',
      text: 'text-white',
      label: 'Probation'
    }
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles['Active'];

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
