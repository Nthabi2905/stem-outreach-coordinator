import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "./DashboardHeader";
import { WelcomeBanner } from "./WelcomeBanner";
import { StatCard } from "./StatCard";
import { 
  GraduationCap, 
  Building2, 
  AlertTriangle, 
  MessageCircle,
  CheckCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface AdminDashboardViewProps {
  userEmail: string;
  userName: string;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
];

export const AdminDashboardView = ({ userEmail, userName }: AdminDashboardViewProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSchools: 0,
    organizations: 0,
    underservedSchools: 0,
    pendingRequests: 0,
    completedActivities: 0,
    totalOutreaches: 0,
    totalDistricts: 0,
    coveredDistricts: 0,
    totalLearners: 0,
  });
  const [provincialDistribution, setProvincialDistribution] = useState<{ province: string; count: number; abbreviation: string }[]>([]);
  const [quintileDistribution, setQuintileDistribution] = useState<{ name: string; value: number }[]>([]);
  const [outreachByStatus, setOutreachByStatus] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const getProvinceAbbreviation = (province: string): string => {
    const abbreviations: Record<string, string> = {
      "Gauteng": "GP",
      "Western Cape": "WC",
      "KwaZulu-Natal": "KZN",
      "Eastern Cape": "EC",
      "Free State": "FS",
      "Limpopo": "LP",
      "Mpumalanga": "MP",
      "North West": "NW",
      "Northern Cape": "NC",
    };
    return abbreviations[province] || province.substring(0, 2).toUpperCase();
  };

  const fetchStats = async () => {
    try {
      const [schoolsRes, orgsRes, requestsRes, campaignsRes] = await Promise.all([
        supabase.from("schools").select("id, quintile, province, district, learners_2024", { count: "exact" }),
        supabase.from("organizations").select("id", { count: "exact" }),
        supabase.from("outreach_requests").select("id, status", { count: "exact" }),
        supabase.from("outreach_campaigns").select("id, status, province, district", { count: "exact" }),
      ]);

      const schools = schoolsRes.data || [];
      const campaigns = campaignsRes.data || [];
      const underserved = schools.filter(s => s.quintile && parseInt(s.quintile) <= 2).length;
      const pending = (requestsRes.data || []).filter(r => r.status === "pending").length;
      const completed = campaigns.filter(c => c.status === "completed").length;
      
      // Calculate total learners
      const totalLearners = schools.reduce((sum, s) => sum + (s.learners_2024 || 0), 0);

      // Calculate districts
      const allDistricts = new Set(schools.map(s => s.district).filter(Boolean));
      const coveredDistricts = new Set(campaigns.map(c => c.district).filter(Boolean));

      // Calculate provincial distribution
      const provinceCounts: Record<string, number> = {};
      schools.forEach(s => {
        if (s.province) {
          provinceCounts[s.province] = (provinceCounts[s.province] || 0) + 1;
        }
      });
      const distribution = Object.entries(provinceCounts)
        .map(([province, count]) => ({ 
          province, 
          count,
          abbreviation: getProvinceAbbreviation(province)
        }))
        .sort((a, b) => b.count - a.count);

      // Calculate quintile distribution
      const quintileCounts: Record<string, number> = {};
      schools.forEach(s => {
        const q = s.quintile || "Unknown";
        quintileCounts[q] = (quintileCounts[q] || 0) + 1;
      });
      const quintileData = Object.entries(quintileCounts)
        .map(([name, value]) => ({ name: `Q${name}`, value }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Calculate outreach by status
      const statusCounts: Record<string, number> = {
        draft: 0,
        active: 0,
        completed: 0,
      };
      campaigns.forEach(c => {
        if (statusCounts.hasOwnProperty(c.status)) {
          statusCounts[c.status]++;
        }
      });
      const statusData = Object.entries(statusCounts)
        .map(([name, value]) => ({ 
          name: name.charAt(0).toUpperCase() + name.slice(1), 
          value 
        }));

      setStats({
        totalSchools: schoolsRes.count || 0,
        organizations: orgsRes.count || 0,
        underservedSchools: underserved,
        pendingRequests: pending,
        completedActivities: completed,
        totalOutreaches: campaignsRes.count || 0,
        totalDistricts: allDistricts.size,
        coveredDistricts: coveredDistricts.size,
        totalLearners,
      });
      setProvincialDistribution(distribution);
      setQuintileDistribution(quintileData);
      setOutreachByStatus(statusData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-primary">{payload[0].value.toLocaleString()} schools</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Admin Dashboard" onSignOut={handleSignOut} />
      
      <WelcomeBanner 
        name={userName || "System Administrator"} 
        subtitle="National Administrator"
        role="admin"
      />

      {/* Key Metrics */}
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          National Statistics
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={GraduationCap} 
            value={stats.totalSchools.toLocaleString()} 
            label="Total Schools" 
            variant="primary" 
          />
          <StatCard 
            icon={Users} 
            value={stats.totalLearners.toLocaleString()} 
            label="Total Learners" 
            variant="purple" 
          />
          <StatCard 
            icon={AlertTriangle} 
            value={stats.underservedSchools.toLocaleString()} 
            label="Underserved (Q1-Q2)" 
            variant="amber" 
          />
          <StatCard 
            icon={Building2} 
            value={stats.organizations} 
            label="Organizations" 
            variant="orange" 
          />
        </div>
      </div>

      {/* Provincial Distribution Chart */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Schools by Province
        </h3>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          {provincialDistribution.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={provincialDistribution} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="abbreviation" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  name="Schools"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quintile & Outreach Charts */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Quintile Distribution */}
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-3 text-center">Quintile Distribution</h4>
            {quintileDistribution.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={quintileDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    dataKey="value"
                    label={({ name }) => name}
                    labelLine={false}
                  >
                    {quintileDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Outreach Status */}
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-3 text-center">Campaign Status</h4>
            {outreachByStatus.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={outreachByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    dataKey="value"
                    label={({ name }) => name}
                    labelLine={false}
                  >
                    <Cell fill="#F59E0B" />
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* District Coverage */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Outreach Coverage
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={MapPin} 
            value={stats.totalDistricts} 
            label="Total Districts" 
            variant="primary" 
          />
          <StatCard 
            icon={CheckCheck} 
            value={stats.coveredDistricts} 
            label="Districts Reached" 
            variant="primary" 
          />
          <StatCard 
            icon={MessageCircle} 
            value={stats.pendingRequests} 
            label="Pending Requests" 
            variant="amber" 
          />
          <StatCard 
            icon={TrendingUp} 
            value={stats.totalOutreaches} 
            label="Total Campaigns" 
            variant="purple" 
          />
        </div>
      </div>

      {/* Provincial List */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold mb-4">Provincial Breakdown</h3>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
          {provincialDistribution.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No data available</p>
          ) : (
            provincialDistribution.map((item, index) => (
              <div key={item.province} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-foreground">{item.province}</span>
                </div>
                <span className="text-primary text-sm bg-primary/10 px-3 py-1 rounded-full">
                  {item.count.toLocaleString()} schools
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-4 space-y-3">
        <Button 
          onClick={() => navigate("/admin")} 
          className="w-full bg-gradient-to-r from-purple-500/20 to-primary/20 border border-purple-500/30 text-foreground hover:bg-purple-500/30"
          variant="outline"
        >
          <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
          <div className="flex-1 text-left">
            <p className="font-semibold">User Management</p>
            <p className="text-xs text-muted-foreground">Manage users and roles</p>
          </div>
          <ArrowRight className="h-5 w-5" />
        </Button>

        <Button 
          onClick={() => navigate("/admin/responses")} 
          className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-foreground hover:bg-amber-500/30"
          variant="outline"
        >
          <MessageCircle className="h-5 w-5 mr-2 text-amber-400" />
          <div className="flex-1 text-left">
            <p className="font-semibold">Questionnaire Responses</p>
            <p className="text-xs text-muted-foreground">Review school and company submissions</p>
          </div>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};