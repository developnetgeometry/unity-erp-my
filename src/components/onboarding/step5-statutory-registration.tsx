import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CompanySetupData } from '@/types/setup-wizard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  epfNumber: z.string().regex(/^\d{12}$/, 'EPF number must be 12 digits').or(z.literal('')),
  socsoNumber: z.string().regex(/^\d{12}$/, 'SOCSO number must be 12 digits').or(z.literal('')),
  eisNumber: z.string().optional(),
  lhdnNumber: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Step5Props {
  data: Partial<CompanySetupData['statutory']>;
  onNext: (data: Partial<CompanySetupData['statutory']>) => void;
  onSkip: () => void;
}

export function Step5StatutoryRegistration({ data, onNext, onSkip }: Step5Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      epfNumber: data.epfNumber || '',
      socsoNumber: data.socsoNumber || '',
      eisNumber: data.eisNumber || '',
      lhdnNumber: data.lhdnNumber || '',
    },
  });

  const handleSubmit = (values: FormData) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Statutory Registration Numbers</h2>
          <p className="text-muted-foreground">
            Enter your Malaysian statutory registration numbers for payroll compliance. You can skip this and add them later.
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These numbers are required for payroll processing and statutory contributions. If you don't have them yet, you can skip and add
            them before your first payroll run.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="epfNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>EPF Employer Number</FormLabel>
                <FormControl>
                  <Input placeholder="123456789012 (12 digits)" {...field} />
                </FormControl>
                <FormDescription>
                  Employees Provident Fund registration number from KWSP
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="socsoNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SOCSO Employer Number</FormLabel>
                <FormControl>
                  <Input placeholder="123456789012 (12 digits)" {...field} />
                </FormControl>
                <FormDescription>
                  Social Security Organization registration number from PERKESO
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eisNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>EIS Registration Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Employment Insurance System" {...field} />
                </FormControl>
                <FormDescription>
                  EIS registration for unemployment insurance
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lhdnNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LHDN Tax Reference Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Inland Revenue Board reference" {...field} />
                </FormControl>
                <FormDescription>
                  Your company's LHDN tax reference number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <button type="submit" className="hidden" />
      </form>
    </Form>
  );
}
