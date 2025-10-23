import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceReportCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'purple' | 'success' | 'warning' | 'danger' | 'info';
  subtitle?: string;
}

export const AttendanceReportCard = ({
  label,
  value,
  icon: Icon,
  variant = 'default',
  subtitle,
}: AttendanceReportCardProps) => {
  const variantClasses = {
    default: 'border-border',
    purple: 'border-pink-500/20 bg-pink-50/50 dark:bg-pink-950/20',
    success: 'border-green-500/20 bg-green-50/50 dark:bg-green-950/20',
    warning: 'border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/20',
    danger: 'border-red-500/20 bg-red-50/50 dark:bg-red-950/20',
    info: 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20',
  };

  const iconClasses = {
    default: 'text-muted-foreground',
    purple: 'text-[hsl(330,81%,50%)] dark:text-pink-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-orange-600 dark:text-orange-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <Card className={cn('', variantClasses[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-semibold">{value}</p>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          <div className={cn('rounded-full p-3', iconClasses[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
