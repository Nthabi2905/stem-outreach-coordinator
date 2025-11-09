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
      province: z.string()
        .trim()
        .min(2, "Province must be at least 2 characters")
        .max(100, "Province must be less than 100 characters")
        .regex(/^[a-zA-Z\s-]+$/, "Province can only contain letters, spaces, and hyphens"),
      district: z.string()
        .trim()
        .min(2, "District must be at least 2 characters")
        .max(100, "District must be less than 100 characters")
        .regex(/^[a-zA-Z\s-]+$/, "District can only contain letters, spaces, and hyphens"),
      schoolType: z.enum(['primary', 'high', 'combined'], {
        errorMap: () => ({ message: "School type must be 'primary', 'high', or 'combined'" })
      }),
      languagePreference: z.enum(['any', 'english', 'afrikaans']).optional().default('any')
    });

    const body = await req.json();
    const validated = inputSchema.parse(body);
    const { province, district, schoolType, languagePreference } = validated;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Lovable AI API key is not configured");
    }

    // System prompt for AI school recommendation
    const systemPrompt = `You are an expert educational outreach coordinator for South Africa. 
Your role is to recommend schools in underserved areas that would benefit most from STEM and space education programs.

Consider these factors when scoring schools (0-100):
- Infrastructure gaps (lack of science labs, libraries, computers)
- Geographic accessibility 
- Historical outreach activity (schools never visited score higher)
- Student population size
- Community need indicators

Return EXACTLY 10 school recommendations as a JSON array with this structure:
{
  "schools": [
    {
      "name": "School Name",
      "location": "Specific area/suburb, District, Province",
      "learners": number,
      "educators": number,
      "languageOfInstruction": "English" or "Afrikaans" or "English and Afrikaans" or other,
      "infrastructure": "brief description of gaps",
      "lastOutreach": "Never" or "2+ years ago" or "1 year ago",
      "score": number (85-99),
      "needsAnalysis": "1-2 sentence explanation of why this school needs STEM outreach"
    }
  ]
}`;

    const schoolTypeText = schoolType === 'primary' ? 'primary schools (grades R-7)' : 
                         schoolType === 'high' ? 'high schools (grades 8-12)' : 
                         'combined schools (grades R-12)';
    
    const languageFilter = languagePreference === 'english' 
      ? ' All schools MUST have English as their primary or sole language of instruction.' 
      : languagePreference === 'afrikaans' 
        ? ' All schools MUST have Afrikaans as their primary or sole language of instruction.' 
        : '';
    
    const userPrompt = `Generate 10 realistic ${schoolTypeText} recommendations for STEM outreach in ${district} district, ${province} province. 
Use real South African township and suburb names from this region. Focus on underserved communities.${languageFilter}
Include realistic enrollment numbers (learners), number of educators, and language of instruction for each school.`;

    console.log("Calling Lovable AI for school recommendations...");
    
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

    console.log("AI Response received:", aiResponse);

    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      parsedResponse = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Invalid AI response format");
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-school-recommendations:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "An error occurred while generating recommendations" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
