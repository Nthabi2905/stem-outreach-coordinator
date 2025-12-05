import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { province, district, schoolType, batchSize = 10 } = await req.json();
    
    console.log("Finding underserved schools with criteria:", { province, district, schoolType, batchSize });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get schools that have already been visited (in school_recommendations)
    const { data: visitedSchools, error: visitedError } = await supabase
      .from("school_recommendations")
      .select("school_id")
      .not("school_id", "is", null);

    if (visitedError) {
      console.error("Error fetching visited schools:", visitedError);
    }

    const visitedSchoolIds = visitedSchools?.map(v => v.school_id) || [];
    console.log(`Found ${visitedSchoolIds.length} previously visited schools`);

    // Build query for schools
    let query = supabase
      .from("schools")
      .select("*")
      .eq("status", "Open");

    // Apply filters
    if (province) {
      query = query.eq("province", province);
    }
    if (district) {
      query = query.eq("district", district);
    }
    if (schoolType) {
      query = query.eq("phase_ped", schoolType);
    }

    const { data: allSchools, error: schoolsError } = await query;

    if (schoolsError) {
      console.error("Error fetching schools:", schoolsError);
      throw new Error("Failed to fetch schools");
    }

    console.log(`Found ${allSchools?.length || 0} schools matching criteria`);

    if (!allSchools || allSchools.length === 0) {
      return new Response(
        JSON.stringify({ 
          schools: [], 
          message: "No schools found matching the criteria",
          totalUnderserved: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter out visited schools and calculate underserved score
    const underservedSchools = allSchools
      .filter(school => !visitedSchoolIds.includes(school.id))
      .map(school => {
        // Calculate priority score (higher = more underserved/priority)
        let priorityScore = 0;

        // Quintile scoring (Q1 = most underserved = highest score)
        const quintile = parseInt(school.quintile || "3");
        if (!isNaN(quintile)) {
          priorityScore += (6 - quintile) * 20; // Q1=100, Q2=80, Q3=60, Q4=40, Q5=20
        }

        // No-fee school bonus (indicates underserved community)
        if (school.no_fee_school === "Yes") {
          priorityScore += 30;
        }

        // Rural area bonus
        if (school.urban_rural === "Rural" || school.urban_rural === "Farm") {
          priorityScore += 25;
        }

        // Township bonus
        if (school.township_village && school.township_village.trim() !== "") {
          priorityScore += 15;
        }

        // Larger schools (more learners impacted)
        const learners = school.learners_2024 || 0;
        if (learners > 1000) priorityScore += 15;
        else if (learners > 500) priorityScore += 10;
        else if (learners > 200) priorityScore += 5;

        return {
          ...school,
          priorityScore,
          underservedReasons: getUnderservedReasons(school)
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);

    console.log(`Found ${underservedSchools.length} underserved schools`);

    // Get top batch
    const batch = underservedSchools.slice(0, Math.min(batchSize, underservedSchools.length));

    // Use AI to provide insights about the batch
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiInsights = null;

    if (LOVABLE_API_KEY && batch.length > 0) {
      try {
        const schoolSummary = batch.map(s => 
          `${s.institution_name} (${s.district}, Q${s.quintile}, ${s.urban_rural}, ${s.learners_2024 || 'unknown'} learners)`
        ).join("\n");

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: "You are a STEM outreach coordinator assistant. Provide brief, actionable insights about school batches for outreach planning. Be concise (2-3 sentences max)."
              },
              {
                role: "user",
                content: `Analyze this batch of ${batch.length} underserved schools for STEM outreach:\n\n${schoolSummary}\n\nProvide a brief insight about this batch's characteristics and any recommendations for the outreach team.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiInsights = aiData.choices?.[0]?.message?.content || null;
          console.log("AI insights generated successfully");
        }
      } catch (aiError) {
        console.error("AI insights error (non-critical):", aiError);
      }
    }

    return new Response(
      JSON.stringify({
        schools: batch,
        totalUnderserved: underservedSchools.length,
        totalVisited: visitedSchoolIds.length,
        aiInsights,
        message: `Found ${underservedSchools.length} underserved schools. Showing top ${batch.length} priority schools.`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in find-underserved-schools:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to find underserved schools";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getUnderservedReasons(school: any): string[] {
  const reasons: string[] = [];
  
  const quintile = parseInt(school.quintile || "3");
  if (!isNaN(quintile) && quintile <= 2) {
    reasons.push(`Quintile ${quintile} (low socioeconomic area)`);
  }
  
  if (school.no_fee_school === "Yes") {
    reasons.push("No-fee school");
  }
  
  if (school.urban_rural === "Rural") {
    reasons.push("Rural location");
  } else if (school.urban_rural === "Farm") {
    reasons.push("Farm school");
  }
  
  if (school.township_village && school.township_village.trim() !== "") {
    reasons.push("Township/village area");
  }
  
  if (reasons.length === 0) {
    reasons.push("No recent outreach recorded");
  }
  
  return reasons;
}
