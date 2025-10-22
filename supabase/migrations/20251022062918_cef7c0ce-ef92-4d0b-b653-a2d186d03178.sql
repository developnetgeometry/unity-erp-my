-- Phase 1: Attendance Management Enhancement - Database Schema

-- ============================================
-- 1. Create New ENUM Types
-- ============================================

CREATE TYPE public.leave_type AS ENUM ('annual', 'sick', 'emergency', 'unpaid', 'maternity', 'paternity');
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE public.notification_type AS ENUM (
  'late_arrival',
  'missed_clockout',
  'ot_reminder',
  'correction_approved',
  'correction_rejected',
  'auto_clockout',
  'ot_auto_closed'
);

-- ============================================
-- 2. Create employee_leaves Table
-- ============================================

CREATE TABLE public.employee_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  leave_type leave_type NOT NULL,
  
  -- Date range
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL,
  
  -- Request details
  reason TEXT NOT NULL,
  attachment_url TEXT,
  
  -- Approval workflow
  status leave_status DEFAULT 'pending' NOT NULL,
  approved_by UUID REFERENCES public.employees(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_employee_leaves_employee ON public.employee_leaves(employee_id);
CREATE INDEX idx_employee_leaves_dates ON public.employee_leaves(start_date, end_date);
CREATE INDEX idx_employee_leaves_status ON public.employee_leaves(status);

-- ============================================
-- 3. Create attendance_config Table
-- ============================================

CREATE TABLE public.attendance_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Location rules
  geofence_radius_meters INTEGER DEFAULT 100 CHECK (geofence_radius_meters BETWEEN 50 AND 500),
  
  -- Timing rules
  grace_period_minutes INTEGER DEFAULT 10 CHECK (grace_period_minutes BETWEEN 0 AND 30),
  
  -- Auto clock-out rules
  auto_clockout_enabled BOOLEAN DEFAULT true,
  
  -- Correction rules
  correction_window_hours INTEGER DEFAULT 24 CHECK (correction_window_hours BETWEEN 12 AND 72),
  
  -- OT rules
  ot_auto_close_hours INTEGER DEFAULT 4 CHECK (ot_auto_close_hours BETWEEN 2 AND 8),
  
  -- Work schedule
  work_days JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb,
  
  -- Notification settings
  notification_settings JSONB DEFAULT '{
    "late_arrival": true,
    "missed_clockout": true,
    "ot_reminder": true,
    "correction_submitted": true
  }'::jsonb,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_attendance_config_company ON public.attendance_config(company_id);

-- Insert default config for all existing companies
INSERT INTO public.attendance_config (company_id)
SELECT id FROM public.companies
ON CONFLICT (company_id) DO NOTHING;

-- ============================================
-- 4. Alter attendance_records Table
-- ============================================

ALTER TABLE public.attendance_records 
  ADD COLUMN IF NOT EXISTS is_provisional BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS locked_for_payroll BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS correction_id UUID REFERENCES public.attendance_corrections(id),
  ADD COLUMN IF NOT EXISTS leave_id UUID REFERENCES public.employee_leaves(id);

CREATE INDEX IF NOT EXISTS idx_attendance_provisional ON public.attendance_records(is_provisional);
CREATE INDEX IF NOT EXISTS idx_attendance_locked ON public.attendance_records(locked_for_payroll);

-- ============================================
-- 5. Alter attendance_corrections Table
-- ============================================

ALTER TABLE public.attendance_corrections
  ADD COLUMN IF NOT EXISTS submission_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_within_deadline BOOLEAN GENERATED ALWAYS AS (
    CASE 
      WHEN submission_deadline IS NULL THEN true
      WHEN created_at <= submission_deadline THEN true
      ELSE false
    END
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_corrections_deadline ON public.attendance_corrections(is_within_deadline);

-- ============================================
-- 6. Create overtime_sessions Table
-- ============================================

CREATE TABLE public.overtime_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_record_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES public.work_sites(id) NOT NULL,
  
  -- OT-In details
  ot_in_time TIMESTAMPTZ NOT NULL,
  ot_in_latitude NUMERIC NOT NULL,
  ot_in_longitude NUMERIC NOT NULL,
  
  -- OT-Out details
  ot_out_time TIMESTAMPTZ,
  ot_out_latitude NUMERIC,
  ot_out_longitude NUMERIC,
  
  -- Calculated fields
  total_ot_hours NUMERIC DEFAULT 0,
  
  -- Status management
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'auto_closed', 'cancelled')),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.employees(id),
  approved_at TIMESTAMPTZ,
  auto_closed_at TIMESTAMPTZ,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_overtime_sessions_employee ON public.overtime_sessions(employee_id);
CREATE INDEX idx_overtime_sessions_attendance ON public.overtime_sessions(attendance_record_id);
CREATE INDEX idx_overtime_sessions_status ON public.overtime_sessions(status);
CREATE INDEX idx_overtime_sessions_date ON public.overtime_sessions(ot_in_time);

-- ============================================
-- 7. Create notification_log Table
-- ============================================

