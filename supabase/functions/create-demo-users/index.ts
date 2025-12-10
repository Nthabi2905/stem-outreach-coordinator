import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_USERS = [
  { email: "admin@stemreach.org", password: "demo123456", role: "admin", fullName: "Demo Admin" },
  { email: "admin@edureach.ai", password: "EduReach2024!", role: "admin", fullName: "EduReach AI Team" },
  { email: "org@stemreach.org", password: "demo123456", role: "organization", fullName: "Demo Organization" },
  { email: "school@stemreach.org", password: "demo123456", role: "school_official", fullName: "Demo School Official" },
  { email: "learner@stemreach.org", password: "demo123456", role: "learner", fullName: "Demo Learner" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];

    for (const user of DEMO_USERS) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === user.email);

      if (existingUser) {
        results.push({ email: user.email, status: "already_exists", id: existingUser.id });
        continue;
      }

      // Create the user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.fullName, role: user.role }
      });

      if (createError) {
        results.push({ email: user.email, status: "error", error: createError.message });
        continue;
      }

      results.push({ email: user.email, status: "created", id: newUser.user?.id });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
