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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdminDashboardViewProps {
  userEmail: string;
  userName: string;
}

export const AdminDashboardView = ({ userEmail, userName }: AdminDashboardViewProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSchools: 0,
    organizations: 0,
    underservedSchools: 0,
    pendingRequests: 0,
    completedActivities: 0,
    totalOutreaches: 0,
  });
  const [provincialDistribution, setProvincialDistribution] = useState<{ province: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [schoolsRes, orgsRes, requestsRes, campaignsRes] = await Promise.all([
        supabase.from("schools").select("id, quintile, province", { count: "exact" }),
        supabase.from("organizations").select("id", { count: "exact" }),
        supabase.from("outreach_requests").select("id, status", { count: "exact" }),
        supabase.from("outreach_campaigns").select("id, status", { count: "exact" }),
      ]);

      const schools = schoolsRes.data || [];
      const underserved = schools.filter(s => s.quintile && parseInt(s.quintile) <= 2).length;
      const pending = (requestsRes.data || []).filter(r => r.status === "pending").length;
      const completed = (campaignsRes.data || []).filter(c => c.status === "completed").length;

      // Calculate provincial distribution
      const provinceCounts: Record<string, number> = {};
      schools.forEach(s => {
        if (s.province) {
          provinceCounts[s.province] = (provinceCounts[s.province] || 0) + 1;
        }
      });
      const distribution = Object.entries(provinceCounts)
        .map(([province, count]) => ({ province, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalSchools: schoolsRes.count || 0,
        organizations: orgsRes.count || 0,
        underservedSchools: underserved,
        pendingRequests: pending,
        completedActivities: completed,
        totalOutreaches: campaignsRes.count || 0,
      });
      setProvincialDistribution(distribution);
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Admin Dashboard" onSignOut={handleSignOut} />
      
      <WelcomeBanner 
        name={userName || "System Administrator"} 
        subtitle="System Administrator"
        role="admin"
      />

      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold mb-4">Platform Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={GraduationCap} 
            value={stats.totalSchools} 
            label="Total Schools" 
            variant="primary" 
          />
          <StatCard 
            icon={Building2} 
            value={stats.organizations} 
            label="Organizations" 
            variant="purple" 
          />
          <StatCard 
            icon={AlertTriangle} 
            value={stats.underservedSchools} 
            label="Underserved Schools" 
            variant="amber" 
          />
          <StatCard 
            icon={MessageCircle} 
            value={stats.pendingRequests} 
            label="Pending Requests" 
            variant="orange" 
          />
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold mb-4">Impact Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={CheckCheck} 
            value={stats.completedActivities} 
            label="Completed Activities" 
            variant="primary" 
          />
          <StatCard 
            icon={TrendingUp} 
            value={stats.totalOutreaches} 
            label="Total Outreaches" 
            variant="primary" 
          />
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold mb-4">Provincial Distribution</h3>
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
          {provincialDistribution.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No data available</p>
          ) : (
            provincialDistribution.map((item) => (
              <div key={item.province} className="flex items-center justify-between">
                <span className="text-foreground">{item.province}</span>
                <span className="text-primary text-sm bg-primary/10 px-3 py-1 rounded-full">
                  {item.count} schools
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        <Button 
          onClick={() => navigate("/admin/responses")} 
          className="w-full bg-gradient-to-r from-purple-500/20 to-primary/20 border border-purple-500/30 text-foreground hover:bg-purple-500/30"
          variant="outline"
        >
          <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
          <div className="flex-1 text-left">
            <p className="font-semibold">Platform Analytics</p>
            <p className="text-xs text-muted-foreground">View detailed reports and insights</p>
          </div>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
