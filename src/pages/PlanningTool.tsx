import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboards/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  GraduationCap
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
        <div className="flex items-center gap-2 mt-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">1</span>
            Configure
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">2</span>
            Review Results
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
                    <Button size="sm">
                      Create Campaign
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
      </div>
    </div>
  );
};

export default PlanningTool;
