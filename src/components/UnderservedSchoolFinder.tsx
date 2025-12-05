import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  MapPin, 
  Users, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  X,
  Lightbulb,
  School,
  Target
} from "lucide-react";

interface UnderservedSchool {
  id: string;
  institution_name: string;
  nat_emis: string;
  province: string;
  district: string | null;
  quintile: string | null;
  urban_rural: string | null;
  no_fee_school: string | null;
  learners_2024: number | null;
  township_village: string | null;
  street_address: string | null;
  telephone: string | null;
  priorityScore: number;
  underservedReasons: string[];
}

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const SCHOOL_TYPES = [
  { value: "Primary", label: "Primary Schools" },
  { value: "Secondary", label: "Secondary Schools" },
  { value: "Combined", label: "Combined Schools" },
  { value: "Intermediate", label: "Intermediate Schools" },
];

export const UnderservedSchoolFinder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [schools, setSchools] = useState<UnderservedSchool[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());
  const [totalUnderserved, setTotalUnderserved] = useState(0);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const findSchools = async () => {
    if (!province) {
      toast.error("Please select a province");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke("find-underserved-schools", {
        body: {
          province,
          district: district || undefined,
          schoolType: schoolType || undefined,
          batchSize: 10,
        },
      });

      if (error) throw error;

      setSchools(data.schools || []);
      setTotalUnderserved(data.totalUnderserved || 0);
      setAiInsights(data.aiInsights || null);
      setSelectedSchools(new Set(data.schools?.map((s: UnderservedSchool) => s.id) || []));

      if (data.schools?.length > 0) {
        toast.success(`Found ${data.schools.length} priority schools`);
      } else {
        toast.info("No underserved schools found with the selected criteria");
      }
    } catch (error: any) {
      console.error("Error finding schools:", error);
      toast.error(error.message || "Failed to find underserved schools");
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateBatch = async () => {
    // For now, just re-run the search (could be enhanced to exclude current batch)
    await findSchools();
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

  const selectAll = () => {
    setSelectedSchools(new Set(schools.map(s => s.id)));
  };

  const deselectAll = () => {
    setSelectedSchools(new Set());
  };

  const confirmSelection = () => {
    const selectedCount = selectedSchools.size;
    if (selectedCount === 0) {
      toast.error("Please select at least one school");
      return;
    }
    toast.success(`${selectedCount} schools added to your outreach plan`);
    // This would integrate with campaign creation in a full implementation
  };

  const getPriorityColor = (score: number) => {
    if (score >= 100) return "bg-red-500";
    if (score >= 70) return "bg-orange-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Underserved School Finder</CardTitle>
              <CardDescription>
                Identify priority schools that haven't received STEM outreach. Schools are ranked by quintile, location, and impact potential.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Province *</Label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>District (Optional)</Label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="All districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All districts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>School Type (Optional)</Label>
              <Select value={schoolType} onValueChange={setSchoolType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {SCHOOL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={findSchools} disabled={isLoading || !province} className="w-full md:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Schools...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Find Underserved Schools
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {aiInsights && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">AI Insights</p>
                <p className="text-sm text-muted-foreground">{aiInsights}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {schools.length > 0 ? `Priority Schools (${schools.length} of ${totalUnderserved})` : "No Schools Found"}
                </CardTitle>
                {schools.length > 0 && (
                  <CardDescription>
                    {selectedSchools.size} selected for outreach
                  </CardDescription>
                )}
              </div>
              {schools.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={regenerateBatch}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    New Batch
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {schools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <School className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No underserved schools found matching your criteria.</p>
                <p className="text-sm">Try adjusting the filters or selecting a different province.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schools.map((school, index) => (
                  <div
                    key={school.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedSchools.has(school.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleSchoolSelection(school.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-muted-foreground">#{index + 1}</span>
                          <h4 className="font-semibold truncate">{school.institution_name}</h4>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(school.priorityScore)}`} 
                               title={`Priority Score: ${school.priorityScore}`} />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {school.district || school.province}
                          </span>
                          {school.learners_2024 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {school.learners_2024.toLocaleString()} learners
                            </span>
                          )}
                          {school.quintile && (
                            <Badge variant="outline" className="text-xs">
                              Quintile {school.quintile}
                            </Badge>
                          )}
                          {school.urban_rural && (
                            <Badge variant="outline" className="text-xs">
                              {school.urban_rural}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {school.underservedReasons.map((reason, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {selectedSchools.has(school.id) ? (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-5 w-5 text-primary-foreground" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-muted" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {selectedSchools.size > 0 && (
                  <div className="pt-4 border-t">
                    <Button onClick={confirmSelection} className="w-full">
                      <Check className="mr-2 h-4 w-4" />
                      Add {selectedSchools.size} Schools to Outreach Plan
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
