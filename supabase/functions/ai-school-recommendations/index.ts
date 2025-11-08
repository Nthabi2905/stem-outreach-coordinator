import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { province, district, schoolType } = await req.json();
    
    if (!province || !district || !schoolType) {
      return new Response(
        JSON.stringify({ error: "Province, district, and school type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
    
    const userPrompt = `Generate 10 realistic ${schoolTypeText} recommendations for STEM outreach in ${district} district, ${province} province. 
Use real South African township and suburb names from this region. Focus on underserved communities. 
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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway request failed");
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
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
