import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Late arrival notifier started');

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];
    const today = now.toISOString().split('T')[0];
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Get all active employee shifts for today
    const { data: employeeShifts, error: fetchError } = await supabase
      .from('employee_shifts')
      .select(`
        employee_id,
        shift_id,
        work_days,
        shifts(shift_name, start_time, grace_period_minutes),
        employees(id, full_name, company_id)
      `)
      .lte('effective_from', today)
      .or(`effective_until.is.null,effective_until.gte.${today}`);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch employee shifts' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${employeeShifts?.length || 0} employee shifts`);

    let notificationsSent = 0;

    for (const empShift of employeeShifts || []) {
      // Check if today is a work day for this employee
      const workDays = empShift.work_days as string[];
      if (!workDays.includes(dayOfWeek)) {
        continue;
      }

      const shift = Array.isArray(empShift.shifts) ? empShift.shifts[0] : empShift.shifts;
      const employee = Array.isArray(empShift.employees) ? empShift.employees[0] : empShift.employees;
      
      if (!shift?.start_time) {
        continue;
      }

      // Calculate when they should have clocked in (start_time + grace_period)
      const shiftStart = new Date(`${today}T${shift.start_time}`);
      const gracePeriodMinutes = shift.grace_period_minutes || 10;
      const lateThreshold = new Date(shiftStart.getTime() + gracePeriodMinutes * 60 * 1000);

      // Only notify if we're past the grace period
      if (now < lateThreshold) {
        continue;
      }

      // Check if employee has clocked in
      const { data: attendance } = await supabase
        .from('attendance_records')
        .select('id, clock_in_time')
        .eq('employee_id', empShift.employee_id)
        .eq('attendance_date', today)
        .maybeSingle();

      if (attendance?.clock_in_time) {
        // Already clocked in
        continue;
      }

      // Check if employee is on leave
      const { data: isOnLeave } = await supabase.rpc('is_employee_on_leave', {
        p_employee_id: empShift.employee_id,
        p_date: today
      });

      if (isOnLeave) {
        continue;
      }

      // Check if we've already sent a notification today
      const { data: existingNotification } = await supabase
        .from('notification_log')
        .select('id')
        .eq('employee_id', empShift.employee_id)
        .eq('notification_type', 'late_arrival')
        .gte('sent_at', `${today}T00:00:00`)
        .maybeSingle();

      if (existingNotification) {
        continue;
      }

      // Get company config to check if notifications are enabled
      const { data: config } = await supabase.rpc('get_attendance_config', {
        p_company_id: employee?.company_id
      });

      const notificationSettings = config?.[0]?.notification_settings || {};
      if (notificationSettings.late_arrival === false) {
        continue;
      }

      // Send late arrival notification
      await supabase
        .from('notification_log')
        .insert({
          employee_id: empShift.employee_id,
          notification_type: 'late_arrival',
          title: 'Late Arrival Alert',
          message: `You haven't clocked in yet. Your shift ${shift.shift_name} started at ${shift.start_time}. Please clock in as soon as possible.`,
          data: {
            shift_name: shift.shift_name,
            shift_start: shift.start_time,
            late_by_minutes: Math.floor((now.getTime() - lateThreshold.getTime()) / 60000)
          }
        });

      notificationsSent++;
      console.log(`Sent late arrival notification to employee ${empShift.employee_id}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Late arrival notifications completed`,
        shifts_checked: employeeShifts?.length || 0,
        notifications_sent: notificationsSent
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scheduler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
