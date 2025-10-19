import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CompanySetupData } from '@/types/setup-wizard';
import { CheckCircle2, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  template: z.enum(['standard', 'import', 'scratch']),
});

type FormData = z.infer<typeof formSchema>;

interface Step3Props {
  data: Partial<CompanySetupData['chartOfAccounts']>;
  onNext: (data: Partial<CompanySetupData['chartOfAccounts']>) => void;
}

export function Step3ChartOfAccounts({ data, onNext }: Step3Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      template: data.template || 'standard',
    },
  });

  const selectedTemplate = form.watch('template');

  const handleSubmit = (values: FormData) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Set up your Chart of Accounts</h2>
          <p className="text-muted-foreground">
            Choose how you'd like to organize your accounts. Don't worry, you can customize this later.
          </p>
        </div>

        <FormField
          control={form.control}
          name="template"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-4">
                  {/* Option 1: Standard Template */}
                  <div
                    className={`relative flex items-start space-x-4 rounded-lg border-2 p-6 cursor-pointer transition-colors ${
                      selectedTemplate === 'standard' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => form.setValue('template', 'standard')}
                  >
                    <RadioGroupItem value="standard" id="standard" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <FormLabel htmlFor="standard" className="text-lg font-semibold cursor-pointer">
                          Use Malaysian Standard Template
                        </FormLabel>
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      </div>
                      <FormDescription className="text-sm">
                        Pre-configured chart of accounts compliant with Malaysian MASB standards. Perfect for SMEs and includes all
                        common account types.
                      </FormDescription>
                      <div className="mt-3 text-sm text-muted-foreground">
                        Includes: Assets, Liabilities, Equity, Revenue, Expenses
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Import from CSV */}
                  <div
                    className={`relative flex items-start space-x-4 rounded-lg border-2 p-6 cursor-pointer transition-colors ${
                      selectedTemplate === 'import' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => form.setValue('template', 'import')}
                  >
                    <RadioGroupItem value="import" id="import" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="w-5 h-5 text-primary" />
                        <FormLabel htmlFor="import" className="text-lg font-semibold cursor-pointer">
                          Import from CSV
                        </FormLabel>
                      </div>
                      <FormDescription className="text-sm">
                        Already have a chart of accounts? Import it from your existing system or Excel file.
                      </FormDescription>
                      {selectedTemplate === 'import' && (
                        <div className="mt-4 space-y-2">
                          <Button type="button" variant="outline" size="sm">
                            Download CSV Template
                          </Button>
                          <div className="text-xs text-muted-foreground">
                            Template includes: Account Code, Name, Type, Parent Account
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option 3: Start from Scratch */}
                  <div
                    className={`relative flex items-start space-x-4 rounded-lg border-2 p-6 cursor-pointer transition-colors ${
                      selectedTemplate === 'scratch' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => form.setValue('template', 'scratch')}
                  >
                    <RadioGroupItem value="scratch" id="scratch" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <FormLabel htmlFor="scratch" className="text-lg font-semibold cursor-pointer">
                          Start from Scratch
                        </FormLabel>
                      </div>
                      <FormDescription className="text-sm">
                        Build your own chart of accounts from the ground up. For advanced users who need full customization.
                      </FormDescription>
                      {selectedTemplate === 'scratch' && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-sm text-amber-800">
                            <strong>Note:</strong> Starting from scratch requires accounting knowledge. You'll need to create all account
                            categories and ensure MASB compliance.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button type="submit" className="hidden" />
      </form>
    </Form>
  );
}
