import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SetupStep } from '@/types/setup-wizard';

const STEPS = [
  { number: 1, label: 'Company Profile' },
  { number: 2, label: 'Financial Year' },
  { number: 3, label: 'Chart of Accounts' },
  { number: 4, label: 'Employee Import' },
  { number: 5, label: 'Statutory' },
  { number: 6, label: 'Tax Settings' },
  { number: 7, label: 'Invite Team' },
];

interface SetupProgressProps {
  currentStep: SetupStep;
  completedSteps: SetupStep[];
}

export function SetupProgress({ currentStep, completedSteps }: SetupProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">
          Step {currentStep} of 7: {STEPS[currentStep - 1].label}
        </p>
      </div>

      {/* Desktop: Horizontal */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                  completedSteps.includes(step.number as SetupStep)
                    ? 'bg-primary border-primary text-primary-foreground'
                    : currentStep === step.number
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground'
                )}
              >
                {completedSteps.includes(step.number as SetupStep) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.number}</span>
                )}
              </div>
              <p
                className={cn(
                  'mt-2 text-xs text-center',
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
                  completedSteps.includes(step.number as SetupStep) ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Compact dots */}
      <div className="flex md:hidden items-center justify-center gap-2">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              completedSteps.includes(step.number as SetupStep)
                ? 'bg-primary w-3'
                : currentStep === step.number
                ? 'bg-primary w-4'
                : 'bg-border'
            )}
          />
        ))}
      </div>
    </div>
  );
}
