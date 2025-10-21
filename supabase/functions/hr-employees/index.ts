import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      return new Response(JSON.stringify({ error: 'User not associated with a company' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // GET /hr-employees
    if (method === 'GET' && path.endsWith('/hr-employees')) {
      const searchQuery = url.searchParams.get('search') || '';
      const department = url.searchParams.get('department') || '';
      const status = url.searchParams.get('status') || '';

      let query = supabase
        .from('employees')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }
      if (department) {
        query = query.eq('department', department);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ employees: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /hr-employees
    if (method === 'POST' && path.endsWith('/hr-employees')) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => ['company_admin', 'super_admin'].includes(r.role));
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const body = await req.json();

      if (!body.full_name || !body.position || !body.department || !body.join_date) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: full_name, position, department, join_date' 
        }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const { data: lastEmployee } = await supabase
        .from('employees')
        .select('employee_number')
        .eq('company_id', profile.company_id)
        .order('employee_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      let newEmployeeNumber = 'EMP0001';
      if (lastEmployee?.employee_number) {
        const lastNum = parseInt(lastEmployee.employee_number.replace('EMP', ''));
        newEmployeeNumber = 'EMP' + String(lastNum + 1).padStart(4, '0');
      }

      const { data, error } = await supabase
        .from('employees')
        .insert({
          company_id: profile.company_id,
          employee_number: newEmployeeNumber,
          full_name: body.full_name,
          ic_number: body.ic_number || null,
          email: body.email || null,
          phone: body.phone || null,
          position: body.position,
          department: body.department,
          branch_id: body.branch_id || null,
          join_date: body.join_date,
          status: body.status || 'Active',
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ employee: data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /hr-employees/:id
    const updateMatch = path.match(/\/hr-employees\/([a-f0-9-]+)$/);
    if (method === 'PATCH' && updateMatch) {
      const employeeId = updateMatch[1];

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => ['company_admin', 'super_admin'].includes(r.role));
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const body = await req.json();

      const { data, error } = await supabase
        .from('employees')
        .update({
          full_name: body.full_name,
          ic_number: body.ic_number,
          email: body.email,
          phone: body.phone,
          position: body.position,
          department: body.department,
          branch_id: body.branch_id,
          join_date: body.join_date,
          status: body.status,
        })
        .eq('id', employeeId)
        .eq('company_id', profile.company_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ employee: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /hr-employees/:id
    const deleteMatch = path.match(/\/hr-employees\/([a-f0-9-]+)$/);
    if (method === 'DELETE' && deleteMatch) {
      const employeeId = deleteMatch[1];

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => ['company_admin', 'super_admin'].includes(r.role));
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId)
        .eq('company_id', profile.company_id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
