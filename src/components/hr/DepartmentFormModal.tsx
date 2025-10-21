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

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormData) => void;
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || '',
      description: department?.description || '',
    },
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        description: department.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [department, reset]);

  const handleFormSubmit = (data: DepartmentFormData) => {
    onSubmit(data);
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the department"
              rows={3}
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : department ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
