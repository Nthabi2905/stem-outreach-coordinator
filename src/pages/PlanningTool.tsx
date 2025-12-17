import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboards/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LetterPreviewDialog } from "@/components/LetterPreviewDialog";
import { toast } from "sonner";
import { 
  Sparkles, 
  MapPin, 
  Users, 
  School, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  ChevronLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  Calendar,
  Clock,
  FileText,
  Send,
  Mail,
  Loader2
} from "lucide-react";

interface SchoolRecommendation {
  schoolId: string;
  schoolName: string;
  matchScore: number;
  priorityReason: string;
  suggestedActivities: string[];
  schoolDetails: {
    id: string;
    name: string;
    province: string;
    district: string;
    quintile: string;
    phase: string;
    urbanRural: string;
    learners: number;
    educators: number;
    hasReceivedOutreach: boolean;
    telephone: string;
    address: string;
  } | null;
}

interface MatchResult {
  success: boolean;
  recommendations: SchoolRecommendation[];
  summary: string;
  totalSchoolsAnalyzed: number;
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

interface GeneratedSchool {
  id: string;
  schoolId: string;
  schoolName: string;
  generated_letter: string | null;
  generated_data: {
    name: string;
    schoolId: string;
    schoolName: string;
  };
}

const provinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"
];

const quintiles = ["Q1", "Q2", "Q3", "Q4", "Q5"];

const services = [
  "STEM Workshops",
  "Science Demonstrations",
  "Robotics Training",
  "Coding Classes",
  "Space Science Education",
  "Mathematics Support",
  "Career Guidance",
  "Teacher Development"
];

