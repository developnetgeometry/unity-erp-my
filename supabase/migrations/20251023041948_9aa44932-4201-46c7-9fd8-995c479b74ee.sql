-- =============================================
-- DUMMY DATA FOR OCTOBER 2025 - HR ATTENDANCE TESTING
-- =============================================

-- Clean up existing October 2025 test data
DELETE FROM public.overtime_sessions 
WHERE ot_in_time >= '2025-10-01' AND ot_in_time < '2025-11-01';

DELETE FROM public.attendance_corrections 
WHERE created_at >= '2025-10-01' AND created_at < '2025-11-01';

DELETE FROM public.attendance_records 
WHERE attendance_date >= '2025-10-01' AND attendance_date < '2025-11-01';

DELETE FROM public.employee_leaves 
WHERE start_date >= '2025-10-01' AND start_date < '2025-11-01';

-- =============================================
-- ATTENDANCE RECORDS - October 2025
-- =============================================

DO $$
DECLARE
  v_employee_record RECORD;
  v_site_id UUID;
  v_shift_id UUID;
  v_attendance_date DATE;
  v_clock_in_time TIMESTAMPTZ;
  v_clock_out_time TIMESTAMPTZ;
  v_status public.attendance_status;
  v_day_pattern INT;
  v_employee_index INT := 0;
BEGIN
  SELECT id INTO v_site_id FROM public.work_sites WHERE is_active = true LIMIT 1;
  SELECT id INTO v_shift_id FROM public.shifts WHERE is_active = true LIMIT 1;
  
  FOR v_employee_record IN 
    SELECT id FROM public.employees WHERE status = 'active' LIMIT 10
  LOOP
    v_employee_index := v_employee_index + 1;
    v_attendance_date := '2025-10-01'::date;
    
    WHILE v_attendance_date <= '2025-10-31'::date LOOP
      IF EXTRACT(DOW FROM v_attendance_date) NOT IN (0, 6) THEN
        v_day_pattern := (EXTRACT(DAY FROM v_attendance_date)::int + v_employee_index) % 10;
        
        CASE v_day_pattern
          WHEN 0, 1, 2, 3, 4, 5 THEN
            v_clock_in_time := v_attendance_date + TIME '08:55:00' + (random() * interval '5 minutes');
            v_clock_out_time := v_attendance_date + TIME '17:30:00' + (random() * interval '30 minutes');
            v_status := 'on_time';
          WHEN 6, 7 THEN
            v_clock_in_time := v_attendance_date + TIME '09:15:00' + (random() * interval '45 minutes');
            v_clock_out_time := v_attendance_date + TIME '17:30:00' + (random() * interval '30 minutes');
            v_status := 'late';
          WHEN 8 THEN
            v_clock_in_time := NULL;
            v_clock_out_time := NULL;
            v_status := 'absent';
          ELSE
            v_clock_in_time := v_attendance_date + TIME '12:30:00' + (random() * interval '30 minutes');
            v_clock_out_time := v_attendance_date + TIME '17:30:00';
            v_status := 'half_day';
        END CASE;
        
        INSERT INTO public.attendance_records (
          employee_id, attendance_date, site_id, shift_id,
          clock_in_time, clock_out_time, status,
          clock_in_latitude, clock_in_longitude,
          clock_out_latitude, clock_out_longitude,
          hours_worked, overtime_hours
        ) VALUES (
          v_employee_record.id, v_attendance_date, v_site_id, v_shift_id,
          v_clock_in_time, v_clock_out_time, v_status,
          3.1390, 101.6869,
          3.1390, 101.6869,
          CASE WHEN v_clock_out_time IS NOT NULL THEN 8.5 ELSE 0 END,
          0
        );
      END IF;
      
      v_attendance_date := v_attendance_date + 1;
    END LOOP;
  END LOOP;
END $$;

-- =============================================
-- EMPLOYEE LEAVES - October 2025
-- =============================================

DO $$
DECLARE
  v_employee_id UUID;
  v_company_id UUID;
  v_admin_employee_id UUID;
  v_admin_user_id UUID;
  v_leave_id UUID;
BEGIN
  SELECT id, company_id INTO v_employee_id, v_company_id 
  FROM public.employees WHERE status = 'active' LIMIT 1;
  
  -- Get both employee_id and user_id of admin
  SELECT e.id, e.user_id INTO v_admin_employee_id, v_admin_user_id
  FROM public.employees e
  INNER JOIN public.user_roles ur ON e.user_id = ur.user_id
  WHERE ur.role = 'company_admin' AND e.status = 'active'
  LIMIT 1;
  
  IF v_employee_id IS NOT NULL THEN
    INSERT INTO public.employee_leaves (
      employee_id, company_id, leave_type, start_date, end_date, 
      total_days, status, approved_by, approved_at, reason
    ) VALUES (
      v_employee_id, v_company_id, 'annual', '2025-10-10', '2025-10-12',
      3, 'approved', v_admin_employee_id, NOW(), 'Family vacation'
    ) RETURNING id INTO v_leave_id;
    
    UPDATE public.attendance_records 
    SET status = 'leave', leave_id = v_leave_id
    WHERE employee_id = v_employee_id 
    AND attendance_date BETWEEN '2025-10-10' AND '2025-10-12';
  END IF;
