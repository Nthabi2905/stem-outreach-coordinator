import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const inputSchema = z.object({
      schools: z.array(z.any()),
      languagePreference: z.enum(['any', 'english', 'afrikaans']).optional().default('any')
    });

    const body = await req.json();
    const validated = inputSchema.parse(body);
    const { schools, languagePreference } = validated;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Lovable AI API key is not configured");
    }

    // Note: Language filtering is disabled because the school data doesn't include language_of_instruction
    // In the future, if this field is added to the database, uncomment the filtering logic below
    const filteredSchools = schools;
    
    /* Language filtering (disabled - field not in database)
    if (languagePreference === 'english') {
      filteredSchools = schools.filter((s: any) => {
        const lang = (s.language_of_instruction || '').toLowerCase();
        return lang.includes('english') || lang.includes('eng');
      });
    } else if (languagePreference === 'afrikaans') {
      filteredSchools = schools.filter((s: any) => {
        const lang = (s.language_of_instruction || '').toLowerCase();
        return lang.includes('afrikaans') || lang.includes('afr');
      });
    }
    */

    if (filteredSchools.length === 0) {
      console.log("No schools after filtering");
      return new Response(
        JSON.stringify({ analyzedSchools: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare school data for AI analysis
    const schoolsForAnalysis = filteredSchools.slice(0, 10).map((school: any) => ({
      name: school.institution_name,
      location: `${school.suburb || school.township_village || school.town_city}, ${school.district}, ${school.province}`,
      quintile: school.quintile || 'Unknown',
      noFeeSchool: school.no_fee_school,
      urbanRural: school.urban_rural,
      learners: school.learners_2024 || 0,
      educators: school.educators_2024 || 0,
      sector: school.sector,
      phase: school.phase_ped
    }));

    const systemPrompt = `You are an expert educational outreach coordinator for South Africa specializing in STEM and space education programs.

Your task is to analyze schools and provide a brief needs analysis for each one based on their characteristics.

Consider these factors when writing the needs analysis:
- Quintile (1-5, where 1 = poorest, 5 = least poor)
- No-fee school status (indicates resource constraints)
- Urban vs Rural location (affects accessibility and infrastructure)
- Student-teacher ratio
- Geographic and community context

For each school, provide a 2-3 sentence needs analysis that explains:
1. Why this school would benefit from STEM outreach
2. What specific gaps or challenges it faces

Return a JSON object with this structure:
{
  "analyses": [
    {
      "schoolName": "Exact school name from input",
      "needsAnalysis": "2-3 sentence analysis here"
    }
  ]
}`;

    const userPrompt = `Analyze these ${schoolsForAnalysis.length} schools and provide a needs analysis for each:

${JSON.stringify(schoolsForAnalysis, null, 2)}

Return the needs analysis for each school in the specified JSON format.`;

    console.log("Calling Lovable AI for school needs analysis...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later or add credits to your workspace." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Lovable AI API error:", response.status, errorText);
      throw new Error("AI API request failed");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log("AI Response received");

    // Parse the JSON response
    let parsedResponse;
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      parsedResponse = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Invalid AI response format");
    }

    // Combine school data with AI analysis
    const analyzedSchools = filteredSchools.slice(0, 10).map((school: any, index: number) => {
      const analysis = parsedResponse.analyses?.find(
        (a: any) => a.schoolName === school.institution_name
      ) || parsedResponse.analyses?.[index];

      return {
        id: school.id,
        name: school.institution_name,
        location: `${school.suburb || school.township_village || school.town_city}, ${school.district}, ${school.province}`,
        learners: school.learners_2024 || 0,
        educators: school.educators_2024 || 0,
        languageOfInstruction: school.language_of_instruction || 'Not specified',
        quintile: school.quintile || 'Unknown',
        noFeeSchool: school.no_fee_school || 'Unknown',
        urbanRural: school.urban_rural || 'Unknown',
        needsAnalysis: analysis?.needsAnalysis || "This school would benefit from STEM outreach programs to enhance educational opportunities."
      };
    });

    return new Response(
      JSON.stringify({ analyzedSchools }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-school-needs:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "An error occurred while analyzing schools" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
