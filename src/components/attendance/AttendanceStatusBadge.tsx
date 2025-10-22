import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock, Lock, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AttendanceStatusBadgeProps {
  status: 'on_time' | 'late' | 'half_day' | 'absent' | 'leave' | 'holiday';
  isProvisional?: boolean;
  isLocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AttendanceStatusBadge = ({
  status,
  isProvisional = false,
  isLocked = false,
  size = 'md',
}: AttendanceStatusBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'on_time':
        return {
          label: 'On Time',
          icon: CheckCircle,
          className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
          tooltip: 'Clocked in within grace period',
        };
      case 'late':
        return {
          label: 'Late',
          icon: AlertCircle,
          className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
          tooltip: 'Clocked in after grace period but before half-day threshold',
        };
      case 'half_day':
        return {
          label: 'Half Day',
          icon: AlertCircle,
          className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
          tooltip: 'Clocked in more than 4 hours after shift start',
        };
      case 'absent':
        return {
          label: 'Absent',
          icon: XCircle,
          className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
          tooltip: 'No clock-in recorded',
        };
      case 'leave':
        return {
          label: 'On Leave',
          icon: Clock,
          className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
          tooltip: 'Approved leave',
        };
      case 'holiday':
        return {
          label: 'Holiday',
          icon: Clock,
          className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
          tooltip: 'Public holiday',
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
          tooltip: 'Unknown status',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`${config.className} ${sizeClasses[size]} inline-flex items-center gap-1.5`}
            >
              <Icon className={iconSizes[size]} />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>

        {isProvisional && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={`bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 ${sizeClasses[size]} inline-flex items-center gap-1`}
              >
                <AlertTriangle className={iconSizes[size]} />
                {size !== 'sm' && 'Provisional'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Auto clock-out applied - may need correction</p>
            </TooltipContent>
          </Tooltip>
        )}

        {isLocked && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={`bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20 ${sizeClasses[size]} inline-flex items-center gap-1`}
              >
                <Lock className={iconSizes[size]} />
                {size !== 'sm' && 'Locked'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Locked for payroll processing</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
