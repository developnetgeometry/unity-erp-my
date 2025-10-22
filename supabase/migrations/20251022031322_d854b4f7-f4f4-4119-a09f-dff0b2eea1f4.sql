-- ============================================
-- PHASE 1: ATTENDANCE MANAGEMENT DATABASE SCHEMA
-- ============================================

-- Create ENUMs
CREATE TYPE public.attendance_status AS ENUM ('on_time', 'late', 'half_day', 'absent', 'leave', 'holiday');
CREATE TYPE public.correction_type AS ENUM ('clock_in', 'clock_out', 'both', 'full_record');
CREATE TYPE public.correction_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- TABLE: work_sites
-- ============================================
CREATE TABLE public.work_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_work_sites_company ON public.work_sites(company_id);
CREATE INDEX idx_work_sites_active ON public.work_sites(company_id, is_active);

-- RLS Policies for work_sites
ALTER TABLE public.work_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company work sites"
ON public.work_sites FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can insert work sites"
ON public.work_sites FOR INSERT
TO authenticated
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "Admins can update work sites"
ON public.work_sites FOR UPDATE
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'company_admin'::app_role)
);

-- ============================================
-- TABLE: shifts
-- ============================================
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shift_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  grace_period_minutes INTEGER NOT NULL DEFAULT 10,
  lunch_break_minutes INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shifts_company ON public.shifts(company_id);
CREATE INDEX idx_shifts_active ON public.shifts(company_id, is_active);

-- RLS Policies for shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company shifts"
ON public.shifts FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage shifts"
ON public.shifts FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'company_admin'::app_role)
);

-- ============================================
-- TABLE: employee_shifts
-- ============================================
CREATE TABLE public.employee_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  effective_from DATE NOT NULL,
  effective_until DATE,
  work_days JSONB NOT NULL DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, effective_from)
);

CREATE INDEX idx_employee_shifts_employee ON public.employee_shifts(employee_id);
CREATE INDEX idx_employee_shifts_shift ON public.employee_shifts(shift_id);
CREATE INDEX idx_employee_shifts_dates ON public.employee_shifts(effective_from, effective_until);

-- RLS Policies for employee_shifts
ALTER TABLE public.employee_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company employee shifts"
ON public.employee_shifts FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Admins can manage employee shifts"
ON public.employee_shifts FOR ALL
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE company_id = public.get_user_company_id(auth.uid())
  )
  AND public.has_role(auth.uid(), 'company_admin'::app_role)
);

-- ============================================
-- TABLE: attendance_records
-- ============================================
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.work_sites(id),
  shift_id UUID REFERENCES public.shifts(id),
  attendance_date DATE NOT NULL,
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  clock_in_latitude DECIMAL(10, 8),
  clock_in_longitude DECIMAL(11, 8),
  clock_out_latitude DECIMAL(10, 8),
  clock_out_longitude DECIMAL(11, 8),
  status public.attendance_status NOT NULL DEFAULT 'absent',
  hours_worked DECIMAL(5, 2) DEFAULT 0,
  overtime_hours DECIMAL(5, 2) DEFAULT 0,
  notes TEXT,
  is_manually_adjusted BOOLEAN NOT NULL DEFAULT false,
  adjusted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

CREATE INDEX idx_attendance_employee_date ON public.attendance_records(employee_id, attendance_date);
CREATE INDEX idx_attendance_date ON public.attendance_records(attendance_date);
CREATE INDEX idx_attendance_status ON public.attendance_records(status);
CREATE INDEX idx_attendance_employee ON public.attendance_records(employee_id);

-- RLS Policies for attendance_records
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own attendance"
ON public.attendance_records FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view company attendance"
ON public.attendance_records FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE company_id = public.get_user_company_id(auth.uid())
  )
  AND public.has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "System can insert attendance"
ON public.attendance_records FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE user_id = auth.uid() 
    OR company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Admins can update attendance"
ON public.attendance_records FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE company_id = public.get_user_company_id(auth.uid())
  )
  AND public.has_role(auth.uid(), 'company_admin'::app_role)
);

-- ============================================
-- TABLE: attendance_corrections
-- ============================================
CREATE TABLE public.attendance_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_record_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  correction_type public.correction_type NOT NULL,
  requested_clock_in TIMESTAMPTZ,
  requested_clock_out TIMESTAMPTZ,
  reason TEXT NOT NULL,
  attachment_url TEXT,
  status public.correction_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_corrections_employee ON public.attendance_corrections(employee_id);
