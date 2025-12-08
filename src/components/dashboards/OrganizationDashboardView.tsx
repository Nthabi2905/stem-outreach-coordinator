import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "./DashboardHeader";
import { WelcomeBanner } from "./WelcomeBanner";
import { StatCard } from "./StatCard";
import { 
  Calendar, 
  CheckCircle, 
  CalendarCheck,
  CheckCheck,
  Lightbulb,
  Shield,
  GraduationCap,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

interface OrganizationDashboardViewProps {
  userEmail: string;
  userName: string;
  userId: string;
}

export const OrganizationDashboardView = ({ userEmail, userName, userId }: OrganizationDashboardViewProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    planned: 0,
    confirmed: 0,
    upcoming: 0,
    completed: 0,
  });
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanningTool, setShowPlanningTool] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const { data: campaigns, error } = await supabase
        .from("outreach_campaigns")
        .select("*, school_recommendations(*)");

      if (error) throw error;

      const planned = (campaigns || []).filter(c => c.status === "draft").length;
      const completed = (campaigns || []).filter(c => c.status === "completed").length;
      
      // Count confirmed from recommendations
      let confirmed = 0;
      let upcoming = 0;
      const activities: any[] = [];
      
      (campaigns || []).forEach(campaign => {
        const recs = campaign.school_recommendations || [];
        const confirmedRecs = recs.filter((r: any) => r.response_status === "confirmed");
        confirmed += confirmedRecs.length;
        
        if (campaign.event_date && new Date(campaign.event_date) > new Date()) {
          upcoming++;
          confirmedRecs.forEach((rec: any) => {
            activities.push({
              id: rec.id,
              name: rec.generated_data?.schoolName || "School",
              type: "Robotics & Coding",
              school: rec.generated_data?.schoolName,
              date: campaign.event_date,
              status: rec.response_status,
            });
          });
        }
      });

      setStats({ planned, confirmed, upcoming, completed });
      setUpcomingActivities(activities.slice(0, 5));
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
      <DashboardHeader title="STEM Innovate SA Dashboard" onSignOut={handleSignOut} />
      
      <WelcomeBanner 
        name={userName || "Organization User"} 
        subtitle="Robotics, Coding"
        role="organization"
      />

      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={Calendar} 
            value={stats.planned} 
            label="Planned" 
            variant="amber" 
          />
          <StatCard 
            icon={CheckCircle} 
            value={stats.confirmed} 
            label="Confirmed" 
            variant="primary" 
          />
          <StatCard 
            icon={CalendarCheck} 
            value={stats.upcoming} 
            label="Upcoming" 
            variant="purple" 
          />
          <StatCard 
            icon={CheckCheck} 
            value={stats.completed} 
            label="Completed" 
            variant="primary" 
          />
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Plan Your Next Outreach</h4>
            <p className="text-sm text-muted-foreground">Use AI to generate batches of underserved schools</p>
          </div>
          <Button 
            onClick={() => setShowPlanningTool(true)}
            className="bg-primary text-primary-foreground"
          >
            Start
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold mb-4">Upcoming Activities</h3>
        {upcomingActivities.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No upcoming activities</p>
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
                    <h4 className="font-semibold">{activity.name}</h4>
                    <p className="text-sm text-muted-foreground">{activity.type}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>{activity.school}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(activity.date), "MMM d, yyyy")}</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>09:00 - 14:00</span>
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
          onClick={() => navigate("/")}
          className="bg-primary text-primary-foreground rounded-full px-6 py-6 shadow-lg shadow-primary/30"
        >
          <Shield className="h-5 w-5 mr-2" />
          Plan Outreach
        </Button>
      </div>
    </div>
  );
};
