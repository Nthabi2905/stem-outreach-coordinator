import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendLettersRequest {
  campaignId: string;
  fromEmail?: string;
  fromName?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request
    const { campaignId, fromEmail, fromName }: SendLettersRequest = await req.json();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("outreach_campaigns")
      .select("*, organizations(*)")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    // Get all recommendations with generated letters
    const { data: recommendations, error: recsError } = await supabase
      .from("school_recommendations")
      .select("*, schools(*)")
      .eq("campaign_id", campaignId)
      .eq("is_accepted", true)
      .not("generated_letter", "is", null);

    if (recsError) {
      throw new Error("Failed to fetch recommendations");
    }

    if (!recommendations || recommendations.length === 0) {
      throw new Error("No letters to send");
    }

    console.log(`Sending ${recommendations.length} letters for campaign ${campaignId}`);

    const results = [];
    const siteUrl = Deno.env.get("SUPABASE_URL")?.replace("https://", "https://");
    
    for (const rec of recommendations) {
      try {
        // Generate unique response token
        const responseToken = crypto.randomUUID();
        
        // Get school contact info from generated_data
        const schoolData = rec.generated_data as any;
        const schoolEmail = schoolData?.contact_email || "school@example.com";
        const schoolName = schoolData?.name || rec.schools?.institution_name || "School";

        // Create response URL
        const responseUrl = `${siteUrl?.replace(/supabase\.co$/, 'lovable.app')}/school-response/${responseToken}`;

        // Prepare email content
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">STEM Outreach Program Invitation</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${rec.generated_letter?.replace(/\n/g, '<br>')}
            </div>

            <div style="margin: 30px 0; padding: 20px; background: #e8f5e9; border-radius: 8px;">
              <h3 style="color: #2e7d32; margin-top: 0;">Please Confirm Your Attendance</h3>
              <p>Click the button below to confirm whether your school can attend this event:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${responseUrl}" 
                   style="background: #2e7d32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Respond to Invitation
                </a>
              </div>
              <p style="font-size: 12px; color: #666;">
                Or copy this link: ${responseUrl}
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
              <p>This invitation was sent by ${campaign.organizations?.name || 'STEM Outreach Organization'}</p>
              <p>If you have any questions, please reply to this email.</p>
            </div>
          </div>
        `;

        // Send email via Resend
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail || "STEM Outreach <onboarding@resend.dev>",
            to: [schoolEmail],
            subject: `STEM Outreach Invitation - ${campaign.visit_details?.programDescription || 'Special Program'}`,
            html: emailHtml,
          }),
        });

        if (!resendResponse.ok) {
          throw new Error(`Resend API error: ${await resendResponse.text()}`);
        }

        const emailResult = await resendResponse.json();
        console.log(`Email sent to ${schoolEmail}:`, emailResult);

        // Update recommendation with response token and sent status
        const { error: updateError } = await supabase
          .from("school_recommendations")
          .update({
            response_token: responseToken,
            letter_sent_at: new Date().toISOString(),
            response_status: 'pending',
          })
          .eq("id", rec.id);

        if (updateError) {
          console.error(`Failed to update recommendation ${rec.id}:`, updateError);
          results.push({ school: schoolName, success: false, error: updateError.message });
        } else {
          results.push({ school: schoolName, success: true, email: schoolEmail });
        }

      } catch (emailError: any) {
        console.error(`Failed to send email for ${rec.id}:`, emailError);
        results.push({ 
          school: rec.schools?.institution_name || "Unknown", 
          success: false, 
          error: emailError.message 
        });
      }
    }

    // Update campaign status
    await supabase
      .from("outreach_campaigns")
      .update({ status: "letters_sent" })
      .eq("id", campaignId);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Sent ${successCount} letters successfully, ${failCount} failed`,
        results,
        total: recommendations.length,
        success: successCount,
        failed: failCount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in send-campaign-letters:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
