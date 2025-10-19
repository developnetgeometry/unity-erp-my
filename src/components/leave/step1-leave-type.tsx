import { LeaveRequestData } from '@/types/leave-request';
import { Card } from '@/components/ui/card';
import { Check, Calendar, Heart, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Info } from 'lucide-react';

interface Step1Props {
  selectedType: LeaveRequestData['leaveType'] | null;
  onSelect: (type: LeaveRequestData['leaveType']) => void;
  balance: {
    annual: number;
    sick: number;
    emergency: number;
  };
}

export function Step1LeaveType({ selectedType, onSelect, balance }: Step1Props) {
  const leaveTypes = [
    {
      type: 'annual' as const,
      icon: Calendar,
      title: 'Annual Leave',
      description: 'Planned time off for vacation or personal matters',
      balance: balance.annual,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      policy: 'Requires 7-day advance notice. Subject to manager approval and team coverage.',
    },
    {
      type: 'sick' as const,
      icon: Heart,
      title: 'Sick Leave',
      description: 'Medical certificate required for claims',
      balance: balance.sick,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      policy: 'Medical certificate (MC) required within 48 hours. Can be uploaded later.',
    },
    {
      type: 'emergency' as const,
      icon: AlertCircle,
      title: 'Emergency Leave',
      description: 'Employment Act compliant',
      balance: balance.emergency,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      policy: 'For urgent family matters or unforeseen circumstances. Reason required.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Select Leave Type</h2>
        <p className="text-muted-foreground">Choose the type of leave you'd like to request</p>
      </div>

      <div className="space-y-3">
        {leaveTypes.map((leave) => {
          const Icon = leave.icon;
          const isSelected = selectedType === leave.type;

          return (
            <Card
              key={leave.type}
              className={cn(
                'relative p-6 cursor-pointer transition-all',
                'hover:shadow-md',
                isSelected && 'border-primary border-2 bg-primary/5'
              )}
              onClick={() => onSelect(leave.type)}
            >
              <div className="flex items-start gap-4">
                <div className={cn('p-3 rounded-lg', leave.bgColor)}>
                  <Icon className={cn('w-6 h-6', leave.color)} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{leave.title}</h3>
                    <Badge variant="outline" className={cn(leave.borderColor)}>
                      {leave.balance} days left
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{leave.description}</p>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                        <Info className="w-4 h-4 mr-1" />
                        <span className="text-xs">Policy Details</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto">
                      <SheetHeader>
                        <SheetTitle>{leave.title} Policy</SheetTitle>
                        <SheetDescription className="text-left pt-4">{leave.policy}</SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
