import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, MapPin, Users, School, CheckCircle2, AlertCircle, Zap } from "lucide-react";

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

export function AISchoolMatcher() {
  const { toast } = useToast();
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [targetQuintiles, setTargetQuintiles] = useState<string[]>(["Q1", "Q2", "Q3"]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [maxSchools, setMaxSchools] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());

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
      toast({ title: "Please select a province", variant: "destructive" });
      return;
    }

    setIsLoading(true);
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
      toast({ 
        title: "Matching Complete", 
        description: `Found ${data.recommendations.length} matching schools` 
      });
    } catch (error) {
      console.error('Matching error:', error);
      toast({ 
        title: "Matching Failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
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
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-orange-600 bg-orange-100";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI School Matcher</h2>
          <p className="text-muted-foreground">
            Intelligent matching of underserved schools with STEM organizations
          </p>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match Configuration</CardTitle>
          <CardDescription>
            Define your outreach criteria and let AI find the best matching schools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Province & District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Province *</label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger>
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Quintile Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Quintiles</label>
            <p className="text-xs text-muted-foreground mb-2">
              Lower quintile schools (Q1-Q3) are typically more underserved
            </p>
            <div className="flex flex-wrap gap-2">
              {quintiles.map(q => (
                <Badge
                  key={q}
                  variant={targetQuintiles.includes(q) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleQuintileToggle(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Services You Offer</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {services.map(service => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <label htmlFor={service} className="text-sm cursor-pointer">
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Max Schools */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Schools: {maxSchools}</label>
            <input
              type="range"
              min={5}
              max={20}
              value={maxSchools}
              onChange={e => setMaxSchools(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Match Button */}
          <Button 
            onClick={handleMatch} 
            disabled={isLoading || !province}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Zap className="mr-2 h-4 w-4 animate-pulse" />
                AI is analyzing schools...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Find Matching Schools
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Match Summary</p>
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
            <Card className="border-green-200 bg-green-50">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">
                    {selectedSchools.size} schools selected
                  </span>
                  <Button size="sm" variant="default">
                    Create Outreach Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* School Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendations.map((rec, index) => (
              <Card 
                key={rec.schoolId} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSchools.has(rec.schoolId) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => toggleSchoolSelection(rec.schoolId)}
              >
                <CardContent className="py-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <Badge className={getScoreColor(rec.matchScore)}>
                        {rec.matchScore}% match
                      </Badge>
                    </div>
                    <Checkbox
                      checked={selectedSchools.has(rec.schoolId)}
                      onClick={e => e.stopPropagation()}
                      onCheckedChange={() => toggleSchoolSelection(rec.schoolId)}
                    />
                  </div>
                  
                  <h3 className="font-semibold mb-1">{rec.schoolName}</h3>
                  
                  {rec.schoolDetails && (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{rec.schoolDetails.district}, {rec.schoolDetails.province}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <School className="h-3 w-3" />
                        <span>
                          {rec.schoolDetails.quintile} • {rec.schoolDetails.phase} • {rec.schoolDetails.urbanRural}
                        </span>
                      </div>
                      {rec.schoolDetails.learners && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{rec.schoolDetails.learners.toLocaleString()} learners</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 p-2 rounded bg-muted/50">
                    <p className="text-xs font-medium mb-1">Priority Reason:</p>
                    <p className="text-xs text-muted-foreground">{rec.priorityReason}</p>
                  </div>

                  {rec.suggestedActivities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {rec.suggestedActivities.map((activity, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {rec.schoolDetails?.hasReceivedOutreach && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
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
  );
}
