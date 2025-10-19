import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CompanySetupData } from '@/types/setup-wizard';
import { Upload, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  importMethod: z.enum(['csv', 'manual', 'skip']),
});

type FormData = z.infer<typeof formSchema>;

interface Step4Props {
  data: Partial<CompanySetupData['employees']>;
  onNext: (data: Partial<CompanySetupData['employees']>) => void;
}

export function Step4EmployeeImport({ data, onNext }: Step4Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      importMethod: data.importMethod || 'skip',
    },
  });

  const selectedMethod = form.watch('importMethod');

  const handleSubmit = (values: FormData) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Add Your Employees</h2>
          <p className="text-muted-foreground">
            You can add employees now or do it later. This is optional for the initial setup.
          </p>
        </div>

        <FormField
          control={form.control}
          name="importMethod"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-4">
                  {/* Option 1: Import CSV */}
                  <div
                    className={`relative flex items-start space-x-4 rounded-lg border-2 p-6 cursor-pointer transition-colors ${
                      selectedMethod === 'csv' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => form.setValue('importMethod', 'csv')}
                  >
                    <RadioGroupItem value="csv" id="csv" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="w-5 h-5 text-primary" />
                        <FormLabel htmlFor="csv" className="text-lg font-semibold cursor-pointer">
                          Import from Excel/CSV
                        </FormLabel>
                      </div>
                      <FormDescription className="text-sm">
                        Upload an Excel or CSV file with your employee data. Great if you have 10+ employees.
                      </FormDescription>
                      {selectedMethod === 'csv' && (
                        <div className="mt-4 space-y-3">
                          <Button type="button" variant="outline" size="sm">
                            Download Template
                          </Button>
                          <div className="text-xs text-muted-foreground">
                            Template includes: Name, IC Number, Email, Department, Job Title, Join Date, Salary
                          </div>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                              After upload, you'll see a preview table with validation before importing.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option 2: Add Manually */}
                  <div
                    className={`relative flex items-start space-x-4 rounded-lg border-2 p-6 cursor-pointer transition-colors ${
                      selectedMethod === 'manual' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => form.setValue('importMethod', 'manual')}
                  >
                    <RadioGroupItem value="manual" id="manual" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        <FormLabel htmlFor="manual" className="text-lg font-semibold cursor-pointer">
                          Add Manually
                        </FormLabel>
                      </div>
                      <FormDescription className="text-sm">
                        Enter employee details one by one. Best for small teams (under 10 employees).
                      </FormDescription>
                      {selectedMethod === 'manual' && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          You'll be able to add multiple employees on the next screen.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option 3: Skip for Now */}
                  <div
                    className={`relative flex items-start space-x-4 rounded-lg border-2 p-6 cursor-pointer transition-colors ${
                      selectedMethod === 'skip' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => form.setValue('importMethod', 'skip')}
                  >
                    <RadioGroupItem value="skip" id="skip" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <FormLabel htmlFor="skip" className="text-lg font-semibold cursor-pointer">
                          Skip for Now
                        </FormLabel>
                      </div>
                      <FormDescription className="text-sm">
                        You can add employees later from the HR module. No problem!
                      </FormDescription>
                      {selectedMethod === 'skip' && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">
                            You can always add employees later from Dashboard → HR → Employee Management
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <button type="submit" className="hidden" />
      </form>
    </Form>
  );
}
