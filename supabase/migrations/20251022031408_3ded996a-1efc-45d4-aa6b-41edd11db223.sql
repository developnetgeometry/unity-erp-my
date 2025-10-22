-- Fix security warnings: Set search_path for all attendance functions

-- Function: Calculate distance
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  earth_radius DECIMAL := 6371000;
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

-- Function: Validate geofence
CREATE OR REPLACE FUNCTION public.validate_geofence(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_site_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_lat DECIMAL;
  v_site_lon DECIMAL;
  v_radius INTEGER;
  v_distance DECIMAL;
BEGIN
  SELECT latitude, longitude, radius_meters
  INTO v_site_lat, v_site_lon, v_radius
  FROM public.work_sites
  WHERE id = p_site_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  v_distance := public.calculate_distance(
    p_latitude, p_longitude,
    v_site_lat, v_site_lon
  );
  
  RETURN v_distance <= v_radius;
END;
$$;

-- Function: Calculate hours worked
CREATE OR REPLACE FUNCTION public.calculate_hours_worked(
  p_clock_in TIMESTAMPTZ,
  p_clock_out TIMESTAMPTZ,
  p_lunch_break_minutes INTEGER DEFAULT 60
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_minutes DECIMAL;
  v_hours DECIMAL;
BEGIN
  IF p_clock_in IS NULL OR p_clock_out IS NULL THEN
    RETURN 0;
  END IF;
  
  v_total_minutes := EXTRACT(EPOCH FROM (p_clock_out - p_clock_in)) / 60;
  
  IF v_total_minutes > 240 THEN
    v_total_minutes := v_total_minutes - p_lunch_break_minutes;
  END IF;
  
  v_hours := ROUND(v_total_minutes / 60, 2);
  
  RETURN GREATEST(v_hours, 0);
END;
$$;

-- Function: Calculate overtime
CREATE OR REPLACE FUNCTION public.calculate_overtime_hours(
  p_clock_out_time TIMESTAMPTZ,
  p_shift_end_time TIME
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shift_end_datetime TIMESTAMPTZ;
  v_overtime_minutes DECIMAL;
  v_overtime_hours DECIMAL;
BEGIN
  IF p_clock_out_time IS NULL OR p_shift_end_time IS NULL THEN
    RETURN 0;
  END IF;
  
  v_shift_end_datetime := date_trunc('day', p_clock_out_time) + p_shift_end_time;
  
  IF p_clock_out_time <= v_shift_end_datetime THEN
    RETURN 0;
  END IF;
  
  v_overtime_minutes := EXTRACT(EPOCH FROM (p_clock_out_time - v_shift_end_datetime)) / 60;
  v_overtime_hours := ROUND(v_overtime_minutes / 60, 2);
  
  RETURN v_overtime_hours;
END;
$$;

-- Function: Determine status
CREATE OR REPLACE FUNCTION public.determine_attendance_status(
  p_clock_in_time TIMESTAMPTZ,
  p_shift_start_time TIME,
  p_grace_period_minutes INTEGER
)
RETURNS public.attendance_status
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shift_start_datetime TIMESTAMPTZ;
  v_grace_end_datetime TIMESTAMPTZ;
  v_half_day_threshold TIMESTAMPTZ;
BEGIN
  IF p_clock_in_time IS NULL THEN
    RETURN 'absent'::public.attendance_status;
  END IF;
  
  v_shift_start_datetime := date_trunc('day', p_clock_in_time) + p_shift_start_time;
  v_grace_end_datetime := v_shift_start_datetime + (p_grace_period_minutes || ' minutes')::interval;
  v_half_day_threshold := v_shift_start_datetime + interval '4 hours';
  
  IF p_clock_in_time <= v_grace_end_datetime THEN
    RETURN 'on_time'::public.attendance_status;
  ELSIF p_clock_in_time <= v_half_day_threshold THEN
    RETURN 'late'::public.attendance_status;
  ELSE
    RETURN 'half_day'::public.attendance_status;
  END IF;
END;
$$;

-- Function: Calculate metrics trigger
CREATE OR REPLACE FUNCTION public.calculate_attendance_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shift_end_time TIME;
  v_lunch_break_minutes INTEGER;
BEGIN
  IF NEW.clock_out_time IS NOT NULL AND (OLD.clock_out_time IS NULL OR NEW.clock_out_time <> OLD.clock_out_time) THEN
    IF NEW.shift_id IS NOT NULL THEN
      SELECT end_time, lunch_break_minutes
      INTO v_shift_end_time, v_lunch_break_minutes
      FROM public.shifts
      WHERE id = NEW.shift_id;
      
      NEW.hours_worked := public.calculate_hours_worked(
        NEW.clock_in_time,
        NEW.clock_out_time,
        COALESCE(v_lunch_break_minutes, 60)
      );
      
      NEW.overtime_hours := public.calculate_overtime_hours(
        NEW.clock_out_time,
        v_shift_end_time
      );
    END IF;
  END IF;
  
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