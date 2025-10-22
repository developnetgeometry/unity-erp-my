import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/cors.ts';

interface ClockInRequest {
  site_id: string;
  latitude: number;
  longitude: number;
}

interface ClockOutRequest {
  attendance_record_id: string;
  latitude: number;
  longitude: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Get employee ID for current user
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, company_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (empError) {
      console.error('Employee lookup error:', empError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch employee data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!employee) {
      return new Response(
        JSON.stringify({ error: 'Employee record not found. Please contact HR.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CLOCK IN
    if (path === 'clock-in' && req.method === 'POST') {
      const body: ClockInRequest = await req.json();
      console.log('Clock-in request:', { employee_id: employee.id, site_id: body.site_id });

      // Validate geofence
      const { data: isValid, error: geoError } = await supabase.rpc('validate_geofence', {
        p_latitude: body.latitude,
        p_longitude: body.longitude,
        p_site_id: body.site_id,
      });

      if (geoError) {
        console.error('Geofence validation error:', geoError);
        return new Response(
          JSON.stringify({ error: 'Geolocation validation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!isValid) {
        return new Response(
          JSON.stringify({
            error: 'You are outside the permitted location radius. Please ensure you are within the work site area.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get employee's active shift
      const today = new Date().toISOString().split('T')[0];
      const { data: employeeShift } = await supabase
        .from('employee_shifts')
        .select('shift_id, shifts(*)')
        .eq('employee_id', employee.id)
        .lte('effective_from', today)
        .or(`effective_until.is.null,effective_until.gte.${today}`)
        .maybeSingle();

      // Check if already clocked in today
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('id, clock_in_time')
        .eq('employee_id', employee.id)
        .eq('attendance_date', today)
        .maybeSingle();

      if (existingRecord?.clock_in_time) {
        return new Response(
          JSON.stringify({
            error: 'Already clocked in today',
            attendance_id: existingRecord.id,
            clock_in_time: existingRecord.clock_in_time,
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create attendance record
      const { data: attendance, error: insertError } = await supabase
        .from('attendance_records')
        .insert({
          employee_id: employee.id,
          site_id: body.site_id,
          shift_id: employeeShift?.shift_id || null,
          attendance_date: today,
          clock_in_time: new Date().toISOString(),
          clock_in_latitude: body.latitude,
          clock_in_longitude: body.longitude,
          status: 'on_time', // Will be auto-calculated by trigger
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Clock-in insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to record clock-in' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Clock-in successful:', attendance);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Clock-in recorded successfully',
          attendance,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CLOCK OUT
    if (path === 'clock-out' && req.method === 'POST') {
      const body: ClockOutRequest = await req.json();
      console.log('Clock-out request:', { attendance_id: body.attendance_record_id });

      // Validate geofence
      const { data: isValid, error: geoError } = await supabase.rpc('validate_geofence', {
        p_latitude: body.latitude,
        p_longitude: body.longitude,
        p_site_id: body.attendance_record_id, // Need to get site_id from attendance record
      });

      // Get attendance record
      const { data: record, error: fetchError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('id', body.attendance_record_id)
        .eq('employee_id', employee.id)
        .single();

      if (fetchError || !record) {
        return new Response(
          JSON.stringify({ error: 'Attendance record not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (record.clock_out_time) {
        return new Response(
          JSON.stringify({ error: 'Already clocked out', clock_out_time: record.clock_out_time }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update with clock out
      const { data: updated, error: updateError } = await supabase
        .from('attendance_records')
        .update({
          clock_out_time: new Date().toISOString(),
          clock_out_latitude: body.latitude,
          clock_out_longitude: body.longitude,
        })
        .eq('id', body.attendance_record_id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Clock-out update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to record clock-out' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Clock-out successful:', updated);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Clock-out recorded successfully',
          attendance: updated,
          hours_worked: updated.hours_worked,
          overtime_hours: updated.overtime_hours,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // MY STATUS (current attendance for today)
    if (path === 'my-status' && req.method === 'GET') {
      const today = new Date().toISOString().split('T')[0];

      const { data: attendance, error: fetchError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          work_sites(site_name, address),
          shifts(shift_name, start_time, end_time)
        `)
        .eq('employee_id', employee.id)
        .eq('attendance_date', today)
        .maybeSingle();

      if (fetchError) {
        console.error('Status fetch error:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch attendance status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          attendance: attendance || null,
          has_clocked_in: !!attendance?.clock_in_time,
          has_clocked_out: !!attendance?.clock_out_time,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODAY SUMMARY (admin only - company-wide stats)
    if (path === 'today-summary' && req.method === 'GET') {
      const today = new Date().toISOString().split('T')[0];

      // Get all attendance for company today
      const { data: records, error: fetchError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          employees!inner(company_id)
        `)
        .eq('employees.company_id', employee.company_id)
        .eq('attendance_date', today);

      if (fetchError) {
        console.error('Summary fetch error:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch summary' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const present = records?.filter(r => r.clock_in_time && r.status !== 'absent').length || 0;
      const late = records?.filter(r => r.status === 'late' || r.status === 'half_day').length || 0;
      const absent = records?.filter(r => r.status === 'absent').length || 0;
      const avgHours = records?.reduce((sum, r) => sum + (Number(r.hours_worked) || 0), 0) / (records?.length || 1);

      return new Response(
        JSON.stringify({
          present_count: present,
          late_count: late,
          absent_count: absent,
          average_hours: Math.round(avgHours * 100) / 100,
          total_employees: records?.length || 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});