import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Users as UsersIcon,
  School as SchoolIcon,
  GraduationCap,
  Activity,
  BarChart3,
  FolderOpen,
  Video,
  MessageSquare,
  Handshake,
  Settings,
  FileText,
  LogOut,
  Bell,
  Mail,
  Search,
  Calendar,
  ChevronDown,
  TrendingUp,
  Building2,
  Download,
  ArrowUp,
  ShieldCheck,
  Megaphone,
  X,
  ClipboardList,
  Shield,
  ArrowRight,
} from "lucide-react";
import { QuestionnaireResponsesTable } from "@/components/QuestionnaireResponsesTable";
import { UserRoleManagement } from "@/components/UserRoleManagement";
import { OrganizationManagement } from "@/components/OrganizationManagement";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: UsersIcon, label: "Users", key: "users", chevron: true },
  { icon: SchoolIcon, label: "Schools & Orgs", key: "organizations" },
  { icon: GraduationCap, label: "Programs", key: "programs" },
  { icon: Activity, label: "Outreach Activities", key: "outreach" },
  { icon: BarChart3, label: "Reports & Analytics", key: "reports" },
  { icon: FolderOpen, label: "Resources", key: "resources" },
  { icon: Video, label: "Trainings & Webinars", key: "trainings" },
  { icon: MessageSquare, label: "Communications", key: "communications" },
  { icon: Handshake, label: "Partners & Sponsors", key: "partners" },
  { icon: Settings, label: "Settings", key: "settings" },
  { icon: FileText, label: "System Logs", key: "logs" },
];

const PROVINCE_COLORS = [
  "hsl(var(--logo-blue))",
  "hsl(var(--logo-teal))",
  "hsl(var(--logo-purple))",
  "hsl(var(--logo-orange))",
  "hsl(var(--logo-teal))",
  "hsl(var(--muted-foreground) / 0.5)",
];

interface KPI {
  icon: any;
  label: string;
  value: string;
  trend: string;
  tint: string;
}

interface ProvinceSlice {
  name: string;
  value: number;
  color: string;
  count: number;
}

