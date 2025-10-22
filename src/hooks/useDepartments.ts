import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Department {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  positions: string[] | null;
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
  positions?: string[];
  manager_id?: string;
}

// Fetch all departments
export const useDepartments = (search?: string) => {
  const { session, loading } = useAuth();

  return useQuery({
    queryKey: ['departments', search],
    enabled: !!session && !loading,
    queryFn: async () => {
      console.log('useDepartments - Using session from context:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        email: session?.user?.email,
        tokenPreview: session?.access_token?.substring(0, 20) + '...'
      });
      
      if (!session?.access_token) {
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
  const { session, loading, ensureFreshToken } = useAuth();

  return useMutation({
    mutationFn: async (department: DepartmentInput) => {
      console.log('useCreateDepartment - Starting mutation', {
        hasSession: !!session,
        loading,
        department
      });

      if (loading) {
        throw new Error('Session is still loading. Please wait...');
      }

      // Ensure we have a fresh token
      const freshSession = await ensureFreshToken();
      
      if (!freshSession?.access_token) {
        throw new Error('No active session. Please sign in again.');
      }

      console.log('useCreateDepartment - Making API call with fresh token');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-departments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${freshSession.access_token}`,
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
        
        // Handle 401 with retry
        if (response.status === 401) {
          console.log('useCreateDepartment - 401 error, refreshing and retrying...');
          const retrySession = await ensureFreshToken();
          
          if (!retrySession?.access_token) {
            throw new Error('Authentication failed. Please sign in again.');
          }

          const retryResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-departments`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${retrySession.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(department),
            }
          );

          if (!retryResponse.ok) {
            const retryError = await retryResponse.json().catch(() => ({}));
            throw new Error(retryError.details || retryError.message || retryError.error || 'Failed to create department');
          }

          return retryResponse.json() as Promise<Department>;
        }
        
        throw new Error(errorData.details || errorData.message || errorData.error || `Failed to create department: ${response.status}`);
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
  const { session, loading, ensureFreshToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...department }: DepartmentInput & { id: string }) => {
      if (loading) {
        throw new Error('Session is still loading. Please wait...');
      }

      const freshSession = await ensureFreshToken();
      
      if (!freshSession?.access_token) {
        throw new Error('No active session. Please sign in again.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-departments/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${freshSession.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(department),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.message || errorData.error || 'Failed to update department');
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
  const { session, loading, ensureFreshToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (loading) {
        throw new Error('Session is still loading. Please wait...');
      }

      const freshSession = await ensureFreshToken();
      
      if (!freshSession?.access_token) {
        throw new Error('No active session. Please sign in again.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-departments/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${freshSession.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || errorData.error || 'Failed to delete department');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
