import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employee } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useEffect, useState } from 'react';

const employeeSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  ic_number: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  department_id: z.string().optional(),
  join_date: z.string().min(1, 'Join date is required'),
  status: z.enum(['Active', 'On Leave', 'Terminated', 'Probation']).optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormValues) => void;
  employee?: Employee | null;
  isLoading?: boolean;
}

export const EmployeeFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  employee,
  isLoading,
}: EmployeeFormModalProps) => {
  const { data: departments = [] } = useDepartments();
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: '',
      ic_number: '',
      email: '',
      phone: '',
      position: '',
      department_id: '',
      join_date: new Date().toISOString().split('T')[0],
      status: 'Active',
    },
  });

  // Watch department changes and update available positions
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'department_id' && value.department_id) {
        const dept = departments.find(d => d.id === value.department_id);
        setAvailablePositions(dept?.positions || []);
        
        // Clear position if it doesn't exist in new department
        const currentPosition = form.getValues('position');
        if (currentPosition && !dept?.positions?.includes(currentPosition)) {
          form.setValue('position', '');
        }
      } else if (name === 'department_id' && !value.department_id) {
        setAvailablePositions([]);
        form.setValue('position', '');
      }
    });
    return () => subscription.unsubscribe();
  }, [departments, form]);

  useEffect(() => {
    if (employee) {
      form.reset({
        full_name: employee.full_name,
        ic_number: employee.ic_number || '',
        email: employee.email || '',
        phone: employee.phone || '',
        position: employee.position,
        department_id: employee.department_id || '',
        join_date: employee.join_date,
        status: employee.status,
      });
      
      // Set available positions for existing employee's department
      if (employee.department_id) {
        const dept = departments.find(d => d.id === employee.department_id);
        setAvailablePositions(dept?.positions || []);
      }
    } else {
      form.reset({
        full_name: '',
        ic_number: '',
        email: '',
        phone: '',
        position: '',
        department_id: '',
        join_date: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
      setAvailablePositions([]);
    }
  }, [employee, form, departments]);

  const handleSubmit = (data: EmployeeFormValues) => {
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmad Hassan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ic_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IC Number</FormLabel>
                    <FormControl>
                      <Input placeholder="900101-01-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="ahmad@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+60 12-345 6789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
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
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!form.watch('department_id') || availablePositions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !form.watch('department_id') 
                              ? "Select department first" 
                              : availablePositions.length === 0
                                ? "No positions available"
                                : "Select position"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availablePositions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
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
                name="join_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Join Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Probation">Probation</SelectItem>
                        <SelectItem value="Terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
