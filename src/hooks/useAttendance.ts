import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-api';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  status: 'on_time' | 'late' | 'half_day' | 'absent' | 'leave' | 'holiday';
  hours_worked: number;
  overtime_hours: number;
  is_provisional: boolean;
  locked_for_payroll: boolean;
  correction_id: string | null;
  employees: {
    full_name: string;
    position: string;
    employee_number: string;
    department_id: string | null;
    departments: {
      id: string;
      name: string;
    } | null;
  };
  work_sites: {
    site_name: string;
  } | null;
}

export interface OvertimeSession {
  id: string;
  employee_id: string;
  attendance_record_id: string;
  site_id: string;
  ot_in_time: string;
  ot_out_time: string | null;
  total_ot_hours: number;
  status: string;
  is_approved: boolean;
  rejection_reason: string | null;
  work_sites: {
    site_name: string;
  };
  employees: {
    full_name: string;
    position: string;
  };
}

export interface CorrectionRequest {
  id: string;
  employee_id: string;
  attendance_record_id: string;
  correction_type: 'clock_in' | 'clock_out' | 'both' | 'full_record';
  requested_clock_in: string | null;
  requested_clock_out: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  attachment_url: string | null;
  reviewer_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  submission_deadline: string;
  is_within_deadline: boolean;
  created_at: string;
  employees: {
    full_name: string;
    position: string;
  };
}

// Fetch attendance records with filters
export const useAttendanceRecords = (filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  department?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['attendance-records', filters],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.department) params.append('department', filters.department);
      if (filters?.search) params.append('search', filters.search);

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const queryString = params.toString();
      const url = `${SUPABASE_URL}/functions/v1/hr-attendance${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch attendance records');
      }

      const data = await response.json();
      return data.records as AttendanceRecord[];
    },
  });
};

// Clock In
export const useClockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      site_id: string;
      latitude: number;
      longitude: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data: result, error } = await supabase.functions.invoke('hr-attendance/clock-in', {
        method: 'POST',
        body: data,
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      toast.success('Clocked in successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clock in');
    },
  });
};

// Clock Out
export const useClockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      attendance_record_id: string;
      latitude: number;
      longitude: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data: result, error } = await supabase.functions.invoke('hr-attendance/clock-out', {
        method: 'POST',
        body: data,
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['my-attendance-status'] });
      toast.success('Clocked out successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clock out');
    },
  });
};

// OT Clock In
export const useOTClockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      site_id: string;
      attendance_record_id: string;
      latitude: number;
      longitude: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data: result, error } = await supabase.functions.invoke('hr-attendance/ot-in', {
        method: 'POST',
        body: data,
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtime-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      toast.success('Overtime session started');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start OT session');
    },
  });
};

// OT Clock Out
export const useOTClockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      latitude: number;
      longitude: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data: result, error } = await supabase.functions.invoke('hr-attendance/ot-out', {
        method: 'POST',
        body: data,
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtime-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      toast.success('Overtime session ended');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to end OT session');
    },
  });
};

// Fetch overtime sessions
export const useOvertimeSessions = (filters?: { employee_id?: string; status?: string }) => {
  return useQuery({
    queryKey: ['overtime-sessions', filters],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let query = supabase
        .from('overtime_sessions')
        .select(`
          *,
          work_sites(site_name),
          employees!overtime_sessions_employee_id_fkey(full_name, position)
        `)
        .order('ot_in_time', { ascending: false });

      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OvertimeSession[];
    },
  });
};

// Submit correction request
export const useSubmitCorrection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      attendance_record_id: string;
      correction_type: 'clock_in' | 'clock_out' | 'both' | 'full_record';
      requested_clock_in?: string;
      requested_clock_out?: string;
      reason: string;
      attachment?: File;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let attachment_url = null;

      // Upload file if provided
      if (data.attachment) {
        const fileName = `${Date.now()}-${data.attachment.name}`;
        const { error: uploadError } = await supabase.storage
          .from('correction-attachments')
          .upload(fileName, data.attachment);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('correction-attachments')
          .getPublicUrl(fileName);

        attachment_url = publicUrl;
      }

      const { data: result, error } = await supabase.functions.invoke('hr-attendance/corrections', {
        method: 'POST',
        body: { ...data, attachment_url },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      toast.success('Correction request submitted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit correction');
    },
  });
};

// Fetch correction requests
export const useCorrections = (filters?: { 
  status?: 'pending' | 'approved' | 'rejected'; 
  employee_id?: string;
}) => {
  return useQuery({
    queryKey: ['corrections', filters],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let query = supabase
        .from('attendance_corrections')
        .select(`
          *,
          employees(full_name, position)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CorrectionRequest[];
    },
  });
};

// Review correction request (HR)
export const useReviewCorrection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      correction_id: string;
      action: 'approve' | 'reject';
      reviewer_notes?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data: result, error } = await supabase.functions.invoke(
        `hr-attendance/corrections/${data.correction_id}`,
        {
          method: 'PATCH',
          body: { action: data.action, reviewer_notes: data.reviewer_notes },
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      toast.success(
        variables.action === 'approve' 
          ? 'Correction approved' 
          : 'Correction rejected'
      );
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to review correction');
    },
  });
};

// ============= NEW HOOKS FOR GEOFENCING CONTROL =============

// Get attendance settings
export const useAttendanceSettings = () => {
  return useQuery({
    queryKey: ['attendance-settings'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-attendance/settings`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      return data.config;
    },
  });
};

// Get employee's authorized sites
export const useMySites = () => {
  return useQuery({
    queryKey: ['my-sites'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-attendance/my-sites`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch sites');
      const data = await response.json();
      return data.sites || [];
    },
  });
};

// Get all work sites (Admin)
export const useWorkSites = () => {
  return useQuery({
    queryKey: ['work-sites'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-attendance/sites`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch sites');
      const data = await response.json();
      return data.sites || [];
    },
  });
};

// Create work site
export const useCreateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteData: {
      site_name: string;
      address: string;
      latitude: number;
      longitude: number;
      radius_meters: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-attendance/sites`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(siteData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create site');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sites'] });
      queryClient.invalidateQueries({ queryKey: ['my-sites'] });
    },
  });
};

// Update work site
export const useUpdateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteData: {
      id: string;
      site_name: string;
      address: string;
      latitude: number;
      longitude: number;
      radius_meters: number;
      is_active: boolean;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { id, ...updateData } = siteData;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-attendance/sites/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update site');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sites'] });
      queryClient.invalidateQueries({ queryKey: ['my-sites'] });
    },
  });
};

// Delete work site
export const useDeleteSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hr-attendance/sites/${siteId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete site');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sites'] });
      queryClient.invalidateQueries({ queryKey: ['my-sites'] });
    },
  });
};
