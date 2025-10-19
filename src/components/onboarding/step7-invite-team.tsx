import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CompanySetupData } from '@/types/setup-wizard';
import { Plus, Trash2 } from 'lucide-react';

const formSchema = z.object({
  teamInvites: z.array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
      role: z.enum(['admin', 'manager', 'employee']),
    })
  ),
  sendInvitesNow: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface Step7Props {
  data: CompanySetupData['teamInvites'] | undefined;
  onNext: (data: CompanySetupData['teamInvites']) => void;
  onSkip: () => void;
}

export function Step7InviteTeam({ data, onNext, onSkip }: Step7Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamInvites: Array.isArray(data) && data.length > 0
        ? data
        : [{ name: '', email: '', role: 'employee' as const }],
      sendInvitesNow: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'teamInvites',
  });

  const handleSubmit = (values: FormData) => {
    onNext(values.teamInvites as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Invite Your Team</h2>
          <p className="text-muted-foreground">
            Add team members and assign roles. They'll receive email invitations to join your ERP One workspace.
          </p>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Team Member {index + 1}</h3>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`teamInvites.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`teamInvites.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`teamInvites.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin - Full access</SelectItem>
                          <SelectItem value="manager">Manager - Department access</SelectItem>
                          <SelectItem value="employee">Employee - Limited access</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: '', email: '', role: 'employee' })}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Team Member
          </Button>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <FormDescription>
            <strong>Role Permissions:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• <strong>Admin:</strong> Full system access, can manage company settings and users</li>
              <li>• <strong>Manager:</strong> Access to department modules, can approve requests</li>
              <li>• <strong>Employee:</strong> Can submit leave, expenses, and view own records</li>
            </ul>
          </FormDescription>
        </div>

        <button type="submit" className="hidden" />
      </form>
    </Form>
  );
}
