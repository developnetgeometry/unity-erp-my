import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-api';

export interface Employee {
  id: string;
  company_id: string;
  employee_number: string;
  full_name: string;
  ic_number: string | null;
  email: string | null;
  phone: string | null;
  position: string;
  department_id: string | null;
  branch_id: string | null;
  join_date: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Probation';
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormData {
  full_name: string;
  ic_number?: string;
  email?: string;
  phone?: string;
  position: string;
  department_id?: string;
  branch_id?: string;
  join_date: string;
  status?: string;
}

export const useEmployees = (filters?: { search?: string; department?: string; status?: string }) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.department) params.append('department', filters.department);
      if (filters?.status) params.append('status', filters.status);

      const url = params.toString() ? `hr-employees?${params.toString()}` : 'hr-employees';

      const { data, error } = await supabase.functions.invoke(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.employees as Employee[];
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: EmployeeFormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('hr-employees', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (error) throw error;
      return data.employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee added successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to add employee: ${error.message}`);
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formData }: EmployeeFormData & { id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/hr-employees/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update employee');
      }

      const data = await response.json();
      return data.employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        console.log('Deleting employee:', { id, url: `${supabaseUrl}/functions/v1/hr-employees/${id}` });

        const response = await fetch(
          `${supabaseUrl}/functions/v1/hr-employees/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': supabaseAnonKey,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Delete response:', { status: response.status, ok: response.ok });

        if (!response.ok) {
          let errorMessage = 'Failed to delete employee';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        return { success: true };
      } catch (error: any) {
        console.error('Delete error:', error);
        throw new Error(error.message || 'Network error occurred');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Deletion failed: ${error.message}`);
    },
  });
};
