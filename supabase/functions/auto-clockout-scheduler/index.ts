import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Auto-clockout scheduler started');

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Find attendance records with missing clock-out where shift has ended
    const { data: records, error: fetchError } = await supabase
      .from('attendance_records')
      .select(`
        id,
        employee_id,
        clock_in_time,
        attendance_date,
        shift_id,
        shifts(shift_name, end_time),
        employees(company_id)
      `)
      .eq('attendance_date', today)
      .not('clock_in_time', 'is', null)
      .is('clock_out_time', null)
      .is('locked_for_payroll', false);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch attendance records' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${records?.length || 0} records with missing clock-out`);

    let autoClosedCount = 0;

    for (const record of records || []) {
      if (!record.shifts?.end_time) {
        console.log(`Skipping record ${record.id} - no shift end time`);
        continue;
      }

      // Calculate when shift ended (shift end time + 30 minutes grace)
      const shiftEndTime = new Date(`${today}T${record.shifts.end_time}`);
      const graceEndTime = new Date(shiftEndTime.getTime() + 30 * 60 * 1000); // +30 minutes

      if (now < graceEndTime) {
        console.log(`Skipping record ${record.id} - still within grace period`);
        continue;
      }

      // Get company config
      const { data: config } = await supabase.rpc('get_attendance_config', {
        p_company_id: record.employees.company_id
      });

      const correctionWindowHours = config?.[0]?.correction_window_hours || 24;

      // Calculate submission deadline
      const deadline = new Date(shiftEndTime);
      deadline.setHours(deadline.getHours() + correctionWindowHours);

      // Auto clock-out at shift end time
      const { error: updateError } = await supabase
        .from('attendance_records')
        .update({
          clock_out_time: shiftEndTime.toISOString(),
          is_provisional: true,
          notes: 'Auto-clocked out by system. Please submit correction if needed.'
        })
        .eq('id', record.id);

      if (updateError) {
        console.error(`Failed to auto-clockout record ${record.id}:`, updateError);
        continue;
      }

      // Log notification for employee
      await supabase
        .from('notification_log')
        .insert({
          employee_id: record.employee_id,
          notification_type: 'missed_clockout',
          title: 'Missed Clock-Out',
          message: `You were automatically clocked out at ${shiftEndTime.toLocaleTimeString()}. Submit a correction if this is incorrect. Deadline: ${deadline.toLocaleString()}`,
          data: { 
            attendance_id: record.id,
            auto_clockout_time: shiftEndTime.toISOString(),
            deadline: deadline.toISOString()
          }
        });

      autoClosedCount++;
      console.log(`Auto-clocked out record ${record.id} at ${shiftEndTime.toISOString()}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Auto-clockout completed`,
        records_processed: records?.length || 0,
        auto_closed_count: autoClosedCount
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
