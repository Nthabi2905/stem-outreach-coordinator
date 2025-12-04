import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationId, province, district, targetQuintiles, servicesOffered, maxSchools = 10 } = await req.json();
    
    console.log('AI Match Schools request:', { organizationId, province, district, targetQuintiles, servicesOffered, maxSchools });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch schools matching criteria
    let query = supabase
      .from('schools')
      .select('*')
      .eq('province', province);

    if (district) {
      query = query.eq('district', district);
    }

    if (targetQuintiles && targetQuintiles.length > 0) {
      query = query.in('quintile', targetQuintiles);
    }

    const { data: schools, error: schoolsError } = await query.limit(100);

    if (schoolsError) {
      console.error('Error fetching schools:', schoolsError);
      throw new Error('Failed to fetch schools');
    }

    console.log(`Found ${schools?.length || 0} schools matching criteria`);

    // Fetch school needs from questionnaire responses
    const { data: schoolNeeds, error: needsError } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('questionnaire_type', 'school_needs')
      .eq('school_province', province);

    if (needsError) {
      console.error('Error fetching school needs:', needsError);
    }

    // Fetch previous outreach to identify underserved schools
    const { data: previousOutreach, error: outreachError } = await supabase
      .from('school_recommendations')
      .select('school_id, letter_sent_at, school_response_at')
      .not('school_id', 'is', null);

    if (outreachError) {
      console.error('Error fetching outreach history:', outreachError);
    }

    // Create a set of schools that have received outreach
    const schoolsWithOutreach = new Set(
      (previousOutreach || []).map(o => o.school_id)
    );

    // Prepare school data for AI matching
    const schoolData = (schools || []).map(school => ({
      id: school.id,
      name: school.institution_name,
      province: school.province,
      district: school.district,
      quintile: school.quintile,
      phase: school.phase_ped,
      urbanRural: school.urban_rural,
      learners: school.learners_2024,
      educators: school.educators_2024,
      hasReceivedOutreach: schoolsWithOutreach.has(school.id),
      latitude: school.latitude,
      longitude: school.longitude,
      telephone: school.telephone,
      address: school.street_address || school.postal_address
    }));

    // Use Lovable AI to rank and match schools
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are an AI matching engine for STEM outreach in South Africa. 
    
Your task is to analyze and rank schools for STEM outreach based on these criteria:
1. **Underserved priority**: Schools that haven't received outreach should rank higher
2. **Quintile priority**: Lower quintile schools (Q1-Q3) should rank higher as they have fewer resources
3. **Size impact**: Schools with more learners = greater impact potential
4. **Geographic clustering**: Group nearby schools for efficient route planning

Organization offering these services: ${JSON.stringify(servicesOffered || ['STEM workshops', 'Science demonstrations'])}

Available schools data:
${JSON.stringify(schoolData.slice(0, 50), null, 2)}

Return a JSON object with this structure:
{
  "recommendations": [
    {
      "schoolId": "uuid",
      "schoolName": "name",
      "matchScore": 0-100,
      "priorityReason": "brief explanation",
      "suggestedActivities": ["activity1", "activity2"]
    }
  ],
  "summary": "brief summary of the matching strategy"
}

Select the top ${maxSchools} schools, prioritizing underserved schools in lower quintiles.`;

    console.log('Calling Lovable AI for matching...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert at matching STEM organizations with underserved schools. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI matching failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    console.log('AI response received:', aiContent?.substring(0, 200));

    // Parse AI response
    let matchResult;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiContent.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, aiContent];
      matchResult = JSON.parse(jsonMatch[1] || aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: return schools sorted by quintile and outreach status
      matchResult = {
        recommendations: schoolData
          .sort((a, b) => {
            // Prioritize schools without outreach
            if (a.hasReceivedOutreach !== b.hasReceivedOutreach) {
              return a.hasReceivedOutreach ? 1 : -1;
            }
            // Then by quintile (lower is higher priority)
            const qA = parseInt(a.quintile?.replace('Q', '') || '5');
            const qB = parseInt(b.quintile?.replace('Q', '') || '5');
            return qA - qB;
          })
          .slice(0, maxSchools)
          .map((s, i) => ({
            schoolId: s.id,
            schoolName: s.name,
            matchScore: 100 - (i * 5),
            priorityReason: s.hasReceivedOutreach ? 'Previously contacted' : `Underserved ${s.quintile} school`,
            suggestedActivities: ['STEM workshop', 'Science demonstration']
          })),
        summary: 'Fallback ranking based on quintile and outreach history'
      };
    }

    // Enrich recommendations with full school data
    const enrichedRecommendations = matchResult.recommendations.map((rec: any) => {
      const school = schoolData.find(s => s.id === rec.schoolId);
      return {
        ...rec,
        schoolDetails: school || null
      };
    });

    console.log(`Returning ${enrichedRecommendations.length} matched schools`);

    return new Response(JSON.stringify({
      success: true,
      recommendations: enrichedRecommendations,
      summary: matchResult.summary,
      totalSchoolsAnalyzed: schoolData.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-match-schools:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
