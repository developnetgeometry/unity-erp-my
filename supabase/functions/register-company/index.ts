import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegisterCompanyRequest {
  companyName: string;
  registrationNo: string;
  companyEmail: string;
  phone: string;
  businessType: string;
  address: string;
  adminName: string;
  adminEmail: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      companyName,
      registrationNo,
      companyEmail,
      phone,
      businessType,
      address,
      adminName,
      adminEmail,
      password
    }: RegisterCompanyRequest = await req.json();

    console.log('Starting company registration for:', adminEmail);

    // Validate required fields
    if (!companyName || !registrationNo || !companyEmail || !phone || 
        !businessType || !address || !adminName || !adminEmail || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password must be at least 8 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Step 1: Check if user email already exists (most common case)
    console.log('Checking for existing user email...');
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = users?.find(u => u.email === adminEmail);

    if (userExists) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'An account with this email already exists',
          action: 'signin',
          message: 'Please sign in to your account or use a different email address.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Check if company with this registration number already exists
    console.log('Checking for existing company with registration number:', registrationNo);
    const { data: existingCompany, error: companyCheckError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('registration_no', registrationNo)
      .maybeSingle();

    if (companyCheckError) {
      console.error('Error checking for existing company:', companyCheckError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Database error while checking company',
          details: companyCheckError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingCompany) {
      console.log('Found existing company with ID:', existingCompany.id);
      
      // Check if company has any associated users
      const { data: companyProfiles, error: profileCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('company_id', existingCompany.id)
        .limit(1);

      if (profileCheckError) {
        console.error('Error checking company profiles:', profileCheckError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Database error while checking company users',
            details: profileCheckError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Found', companyProfiles?.length || 0, 'profiles for company');

      if (companyProfiles && companyProfiles.length > 0) {
        // Company has users - this is a genuine duplicate
        console.log('Company is active with users - returning duplicate error');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'This company registration number is already in use',
            message: 'This registration number is already registered. If you are an employee of this company, please contact your administrator for access.',
            action: 'contact_admin'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Orphaned company record - clean it up and continue
        console.log('Found orphaned company record (no users) - attempting cleanup');
        const { error: deleteError } = await supabaseAdmin
          .from('companies')
          .delete()
          .eq('id', existingCompany.id);
        
        if (deleteError) {
          console.error('Error deleting orphaned company:', deleteError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Unable to process registration',
              message: 'A registration issue was detected. Please contact support.',
              details: deleteError.message
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log('Orphaned company record removed successfully - proceeding with registration');
      }
    } else {
      console.log('No existing company found - proceeding with new registration');
    }

    // Step 3: Create company record
    console.log('Creating company record...');
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        company_name: companyName,
        registration_no: registrationNo,
        email: companyEmail,
        phone: phone,
        business_type: businessType,
        address: address,
        status: 'active'
      })
      .select()
      .single();

    if (companyError || !company) {
      console.error('Company creation error:', companyError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create company record', details: companyError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Company created:', company.id);

    // Step 4: Create auth user
    console.log('Creating auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
        company_id: company.id
      }
    });

    if (authError || !authData.user) {
      console.error('Auth user creation error:', authError);
      // Rollback: Delete company
      await supabaseAdmin.from('companies').delete().eq('id', company.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create user account', details: authError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created:', authData.user.id);

    // Step 5: Update profile with company_id (should be created by trigger)
    console.log('Updating profile...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ company_id: company.id })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Continue anyway as the trigger should have set this
    }

    // Step 5b: Explicitly activate the user profile
    console.log('Activating user profile...');
    const { error: activationError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        status: 'active',
        email_verified: true 
      })
      .eq('id', authData.user.id);

    if (activationError) {
      console.error('Profile activation error:', activationError);
      // Continue anyway as this is not critical
    } else {
      console.log('Profile activated for user:', authData.user.id);
    }

    // Step 6: Assign company_admin role
    console.log('Assigning company_admin role...');
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'company_admin'
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      // Log but don't fail the registration
    }

    console.log('Registration completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        userId: authData.user.id,
        companyId: company.id,
        message: 'Registration successful. You can now sign in to your account.'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Unexpected error in register-company function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected error occurred',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
