// EduReach AI - School Outreach Platform
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Hero from "@/components/Hero";
import { SchoolRequestForm } from "@/components/SchoolRequestForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboardView } from "@/components/dashboards/AdminDashboardView";
import { OrganizationDashboardView } from "@/components/dashboards/OrganizationDashboardView";
import { SchoolOfficialDashboardView } from "@/components/dashboards/SchoolOfficialDashboardView";
import { LearnerDashboardView } from "@/components/dashboards/LearnerDashboardView";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setUserRole(null);
        setUserName("");
        setIsLoading(false);
        return;
      }

      try {
        // Get user name from metadata
        const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
        setUserName(fullName);

        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase.rpc('is_current_user_admin');

        if (adminError) {
          console.error('Error checking admin status:', adminError);
          setIsAdmin(false);
        } else {
          setIsAdmin(adminData === true);
        }

        // Get user's role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          setUserRole(null);
        } else {
          setUserRole(roleData?.role || null);
        }
      } catch (error) {
        console.error('Error checking user permissions:', error);
        setIsAdmin(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  // Show loading state
  if (isLoading && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show public view
  if (!user) {
    return (
      <div className="min-h-screen">
        <Hero />
        <section className="py-12 px-6">
          <Tabs defaultValue="request" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="request">Request Support</TabsTrigger>
              <TabsTrigger value="login">Sign In</TabsTrigger>
            </TabsList>
            
            <TabsContent value="request">
              <SchoolRequestForm />
            </TabsContent>
            
            <TabsContent value="login">
              <div className="max-w-md mx-auto text-center bg-card border rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Organisation Access</h2>
                <p className="text-muted-foreground mb-6">
                  Sign in to access the full platform: AI school matching, campaign planning, and impact reporting.
                </p>
                <Button onClick={() => navigate("/auth")} size="lg" className="w-full">
                  Sign In / Sign Up
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    );
  }

  // Admin role
  if (isAdmin || userRole === 'admin') {
    return (
      <AdminDashboardView 
        userEmail={user.email || ""} 
        userName={userName}
      />
    );
  }

  // Organization role
  if (userRole === 'organization') {
    return (
      <OrganizationDashboardView 
        userEmail={user.email || ""} 
        userName={userName}
        userId={user.id}
      />
    );
  }

  // School official role
  if (userRole === 'school_official') {
    return (
      <SchoolOfficialDashboardView 
        userEmail={user.email || ""} 
        userName={userName}
        userId={user.id}
      />
    );
  }

  // Learner role
  if (userRole === 'learner') {
    return (
      <LearnerDashboardView 
        userEmail={user.email || ""} 
        userName={userName}
      />
    );
  }

  // Fallback for users without a role
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome, {userName}!</h2>
            <p className="text-muted-foreground mb-6">
              Your account has been created. Please contact an administrator to assign your role.
            </p>
            <Button 
              onClick={async () => {
                await supabase.auth.signOut();
                toast.success("Signed out successfully");
                navigate("/auth");
              }} 
              variant="outline"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
