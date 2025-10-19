import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CompanySetupData } from '@/types/setup-wizard';

const formSchema = z.object({
  sstEnabled: z.boolean().default(false),
  sstRate: z.enum(['6', '10']).default('6'),
  tourismTaxEnabled: z.boolean().default(false),
  sstRegistrationNumber: z.string().optional(),
  pricesIncludeTax: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface Step6Props {
  data: Partial<CompanySetupData['tax']>;
  onNext: (data: Partial<CompanySetupData['tax']>) => void;
  onSkip: () => void;
}

export function Step6TaxSettings({ data, onNext, onSkip }: Step6Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sstEnabled: data.sstEnabled ?? false,
      sstRate: data.sstRate?.toString() as '6' | '10' ?? '6',
      tourismTaxEnabled: data.tourismTaxEnabled ?? false,
      sstRegistrationNumber: data.sstRegistrationNumber || '',
      pricesIncludeTax: data.pricesIncludeTax ?? false,
    },
  });

  const sstEnabled = form.watch('sstEnabled');

  const handleSubmit = (values: FormData) => {
    onNext({
      sstEnabled: values.sstEnabled,
      sstRate: parseInt(values.sstRate) as 6 | 10,
      tourismTaxEnabled: values.tourismTaxEnabled,
      sstRegistrationNumber: values.sstRegistrationNumber || '',
      pricesIncludeTax: values.pricesIncludeTax,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Tax Settings</h2>
          <p className="text-muted-foreground">
            Configure your Malaysian tax settings. You can skip this if you're not registered for SST yet.
          </p>
        </div>

        <div className="space-y-6">
          {/* SST Enable */}
          <FormField
            control={form.control}
            name="sstEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable SST (Sales & Service Tax)</FormLabel>
                  <FormDescription>
                    Turn this on if your company is registered for SST in Malaysia
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* SST Rate */}
          {sstEnabled && (
            <>
              <FormField
                control={form.control}
                name="sstRate"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>SST Rate</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="6" id="rate-6" />
                          <FormLabel htmlFor="rate-6" className="font-normal cursor-pointer">
                            6% (Standard rate for most goods)
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="10" id="rate-10" />
                          <FormLabel htmlFor="rate-10" className="font-normal cursor-pointer">
                            10% (Service tax rate)
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sstRegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SST Registration Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="A02-1234-56789012" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your SST registration number from Royal Malaysian Customs Department
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Tourism Tax */}
          <FormField
            control={form.control}
            name="tourismTaxEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Tourism Tax</FormLabel>
                  <FormDescription>
                    Enable if you operate accommodation services (hotels, resorts, etc.)
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Prices Include Tax */}
          <FormField
            control={form.control}
            name="pricesIncludeTax"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Prices Include Tax</FormLabel>
                  <FormDescription>
                    Your displayed prices already include SST (tax-inclusive pricing)
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> You can modify these settings anytime from Settings → Finance → Tax Settings
          </p>
        </div>

        <button type="submit" className="hidden" />
      </form>
    </Form>
  );
}
