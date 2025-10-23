-- Create October 2025 attendance data for company 8de9ad52-e82a-400e-801a-f54c274cc9c8
-- Fixed: Remove is_within_deadline (generated column)

DO $$
DECLARE
  v_company_id UUID := '8de9ad52-e82a-400e-801a-f54c274cc9c8';
  v_employee RECORD;
  v_date DATE;
  v_shift_id UUID;
  v_site_id UUID;
  v_admin_employee_id UUID;
  v_attendance_id UUID;
  v_random FLOAT;
  v_clock_in_time TIMESTAMPTZ;
  v_clock_out_time TIMESTAMPTZ;
  v_leave_id UUID;
BEGIN
  -- Get shift and site
  SELECT id INTO v_shift_id FROM shifts WHERE company_id = v_company_id LIMIT 1;
  SELECT id INTO v_site_id FROM work_sites WHERE company_id = v_company_id LIMIT 1;
  
  -- Get admin employee
  SELECT e.id INTO v_admin_employee_id 
  FROM employees e
  INNER JOIN user_roles ur ON e.user_id = ur.user_id
  WHERE e.company_id = v_company_id AND ur.role = 'company_admin'
  LIMIT 1;

  -- Delete existing October 2025 data
  DELETE FROM overtime_sessions 
  WHERE employee_id IN (SELECT id FROM employees WHERE company_id = v_company_id)
  AND ot_in_time >= '2025-10-01'::date AND ot_in_time < '2025-11-01'::date;

  DELETE FROM attendance_corrections 
  WHERE employee_id IN (SELECT id FROM employees WHERE company_id = v_company_id)
  AND created_at >= '2025-10-01'::date AND created_at < '2025-11-01'::date;

  DELETE FROM attendance_records 
  WHERE employee_id IN (SELECT id FROM employees WHERE company_id = v_company_id)
  AND attendance_date >= '2025-10-01'::date AND attendance_date < '2025-11-01'::date;

  DELETE FROM employee_leaves 
  WHERE company_id = v_company_id
  AND start_date >= '2025-10-01'::date AND start_date < '2025-11-01'::date;

  -- Loop through active employees
  FOR v_employee IN 
    SELECT id, full_name FROM employees 
    WHERE company_id = v_company_id AND status = 'active'
  LOOP
    -- Create attendance records for October 2025 weekdays
    FOR v_date IN 
      SELECT generate_series::date 
      FROM generate_series('2025-10-01'::date, '2025-10-31'::date, '1 day'::interval)
      WHERE EXTRACT(DOW FROM generate_series) BETWEEN 1 AND 5
    LOOP
      v_random := random();
      
      IF v_random < 0.70 THEN
        v_clock_in_time := v_date + TIME '08:00:00' + (random() * interval '5 minutes');
        v_clock_out_time := v_date + TIME '17:00:00' + (random() * interval '30 minutes');
        
        INSERT INTO attendance_records (
          employee_id, attendance_date, shift_id, site_id,
          clock_in_time, clock_out_time,
          clock_in_latitude, clock_in_longitude,
          clock_out_latitude, clock_out_longitude,
          status, hours_worked
        ) VALUES (
          v_employee.id, v_date, v_shift_id, v_site_id,
          v_clock_in_time, v_clock_out_time,
          3.1390, 101.6869, 3.1390, 101.6869,
          'on_time', 8.5
        );
        
      ELSIF v_random < 0.85 THEN
        v_clock_in_time := v_date + TIME '08:00:00' + (interval '15 minutes' + random() * interval '75 minutes');
        v_clock_out_time := v_date + TIME '17:00:00' + (random() * interval '30 minutes');
        
        INSERT INTO attendance_records (
          employee_id, attendance_date, shift_id, site_id,
          clock_in_time, clock_out_time,
          clock_in_latitude, clock_in_longitude,
          clock_out_latitude, clock_out_longitude,
          status, hours_worked
        ) VALUES (
          v_employee.id, v_date, v_shift_id, v_site_id,
          v_clock_in_time, v_clock_out_time,
          3.1390, 101.6869, 3.1390, 101.6869,
          'late', 7.5
        );
        
      ELSIF v_random < 0.95 THEN
        v_clock_in_time := v_date + TIME '12:00:00' + (random() * interval '2 hours');
        v_clock_out_time := v_date + TIME '17:00:00' + (random() * interval '30 minutes');
        
        INSERT INTO attendance_records (
          employee_id, attendance_date, shift_id, site_id,
          clock_in_time, clock_out_time,
          clock_in_latitude, clock_in_longitude,
          clock_out_latitude, clock_out_longitude,
          status, hours_worked
        ) VALUES (
          v_employee.id, v_date, v_shift_id, v_site_id,
          v_clock_in_time, v_clock_out_time,
          3.1390, 101.6869, 3.1390, 101.6869,
          'half_day', 4.0
        );
        
      ELSE
        INSERT INTO attendance_records (
          employee_id, attendance_date, shift_id, site_id,
          status, hours_worked
        ) VALUES (
          v_employee.id, v_date, v_shift_id, v_site_id,
          'absent', 0
        );
      END IF;
    END LOOP;

    -- Create approved leave (Oct 20-22)
    IF v_admin_employee_id IS NOT NULL THEN
      INSERT INTO employee_leaves (
        employee_id, company_id, leave_type,
        start_date, end_date, total_days,
        status, approved_by, approved_at, reason
      ) VALUES (
        v_employee.id, v_company_id, 'annual',
        '2025-10-20'::date, '2025-10-22'::date, 3,
        'approved', v_admin_employee_id, '2025-10-15 10:00:00+00',
        'Family vacation'
      ) RETURNING id INTO v_leave_id;

      UPDATE attendance_records
      SET status = 'leave', leave_id = v_leave_id
      WHERE employee_id = v_employee.id
      AND attendance_date BETWEEN '2025-10-20' AND '2025-10-22';
    END IF;

    -- Create overtime sessions
    SELECT id INTO v_attendance_id FROM attendance_records 
    WHERE employee_id = v_employee.id AND attendance_date = '2025-10-08' LIMIT 1;
    
    IF v_attendance_id IS NOT NULL AND v_admin_employee_id IS NOT NULL THEN
      INSERT INTO overtime_sessions (
        employee_id, attendance_record_id, site_id,
        ot_in_time, ot_out_time,
        ot_in_latitude, ot_in_longitude,
        ot_out_latitude, ot_out_longitude,
        total_ot_hours, status, is_approved, approved_by, approved_at
      ) VALUES (
        v_employee.id, v_attendance_id, v_site_id,
        '2025-10-08 18:00:00+00', '2025-10-08 21:30:00+00',
        3.1390, 101.6869, 3.1390, 101.6869,
        3.5, 'completed', true, v_admin_employee_id, '2025-10-09 09:00:00+00'
      );
    END IF;

    SELECT id INTO v_attendance_id FROM attendance_records 
    WHERE employee_id = v_employee.id AND attendance_date = '2025-10-15' LIMIT 1;
    
    IF v_attendance_id IS NOT NULL AND v_admin_employee_id IS NOT NULL THEN
      INSERT INTO overtime_sessions (
        employee_id, attendance_record_id, site_id,
        ot_in_time, ot_out_time,
        ot_in_latitude, ot_in_longitude,
        ot_out_latitude, ot_out_longitude,
        total_ot_hours, status, is_approved, approved_by, approved_at
      ) VALUES (
        v_employee.id, v_attendance_id, v_site_id,
        '2025-10-15 18:00:00+00', '2025-10-15 20:00:00+00',
        3.1390, 101.6869, 3.1390, 101.6869,
        2.0, 'completed', true, v_admin_employee_id, '2025-10-16 09:00:00+00'
      );
    END IF;

    -- Correction 1: Pending
    SELECT id INTO v_attendance_id FROM attendance_records 
    WHERE employee_id = v_employee.id AND attendance_date = '2025-10-03' LIMIT 1;
    
    IF v_attendance_id IS NOT NULL THEN
      INSERT INTO attendance_corrections (
        employee_id, attendance_record_id,
        correction_type, requested_clock_out,
        reason, status, submission_deadline, created_at
      ) VALUES (
        v_employee.id, v_attendance_id,
        'clock_out', '2025-10-03 17:30:00+00',
        'Forgot to clock out, left office at 5:30 PM',
        'pending', '2025-10-04 17:00:00+00', '2025-10-04 09:00:00+00'
      );
    END IF;

    -- Correction 2: Approved
    SELECT id INTO v_attendance_id FROM attendance_records 
    WHERE employee_id = v_employee.id AND attendance_date = '2025-10-10' LIMIT 1;
    
    IF v_attendance_id IS NOT NULL AND v_admin_employee_id IS NOT NULL THEN
      DECLARE
        v_admin_user_id UUID;
      BEGIN
        SELECT user_id INTO v_admin_user_id FROM employees WHERE id = v_admin_employee_id;
        
        INSERT INTO attendance_corrections (
          employee_id, attendance_record_id,
          correction_type, requested_clock_in,
          reason, status,
          reviewed_by, reviewed_at, reviewer_notes,
          submission_deadline, created_at
        ) VALUES (
          v_employee.id, v_attendance_id,
          'clock_in', '2025-10-10 08:05:00+00',
          'Traffic jam on highway, arrived at 8:05 AM',
          'approved',
          v_admin_user_id, '2025-10-11 10:00:00+00', 'Valid reason',
          '2025-10-11 17:00:00+00', '2025-10-10 09:30:00+00'
        );
      END;
    END IF;

    -- Correction 3: Rejected
    SELECT id INTO v_attendance_id FROM attendance_records 
    WHERE employee_id = v_employee.id AND attendance_date = '2025-10-17' LIMIT 1;
    
    IF v_attendance_id IS NOT NULL AND v_admin_employee_id IS NOT NULL THEN
      DECLARE
        v_admin_user_id UUID;
      BEGIN
        SELECT user_id INTO v_admin_user_id FROM employees WHERE id = v_admin_employee_id;
        
        INSERT INTO attendance_corrections (
          employee_id, attendance_record_id,
          correction_type, requested_clock_in, requested_clock_out,
          reason, status,
          reviewed_by, reviewed_at, reviewer_notes,
          submission_deadline, created_at
        ) VALUES (
          v_employee.id, v_attendance_id,
          'both', '2025-10-17 08:00:00+00', '2025-10-17 17:00:00+00',
          'System malfunction, both times not recorded',
          'rejected',
          v_admin_user_id, '2025-10-18 14:00:00+00', 'No evidence of system issues',
          '2025-10-18 17:00:00+00', '2025-10-17 16:00:00+00'
        );
      END;
    END IF;

  END LOOP;
END $$;