interface ActivityItem {
  icon: any;
  title: string;
  desc: string;
  time: string;
  tint: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState("dashboard");
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const [kpis, setKpis] = useState<KPI[]>([
    { icon: UsersIcon, label: "Total Learners", value: "—", trend: "—", tint: "bg-logo-teal/10 text-logo-teal" },
    { icon: SchoolIcon, label: "Schools & Orgs", value: "—", trend: "—", tint: "bg-logo-purple/10 text-logo-purple" },
    { icon: BarChart3, label: "Outreach Activities", value: "—", trend: "—", tint: "bg-logo-blue/10 text-logo-blue" },
    { icon: Handshake, label: "Partners", value: "—", trend: "—", tint: "bg-logo-orange/10 text-logo-orange" },
    { icon: Download, label: "Questionnaire Responses", value: "—", trend: "—", tint: "bg-logo-teal/10 text-logo-teal" },
  ]);
  const [provinceData, setProvinceData] = useState<ProvinceSlice[]>([]);
  const [totalLearners, setTotalLearners] = useState(0);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [engagementSeries, setEngagementSeries] = useState<{ x: number; y: number; label: string }[]>([]);
  const [programs, setPrograms] = useState<{ name: string; current: number; total: number; percent: number; color: string }[]>([]);
  const [impactStats, setImpactStats] = useState({
    learnersReached: 0,
    underservedSchools: 0,
    workshopsDelivered: 0,
    provincesCovered: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to access this page");
        navigate("/auth");
        return;
      }
      const { data: adminData, error } = await supabase.rpc("is_current_user_admin");
      if (error) throw error;
      if (!adminData) {
        toast.error("You don't have permission to access this page");
        navigate("/");
        return;
      }
      setIsAdmin(true);
      await loadDashboardData();
    } catch (error: any) {
      console.error("Error checking admin access:", error);
      toast.error("Failed to verify access permissions");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      const [
        schoolsRes,
        orgsRes,
        campaignsRes,
        questionnairesRes,
        recentCampaignsRes,
        recentQuestionnairesRes,
        recentOutreachRes,
        prevCampaignsRes,
        prevQuestionnairesRes,
      ] = await Promise.all([
        supabase.from("schools").select("id, province, learners_2024, quintile", { count: "exact" }),
        supabase.from("organizations").select("id, name, created_at", { count: "exact" }),
        supabase.from("outreach_campaigns").select("id, status, created_at, province, district, school_type", { count: "exact" }),
        supabase.from("questionnaire_responses").select("id, organization_name, questionnaire_type, created_at", { count: "exact" }),
        supabase.from("outreach_campaigns").select("id, school_type, district, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("questionnaire_responses").select("id, organization_name, questionnaire_type, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("outreach_requests").select("id, school_name, outreach_type, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("outreach_campaigns").select("id", { count: "exact", head: true }).lt("created_at", weekAgo).gte("created_at", twoWeeksAgo),
        supabase.from("questionnaire_responses").select("id", { count: "exact", head: true }).lt("created_at", weekAgo).gte("created_at", twoWeeksAgo),
      ]);

      const schools = schoolsRes.data || [];
      const orgs = orgsRes.data || [];
      const campaigns = campaignsRes.data || [];
      const questionnaires = questionnairesRes.data || [];

      const learnerSum = schools.reduce((acc, s: any) => acc + (s.learners_2024 || 0), 0);
      setTotalLearners(learnerSum);

      const trendStr = (curr: number, prev: number) => {
        if (!prev) return curr > 0 ? "+100%" : "0%";
        const pct = ((curr - prev) / prev) * 100;
        return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
      };

      const campaignsLastWeek = campaigns.filter((c: any) => c.created_at >= weekAgo).length;
      const questionnairesLastWeek = questionnaires.filter((q: any) => q.created_at >= weekAgo).length;

      setKpis([
        { icon: UsersIcon, label: "Total Learners", value: learnerSum.toLocaleString(), trend: `${schools.length} schools`, tint: "bg-logo-teal/10 text-logo-teal" },
        { icon: SchoolIcon, label: "Schools & Orgs", value: ((schoolsRes.count || 0) + (orgsRes.count || 0)).toLocaleString(), trend: `${orgsRes.count || 0} orgs`, tint: "bg-logo-purple/10 text-logo-purple" },
        { icon: BarChart3, label: "Outreach Activities", value: (campaignsRes.count || 0).toLocaleString(), trend: trendStr(campaignsLastWeek, prevCampaignsRes.count || 0), tint: "bg-logo-blue/10 text-logo-blue" },
        { icon: Handshake, label: "Partners", value: (orgsRes.count || 0).toLocaleString(), trend: `${orgs.filter((o: any) => o.created_at >= weekAgo).length} new`, tint: "bg-logo-orange/10 text-logo-orange" },
        { icon: Download, label: "Questionnaire Responses", value: (questionnairesRes.count || 0).toLocaleString(), trend: trendStr(questionnairesLastWeek, prevQuestionnairesRes.count || 0), tint: "bg-logo-teal/10 text-logo-teal" },
      ]);

      // Province distribution by learner count
      const byProvince: Record<string, number> = {};
      schools.forEach((s: any) => {
        if (!s.province) return;
        byProvince[s.province] = (byProvince[s.province] || 0) + (s.learners_2024 || 0);
      });
      const sorted = Object.entries(byProvince).sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, 5);
      const othersTotal = sorted.slice(5).reduce((acc, [, v]) => acc + v, 0);
      const totalProv = sorted.reduce((acc, [, v]) => acc + v, 0) || 1;
      const slices: ProvinceSlice[] = top.map(([name, count], i) => ({
        name,
        count,
        value: Math.round((count / totalProv) * 1000) / 10,
        color: PROVINCE_COLORS[i],
      }));
      if (othersTotal > 0) {
        slices.push({
          name: "Others",
          count: othersTotal,
          value: Math.round((othersTotal / totalProv) * 1000) / 10,
          color: PROVINCE_COLORS[5],
        });
      }
      setProvinceData(slices);

      const provincesCovered = new Set(
        campaigns.filter((c: any) => c.status !== "draft").map((c: any) => c.province).filter(Boolean)
      ).size;
      const underserved = schools.filter((s: any) => s.quintile && parseInt(s.quintile) <= 2).length;
      const workshopsDelivered = campaigns.filter((c: any) => c.status === "completed").length;
      setImpactStats({
        learnersReached: learnerSum,
        underservedSchools: underserved,
        workshopsDelivered,
        provincesCovered,
      });

      // Engagement: questionnaire responses per week (last 9 weeks)
      const weeks = 9;
      const series: { x: number; y: number; label: string }[] = [];
      for (let i = weeks - 1; i >= 0; i--) {
        const start = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
        const count = questionnaires.filter((q: any) => {
          const d = new Date(q.created_at);
          return d >= start && d < end;
        }).length;
        series.push({
          x: weeks - 1 - i,
          y: count,
          label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        });
      }
      setEngagementSeries(series);

      // Programs: campaigns grouped by school_type
      const byType: Record<string, number> = {};
      campaigns.forEach((c: any) => {
        const t = c.school_type || "Other";
        byType[t] = (byType[t] || 0) + 1;
      });
      const totalC = campaigns.length || 1;
      const colors = ["bg-logo-blue", "bg-logo-teal", "bg-logo-purple", "bg-logo-orange"];
      const progs = Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, count], i) => ({
          name,
          current: count,
          total: totalC,
          percent: Math.round((count / totalC) * 100),
          color: colors[i % colors.length],
        }));
      setPrograms(progs);

      // Recent activities
      type Raw = { date: string; item: ActivityItem };
      const acts: Raw[] = [];
      (recentCampaignsRes.data || []).forEach((c: any) => {
        acts.push({
          date: c.created_at,
          item: {
            icon: Activity,
            title: "New outreach activity",
            desc: `${c.school_type || "Campaign"}${c.district ? ` – ${c.district}` : ""}`,
            time: formatDistanceToNow(new Date(c.created_at), { addSuffix: true }),
            tint: "bg-logo-purple/10 text-logo-purple",
          },
        });
      });
      (recentQuestionnairesRes.data || []).forEach((q: any) => {
        acts.push({
          date: q.created_at,
          item: {
            icon: ClipboardList,
            title: q.questionnaire_type === "school_needs" ? "School needs submitted" : "Company offering submitted",
            desc: q.organization_name,
            time: formatDistanceToNow(new Date(q.created_at), { addSuffix: true }),
            tint: "bg-logo-teal/10 text-logo-teal",
          },
        });
      });
      (recentOutreachRes.data || []).forEach((r: any) => {
        acts.push({
          date: r.created_at,
          item: {
            icon: SchoolIcon,
            title: "Outreach request",
            desc: `${r.school_name} – ${r.outreach_type}`,
            time: formatDistanceToNow(new Date(r.created_at), { addSuffix: true }),
            tint: "bg-logo-orange/10 text-logo-orange",
          },
        });
      });
      acts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(acts.slice(0, 5).map((a) => a.item));
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      toast.error("Failed to load dashboard data");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }
  if (!isAdmin) return null;

  // Build SVG path for engagement chart
  const w = 600, h = 180, pad = 20;
  const maxY = Math.max(10, ...engagementSeries.map((p) => p.y)) * 1.2;
  const points = engagementSeries.length > 0
    ? engagementSeries.map((p) => {
        const x = pad + (p.x / Math.max(1, engagementSeries.length - 1)) * (w - pad * 2);
        const y = h - pad - (p.y / maxY) * (h - pad * 2);
        return { x, y, raw: p };
      })
    : [];
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`
    : "";

  // Donut conic gradient
  let acc = 0;
  const conicStops = provinceData.length > 0
    ? provinceData
        .map((p) => {
          const start = acc;
          acc += p.value;
          return `${p.color} ${start}% ${acc}%`;
        })
        .join(", ")
    : "hsl(var(--muted)) 0% 100%";

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex-shrink-0 flex flex-col sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-lg text-foreground">EduReach AI</span>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-logo-purple/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-logo-purple" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Admin</div>
              <div className="text-[11px] text-muted-foreground">Super Administrator</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-logo-blue/10 text-logo-blue"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </nav>

        <div className="m-3 p-4 rounded-xl bg-logo-purple/5 border border-logo-purple/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-logo-purple/15 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-logo-purple" />
            </div>
            <span className="text-sm font-bold text-foreground">Your Impact</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
            You're helping connect learners to life-changing STEM opportunities.
          </p>
          <button
            onClick={() => navigate("/impact")}
            className="text-xs font-semibold text-logo-blue hover:underline inline-flex items-center gap-1"
          >
            View Impact <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="mx-3 mb-4 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-3"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-6 px-8 pt-8 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              Welcome back, Admin! <span>👋</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening across EduReach AI today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search anything…"
                className="pl-9 pr-14 w-72 bg-card border-border h-10 rounded-xl"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                ⌘ K
              </kbd>
            </div>
            <button className="relative w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-logo-orange text-[9px] font-bold text-white flex items-center justify-center">
                8
              </span>
            </button>
            <button className="relative w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Mail className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-logo-orange text-[9px] font-bold text-white flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-card border border-border">
              <div className="w-8 h-8 rounded-full bg-logo-purple flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="text-sm font-semibold text-foreground">Admin</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 space-y-6">
          {/* Date selector */}
          <div className="flex justify-end">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-foreground">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              May 12 – May 18, 2025
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl ${k.tint} flex items-center justify-center`}>
                    <k.icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium pt-1">{k.label}</div>
                </div>
                <div className="text-2xl font-extrabold text-foreground mb-1">{k.value}</div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <ArrowUp className="w-3 h-3" />
                  {k.trend} from last week
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Engagement chart */}
            <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Learner Engagement Over Time</h3>
                <button className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground inline-flex items-center gap-1">
                  This Month <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
                <defs>
                  <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--logo-blue))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--logo-blue))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 25, 50, 75, 100].map((v) => {
                  const y = h - pad - (v / maxY) * (h - pad * 2);
                  return (
                    <g key={v}>
                      <line x1={pad} x2={w - pad} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="2 4" />
                      <text x={4} y={y + 3} fontSize="9" fill="hsl(var(--muted-foreground))">
                        {v === 0 ? "0" : `${v / 10 * 8}K`}
                      </text>
                    </g>
                  );
                })}
                <path d={areaPath} fill="url(#engGrad)" />
                <path d={linePath} fill="none" stroke="hsl(var(--logo-blue))" strokeWidth="2" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(var(--logo-blue))" />
                ))}
                {["May 1", "May 5", "May 9", "May 13", "May 17"].map((lbl, i, arr) => {
                  const x = pad + (i / (arr.length - 1)) * (w - pad * 2);
                  return (
                    <text key={lbl} x={x} y={h - 4} fontSize="9" fill="hsl(var(--muted-foreground))" textAnchor="middle">
                      {lbl}
                    </text>
                  );
                })}
              </svg>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-logo-blue" />
                <span className="text-xs text-muted-foreground">Learners Engaged</span>
              </div>
            </div>

            {/* Donut */}
            <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4">Learners by Province</h3>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div
                    className="w-32 h-32 rounded-full"
                    style={{ background: `conic-gradient(${conicStops})` }}
                  />
                  <div className="absolute inset-3 rounded-full bg-card flex flex-col items-center justify-center">
                    <div className="text-lg font-extrabold text-foreground">245,780</div>
                    <div className="text-[10px] text-muted-foreground">Total</div>
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {provinces.map((p) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                        <span className="text-foreground">{p.name}</span>
                      </div>
                      <span className="text-muted-foreground font-medium">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="mt-4 text-xs font-semibold text-logo-blue hover:underline inline-flex items-center gap-1">
                View Full Report <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Recent Activities */}
            <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Recent Activities</h3>
                <button className="text-xs font-semibold text-logo-blue hover:underline inline-flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${a.tint} flex items-center justify-center shrink-0`}>
                      <a.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{a.title}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{a.desc}</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-xs font-semibold text-logo-blue hover:underline">
                View All Activities
              </button>
            </div>
          </div>

          {/* Bottom row: Programs / Impact / System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Programs Overview */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Programs Overview</h3>
                <button className="text-xs font-semibold text-logo-blue hover:underline inline-flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-4">
                {programs.map((p) => (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <div className="text-xs font-bold text-foreground">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {p.current.toLocaleString()} / {p.total.toLocaleString()} learners
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Active
                        </span>
                        <span className="text-xs font-bold text-foreground">{p.percent}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-xs font-semibold text-logo-blue hover:underline inline-flex items-center gap-1">
                Manage Programs <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Impact at a Glance */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4">Impact at a Glance</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: GraduationCap, label: "Learners Reached", value: "245,780", sub: "+26,540 this month", tint: "bg-logo-teal/10 text-logo-teal" },
                  { icon: SchoolIcon, label: "Underserved Schools", value: "1,284", sub: "+143 this month", tint: "bg-logo-purple/10 text-logo-purple" },
                  { icon: Download, label: "Workshops Delivered", value: "158", sub: "+21 this month", tint: "bg-logo-orange/10 text-logo-orange" },
                  { icon: Building2, label: "Provinces Covered", value: "9 / 9", sub: "Nationwide", tint: "bg-logo-blue/10 text-logo-blue" },
                ].map((s) => (
                  <div key={s.label} className="bg-secondary/40 rounded-xl p-3">
                    <div className={`w-8 h-8 rounded-lg ${s.tint} flex items-center justify-center mb-2`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                    <div className="text-lg font-extrabold text-foreground leading-tight">{s.value}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/impact")}
                className="mt-4 text-xs font-semibold text-logo-blue hover:underline inline-flex items-center gap-1"
              >
                View Impact Dashboard <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* System Status */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4">System Status</h3>
              <div className="space-y-3">
                {[
                  { label: "Platform Status", value: "All Systems Operational", dot: "bg-emerald-500" },
                  { label: "Data Sync", value: "Up to date", dot: "bg-emerald-500" },
                  { label: "Last Backup", value: "May 18, 2025 – 02:30 AM", dot: "bg-emerald-500" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="w-4 h-4" />
                      {s.label}
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-xs font-semibold text-logo-blue hover:underline inline-flex items-center gap-1">
                View System Logs <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Announcement banner */}
          {showAnnouncement && (
            <div className="bg-logo-blue/5 border border-logo-blue/20 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-logo-blue/15 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-logo-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">Platform Announcement</div>
                <div className="text-xs text-muted-foreground">
                  The new Impact Reporting Toolkit is now live. Track outcomes, measure change and showcase your impact with ease.
                </div>
              </div>
              <Button className="bg-logo-blue hover:bg-logo-blue/90 text-white">Explore Now</Button>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Conditional management panels (kept functional) */}
          {active === "users" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-logo-purple/10 text-logo-purple flex items-center justify-center">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">User Role Management</h2>
                  <p className="text-sm text-muted-foreground">Assign and manage roles for platform users.</p>
                </div>
              </div>
              <UserRoleManagement />
            </div>
          )}

          {active === "organizations" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-logo-orange/10 text-logo-orange flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Organization Management</h2>
                  <p className="text-sm text-muted-foreground">Create and manage organizations and members.</p>
                </div>
              </div>
              <OrganizationManagement />
            </div>
          )}

          {active === "reports" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-logo-teal/10 text-logo-teal flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Questionnaire Responses</h2>
                  <p className="text-sm text-muted-foreground">View questionnaire responses from schools and companies.</p>
                </div>
              </div>
              <QuestionnaireResponsesTable />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