END $$;

-- =============================================
-- OVERTIME SESSIONS - October 2025
-- =============================================

DO $$
DECLARE
  v_employee_id UUID;
  v_site_id UUID;
  v_attendance_id UUID;
  v_admin_employee_id UUID;
  v_ot_date DATE;
BEGIN
  SELECT id INTO v_employee_id FROM public.employees WHERE status = 'active' LIMIT 1;
  SELECT id INTO v_site_id FROM public.work_sites WHERE is_active = true LIMIT 1;
  
  SELECT e.id INTO v_admin_employee_id 
  FROM public.employees e
  INNER JOIN public.user_roles ur ON e.user_id = ur.user_id
  WHERE ur.role = 'company_admin' AND e.status = 'active'
  LIMIT 1;
  
  IF v_employee_id IS NOT NULL AND v_site_id IS NOT NULL THEN
    FOREACH v_ot_date IN ARRAY ARRAY['2025-10-05'::date, '2025-10-12'::date, '2025-10-19'::date]
    LOOP
      SELECT id INTO v_attendance_id 
      FROM public.attendance_records 
      WHERE employee_id = v_employee_id AND attendance_date = v_ot_date 
      LIMIT 1;
      
      IF v_attendance_id IS NOT NULL THEN
        INSERT INTO public.overtime_sessions (
          employee_id, attendance_record_id, site_id,
          ot_in_time, ot_out_time, total_ot_hours, status, is_approved,
          approved_by, approved_at,
          ot_in_latitude, ot_in_longitude, ot_out_latitude, ot_out_longitude
        ) VALUES (
          v_employee_id, v_attendance_id, v_site_id,
          v_ot_date + TIME '18:00:00', v_ot_date + TIME '21:00:00',
          3.0, 'completed', true,
          v_admin_employee_id, NOW(),
          3.1390, 101.6869, 3.1390, 101.6869
        );
      END IF;
    END LOOP;
  END IF;
END $$;

-- =============================================
-- ATTENDANCE CORRECTIONS - October 2025
-- =============================================

DO $$
DECLARE
  v_employee_id UUID;
  v_attendance_id UUID;
  v_admin_user_id UUID;
BEGIN
  SELECT id INTO v_employee_id FROM public.employees WHERE status = 'active' LIMIT 1;
  
  -- Get user_id of admin (for reviewed_by which references auth.users)
  SELECT e.user_id INTO v_admin_user_id
  FROM public.employees e
  INNER JOIN public.user_roles ur ON e.user_id = ur.user_id
  WHERE ur.role = 'company_admin' AND e.status = 'active'
  LIMIT 1;
  
  IF v_employee_id IS NOT NULL THEN
    SELECT id INTO v_attendance_id 
    FROM public.attendance_records 
    WHERE employee_id = v_employee_id AND attendance_date = '2025-10-15' 
    LIMIT 1;
    
    IF v_attendance_id IS NOT NULL THEN
      INSERT INTO public.attendance_corrections (
        employee_id, attendance_record_id, correction_type,
        requested_clock_in, requested_clock_out, reason, status,
        submission_deadline
      ) VALUES (
        v_employee_id, v_attendance_id, 'clock_out',
        '2025-10-15 08:55:00+08', '2025-10-15 17:30:00+08',
        'Forgot to clock out, left office at usual time',
        'pending', '2025-10-16 23:59:59+08'
      );
    END IF;
    
    SELECT id INTO v_attendance_id 
    FROM public.attendance_records 
    WHERE employee_id = v_employee_id AND attendance_date = '2025-10-08' 
    LIMIT 1;
    
    IF v_attendance_id IS NOT NULL THEN
      INSERT INTO public.attendance_corrections (
        employee_id, attendance_record_id, correction_type,
        requested_clock_in, requested_clock_out, reason, status,
        reviewed_by, reviewed_at, submission_deadline
      ) VALUES (
        v_employee_id, v_attendance_id, 'clock_in',
        '2025-10-08 09:00:00+08', '2025-10-08 17:30:00+08',
        'System error - was present but attendance not recorded',
        'approved', v_admin_user_id, NOW(), '2025-10-09 23:59:59+08'
      );
    END IF;
    
    SELECT id INTO v_attendance_id 
    FROM public.attendance_records 
    WHERE employee_id = v_employee_id AND attendance_date = '2025-10-03' 
    LIMIT 1;
    
    IF v_attendance_id IS NOT NULL THEN
      INSERT INTO public.attendance_corrections (
        employee_id, attendance_record_id, correction_type,
        requested_clock_in, requested_clock_out, reason, status,
        reviewed_by, reviewed_at, reviewer_notes, submission_deadline
      ) VALUES (
        v_employee_id, v_attendance_id, 'both',
        '2025-10-03 08:00:00+08', '2025-10-03 17:00:00+08',
        'Clock in time recorded incorrectly',
        'rejected', v_admin_user_id, NOW(),
        'CCTV footage shows actual clock in at 09:15. Correction denied.',
        '2025-10-04 23:59:59+08'
      );
    END IF;
  END IF;
END $$;