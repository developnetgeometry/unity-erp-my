import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanySetupData, SetupStep, SetupWizardProps } from '@/types/setup-wizard';
import { SetupProgress } from './setup-progress';
import { Step1CompanyProfile } from './step1-company-profile';
import { Step2FinancialYear } from './step2-financial-year';
import { Step3ChartOfAccounts } from './step3-chart-of-accounts';
import { Step4EmployeeImport } from './step4-employee-import';
import { Step5StatutoryRegistration } from './step5-statutory-registration';
import { Step6TaxSettings } from './step6-tax-settings';
import { Step7InviteTeam } from './step7-invite-team';
import { SetupCompletion } from './setup-completion';
import { useAutoSave, clearDraft } from '@/hooks/use-auto-save';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DRAFT_KEY = 'erp-setup-wizard-draft';

export function SetupWizard({ onComplete, onExit, existingData }: SetupWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SetupStep>(1);
  const [completedSteps, setCompletedSteps] = useState<SetupStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const [wizardData, setWizardData] = useState<Partial<CompanySetupData>>(
    existingData || {
      companyProfile: {} as any,
      financialYear: {} as any,
      chartOfAccounts: { template: 'standard' },
      employees: { importMethod: 'skip' },
      statutory: { epfNumber: '', socsoNumber: '', eisNumber: '', lhdnNumber: '' },
      tax: { sstEnabled: false, sstRate: 6, tourismTaxEnabled: false, sstRegistrationNumber: '', pricesIncludeTax: false },
      teamInvites: [],
    }
  );

  // Auto-save draft
  useAutoSave(wizardData, DRAFT_KEY, !isComplete);

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    if (currentStep === 7) {
      setIsComplete(true);
    } else {
      setCurrentStep((currentStep + 1) as SetupStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as SetupStep);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleComplete = () => {
    clearDraft(DRAFT_KEY);
    onComplete(wizardData as CompanySetupData);
  };

  const handleExit = () => {
    onExit();
  };

  const canSkip = currentStep >= 4; // Steps 4-7 are optional

  if (isComplete) {
    return <SetupCompletion data={wizardData as CompanySetupData} onComplete={handleComplete} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">ERP One Setup</h1>
            <p className="text-muted-foreground">Let's get your system configured in about 10 minutes</p>
          </div>
          <Button variant="ghost" onClick={handleExit}>
            <X className="w-4 h-4 mr-2" />
            Save & Exit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <SetupProgress currentStep={currentStep} completedSteps={completedSteps} />
          </CardHeader>

          <CardContent>
            {currentStep === 1 && (
              <Step1CompanyProfile
                data={wizardData.companyProfile || {}}
                onNext={(data) => {
                  setWizardData({ ...wizardData, companyProfile: data as any });
                  handleNext();
                }}
              />
            )}

            {currentStep === 2 && (
              <Step2FinancialYear
                data={wizardData.financialYear || {}}
                onNext={(data) => {
                  setWizardData({ ...wizardData, financialYear: data as any });
                  handleNext();
                }}
              />
            )}

            {currentStep === 3 && (
              <Step3ChartOfAccounts
                data={wizardData.chartOfAccounts || {}}
                onNext={(data) => {
                  setWizardData({ ...wizardData, chartOfAccounts: data as any });
                  handleNext();
                }}
              />
            )}

            {currentStep === 4 && (
              <Step4EmployeeImport
                data={wizardData.employees || {}}
                onNext={(data) => {
                  setWizardData({ ...wizardData, employees: data as any });
                  handleNext();
                }}
              />
            )}

            {currentStep === 5 && (
              <Step5StatutoryRegistration
                data={wizardData.statutory || {}}
                onNext={(data) => {
                  setWizardData({ ...wizardData, statutory: data as any });
                  handleNext();
                }}
                onSkip={handleSkip}
              />
            )}

            {currentStep === 6 && (
              <Step6TaxSettings
                data={wizardData.tax || {}}
                onNext={(data) => {
                  setWizardData({ ...wizardData, tax: data as any });
                  handleNext();
                }}
                onSkip={handleSkip}
              />
            )}

            {currentStep === 7 && (
              <Step7InviteTeam
                data={wizardData.teamInvites || []}
                onNext={(data) => {
                  setWizardData({ ...wizardData, teamInvites: data });
                  handleNext();
                }}
                onSkip={handleSkip}
              />
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              {canSkip && (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip
                </Button>
              )}
              <Button
                onClick={() => {
                  const form = document.querySelector('form') as HTMLFormElement;
                  if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }
                }}
              >
                {currentStep === 7 ? 'Finish Setup' : 'Next'}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Save className="w-4 h-4 inline mr-1" />
          Your progress is automatically saved
        </p>
      </div>
    </div>
  );
}
