import { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import type { Department } from '@/hooks/useDepartments';
import { useAuth } from '@/contexts/AuthContext';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

type DepartmentFormData = {
  name: string;
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
  const [positions, setPositions] = useState<string[]>(department?.positions || []);
  const [newPosition, setNewPosition] = useState('');
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || '',
    },
  });

  useEffect(() => {
    if (department) {
      reset({ name: department.name });
      setPositions(department.positions || []);
    } else {
      reset({ name: '' });
      setPositions([]);
    }
    setNewPosition('');
  }, [department, reset]);

  const addPosition = () => {
    const trimmed = newPosition.trim();
    if (trimmed && !positions.includes(trimmed)) {
      setPositions([...positions, trimmed]);
      setNewPosition('');
    }
  };

  const removePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: DepartmentFormData) => {
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

          <div className="space-y-3">
            <Label>Positions</Label>
            
            {/* Display existing positions as badges */}
            {positions.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50">
                {positions.map((position, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {position}
                    <button
                      type="button"
                      onClick={() => removePosition(index)}
                      disabled={isLoading}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add new position */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter position name (e.g., Software Developer)"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPosition();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addPosition}
                disabled={isLoading || !newPosition.trim()}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
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
