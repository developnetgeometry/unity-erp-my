import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaveStep } from '@/types/leave-request';

const STEPS = [
  { number: 1, label: 'Leave Type' },
  { number: 2, label: 'Select Dates' },
  { number: 3, label: 'Coverage' },
  { number: 4, label: 'Review' },
];

interface LeaveStepProgressProps {
  currentStep: LeaveStep;
  completedSteps: LeaveStep[];
}

export function LeaveStepProgress({ currentStep, completedSteps }: LeaveStepProgressProps) {
  return (
    <div className="w-full mb-6">
      <p className="text-sm font-medium text-muted-foreground mb-4">
        Step {currentStep} of 4
      </p>

      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                  completedSteps.includes(step.number as LeaveStep)
                    ? 'bg-primary border-primary text-primary-foreground'
                    : currentStep === step.number
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground'
                )}
              >
                {completedSteps.includes(step.number as LeaveStep) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-semibold">{step.number}</span>
                )}
              </div>
              <p
                className={cn(
                  'mt-1 text-xs text-center hidden sm:block',
                  currentStep === step.number ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 transition-colors',
                  completedSteps.includes(step.number as LeaveStep) ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
