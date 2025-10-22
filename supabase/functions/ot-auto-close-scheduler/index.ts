import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('OT auto-close scheduler started');

    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    // Find active OT sessions older than 4 hours
    const { data: sessions, error: fetchError } = await supabase
      .from('overtime_sessions')
      .select(`
        id,
        employee_id,
        ot_in_time,
        site_id,
        work_sites(site_name)
      `)
      .eq('status', 'active')
      .lt('ot_in_time', fourHoursAgo.toISOString());

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch OT sessions' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${sessions?.length || 0} OT sessions to auto-close`);

    let autoClosedCount = 0;

    for (const session of sessions || []) {
      // Calculate auto-close time (OT-in + 4 hours)
      const otInTime = new Date(session.ot_in_time);
      const autoCloseTime = new Date(otInTime.getTime() + 4 * 60 * 60 * 1000);

      // Update OT session
      const { error: updateError } = await supabase
        .from('overtime_sessions')
        .update({
          ot_out_time: autoCloseTime.toISOString(),
          status: 'auto_closed',
          auto_closed_at: now.toISOString(),
          total_ot_hours: 4.0
        })
        .eq('id', session.id);

      if (updateError) {
        console.error(`Failed to auto-close OT session ${session.id}:`, updateError);
        continue;
      }

      // Log notification for HR review
      await supabase
        .from('notification_log')
        .insert({
          employee_id: session.employee_id,
          notification_type: 'ot_auto_closed',
          title: 'OT Session Auto-Closed',
          message: `Your OT session at ${session.work_sites?.site_name || 'work site'} was automatically closed after 4 hours. Total OT: 4.0 hours. Please verify with HR if this is incorrect.`,
          data: { 
            ot_session_id: session.id,
            auto_close_time: autoCloseTime.toISOString(),
            ot_in_time: session.ot_in_time
          }
        });

      autoClosedCount++;
      console.log(`Auto-closed OT session ${session.id} at ${autoCloseTime.toISOString()}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `OT auto-close completed`,
        sessions_processed: sessions?.length || 0,
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
