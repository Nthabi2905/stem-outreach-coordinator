import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Users, GraduationCap, ChevronLeft, School as SchoolIcon } from "lucide-react";

interface SchoolRow {
  id: string;
  nat_emis: string;
  institution_name: string;
  province: string;
  district: string | null;
  town_city: string | null;
  quintile: string | null;
  phase_ped: string | null;
  learners_2024: number | null;
  educators_2024: number | null;
  urban_rural: string | null;
}

const PROVINCES = [
  { code: "WC", label: "Western Cape" },
  { code: "EC", label: "Eastern Cape" },
  { code: "FS", label: "Free State" },
  { code: "GT", label: "Gauteng" },
  { code: "KZN", label: "KwaZulu-Natal" },
  { code: "LP", label: "Limpopo" },
  { code: "MP", label: "Mpumalanga" },
  { code: "NC", label: "Northern Cape" },
  { code: "NW", label: "North West" },
];

const QUINTILE_TINTS: Record<string, string> = {
  Q1: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  Q2: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  Q3: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Q4: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Q5: "bg-sky-500/10 text-sky-700 border-sky-500/20",
};

const Schools = () => {
  const navigate = useNavigate();
  const [province, setProvince] = useState("WC");
  const [quintile, setQuintile] = useState("all");
  const [search, setSearch] = useState("");
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalsByQuintile, setTotalsByQuintile] = useState<Record<string, number>>({});

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      let q = supabase
        .from("schools")
        .select("id, nat_emis, institution_name, province, district, town_city, quintile, phase_ped, learners_2024, educators_2024, urban_rural")
        .eq("province", province)
        .order("institution_name", { ascending: true })
        .limit(500);
      if (quintile !== "all") q = q.eq("quintile", quintile);
      if (search.trim()) q = q.ilike("institution_name", `%${search.trim()}%`);
      const { data } = await q;
      setSchools(data || []);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [province, quintile, search]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("schools")
        .select("quintile")
        .eq("province", province)
        .limit(10000);
      const tally: Record<string, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Other: 0 };
      (data || []).forEach((r: any) => {
        const q = r.quintile || "Other";
        if (tally[q] !== undefined) tally[q]++;
        else tally.Other++;
      });
      setTotalsByQuintile(tally);
    })();
  }, [province]);

  const provinceLabel = useMemo(() => PROVINCES.find((p) => p.code === province)?.label || province, [province]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-gradient-to-b from-primary/10 to-background px-6 py-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
              <SchoolIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Schools Directory</h1>
              <p className="text-muted-foreground">Browse the national school list and target outreach by quintile.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Quintile breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quintile breakdown — {provinceLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {(["Q1", "Q2", "Q3", "Q4", "Q5", "Other"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuintile(q === "Other" ? "all" : q)}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    quintile === q ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {q === "Q1" && "Most underserved"}
                    {q === "Q2" && "Underserved"}
                    {q === "Q3" && "Mid-tier"}
                    {q === "Q4" && "Better-resourced"}
                    {q === "Q5" && "Least disadvantaged"}
                    {q === "Other" && "Unspecified"}
                  </div>
                  <div className="text-2xl font-extrabold mt-1">{(totalsByQuintile[q] || 0).toLocaleString()}</div>
                  <div className="text-xs font-semibold mt-0.5">{q} schools</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => <SelectItem key={p.code} value={p.code}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={quintile} onValueChange={setQuintile}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All quintiles</SelectItem>
                  <SelectItem value="Q1">Quintile 1</SelectItem>
                  <SelectItem value="Q2">Quintile 2</SelectItem>
                  <SelectItem value="Q3">Quintile 3</SelectItem>
                  <SelectItem value="Q4">Quintile 4</SelectItem>
                  <SelectItem value="Q5">Quintile 5</SelectItem>
                </SelectContent>
              </Select>
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by school name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `Showing ${schools.length} schools`}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((s) => {
            const tint = s.quintile && QUINTILE_TINTS[s.quintile] ? QUINTILE_TINTS[s.quintile] : "bg-secondary text-foreground border-border";
            return (
              <Card key={s.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{s.institution_name}</CardTitle>
                    <Badge variant="outline" className={tint}>{s.quintile || "—"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {[s.town_city, s.district].filter(Boolean).join(" · ")}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Learners</div>
                        <div className="font-semibold">{(s.learners_2024 ?? 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Educators</div>
                        <div className="font-semibold">{(s.educators_2024 ?? 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  {s.phase_ped && (
                    <div className="text-xs text-muted-foreground mt-3">
                      {s.phase_ped} · {s.urban_rural || ""}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schools;