CREATE INDEX idx_corrections_status ON public.attendance_corrections(status);
CREATE INDEX idx_corrections_date ON public.attendance_corrections(created_at);

-- RLS Policies for attendance_corrections
ALTER TABLE public.attendance_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own corrections"
ON public.attendance_corrections FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Employees can create corrections"
ON public.attendance_corrections FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view company corrections"
ON public.attendance_corrections FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE company_id = public.get_user_company_id(auth.uid())
  )
  AND public.has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "Admins can update corrections"
ON public.attendance_corrections FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE company_id = public.get_user_company_id(auth.uid())
  )
  AND public.has_role(auth.uid(), 'company_admin'::app_role)
);

-- ============================================
-- TABLE: public_holidays
-- ============================================
CREATE TABLE public.public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  holiday_name TEXT NOT NULL,
  holiday_date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, holiday_date)
);

CREATE INDEX idx_holidays_company_date ON public.public_holidays(company_id, holiday_date);

-- RLS Policies for public_holidays
ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company holidays"
ON public.public_holidays FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage holidays"
ON public.public_holidays FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'company_admin'::app_role)
);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function: Calculate distance between two GPS coordinates (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  earth_radius DECIMAL := 6371000; -- Earth radius in meters
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$;

-- Function: Validate if coordinates are within geofence
CREATE OR REPLACE FUNCTION public.validate_geofence(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_site_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_site_lat DECIMAL;
  v_site_lon DECIMAL;
  v_radius INTEGER;
  v_distance DECIMAL;
BEGIN
  -- Get site coordinates and radius
  SELECT latitude, longitude, radius_meters
  INTO v_site_lat, v_site_lon, v_radius
  FROM public.work_sites
  WHERE id = p_site_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Calculate distance
  v_distance := public.calculate_distance(
    p_latitude, p_longitude,
    v_site_lat, v_site_lon
  );
  
  -- Check if within radius
  RETURN v_distance <= v_radius;
END;
$$;

-- Function: Calculate hours worked between clock in and clock out
CREATE OR REPLACE FUNCTION public.calculate_hours_worked(
  p_clock_in TIMESTAMPTZ,
  p_clock_out TIMESTAMPTZ,
  p_lunch_break_minutes INTEGER DEFAULT 60
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_total_minutes DECIMAL;
  v_hours DECIMAL;
BEGIN
  IF p_clock_in IS NULL OR p_clock_out IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate total minutes
  v_total_minutes := EXTRACT(EPOCH FROM (p_clock_out - p_clock_in)) / 60;
  
  -- Subtract lunch break if work duration > 4 hours
  IF v_total_minutes > 240 THEN
    v_total_minutes := v_total_minutes - p_lunch_break_minutes;
  END IF;
  
  -- Convert to hours (2 decimal places)
  v_hours := ROUND(v_total_minutes / 60, 2);
  
  RETURN GREATEST(v_hours, 0);
END;
$$;

-- Function: Calculate overtime hours
CREATE OR REPLACE FUNCTION public.calculate_overtime_hours(
  p_clock_out_time TIMESTAMPTZ,
  p_shift_end_time TIME
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_shift_end_datetime TIMESTAMPTZ;
  v_overtime_minutes DECIMAL;
  v_overtime_hours DECIMAL;
BEGIN
  IF p_clock_out_time IS NULL OR p_shift_end_time IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Construct shift end datetime from clock_out date + shift end time
  v_shift_end_datetime := date_trunc('day', p_clock_out_time) + p_shift_end_time;
  
  -- If clock out is before shift end, no overtime
  IF p_clock_out_time <= v_shift_end_datetime THEN
    RETURN 0;
  END IF;
  
  -- Calculate overtime minutes
  v_overtime_minutes := EXTRACT(EPOCH FROM (p_clock_out_time - v_shift_end_datetime)) / 60;
  
  -- Convert to hours (2 decimal places)
  v_overtime_hours := ROUND(v_overtime_minutes / 60, 2);
  
  RETURN v_overtime_hours;
END;
$$;

-- Function: Determine attendance status based on clock in time and shift
CREATE OR REPLACE FUNCTION public.determine_attendance_status(
  p_clock_in_time TIMESTAMPTZ,
  p_shift_start_time TIME,
  p_grace_period_minutes INTEGER
)
RETURNS public.attendance_status
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_shift_start_datetime TIMESTAMPTZ;
  v_grace_end_datetime TIMESTAMPTZ;
  v_half_day_threshold TIMESTAMPTZ;
BEGIN
  IF p_clock_in_time IS NULL THEN
    RETURN 'absent'::public.attendance_status;
  END IF;
  
  -- Construct shift start datetime
  v_shift_start_datetime := date_trunc('day', p_clock_in_time) + p_shift_start_time;
  v_grace_end_datetime := v_shift_start_datetime + (p_grace_period_minutes || ' minutes')::interval;
  v_half_day_threshold := v_shift_start_datetime + interval '4 hours';
  
  -- Determine status
  IF p_clock_in_time <= v_grace_end_datetime THEN
    RETURN 'on_time'::public.attendance_status;
  ELSIF p_clock_in_time <= v_half_day_threshold THEN
    RETURN 'late'::public.attendance_status;
  ELSE
    RETURN 'half_day'::public.attendance_status;
  END IF;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Auto-calculate hours worked and overtime on clock out
CREATE OR REPLACE FUNCTION public.calculate_attendance_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_shift_end_time TIME;
  v_lunch_break_minutes INTEGER;
BEGIN
  -- Only calculate if clock_out_time is being set/updated
  IF NEW.clock_out_time IS NOT NULL AND (OLD.clock_out_time IS NULL OR NEW.clock_out_time <> OLD.clock_out_time) THEN
    -- Get shift details
    IF NEW.shift_id IS NOT NULL THEN
      SELECT end_time, lunch_break_minutes
      INTO v_shift_end_time, v_lunch_break_minutes
      FROM public.shifts
      WHERE id = NEW.shift_id;
      
      -- Calculate hours worked
      NEW.hours_worked := public.calculate_hours_worked(
        NEW.clock_in_time,
        NEW.clock_out_time,
        COALESCE(v_lunch_break_minutes, 60)
      );
      
      -- Calculate overtime
      NEW.overtime_hours := public.calculate_overtime_hours(
        NEW.clock_out_time,
        v_shift_end_time
      );
    END IF;
  END IF;
  
  -- Auto-determine status if clock_in_time is set
  IF NEW.clock_in_time IS NOT NULL AND NEW.shift_id IS NOT NULL AND NEW.status = 'absent' THEN
    DECLARE
      v_shift_start_time TIME;
      v_grace_period INTEGER;
    BEGIN
      SELECT start_time, grace_period_minutes
      INTO v_shift_start_time, v_grace_period
      FROM public.shifts
      WHERE id = NEW.shift_id;
      
      NEW.status := public.determine_attendance_status(
        NEW.clock_in_time,
        v_shift_start_time,
        COALESCE(v_grace_period, 10)
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_attendance_metrics_trigger
  BEFORE INSERT OR UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_attendance_metrics();

CREATE TRIGGER update_work_sites_updated_at
  BEFORE UPDATE ON public.work_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_shifts_updated_at
  BEFORE UPDATE ON public.employee_shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_corrections_updated_at
  BEFORE UPDATE ON public.attendance_corrections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SEED DATA: Malaysian Public Holidays 2025
-- ============================================
DO $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM public.companies WHERE company_name = 'huawey' LIMIT 1;
  
  IF v_company_id IS NOT NULL THEN
    INSERT INTO public.public_holidays (company_id, holiday_name, holiday_date, is_recurring) VALUES
    (v_company_id, 'New Year''s Day', '2025-01-01', true),
    (v_company_id, 'Chinese New Year', '2025-01-29', false),
    (v_company_id, 'Chinese New Year', '2025-01-30', false),
    (v_company_id, 'Federal Territory Day', '2025-02-01', true),
    (v_company_id, 'Labour Day', '2025-05-01', true),
    (v_company_id, 'Wesak Day', '2025-05-12', false),
    (v_company_id, 'Agong''s Birthday', '2025-06-07', false),
    (v_company_id, 'Hari Raya Aidiladha', '2025-06-07', false),
    (v_company_id, 'Awal Muharram', '2025-06-27', false),
    (v_company_id, 'Merdeka Day', '2025-08-31', true),
    (v_company_id, 'Malaysia Day', '2025-09-16', true),
    (v_company_id, 'Prophet Muhammad''s Birthday', '2025-09-05', false),
    (v_company_id, 'Deepavali', '2025-10-20', false),
    (v_company_id, 'Christmas Day', '2025-12-25', true)
    ON CONFLICT (company_id, holiday_date) DO NOTHING;
  END IF;
END $$;