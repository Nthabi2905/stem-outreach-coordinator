import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, subDays, startOfDay } from "date-fns";
import {
  Users,
  Calendar,
  School as SchoolIcon,
  Building2,
  Download,
  Bell,
  Mail,
  Plus,
  ArrowRight,
  ArrowUpRight,
  LogOut,
  Megaphone,
  FileText,
  Image as ImageIcon,
  ClipboardList,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface OrganizationDashboardViewProps {
  userEmail: string;
  userName: string;
  userId: string;
}

const GRADE_COLORS = ["hsl(var(--primary))", "#10b981", "#8b5cf6", "#94a3b8"];

export const OrganizationDashboardView = ({ userName, userId }: OrganizationDashboardViewProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    learners: 0,
    activities: 0,
    schools: 0,
    communities: 0,
    resources: 0,
  });
  const [trend, setTrend] = useState<{ date: string; learners: number }[]>([]);
  const [grades, setGrades] = useState<{ name: string; value: number }[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [focusAreas, setFocusAreas] = useState<{ name: string; learners: number; pct: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const { data: campaigns } = await supabase
        .from("outreach_campaigns")
        .select("*, school_recommendations(*, schools(*))")
        .order("created_at", { ascending: false });

      const allCampaigns = campaigns || [];
      const allRecs = allCampaigns.flatMap((c: any) => c.school_recommendations || []);

      const learners = allRecs.reduce((sum: number, r: any) => sum + (r.enrollment_total || r.schools?.learners_2024 || 0), 0);
      const activities = allCampaigns.length;
      const schools = new Set(allRecs.map((r: any) => r.school_id).filter(Boolean)).size;
      const communities = new Set(allRecs.map((r: any) => r.schools?.district).filter(Boolean)).size;
      const resources = allRecs.filter((r: any) => r.generated_letter).length;

      setStats({ learners, activities, schools, communities, resources });

      // Trend - last 30 days
      const days: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "MMM d");
        days[d] = 0;
      }
      allRecs.forEach((r: any) => {
        if (!r.created_at) return;
        const d = format(new Date(r.created_at), "MMM d");
        if (d in days) days[d] += r.enrollment_total || r.schools?.learners_2024 || 0;
      });
      let cumulative = 0;
      setTrend(
        Object.entries(days).map(([date, v]) => {
          cumulative += v;
          return { date, learners: cumulative };
        })
      );

      // Grades from phase_ped
      const phaseMap: Record<string, number> = { "Foundation": 0, "Intermediate": 0, "Senior": 0, "FET": 0, "Other": 0 };
      allRecs.forEach((r: any) => {
        const phase = r.schools?.phase_ped || "";
        const learners = r.enrollment_total || r.schools?.learners_2024 || 0;
        if (phase.toLowerCase().includes("primary") || phase.toLowerCase().includes("foundation")) phaseMap["Foundation"] += learners;
        else if (phase.toLowerCase().includes("intermediate")) phaseMap["Intermediate"] += learners;
        else if (phase.toLowerCase().includes("senior")) phaseMap["Senior"] += learners;
        else if (phase.toLowerCase().includes("secondary") || phase.toLowerCase().includes("fet")) phaseMap["FET"] += learners;
        else phaseMap["Other"] += learners;
      });
      const gradeData = Object.entries(phaseMap)
        .filter(([_, v]) => v > 0)
        .map(([name, value]) => ({ name, value }));
      setGrades(gradeData.length ? gradeData : [{ name: "No data", value: 1 }]);

      // Recent activities
      setRecent(
        allRecs
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6)
      );

      // Focus areas from campaign visit_details.programDescription / school_type
      const focusMap: Record<string, number> = {};
      allCampaigns.forEach((c: any) => {
        const focus = c.visit_details?.programDescription?.split(" ").slice(0, 3).join(" ") || c.school_type || "General STEM";
        const cLearners = (c.school_recommendations || []).reduce(
          (s: number, r: any) => s + (r.enrollment_total || r.schools?.learners_2024 || 0),
          0
        );
        focusMap[focus] = (focusMap[focus] || 0) + cLearners;
      });
      const totalFocus = Object.values(focusMap).reduce((a, b) => a + b, 0) || 1;
      setFocusAreas(
        Object.entries(focusMap)
          .map(([name, learners]) => ({ name, learners, pct: Math.round((learners / totalFocus) * 100) }))
          .sort((a, b) => b.learners - a.learners)
          .slice(0, 4)
      );
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const kpis = [
    { icon: Users, label: "Learners Reached", value: stats.learners.toLocaleString(), tint: "bg-emerald-50 text-emerald-600" },
    { icon: Calendar, label: "Outreach Activities", value: stats.activities, tint: "bg-purple-50 text-purple-600" },
    { icon: SchoolIcon, label: "Schools Visited", value: stats.schools, tint: "bg-sky-50 text-sky-600" },
    { icon: Building2, label: "Communities Impacted", value: stats.communities, tint: "bg-orange-50 text-orange-600" },
    { icon: Download, label: "Resources Shared", value: stats.resources, tint: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top header */}
      <div className="bg-background border-b">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {userName?.split(" ")[0] || "there"}! <span aria-hidden>👋</span>
            </h1>
            <p className="text-sm text-muted-foreground">Here's how your outreach is making a difference.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">8</span>
            </Button>
            <Button variant="outline" size="icon" className="relative">
              <Mail className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">3</span>
            </Button>
            <Button onClick={() => navigate("/planning")} className="gap-2">
              <Plus className="h-4 w-4" />
              New Outreach Activity
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((k) => (
            <Card key={k.label} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.tint}`}>
                  <k.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{loading ? "—" : k.value}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3" /> from last week
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend */}
          <Card className="p-5 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Learners Reached Over Time</h3>
              <Badge variant="outline">This Month</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="lr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Area type="monotone" dataKey="learners" stroke="hsl(var(--primary))" fill="url(#lr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Donut */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Learners by Phase</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={grades} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {grades.map((_, i) => (
                      <Cell key={i} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-44 pointer-events-none">
              <p className="text-2xl font-bold">{stats.learners.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </Card>

          {/* Recent activities */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Outreach Activities</h3>
              <Button variant="link" size="sm" className="h-auto p-0" onClick={() => navigate("/campaigns")}>
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recent.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No activities yet</p>
              )}
              {recent.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <SchoolIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {r.generated_data?.schoolName || r.schools?.institution_name || "School"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.schools?.district || r.schools?.town_city || "—"}
                    </p>
                  </div>
                  <Badge variant={r.response_status === "confirmed" ? "default" : "outline"} className="text-[10px]">
                    {r.response_status || "pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Focus areas */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Outreach by Focus Area</h3>
            <div className="space-y-4">
              {focusAreas.length === 0 && (
                <p className="text-sm text-muted-foreground">No focus area data yet</p>
              )}
              {focusAreas.map((f) => (
                <div key={f.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <div>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.learners.toLocaleString()} learners</p>
                    </div>
                    <span className="text-sm font-medium">{f.pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${f.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Impact snapshot */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Impact Snapshot</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Underserved Communities</p>
                <p className="text-2xl font-bold mt-1">{stats.communities}</p>
                <p className="text-xs text-muted-foreground">districts reached</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Schools</p>
                <p className="text-2xl font-bold mt-1">{stats.schools}</p>
                <p className="text-xs text-muted-foreground">visited</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Activities</p>
                <p className="text-2xl font-bold mt-1">{stats.activities}</p>
                <p className="text-xs text-muted-foreground">campaigns</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Letters Sent</p>
                <p className="text-2xl font-bold mt-1">{stats.resources}</p>
                <p className="text-xs text-muted-foreground">resources</p>
              </div>
            </div>
          </Card>

          {/* Pending actions */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">My Pending Actions</h3>
            <div className="space-y-2">
              {[
                { icon: ClipboardList, label: "Activity Reports to Submit", count: stats.activities },
                { icon: ImageIcon, label: "Evidence / Photos to Upload", count: stats.schools },
                { icon: FileText, label: "Feedback Forms to Complete", count: 2 },
                { icon: CalendarClock, label: "Upcoming Activities", count: stats.activities },
              ].map((a) => (
                <div key={a.label} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <a.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="flex-1 text-sm">{a.label}</p>
                  <Badge variant="secondary">{a.count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Share story banner */}
        <Card className="p-5 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Share Your Success!</p>
              <p className="text-sm text-muted-foreground">
                Your stories inspire others. Share photos, feedback and success stories from your outreach.
              </p>
            </div>
            <Button onClick={() => navigate("/campaigns")} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Submit a Story
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
