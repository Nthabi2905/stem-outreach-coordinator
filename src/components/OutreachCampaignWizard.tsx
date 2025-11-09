import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, MapPin, School, FileText, CheckCircle, Clock } from "lucide-react";
import { getPublicErrorMessage } from "@/utils/errorMapping";

interface SchoolRecommendation {
  id: string;
  name: string;
  location: string;
  learners: number;
  educators: number;
  languageOfInstruction: string;
  quintile: string;
  noFeeSchool: string;
  urbanRural: string;
  needsAnalysis: string;
}

interface VisitDetails {
  visitDate: string;
  visitTime: string;
  duration: string;
  programDescription: string;
  targetGrades: string;
  expectedParticipants: string;
  additionalInfo: string;
}

export const OutreachCampaignWizard = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [schoolType, setSchoolType] = useState<"primary" | "high" | "combined">("primary");
  const [languagePreference, setLanguagePreference] = useState<"any" | "english" | "afrikaans">("any");
  const [recommendations, setRecommendations] = useState<SchoolRecommendation[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<number[]>([]);
  const [visitDetails, setVisitDetails] = useState<VisitDetails>({
    visitDate: "",
    visitTime: "",
    duration: "",
    programDescription: "",
    targetGrades: "",
    expectedParticipants: "",
    additionalInfo: "",
  });
  const [campaignId, setCampaignId] = useState<string>("");

  const handleGenerateRecommendations = async () => {
    if (!province || !district) {
      toast.error("Please enter province and district");
      return;
    }

    setLoading(true);
    try {
      // Build school type filter
      let phaseFilter = '';
      if (schoolType === 'primary') {
        phaseFilter = 'PRIMARY SCHOOL';
      } else if (schoolType === 'high') {
        phaseFilter = 'SECONDARY SCHOOL';
      } else {
        phaseFilter = 'COMBINED SCHOOL';
      }

      // Query schools from database
      let query = supabase
        .from('schools')
        .select('*')
        .eq('province', province)
        .ilike('district', `%${district}%`)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(20);

      if (schoolType !== 'combined') {
        query = query.eq('phase_ped', phaseFilter);
      }

      const { data: schools, error: schoolsError } = await query;

      if (schoolsError) throw schoolsError;

      if (!schools || schools.length === 0) {
        toast.error("No schools found matching your criteria");
        setLoading(false);
        return;
      }

      // Call AI to analyze schools and generate needs analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-school-needs",
        {
          body: { schools, languagePreference },
        }
      );

      if (analysisError) throw analysisError;

      setRecommendations(analysisData.analyzedSchools);
      setStep(2);
      toast.success(`Found ${analysisData.analyzedSchools.length} schools with needs analysis!`);
    } catch (error: any) {
      console.error("[DEBUG] Error generating recommendations:", error);
      toast.error(getPublicErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const toggleSchoolSelection = (index: number) => {
    setSelectedSchools((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleGenerateMoreSchools = async () => {
    setLoading(true);
    try {
      // Get IDs of already shown schools to exclude them
      const existingIds = recommendations.map(r => r.id);

      // Build school type filter
      let phaseFilter = '';
      if (schoolType === 'primary') {
        phaseFilter = 'Primary';
      } else if (schoolType === 'high') {
        phaseFilter = 'Secondary';
      } else {
        phaseFilter = 'Combined';
      }

      // Query more schools from database
      let query = supabase
        .from('schools')
        .select('*')
        .ilike('province', `%${province}%`)
        .ilike('district', `%${district}%`)
        .not('id', 'in', `(${existingIds.join(',')})`)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(10);

      if (schoolType !== 'combined') {
        query = query.ilike('phase_ped', `%${phaseFilter}%`);
      }

      const { data: schools, error: schoolsError } = await query;

      if (schoolsError) throw schoolsError;

      if (!schools || schools.length === 0) {
        toast.error("No more schools found");
        setLoading(false);
        return;
      }

      // Call AI to analyze schools
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-school-needs",
        {
          body: { schools, languagePreference },
        }
      );

      if (analysisError) throw analysisError;

      // Add new schools to existing recommendations
      setRecommendations((prev) => [...prev, ...analysisData.analyzedSchools]);
      toast.success(`${analysisData.analyzedSchools.length} more schools loaded!`);
    } catch (error: any) {
      console.error("[DEBUG] Error loading more schools:", error);
      toast.error(getPublicErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSchools = async () => {
    if (selectedSchools.length === 0) {
      toast.error("Please select at least one school");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: orgData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!orgData) throw new Error("No organization found");

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("outreach_campaigns")
        .insert({
          organization_id: orgData.organization_id,
          created_by: user.id,
          province,
          district,
          school_type: schoolType,
          status: "review",
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Insert selected recommendations
      const recommendationsToInsert = selectedSchools.map((index) => ({
        campaign_id: campaign.id,
        generated_data: recommendations[index] as any,
        enrollment_total: recommendations[index].learners,
        language_of_instruction: recommendations[index].languageOfInstruction,
        is_accepted: true,
        school_response: "pending" as const,
      }));

      const { error: recError } = await supabase
        .from("school_recommendations")
        .insert(recommendationsToInsert);

      if (recError) throw recError;

      setCampaignId(campaign.id);
      setStep(3);
      toast.success("Schools accepted! Now enter visit details.");
    } catch (error: any) {
      console.error("[DEBUG] Error accepting schools:", error);
      toast.error(getPublicErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLetters = async () => {
    setLoading(true);
    try {
      // Update campaign with visit details
      const { error: updateError } = await supabase
        .from("outreach_campaigns")
        .update({
          visit_details: visitDetails as any,
          visit_date: visitDetails.visitDate,
          status: "letters_sent" as const,
        })
        .eq("id", campaignId);

      if (updateError) throw updateError;

      // Get selected recommendations
      const { data: schoolRecs } = await supabase
        .from("school_recommendations")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("is_accepted", true);

      if (!schoolRecs || schoolRecs.length === 0) throw new Error("No schools found");

      // Generate letters for each school
      for (const rec of schoolRecs) {
        const { data: letterData, error: letterError } = await supabase.functions.invoke(
          "generate-outreach-letter",
          {
            body: {
              campaignId,
              schoolData: rec.generated_data,
              visitDetails,
            },
          }
        );

        if (letterError) {
          console.error("Letter generation error:", letterError);
          continue;
        }

        // Update recommendation with letter sent timestamp
        await supabase
          .from("school_recommendations")
          .update({ letter_sent_at: new Date().toISOString() })
          .eq("id", rec.id);
      }

      setStep(4);
      toast.success("Letters generated and sent!");
    } catch (error: any) {
      console.error("[DEBUG] Error generating letters:", error);
      toast.error(getPublicErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Campaign Setup */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Create Outreach Campaign
            </CardTitle>
            <CardDescription>
              Select province, district, and school type to generate AI recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EC">Eastern Cape</SelectItem>
                  <SelectItem value="FS">Free State</SelectItem>
                  <SelectItem value="GT">Gauteng</SelectItem>
                  <SelectItem value="KZN">KwaZulu-Natal</SelectItem>
                  <SelectItem value="LP">Limpopo</SelectItem>
                  <SelectItem value="MP">Mpumalanga</SelectItem>
                  <SelectItem value="NC">Northern Cape</SelectItem>
                  <SelectItem value="NW">North West</SelectItem>
                  <SelectItem value="WC">Western Cape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                placeholder="e.g., Cape Winelands"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolType">School Type</Label>
              <Select value={schoolType} onValueChange={(val: any) => setSchoolType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary School (Grades R-7)</SelectItem>
                  <SelectItem value="high">High School (Grades 8-12)</SelectItem>
                  <SelectItem value="combined">Combined School (Grades R-12)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language of Instruction</Label>
              <Select value={languagePreference} onValueChange={(val: any) => setLanguagePreference(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Language</SelectItem>
                  <SelectItem value="english">English Medium</SelectItem>
                  <SelectItem value="afrikaans">Afrikaans Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerateRecommendations} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate School Recommendations"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review and Select Schools */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Review Generated Schools ({recommendations.length})
              </CardTitle>
              <CardDescription>
                Select schools to include in your outreach campaign
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {recommendations.map((school, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedSchools.includes(index)
                    ? "ring-2 ring-primary"
                    : "hover:border-primary"
                }`}
                onClick={() => toggleSchoolSelection(index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{school.name}</h3>
                        {selectedSchools.includes(index) && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{school.location}</p>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-sm font-medium">Enrollment</p>
                          <p className="text-sm text-muted-foreground">{school.learners} learners</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Educators</p>
                          <p className="text-sm text-muted-foreground">{school.educators}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Quintile</p>
                          <p className="text-sm text-muted-foreground">Quintile {school.quintile}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Area Type</p>
                          <p className="text-sm text-muted-foreground">{school.urbanRural}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t mt-3">
                        <p className="text-sm font-medium mb-1">AI Needs Analysis</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{school.needsAnalysis}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="outline" onClick={handleGenerateMoreSchools} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate 10 More Schools"
              )}
            </Button>
            <Button onClick={handleAcceptSchools} disabled={loading || selectedSchools.length === 0} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Accept ${selectedSchools.length} Selected School${selectedSchools.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Visit Details */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Enter Visit Details
            </CardTitle>
            <CardDescription>
              Provide information about the planned outreach visit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitDate">Visit Date</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={visitDetails.visitDate}
                  onChange={(e) => setVisitDetails({ ...visitDetails, visitDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitTime">Visit Time</Label>
                <Input
                  id="visitTime"
                  type="time"
                  value={visitDetails.visitTime}
                  onChange={(e) => setVisitDetails({ ...visitDetails, visitTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 2 hours"
                value={visitDetails.duration}
                onChange={(e) => setVisitDetails({ ...visitDetails, duration: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="programDescription">Program Description</Label>
              <Textarea
                id="programDescription"
                placeholder="Describe the STEM program activities..."
                value={visitDetails.programDescription}
                onChange={(e) => setVisitDetails({ ...visitDetails, programDescription: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetGrades">Target Grades</Label>
                <Input
                  id="targetGrades"
                  placeholder="e.g., Grades 10-12"
                  value={visitDetails.targetGrades}
                  onChange={(e) => setVisitDetails({ ...visitDetails, targetGrades: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedParticipants">Expected Participants</Label>
                <Input
                  id="expectedParticipants"
                  placeholder="e.g., 50 learners"
                  value={visitDetails.expectedParticipants}
                  onChange={(e) => setVisitDetails({ ...visitDetails, expectedParticipants: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any other relevant details..."
                value={visitDetails.additionalInfo}
                onChange={(e) => setVisitDetails({ ...visitDetails, additionalInfo: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleGenerateLetters} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Letters...
                  </>
                ) : (
                  "Generate & Send Letters"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Campaign Active */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Campaign Active - Awaiting School Responses
            </CardTitle>
            <CardDescription>
              Letters have been sent to {selectedSchools.length} schools. You'll be notified when schools respond.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Campaign Successfully Created!</p>
              <p className="text-muted-foreground mb-4">
                Schools will receive invitation letters and can accept or decline participation.
              </p>
              <Button onClick={() => window.location.reload()}>Create New Campaign</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
