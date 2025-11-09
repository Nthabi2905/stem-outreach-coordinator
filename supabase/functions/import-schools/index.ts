import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      throw new Error('Insufficient permissions. Admin access required.')
    }

    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Invalid content type. Must be application/json');
    }

    // Get user's organizations
    const { data: orgData, error: orgError } = await supabaseClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (orgError || !orgData) {
      throw new Error('User must belong to an organization to import schools')
    }

    // Parse and validate body size
    const bodyText = await req.text();
    const bodySize = new TextEncoder().encode(bodyText).length;
    if (bodySize > 5_000_000) { // 5MB limit
      throw new Error('Request body too large. Maximum 5MB allowed.');
    }

    const { schools } = JSON.parse(bodyText);
    
    // Validate array size
    if (!Array.isArray(schools)) {
      throw new Error('Schools must be an array')
    }
    
    if (schools.length === 0) {
      throw new Error('No schools provided')
    }
    
    if (schools.length > 10000) {
      throw new Error('Cannot import more than 10,000 schools at once')
    }
    
    console.log(`Validating and importing ${schools.length} schools for organization ${orgData.organization_id}`)
    
    // Define validation schema
    const schoolSchema = z.object({
      nat_emis: z.string().min(1).max(50).trim(),
      institution_name: z.string().min(1).max(255).trim(),
      province: z.string().min(1).max(100).trim(),
      district: z.string().max(100).trim().optional().nullable().default(null),
      status: z.string().max(50).optional().nullable().default(null),
      sector: z.string().max(50).optional().nullable().default(null),
      type_doe: z.string().max(100).optional().nullable().default(null),
      phase_ped: z.string().max(100).optional().nullable().default(null),
      circuit: z.string().max(100).optional().nullable().default(null),
      quintile: z.string().max(10).optional().nullable().default(null),
      no_fee_school: z.string().max(50).optional().nullable().default(null),
      urban_rural: z.string().max(50).optional().nullable().default(null),
      town_city: z.string().max(100).optional().nullable().default(null),
      suburb: z.string().max(100).optional().nullable().default(null),
      township_village: z.string().max(100).optional().nullable().default(null),
      street_address: z.string().max(500).optional().nullable().default(null),
      postal_address: z.string().max(500).optional().nullable().default(null),
      telephone: z.string().max(50).optional().nullable().default(null),
      learners_2024: z.number().int().min(0).max(50000).optional().nullable().default(null),
      educators_2024: z.number().int().min(0).max(2000).optional().nullable().default(null),
      latitude: z.number().min(-90).max(90).optional().nullable().default(null),
      longitude: z.number().min(-180).max(180).optional().nullable().default(null),
    });
    
    const schoolsArraySchema = z.array(schoolSchema);
    
    // Validate all schools
    let validatedSchools;
    try {
      validatedSchools = schoolsArraySchema.parse(schools);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors.slice(0, 10));
        throw new Error(`Invalid school data: ${error.errors.slice(0, 3).map(e => `${e.path.join('.')}: ${e.message}`).join('; ')}`);
      }
      throw error;
    }

    // Add organization_id to all validated schools
    const schoolsWithOrg = validatedSchools.map((school) => ({
      ...school,
      organization_id: orgData.organization_id
    }))

    // Use service role for the actual insert to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert schools in batches of 100
    const batchSize = 100
    for (let i = 0; i < schoolsWithOrg.length; i += batchSize) {
      const batch = schoolsWithOrg.slice(i, i + batchSize)
      
      const { error } = await supabaseAdmin
        .from('schools')
        .upsert(batch, { onConflict: 'nat_emis' })
      
      if (error) {
        console.error(`Error importing batch ${i / batchSize}:`, error)
        throw error
      }
      
      console.log(`Imported batch ${i / batchSize + 1}`)
    }

    return new Response(
      JSON.stringify({ success: true, imported: schoolsWithOrg.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[INTERNAL] Import error:', error)
    
    // Return user-friendly error message
    let publicMessage = 'Failed to import schools. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid school data')) {
        publicMessage = 'The school data format is invalid. Please check your file.';
      } else if (error.message.includes('organization')) {
        publicMessage = 'Organization access required. Please contact your administrator.';
      } else if (error.message.includes('Unauthorized') || error.message.includes('permissions')) {
        publicMessage = 'You do not have permission to import schools.';
      } else if (error.message.includes('too large')) {
        publicMessage = error.message;
      } else if (error.message.includes('Invalid content type')) {
        publicMessage = 'Invalid request format.';
      }
    }
    
    return new Response(
      JSON.stringify({ error: publicMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})