const PlanningTool = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [targetQuintiles, setTargetQuintiles] = useState<string[]>(["Q1", "Q2", "Q3"]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [maxSchools, setMaxSchools] = useState(10);
  const [isMatching, setIsMatching] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(1);
  
  // Campaign creation state
  const [campaignId, setCampaignId] = useState<string>("");
  const [visitDetails, setVisitDetails] = useState<VisitDetails>({
    visitDate: "",
    visitTime: "",
    duration: "",
    programDescription: "",
    targetGrades: "",
    expectedParticipants: "",
    additionalInfo: "",
  });
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isGeneratingLetters, setIsGeneratingLetters] = useState(false);
  const [letterProgress, setLetterProgress] = useState({ current: 0, total: 0 });
  const [generatedSchools, setGeneratedSchools] = useState<GeneratedSchool[]>([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleQuintileToggle = (q: string) => {
    setTargetQuintiles(prev => 
      prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q]
    );
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(x => x !== service) : [...prev, service]
    );
  };

  const handleMatch = async () => {
    if (!province) {
      toast.error("Please select a province");
      return;
    }

    setIsMatching(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-match-schools', {
        body: {
          province,
          district: district || undefined,
          targetQuintiles,
          servicesOffered: selectedServices.length > 0 ? selectedServices : undefined,
          maxSchools
        }
      });

      if (error) throw error;

      setResult(data);
      setStep(2);
      toast.success(`Found ${data.recommendations.length} matching schools`);
    } catch (error) {
      console.error('Matching error:', error);
      toast.error(error instanceof Error ? error.message : "Matching failed. Please try again.");
    } finally {
      setIsMatching(false);
    }
  };

  const toggleSchoolSelection = (schoolId: string) => {
    setSelectedSchools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schoolId)) {
        newSet.delete(schoolId);
      } else {
        newSet.add(schoolId);
      }
      return newSet;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-primary/20 text-primary";
    if (score >= 60) return "bg-amber-100 text-amber-700";
    return "bg-orange-100 text-orange-700";
  };

  const handleCreateCampaign = async () => {
    if (!visitDetails.visitDate || !visitDetails.programDescription) {
      toast.error("Please fill in required visit details");
      return;
    }

    setIsCreatingCampaign(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get organization for user
      const { data: orgMember, error: orgError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (orgError || !orgMember) {
        throw new Error("User is not associated with an organization");
      }

      // Create campaign
      const campaignData = {
        organization_id: orgMember.organization_id,
        created_by: user.id,
        province,
        district: district || "All Districts",
        school_type: targetQuintiles.join(","),
        visit_details: JSON.parse(JSON.stringify(visitDetails)),
        visit_date: visitDetails.visitDate,
        status: "draft"
      };
      
      const { data: campaign, error: campaignError } = await supabase
        .from("outreach_campaigns")
        .insert([campaignData])
        .select()
        .single();

      if (campaignError) throw campaignError;

      setCampaignId(campaign.id);

      // Add selected schools to campaign
      const selectedRecs = result?.recommendations.filter(r => selectedSchools.has(r.schoolId)) || [];
      
      const recommendationsToInsert = selectedRecs.map(rec => ({
        campaign_id: campaign.id,
        school_id: rec.schoolDetails?.id || null,
        generated_data: {
          schoolId: rec.schoolId,
          schoolName: rec.schoolName,
          matchScore: rec.matchScore,
          priorityReason: rec.priorityReason,
          suggestedActivities: rec.suggestedActivities,
          schoolDetails: rec.schoolDetails
        },
        enrollment_total: rec.schoolDetails?.learners || null,
        language_of_instruction: "English",
        is_accepted: true
      }));

      const { data: insertedRecs, error: recsError } = await supabase
        .from("school_recommendations")
        .insert(recommendationsToInsert)
        .select();

      if (recsError) throw recsError;

      toast.success("Campaign created successfully!");
      setStep(4);
      
      // Start generating letters
      await generateLettersForSchools(campaign.id, insertedRecs || []);

    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create campaign");
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const generateLettersForSchools = async (campaignId: string, schools: any[]) => {
    setIsGeneratingLetters(true);
    setLetterProgress({ current: 0, total: schools.length });

    const updatedSchools: GeneratedSchool[] = [];

    for (let i = 0; i < schools.length; i++) {
      const school = schools[i];
      const schoolData = school.generated_data;

      try {
        const { data, error } = await supabase.functions.invoke("generate-outreach-letter", {
          body: {
            campaignId,
            schoolData: {
              name: schoolData.schoolName,
              location: schoolData.schoolDetails?.district 
                ? `${schoolData.schoolDetails.district}, ${schoolData.schoolDetails.province}` 
                : province,
              learners: schoolData.schoolDetails?.learners || 0,
              languageOfInstruction: school.language_of_instruction || "English"
            },
            visitDetails
          }
        });

        if (error) throw error;

        // Update the recommendation with the generated letter
        await supabase
          .from("school_recommendations")
          .update({ generated_letter: data.letter })
          .eq("id", school.id);

        updatedSchools.push({
          id: school.id,
          schoolId: schoolData.schoolId,
          schoolName: schoolData.schoolName,
          generated_letter: data.letter,
          generated_data: {
            name: schoolData.schoolName,
            schoolId: schoolData.schoolId,
            schoolName: schoolData.schoolName
          }
        });

      } catch (error) {
        console.error(`Error generating letter for ${schoolData.schoolName}:`, error);
        updatedSchools.push({
          id: school.id,
          schoolId: schoolData.schoolId,
          schoolName: schoolData.schoolName,
          generated_letter: null,
          generated_data: {
            name: schoolData.schoolName,
            schoolId: schoolData.schoolId,
            schoolName: schoolData.schoolName
          }
        });
      }

      setLetterProgress({ current: i + 1, total: schools.length });
      
      // Small delay to avoid rate limits
      if (i < schools.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setGeneratedSchools(updatedSchools);
    setIsGeneratingLetters(false);
    toast.success(`Generated ${updatedSchools.filter(s => s.generated_letter).length} letters!`);
  };

  const handleSaveEditedLetter = async (schoolId: string, editedLetter: string) => {
    try {
      const { error } = await supabase
        .from("school_recommendations")
        .update({ generated_letter: editedLetter })
        .eq("id", schoolId);

      if (error) throw error;

      setGeneratedSchools(prev =>
        prev.map(school =>
          school.id === schoolId
            ? { ...school, generated_letter: editedLetter }
            : school
        )
      );

      toast.success("Letter updated!");
    } catch (error) {
      console.error("Error saving letter:", error);
      toast.error("Failed to save letter");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader title="Planning Tool" onSignOut={handleSignOut} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background px-4 py-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/")}
          className="mb-4 -ml-2 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI School Matcher</h1>
            <p className="text-muted-foreground">Generate batches of underserved schools</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            step === 1 ? "bg-primary text-primary-foreground" : step > 1 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">1</span>
            Configure
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            step === 2 ? "bg-primary text-primary-foreground" : step > 2 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">2</span>
            Select Schools
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            step === 3 ? "bg-primary text-primary-foreground" : step > 3 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">3</span>
            Visit Details
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            step === 4 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">4</span>
            Letters
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {step === 1 && (
          <>
            {/* Location Selection */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Location</CardTitle>
                    <CardDescription>Select province and district</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Province *</label>
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">District (Optional)</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="e.g., City of Cape Town"
                    className="flex h-10 w-full rounded-md border border-border/50 bg-muted/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quintile Selection */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Target Schools</CardTitle>
                    <CardDescription>Lower quintiles (Q1-Q3) are typically more underserved</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quintiles.map(q => (
                    <Badge
                      key={q}
                      variant={targetQuintiles.includes(q) ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                        targetQuintiles.includes(q) 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                      onClick={() => handleQuintileToggle(q)}
                    >
                      {q}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Services Offered</CardTitle>
                    <CardDescription>Select the STEM services you provide</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {services.map(service => (
                    <div 
                      key={service} 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedServices.includes(service)
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:bg-muted/50"
                      }`}
                      onClick={() => handleServiceToggle(service)}
                    >
                      <Checkbox
                        checked={selectedServices.includes(service)}
                        className="pointer-events-none"
                      />
                      <label className="text-sm cursor-pointer">
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Max Schools Slider */}
            <Card className="border-border/50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Maximum Schools</label>
                  <span className="text-lg font-bold text-primary">{maxSchools}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={20}
                  value={maxSchools}
                  onChange={e => setMaxSchools(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5</span>
                  <span>20</span>
                </div>
              </CardContent>
            </Card>

            {/* Match Button */}
            <Button 
              onClick={handleMatch} 
              disabled={isMatching || !province}
              className="w-full h-14 text-base font-semibold"
              size="lg"
            >
              {isMatching ? (
                <>
                  <Zap className="mr-2 h-5 w-5 animate-pulse" />
                  AI is analyzing schools...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate School Batch
                </>
              )}
            </Button>
          </>
        )}

        {/* Loading State */}
        {isMatching && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-8">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="h-6 w-6 animate-pulse text-primary" />
                  <span className="text-lg font-medium">AI Matching in Progress...</span>
                </div>
                <Progress value={66} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  Analyzing school data, outreach history, and matching criteria
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {step === 2 && result && (
          <div className="space-y-4">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep(1)}
              className="-ml-2 text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Modify Search
            </Button>

            {/* Summary */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Match Complete</p>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Analyzed {result.totalSchoolsAnalyzed} schools • Found {result.recommendations.length} matches
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Actions */}
            {selectedSchools.size > 0 && (
              <Card className="border-primary/30 bg-primary/10 sticky top-0 z-10">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {selectedSchools.size} schools selected
                    </span>
                    <Button size="sm" onClick={() => setStep(3)}>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* School Cards */}
            <div className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <Card 
                  key={rec.schoolId} 
                  className={`cursor-pointer transition-all border-border/50 ${
                    selectedSchools.has(rec.schoolId) ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
                  }`}
                  onClick={() => toggleSchoolSelection(rec.schoolId)}
                >
                  <CardContent className="py-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <Badge className={`${getScoreColor(rec.matchScore)} border-0`}>
                          {rec.matchScore}% match
                        </Badge>
                      </div>
                      <Checkbox
                        checked={selectedSchools.has(rec.schoolId)}
                        onClick={e => e.stopPropagation()}
                        onCheckedChange={() => toggleSchoolSelection(rec.schoolId)}
                      />
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{rec.schoolName}</h3>
                    
                    {rec.schoolDetails && (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{rec.schoolDetails.district}, {rec.schoolDetails.province}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4" />
                          <span>
                            {rec.schoolDetails.quintile} • {rec.schoolDetails.phase} • {rec.schoolDetails.urbanRural}
                          </span>
                        </div>
                        {rec.schoolDetails.learners && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{rec.schoolDetails.learners.toLocaleString()} learners</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 p-3 rounded-lg bg-muted/50">
                      <p className="text-xs font-medium mb-1">Priority Reason:</p>
                      <p className="text-xs text-muted-foreground">{rec.priorityReason}</p>
                    </div>

                    {rec.suggestedActivities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {rec.suggestedActivities.map((activity, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-muted">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {rec.schoolDetails?.hasReceivedOutreach && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        Previously contacted
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Visit Details */}
        {step === 3 && (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep(2)}
              className="-ml-2 text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to School Selection
            </Button>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Planning visit for {selectedSchools.size} schools</p>
                    <p className="text-sm text-muted-foreground">
                      Enter the details for your outreach visit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visit Date & Time */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Date & Time</CardTitle>
                    <CardDescription>When will the visit take place?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Visit Date *</label>
                    <Input
                      type="date"
                      value={visitDetails.visitDate}
                      onChange={e => setVisitDetails(prev => ({ ...prev, visitDate: e.target.value }))}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Visit Time</label>
                    <Input
                      type="time"
                      value={visitDetails.visitTime}
                      onChange={e => setVisitDetails(prev => ({ ...prev, visitTime: e.target.value }))}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Select 
                    value={visitDetails.duration} 
                    onValueChange={v => setVisitDetails(prev => ({ ...prev, duration: v }))}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                      <SelectItem value="Half day (3-4 hours)">Half day (3-4 hours)</SelectItem>
                      <SelectItem value="Full day">Full day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Program Details */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Program Details</CardTitle>
                    <CardDescription>Describe your outreach program</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Program Description *</label>
                  <Textarea
                    value={visitDetails.programDescription}
                    onChange={e => setVisitDetails(prev => ({ ...prev, programDescription: e.target.value }))}
                    placeholder="Describe the STEM activities you'll be offering..."
                    className="bg-muted/50 border-border/50 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Grades</label>
                    <Input
                      value={visitDetails.targetGrades}
                      onChange={e => setVisitDetails(prev => ({ ...prev, targetGrades: e.target.value }))}
                      placeholder="e.g., Grade 8-12"
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expected Participants</label>
                    <Input
                      value={visitDetails.expectedParticipants}
                      onChange={e => setVisitDetails(prev => ({ ...prev, expectedParticipants: e.target.value }))}
                      placeholder="e.g., 50-100"
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Information</label>
                  <Textarea
                    value={visitDetails.additionalInfo}
                    onChange={e => setVisitDetails(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder="Any special requirements or notes..."
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Create Campaign Button */}
            <Button 
              onClick={handleCreateCampaign} 
              disabled={isCreatingCampaign || !visitDetails.visitDate || !visitDetails.programDescription}
              className="w-full h-14 text-base font-semibold"
              size="lg"
            >
              {isCreatingCampaign ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Campaign & Generate Letters
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 4: Generated Letters */}
        {step === 4 && (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep(3)}
              className="-ml-2 text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Visit Details
            </Button>

            {isGeneratingLetters ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Mail className="h-6 w-6 animate-pulse text-primary" />
                      <span className="text-lg font-medium">Generating Letters...</span>
                    </div>
                    <Progress value={(letterProgress.current / letterProgress.total) * 100} className="w-full" />
                    <p className="text-center text-sm text-muted-foreground">
                      {letterProgress.current} of {letterProgress.total} letters generated
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Letters Generated!</p>
                        <p className="text-sm text-muted-foreground">
                          {generatedSchools.filter(s => s.generated_letter).length} of {generatedSchools.length} letters ready
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Letter Cards */}
                <div className="space-y-3">
                  {generatedSchools.map((school, index) => (
                    <Card 
                      key={school.id}
                      className="border-border/50 cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => {
                        setCurrentPreviewIndex(index);
                        setPreviewDialogOpen(true);
                      }}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{school.schoolName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {school.generated_letter ? "Letter ready" : "Letter generation failed"}
                              </p>
                            </div>
                          </div>
                          <Badge variant={school.generated_letter ? "default" : "destructive"}>
                            {school.generated_letter ? "Ready" : "Failed"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/")}
                  >
                    Back to Dashboard
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      toast.success("Campaign saved! You can send letters from the Campaign Dashboard.");
                      navigate("/");
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Save Campaign
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Letter Preview Dialog */}
      <LetterPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        schools={generatedSchools}
        currentIndex={currentPreviewIndex}
        onNavigate={setCurrentPreviewIndex}
        onSave={handleSaveEditedLetter}
      />
    </div>
  );
};

export default PlanningTool;
