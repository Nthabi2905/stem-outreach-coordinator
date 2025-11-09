import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";
import { sanitizePromptInput, sanitizeAIOutput } from '../_shared/promptSecurity.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { campaignId, schoolData, visitDetails } = await req.json();
    
    if (!campaignId || !schoolData || !visitDetails) {
      return new Response(
        JSON.stringify({ error: "Campaign ID, school data, and visit details are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Lovable API key is not configured");
    }

    // Get organization details
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id, organizations!inner(name)")
      .eq("user_id", user.id)
      .single();

    if (!orgMember || !orgMember.organizations) {
      return new Response(
        JSON.stringify({ error: "User not associated with any organization" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orgName = (orgMember.organizations as any).name;

    const systemPrompt = `You are a professional letter writer for educational outreach programs in South Africa. 
Generate a formal, professional letter inviting a school to participate in a STEM and space education outreach visit.

The letter should:
- Be formal and professional
- Include all visit details
- Highlight the benefits for learners
- Request confirmation of participation
- Be culturally appropriate for South African schools
- Include contact information for questions`;

    // Sanitize user inputs to prevent prompt injection
    const cleanSchoolName = sanitizePromptInput(schoolData.name || "School");
    const cleanLocation = sanitizePromptInput(schoolData.location || "");
    const cleanProgramDesc = sanitizePromptInput(visitDetails.programDescription || "");
    const cleanTargetGrades = sanitizePromptInput(visitDetails.targetGrades || "");
    const cleanAdditionalInfo = sanitizePromptInput(visitDetails.additionalInfo || "");

    const userPrompt = `Generate a formal invitation letter for the following school outreach visit:

Organization: ${orgName}
School Name: ${cleanSchoolName}
School Location: ${cleanLocation}
Total Enrollment: ${schoolData.learners || 0} learners
Language of Instruction: ${schoolData.languageOfInstruction || "English"}

Visit Details:
Date: ${visitDetails.visitDate}
Time: ${visitDetails.visitTime}
Duration: ${visitDetails.duration}
Program Description: ${cleanProgramDesc}
Target Grades: ${cleanTargetGrades}
Expected Participants: ${visitDetails.expectedParticipants}

Additional Information: ${cleanAdditionalInfo || 'N/A'}

Format the letter professionally with proper salutations, body paragraphs, and closing.`;

    console.log("Calling Lovable AI for letter generation...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Lovable AI API error:", response.status, errorText);
      throw new Error("AI API request failed");
    }

    const data = await response.json();
    let letter = data.choices?.[0]?.message?.content;
    
    if (!letter) {
      throw new Error("No response from AI");
    }

    // Sanitize AI output to prevent malicious content
    letter = sanitizeAIOutput(letter);

    console.log("Letter generated successfully");

    return new Response(
      JSON.stringify({ letter }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[INTERNAL] Error in generate-outreach-letter:", error);
    
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: "Failed to generate letter. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
