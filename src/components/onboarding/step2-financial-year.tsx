import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CompanySetupData } from '@/types/setup-wizard';
import { addYears, format } from 'date-fns';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formSchema = z.object({
  startMonth: z.number().min(0).max(11),
  startDay: z.number().min(1).max(31),
  lockPreviousMonths: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface Step2Props {
  data: Partial<CompanySetupData['financialYear']>;
  onNext: (data: Partial<CompanySetupData['financialYear']>) => void;
}

export function Step2FinancialYear({ data, onNext }: Step2Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startMonth: data.startMonth ?? 3, // April (0-indexed)
      startDay: data.startDay ?? 1,
      lockPreviousMonths: data.lockPreviousMonths ?? false,
    },
  });

  const startMonth = form.watch('startMonth');
  const startDay = form.watch('startDay');

  // Calculate FY example
  const currentYear = new Date().getFullYear();
  const fyStart = new Date(currentYear, startMonth, startDay);
  const fyEnd = addYears(fyStart, 1);
  fyEnd.setDate(fyEnd.getDate() - 1);

  const handleSubmit = (values: FormData) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">When does your financial year start?</h2>
          <p className="text-muted-foreground">
            This helps us organize your financial reports and comply with Malaysian tax filing requirements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Month *</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={month} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Day *</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Your Financial Year</p>
          <p className="text-2xl font-semibold">
            FY {format(fyStart, 'yyyy')}/{format(fyEnd, 'yyyy')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Runs from {format(fyStart, 'd MMM yyyy')} to {format(fyEnd, 'd MMM yyyy')}
          </p>
        </div>

        <FormField
          control={form.control}
          name="lockPreviousMonths"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Lock previous months</FormLabel>
                <FormDescription>
                  Prevent transactions from being added to months that have already been closed. Recommended for compliance.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <button type="submit" className="hidden" />
      </form>
    </Form>
  );
}
