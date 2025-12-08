import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "./DashboardHeader";
import { WelcomeBanner } from "./WelcomeBanner";
import { StatCard } from "./StatCard";
import { 
  BookOpen, 
  Users, 
  Calendar,
  Award,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LearnerDashboardViewProps {
  userEmail: string;
  userName: string;
}

export const LearnerDashboardView = ({ userEmail, userName }: LearnerDashboardViewProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader title="Learner Dashboard" onSignOut={handleSignOut} />
      
      <WelcomeBanner 
        name={userName || "Learner"} 
        subtitle="STEM Explorer"
        role="learner"
      />

      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={BookOpen} 
            value={0} 
            label="Workshops Attended" 
            variant="primary" 
          />
          <StatCard 
            icon={Users} 
            value={0} 
            label="Mentors Connected" 
            variant="purple" 
          />
          <StatCard 
            icon={Calendar} 
            value={0} 
            label="Upcoming Sessions" 
            variant="amber" 
          />
          <StatCard 
            icon={Award} 
            value={0} 
            label="Certificates Earned" 
            variant="primary" 
          />
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Coming Soon!</h3>
          <p className="text-muted-foreground mb-4">
            The learner portal is under development. Soon you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 mb-6">
            <li className="flex items-center justify-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Request mentorship from STEM professionals
            </li>
            <li className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Register for upcoming workshops
            </li>
            <li className="flex items-center justify-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Track your learning progress
            </li>
          </ul>
          <Button disabled className="bg-primary/50 text-primary-foreground">
            Request Mentor (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
};
