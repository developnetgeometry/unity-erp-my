import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LeaveRequestData, LeaveRequestFormProps, LeaveStep, TeamMember } from '@/types/leave-request';
import { LeaveStepProgress } from './leave-step-progress';
import { Step1LeaveType } from './step1-leave-type';
import { Step2SelectDates } from './step2-select-dates';
import { Step3Coverage } from './step3-coverage';
import { Step4Review } from './step4-review';
import { useAutoSave } from '@/hooks/use-auto-save';
import { ArrowLeft } from 'lucide-react';
import { addDays } from 'date-fns';

const DRAFT_KEY = 'leave-request-draft';

// Mock data
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'John Lee',
    avatar: '/placeholder.svg',
    role: 'Project Manager',
    onLeave: {
      start: addDays(new Date(), 10),
      end: addDays(new Date(), 12),
      status: 'approved',
    },
  },
  {
    id: '2',
    name: 'Sarah Tan',
    avatar: '/placeholder.svg',
    role: 'Senior Developer',
  },
  {
    id: '3',
    name: 'Ahmad Ibrahim',
    avatar: '/placeholder.svg',
    role: 'Developer',
    onLeave: {
      start: addDays(new Date(), 8),
      end: addDays(new Date(), 10),
      status: 'pending',
    },
  },
];

const PUBLIC_HOLIDAYS = [addDays(new Date(), 15), addDays(new Date(), 30)];

export function LeaveRequestForm({ onSubmit, onSaveDraft, existingDraft, employeeBalance }: LeaveRequestFormProps) {
  const [currentStep, setCurrentStep] = useState<LeaveStep>(1);
  const [completedSteps, setCompletedSteps] = useState<LeaveStep[]>([]);

  const [formData, setFormData] = useState<Partial<LeaveRequestData>>(
    existingDraft || {
      duration: 'full',
    }
  );

  const balance = employeeBalance || { annual: 12, sick: 14, emergency: 5 };

  // Auto-save draft
  useAutoSave(formData, DRAFT_KEY);

  useEffect(() => {
    onSaveDraft(formData);
  }, [formData, onSaveDraft]);

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as LeaveStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as LeaveStep);
    }
  };

  const handleSubmit = () => {
    if (isStepValid()) {
      onSubmit(formData as LeaveRequestData);
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!formData.leaveType;
      case 2:
        return !!formData.startDate && !!formData.endDate && !!formData.duration;
      case 3:
        return true; // Optional step
      case 4:
        return !!formData.leaveType && !!formData.startDate && !!formData.endDate && !!formData.duration;
      default:
        return false;
    }
  };

  const getCurrentBalance = () => {
    if (!formData.leaveType) return 0;
    return balance[formData.leaveType];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <LeaveStepProgress currentStep={currentStep} completedSteps={completedSteps} />

        <div className="mb-6">
          {currentStep === 1 && (
            <Step1LeaveType
              selectedType={formData.leaveType || null}
              onSelect={(type) => {
                setFormData({ ...formData, leaveType: type });
                setTimeout(handleNext, 300);
              }}
              balance={balance}
            />
          )}

          {currentStep === 2 && (
            <Step2SelectDates
              startDate={formData.startDate || null}
              endDate={formData.endDate || null}
              duration={formData.duration || 'full'}
              onDateChange={(start, end) => setFormData({ ...formData, startDate: start || undefined, endDate: end || undefined })}
              onDurationChange={(duration) => setFormData({ ...formData, duration })}
              balance={getCurrentBalance()}
              teamMembers={MOCK_TEAM_MEMBERS}
              publicHolidays={PUBLIC_HOLIDAYS}
            />
          )}

          {currentStep === 3 && (
            <Step3Coverage
              coverageDelegate={formData.coverageDelegate}
              onSelectDelegate={(delegate) => setFormData({ ...formData, coverageDelegate: delegate })}
              teamMembers={MOCK_TEAM_MEMBERS}
              suggestions={MOCK_TEAM_MEMBERS.filter((m) => m.role.includes('Manager') || m.role.includes('Developer'))}
            />
          )}

          {currentStep === 4 && (
            <Step4Review
              data={formData}
              employeeName="You"
              employeeAvatar="/placeholder.svg"
              approverName="Manager Name"
              balance={getCurrentBalance()}
            />
          )}
        </div>

        {/* Navigation */}
        <Card className="fixed bottom-0 left-0 right-0 border-t p-4 bg-background">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              {currentStep === 3 && (
                <Button variant="ghost" onClick={handleNext}>
                  Skip
                </Button>
              )}
              <Button onClick={currentStep === 4 ? handleSubmit : handleNext} disabled={!isStepValid()}>
                {currentStep === 4 ? 'Submit Request' : 'Next'}
              </Button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">Draft saved automatically</p>
      </div>
    </div>
  );
}
