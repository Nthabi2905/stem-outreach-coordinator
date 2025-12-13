import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "./DashboardHeader";
import { WelcomeBanner } from "./WelcomeBanner";
import { StatCard } from "./StatCard";
import { 
  ClipboardList, 
  CheckCircle, 
  CalendarCheck,
  TrendingUp,
  Plus,
  Calendar,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SchoolRequestForm } from "@/components/SchoolRequestForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SchoolOfficialDashboardViewProps {
  userEmail: string;
  userName: string;
  userId: string;
}

export const SchoolOfficialDashboardView = ({ userEmail, userName, userId }: SchoolOfficialDashboardViewProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    matched: 0,
    upcoming: 0,
    totalOutreaches: 0,
  });
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const { data: requests, error } = await supabase
        .from("outreach_requests")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const pending = (requests || []).filter(r => r.status === "pending").length;
      const approved = (requests || []).filter(r => r.status === "approved").length;
      const upcoming = (requests || []).filter(r => 
        r.status === "approved" && r.preferred_date && new Date(r.preferred_date) > new Date()
      ).length;

      setStats({
        pendingRequests: pending,
        matched: approved,
        upcoming,
        totalOutreaches: requests?.length || 0,
      });

      // Get upcoming activities
      const upcomingReqs = (requests || [])
        .filter(r => r.status === "approved" && r.preferred_date)
        .slice(0, 5)
        .map(r => ({
          id: r.id,
          type: r.outreach_type,
          date: r.preferred_date,
          status: r.status,
        }));
      setUpcomingActivities(upcomingReqs);
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
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader title="School Dashboard" onSignOut={handleSignOut} role="school_official" />
      
      <WelcomeBanner 
        name={userName || "School Official"} 
        subtitle={userEmail}
        role="school_official"
      />

      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={ClipboardList} 
            value={stats.pendingRequests} 
            label="Pending Requests" 
            variant="amber" 
          />
          <StatCard 
            icon={CheckCircle} 
            value={stats.matched} 
            label="Matched" 
            variant="primary" 
          />
          <StatCard 
            icon={CalendarCheck} 
            value={stats.upcoming} 
            label="Upcoming" 
            variant="purple" 
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming Activities</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary"
            onClick={() => setShowRequestForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Request
          </Button>
        </div>
        
        {upcomingActivities.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No upcoming activities</p>
            <p className="text-sm text-muted-foreground mt-1">Submit a request to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingActivities.map((activity) => (
              <div 
                key={activity.id}
                className="bg-card border border-border/50 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold capitalize">{activity.type?.replace(/_/g, " ")}</h4>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{activity.date}</span>
                    </div>
                  </div>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full capitalize">
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={() => setShowRequestForm(true)}
          className="bg-primary text-primary-foreground rounded-full px-6 py-6 shadow-lg shadow-primary/30"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Request
        </Button>
      </div>

      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Outreach Request</DialogTitle>
          </DialogHeader>
          <SchoolRequestForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};
