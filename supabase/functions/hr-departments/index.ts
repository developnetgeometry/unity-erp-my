import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin role
    const { data: hasRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'company_admin'
    });

    const { data: hasSuperRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'super_admin'
    });

    const isAdmin = hasRole || hasSuperRole;

    // Get user's company_id
    const { data: companyId } = await supabase.rpc('get_user_company_id', {
      _user_id: user.id
    });

    if (!companyId) {
      return new Response(JSON.stringify({ error: 'Company not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const departmentId = pathParts[pathParts.length - 1];

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET': {
        // If ID is provided, get specific department
        if (departmentId && departmentId !== 'hr-departments') {
          const { data, error } = await supabase
            .from('departments')
            .select(`
              *,
              manager:manager_id(id, full_name, email)
            `)
            .eq('id', departmentId)
            .eq('company_id', companyId)
            .single();

          if (error) throw error;

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get all departments with optional filters
        const search = url.searchParams.get('search');
        
        let query = supabase
          .from('departments')
          .select(`
            *,
            manager:manager_id(id, full_name, email)
          `)
          .eq('company_id', companyId)
          .order('name', { ascending: true });

        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'POST': {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const body = await req.json();
        const { name, description, manager_id } = body;

        if (!name) {
          return new Response(JSON.stringify({ error: 'Name is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('departments')
          .insert([{
            company_id: companyId,
            name,
            description,
            manager_id
          }])
          .select(`
            *,
            manager:manager_id(id, full_name, email)
          `)
          .single();

        if (error) throw error;

        console.log('Department created:', data);
        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'PATCH': {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!departmentId || departmentId === 'hr-departments') {
          return new Response(JSON.stringify({ error: 'Department ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const body = await req.json();
        const { name, description, manager_id } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (manager_id !== undefined) updateData.manager_id = manager_id;

        const { data, error } = await supabase
          .from('departments')
          .update(updateData)
          .eq('id', departmentId)
          .eq('company_id', companyId)
          .select(`
            *,
            manager:manager_id(id, full_name, email)
          `)
          .single();

        if (error) throw error;

        console.log('Department updated:', data);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'DELETE': {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!departmentId || departmentId === 'hr-departments') {
          return new Response(JSON.stringify({ error: 'Department ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if department has employees
        const { count } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('department_id', departmentId);

        if (count && count > 0) {
          return new Response(
            JSON.stringify({ 
              error: 'Cannot delete department with employees',
              detail: `This department has ${count} employee(s). Please reassign or remove employees first.`
            }), 
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { error } = await supabase
          .from('departments')
          .delete()
          .eq('id', departmentId)
          .eq('company_id', companyId);

        if (error) throw error;

        console.log('Department deleted:', departmentId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('Error in hr-departments function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
