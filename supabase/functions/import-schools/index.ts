import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { schools } = await req.json()
    
    console.log(`Importing ${schools.length} schools for organization ${orgData.organization_id}`)

    // Add organization_id to all schools
    const schoolsWithOrg = schools.map((school: any) => ({
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
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})