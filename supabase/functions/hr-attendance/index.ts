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

interface OTInRequest {
  site_id: string;
  attendance_record_id: string;
  latitude: number;
  longitude: number;
}

interface OTOutRequest {
  ot_session_id: string;
  latitude: number;
  longitude: number;
}

interface CorrectionRequest {
  attendance_record_id: string;
  correction_type: 'clock_in' | 'clock_out' | 'both' | 'full_record';
  requested_clock_in?: string;
  requested_clock_out?: string;
  reason: string;
  attachment_url?: string;
}

interface CorrectionReviewRequest {
  correction_id: string;
  action: 'approve' | 'reject';
  reviewer_notes?: string;
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

      const today = new Date().toISOString().split('T')[0];

      // Check if employee is on leave or holiday
      const { data: isOnLeave } = await supabase.rpc('is_employee_on_leave', {
        p_employee_id: employee.id,
        p_date: today
      });

      if (isOnLeave) {
        return new Response(
          JSON.stringify({
            error: 'You are on approved leave or it is a public holiday today. No attendance required.',
            on_leave: true
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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
          status: 'on_time',
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

      // Check if locked for payroll
      if (record.locked_for_payroll) {
        return new Response(
          JSON.stringify({
            error: 'This attendance record has been locked for payroll processing and cannot be modified. Please contact HR if correction is needed.'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate geofence
      const { data: isValid } = await supabase.rpc('validate_geofence', {
        p_latitude: body.latitude,
        p_longitude: body.longitude,
        p_site_id: record.site_id,
      });

      if (!isValid) {
        return new Response(
          JSON.stringify({
            error: 'You are outside the permitted location radius for clock-out.',
          }),
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

    // OT CLOCK IN
    if (path === 'ot-in' && req.method === 'POST') {
      const body: OTInRequest = await req.json();
      console.log('OT clock-in request:', { employee_id: employee.id, attendance_id: body.attendance_record_id });

      const today = new Date().toISOString().split('T')[0];

      // Validate employee has attendance record and clocked out today
      const { data: attendance } = await supabase
        .from('attendance_records')
        .select('id, clock_out_time')
        .eq('id', body.attendance_record_id)
        .eq('employee_id', employee.id)
        .eq('attendance_date', today)
        .single();

      if (!attendance) {
        return new Response(
          JSON.stringify({ error: 'Attendance record not found for today' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!attendance.clock_out_time) {
        return new Response(
          JSON.stringify({ error: 'Please clock out first before starting overtime' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check for existing active OT session
      const { data: activeOT } = await supabase
        .from('overtime_sessions')
        .select('id')
        .eq('employee_id', employee.id)
        .eq('status', 'active')
        .maybeSingle();

      if (activeOT) {
        return new Response(
          JSON.stringify({ error: 'You already have an active OT session. Please complete it first.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate geofence
      const { data: isValid } = await supabase.rpc('validate_geofence', {
        p_latitude: body.latitude,
        p_longitude: body.longitude,
        p_site_id: body.site_id,
      });

      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'You are outside the permitted location radius for OT clock-in' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create OT session
      const { data: otSession, error: insertError } = await supabase
        .from('overtime_sessions')
        .insert({
          employee_id: employee.id,
          attendance_record_id: body.attendance_record_id,
          site_id: body.site_id,
          ot_in_time: new Date().toISOString(),
          ot_in_latitude: body.latitude,
          ot_in_longitude: body.longitude,
          status: 'active'
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('OT-in error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to start OT session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Overtime session started',
          ot_session: otSession
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // OT CLOCK OUT
    if (path === 'ot-out' && req.method === 'POST') {
      const body: OTOutRequest = await req.json();
      console.log('OT clock-out request:', { ot_session_id: body.ot_session_id });

      // Get OT session
      const { data: otSession, error: fetchError } = await supabase
        .from('overtime_sessions')
        .select('*, work_sites(site_name)')
        .eq('id', body.ot_session_id)
        .eq('employee_id', employee.id)
        .single();

      if (fetchError || !otSession) {
        return new Response(
          JSON.stringify({ error: 'OT session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (otSession.status !== 'active') {
        return new Response(
          JSON.stringify({
            error: 'OT session is not active',
            status: otSession.status,
            ot_out_time: otSession.ot_out_time
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate geofence (must be at same site as OT-in)
      const { data: isValid } = await supabase.rpc('validate_geofence', {
        p_latitude: body.latitude,
        p_longitude: body.longitude,
        p_site_id: otSession.site_id,
      });

      if (!isValid) {
        return new Response(
          JSON.stringify({
            error: `You must be at ${otSession.work_sites?.site_name || 'the same site'} to clock out from OT`
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update OT session (trigger will calculate hours)
      const { data: updated, error: updateError } = await supabase
        .from('overtime_sessions')
        .update({
          ot_out_time: new Date().toISOString(),
          ot_out_latitude: body.latitude,
          ot_out_longitude: body.longitude
        })
        .eq('id', body.ot_session_id)
        .select('*')
        .single();

      if (updateError) {
        console.error('OT-out error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to end OT session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Overtime session completed',
          ot_session: updated,
          total_hours: updated.total_ot_hours
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SUBMIT CORRECTION REQUEST
    if (path === 'corrections' && req.method === 'POST') {
      const body: CorrectionRequest = await req.json();
      console.log('Correction request:', { attendance_id: body.attendance_record_id, type: body.correction_type });

      // Get attendance record
      const { data: attendance, error: fetchError } = await supabase
        .from('attendance_records')
        .select('*, employees!inner(company_id)')
        .eq('id', body.attendance_record_id)
        .eq('employee_id', employee.id)
        .single();

      if (fetchError || !attendance) {
        return new Response(
          JSON.stringify({ error: 'Attendance record not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get company config for correction window
      const { data: config } = await supabase.rpc('get_attendance_config', {
        p_company_id: attendance.employees.company_id
      });

      const correctionWindowHours = config?.[0]?.correction_window_hours || 24;

      // Calculate deadline
      const attendanceDate = new Date(attendance.attendance_date);
      const deadline = new Date(attendanceDate);
      deadline.setHours(deadline.getHours() + correctionWindowHours);

      const now = new Date();
      const isWithinDeadline = now <= deadline;

      // Validate correction data
      if (body.reason.length < 20) {
        return new Response(
          JSON.stringify({ error: 'Reason must be at least 20 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create correction request
      const { data: correction, error: insertError } = await supabase
        .from('attendance_corrections')
        .insert({
          attendance_record_id: body.attendance_record_id,
          employee_id: employee.id,
          correction_type: body.correction_type,
          requested_clock_in: body.requested_clock_in || null,
          requested_clock_out: body.requested_clock_out || null,
          reason: body.reason,
          attachment_url: body.attachment_url || null,
          submission_deadline: deadline.toISOString(),
          is_within_deadline: isWithinDeadline,
          status: 'pending'
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Correction insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to submit correction request' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log notification for HR
      await supabase
        .from('notification_log')
        .insert({
          employee_id: employee.id,
          notification_type: 'correction_submitted',
          title: 'New Correction Request',
          message: `Correction request submitted for ${attendance.attendance_date}`,
          data: { correction_id: correction.id, attendance_date: attendance.attendance_date }
        });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Correction request submitted successfully',
          correction,
          deadline: deadline.toISOString(),
          within_deadline: isWithinDeadline
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // REVIEW CORRECTION REQUEST (HR only)
    if (path === 'corrections' && url.searchParams.get('action') === 'review' && req.method === 'POST') {
      const body: CorrectionReviewRequest = await req.json();
      console.log('Correction review:', { correction_id: body.correction_id, action: body.action });

      // Check HR role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => r.role === 'company_admin' || r.role === 'super_admin');

      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized. Only HR Managers can review corrections.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get correction
      const { data: correction, error: fetchError } = await supabase
        .from('attendance_corrections')
        .select('*, attendance_records(*)')
        .eq('id', body.correction_id)
        .single();

      if (fetchError || !correction) {
        return new Response(
          JSON.stringify({ error: 'Correction request not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (correction.status !== 'pending') {
        return new Response(
          JSON.stringify({ error: 'Correction has already been reviewed', status: correction.status }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update correction status
      const { error: updateCorrectionError } = await supabase
        .from('attendance_corrections')
        .update({
          status: body.action === 'approve' ? 'approved' : 'rejected',
          reviewed_by: employee.id,
          reviewed_at: new Date().toISOString(),
          reviewer_notes: body.reviewer_notes || null
        })
        .eq('id', body.correction_id);

      if (updateCorrectionError) {
        console.error('Correction update error:', updateCorrectionError);
        return new Response(
          JSON.stringify({ error: 'Failed to update correction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If approved, update attendance record
      if (body.action === 'approve') {
        const updateData: any = {
          correction_id: body.correction_id,
          locked_for_payroll: true,
          is_provisional: false
        };

        if (correction.requested_clock_in) {
          updateData.clock_in_time = correction.requested_clock_in;
        }
        if (correction.requested_clock_out) {
          updateData.clock_out_time = correction.requested_clock_out;
        }

        const { error: updateAttendanceError } = await supabase
          .from('attendance_records')
          .update(updateData)
          .eq('id', correction.attendance_record_id);

        if (updateAttendanceError) {
          console.error('Attendance update error:', updateAttendanceError);
          return new Response(
            JSON.stringify({ error: 'Failed to update attendance record' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Log notification for employee
      await supabase
        .from('notification_log')
        .insert({
          employee_id: correction.employee_id,
          notification_type: body.action === 'approve' ? 'correction_approved' : 'correction_rejected',
          title: `Correction ${body.action === 'approve' ? 'Approved' : 'Rejected'}`,
          message: body.action === 'approve'
            ? 'Your correction request has been approved'
            : `Your correction request has been rejected: ${body.reviewer_notes || 'No reason provided'}`,
          data: { correction_id: body.correction_id }
        });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Correction ${body.action}d successfully`,
          action: body.action
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

      // Get active OT session
      const { data: activeOT } = await supabase
        .from('overtime_sessions')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('status', 'active')
        .maybeSingle();

      return new Response(
        JSON.stringify({
          attendance: attendance || null,
          has_clocked_in: !!attendance?.clock_in_time,
          has_clocked_out: !!attendance?.clock_out_time,
          active_ot_session: activeOT || null
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
