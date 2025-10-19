import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { CompanySetupData } from '@/types/setup-wizard';

interface SetupCompletionProps {
  data: CompanySetupData;
  onComplete: () => void;
}

export function SetupCompletion({ data, onComplete }: SetupCompletionProps) {
  useEffect(() => {
    // Confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Create confetti particles
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.left = `${randomInRange(0, 100)}%`;
        particle.style.animationDuration = `${randomInRange(2, 4)}s`;
        particle.style.backgroundColor = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)];
        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 4000);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const getSummary = () => {
    const items = [];
    items.push(`Company: ${data.companyProfile.name}`);
    items.push(`Financial Year: ${data.financialYear.startMonth + 1}/${data.financialYear.startDay}`);
    items.push(`Chart of Accounts: ${data.chartOfAccounts.template}`);
    if (data.employees.importMethod !== 'skip') {
      items.push(`Employees: ${data.employees.importMethod === 'csv' ? 'Imported from CSV' : 'Added manually'}`);
    }
    if (data.statutory.epfNumber || data.statutory.socsoNumber) {
      items.push('Statutory: Configured');
    }
    if (data.tax.sstEnabled) {
      items.push(`Tax: SST ${data.tax.sstRate}% enabled`);
    }
    if (data.teamInvites.length > 0) {
      items.push(`Team: ${data.teamInvites.length} invite(s) sent`);
    }
    return items;
  };

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <CardTitle className="text-3xl">You're All Set!</CardTitle>
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <CardDescription className="text-lg">
              Welcome to ERP One. Your system is configured and ready to use!
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Setup Summary</h3>
            <div className="space-y-2">
              {getSummary().map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-3">
            <h4 className="font-semibold">What's Next?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">1.</span>
                <span>Explore your dashboard to see company overview and KPIs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">2.</span>
                <span>Set up approval workflows in Settings → Workflows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">3.</span>
                <span>Run your first payroll when ready from HR → Payroll</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">4.</span>
                <span>Check Compliance Hub for upcoming statutory deadlines</span>
              </li>
            </ul>
          </div>

          <Button onClick={onComplete} size="lg" className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>

      <style>{`
        .confetti-particle {
          position: fixed;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          pointer-events: none;
          animation: confetti-fall linear forwards;
          z-index: 9999;
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