CREATE TABLE public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  notification_type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_notifications_employee ON public.notification_log(employee_id);
CREATE INDEX idx_notifications_unread ON public.notification_log(employee_id, read_at) 
  WHERE read_at IS NULL;

-- ============================================
-- 8. Create Database Functions
-- ============================================

-- Function: Calculate OT Hours
CREATE OR REPLACE FUNCTION public.calculate_ot_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ot_out_time IS NOT NULL THEN
    NEW.total_ot_hours := EXTRACT(EPOCH FROM (NEW.ot_out_time - NEW.ot_in_time)) / 3600;
    NEW.status := 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_ot_hours
BEFORE UPDATE ON public.overtime_sessions
FOR EACH ROW
WHEN (OLD.ot_out_time IS NULL AND NEW.ot_out_time IS NOT NULL)
EXECUTE FUNCTION public.calculate_ot_hours();

-- Function: Check if Employee is on Leave/Holiday
CREATE OR REPLACE FUNCTION public.is_employee_on_leave(
  p_employee_id UUID,
  p_date DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_on_leave BOOLEAN;
  v_company_id UUID;
BEGIN
  -- Get employee's company
  SELECT company_id INTO v_company_id
  FROM public.employees
  WHERE id = p_employee_id;
  
  -- Check for approved leave
  SELECT EXISTS (
    SELECT 1 FROM public.employee_leaves
    WHERE employee_id = p_employee_id
      AND status = 'approved'
      AND start_date <= p_date
      AND end_date >= p_date
  ) INTO v_is_on_leave;
  
  IF v_is_on_leave THEN
    RETURN true;
  END IF;
  
  -- Check for public holiday
  SELECT EXISTS (
    SELECT 1 FROM public.public_holidays
    WHERE company_id = v_company_id
      AND holiday_date = p_date
  ) INTO v_is_on_leave;
  
  RETURN v_is_on_leave;
END;
$$;

-- Function: Get Company Attendance Config
CREATE OR REPLACE FUNCTION public.get_attendance_config(p_company_id UUID)
RETURNS TABLE (
  geofence_radius_meters INTEGER,
  grace_period_minutes INTEGER,
  auto_clockout_enabled BOOLEAN,
  correction_window_hours INTEGER,
  ot_auto_close_hours INTEGER,
  work_days JSONB,
  notification_settings JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.geofence_radius_meters,
    ac.grace_period_minutes,
    ac.auto_clockout_enabled,
    ac.correction_window_hours,
    ac.ot_auto_close_hours,
    ac.work_days,
    ac.notification_settings
  FROM public.attendance_config ac
  WHERE ac.company_id = p_company_id;
  
  -- Return defaults if no config exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      100::INTEGER,
      10::INTEGER,
      true::BOOLEAN,
      24::INTEGER,
      4::INTEGER,
      '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::JSONB,
      '{"late_arrival": true, "missed_clockout": true, "ot_reminder": true, "correction_submitted": true}'::JSONB;
  END IF;
END;
$$;

-- ============================================
-- 9. Row-Level Security (RLS) Policies
-- ============================================

-- RLS for overtime_sessions
ALTER TABLE public.overtime_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own OT sessions"
ON public.overtime_sessions FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Employees can create OT sessions"
ON public.overtime_sessions FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Employees can update own active OT sessions"
ON public.overtime_sessions FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  ) AND status = 'active'
);

CREATE POLICY "Admins can view company OT sessions"
ON public.overtime_sessions FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE company_id = get_user_company_id(auth.uid())
  ) AND has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "Admins can update company OT sessions"
ON public.overtime_sessions FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE company_id = get_user_company_id(auth.uid())
  ) AND has_role(auth.uid(), 'company_admin'::app_role)
);

-- RLS for employee_leaves
ALTER TABLE public.employee_leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own leaves"
ON public.employee_leaves FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Employees can create leave requests"
ON public.employee_leaves FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view company leaves"
ON public.employee_leaves FOR SELECT
TO authenticated
USING (
  company_id = get_user_company_id(auth.uid()) 
  AND has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "Admins can update company leaves"
ON public.employee_leaves FOR UPDATE
TO authenticated
USING (
  company_id = get_user_company_id(auth.uid()) 
  AND has_role(auth.uid(), 'company_admin'::app_role)
);

-- RLS for attendance_config
ALTER TABLE public.attendance_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company config"
ON public.attendance_config FOR SELECT
TO authenticated
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage company config"
ON public.attendance_config FOR ALL
TO authenticated
USING (
  company_id = get_user_company_id(auth.uid()) 
  AND has_role(auth.uid(), 'company_admin'::app_role)
);

-- RLS for notification_log
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own notifications"
ON public.notification_log FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Employees can update own notifications"
ON public.notification_log FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert notifications"
ON public.notification_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- 10. Storage Bucket for Correction Attachments
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('correction-attachments', 'correction-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket
CREATE POLICY "Employees can upload own correction attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'correction-attachments' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Employees can view own correction attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'correction-attachments' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "HR can view all company correction attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'correction-attachments'
  AND has_role(auth.uid(), 'company_admin'::app_role)
);