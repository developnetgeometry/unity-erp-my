import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  employee_count: number;
  created_at: string;
  updated_at: string;
  manager?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface DepartmentInput {
  name: string;
  description?: string;
  manager_id?: string;
}

// Fetch all departments
export const useDepartments = (search?: string) => {
  return useQuery({
    queryKey: ['departments', search],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('useDepartments - Session check:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        email: session?.user?.email,
        tokenPreview: session?.access_token?.substring(0, 20) + '...',
        sessionError: sessionError?.message
      });
      
      if (!session) {
        throw new Error('No active session. Please sign in again.');
      }

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-departments`);
      if (search) {
        url.searchParams.append('search', search);
      }

      console.log('Fetching departments from:', url.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Department fetch response:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Department fetch failed:', errorData);
        throw new Error(errorData.error || errorData.details || `Failed to fetch departments: ${response.status}`);
      }

      return response.json() as Promise<Department[]>;
    },
  });
};

// Create department
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (department: DepartmentInput) => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('useCreateDepartment - Session check:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        sessionError: sessionError?.message
      });
      
      if (!session) {
        throw new Error('No active session. Please sign in again.');
      }

      console.log('Creating department:', department);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-departments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(department),
        }
      );

      console.log('Create department response:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Create department failed:', errorData);
        throw new Error(errorData.error || errorData.details || `Failed to create department: ${response.status}`);
      }

      return response.json() as Promise<Department>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

// Update department
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...department }: DepartmentInput & { id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-departments/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(department),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update department');
      }

      return response.json() as Promise<Department>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

// Delete department
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-departments/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.detail || 'Failed to delete department');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
