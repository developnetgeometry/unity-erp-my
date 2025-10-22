import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Department } from '@/hooks/useDepartments';
import { useAuth } from '@/contexts/AuthContext';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  positions: z.string().optional(),
});

type DepartmentFormData = {
  name: string;
  positions?: string;
};

type DepartmentFormOutput = {
  name: string;
  positions?: string[];
};

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormOutput) => void;
  department?: Department;
  isLoading?: boolean;
}

export const DepartmentFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  department,
  isLoading,
}: DepartmentFormModalProps) => {
  const { loading: authLoading } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || '',
      positions: department?.positions?.join('\n') || '',
    },
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        positions: department.positions?.join('\n') || '',
      });
    } else {
      reset({
        name: '',
        positions: '',
      });
    }
  }, [department, reset]);

  const handleFormSubmit = (data: DepartmentFormData) => {
    // Transform positions string to array
    const positions = data.positions
      ? data.positions.split('\n').map(p => p.trim()).filter(p => p.length > 0)
      : [];
    
    onSubmit({
      name: data.name,
      positions,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {department ? 'Edit Department' : 'Add Department'}
          </DialogTitle>
          <DialogDescription>
            {department
              ? 'Update the department information below.'
              : 'Create a new department by filling out the form below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Department Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Information Technology"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="positions">Positions</Label>
            <Textarea
              id="positions"
              placeholder="Enter positions for this department (one per line)&#10;e.g., Software Developer&#10;IT Manager&#10;Network Engineer"
              rows={5}
              {...register('positions')}
              disabled={isLoading}
            />
            {errors.positions && (
              <p className="text-sm text-destructive">
                {errors.positions.message as string}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || authLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || authLoading}>
              {authLoading ? 'Initializing...' : isLoading ? 'Saving...' : department ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
