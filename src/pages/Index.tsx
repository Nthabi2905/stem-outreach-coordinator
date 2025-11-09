// School Outreach Platform - Index Page
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import Hero from "@/components/Hero";
import SchoolFinder from "@/components/SchoolFinder";
import SchoolImporter from "@/components/SchoolImporter";
import { OutreachCampaignWizard } from "@/components/OutreachCampaignWizard";
import { OutreachRequestForm } from "@/components/OutreachRequestForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
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
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is admin or organization
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Hero />
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Access School Database</h2>
            <p className="text-muted-foreground mb-8">
              Sign in to search schools and access features
            </p>
            <Button onClick={() => navigate("/auth")} size="lg">
              Sign In / Sign Up
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">School Outreach Platform</h1>
            {userRole && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded capitalize">
                {userRole}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <Hero />

      <section className="container mx-auto px-4 py-12">
        {!isLoading && (
          <>
            {/* Organizations and Admins - Full access to campaigns */}
            {(isAdmin || userRole === 'organization' || userRole === 'admin') && (
              <Tabs defaultValue="campaign" className="mb-8">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                  <TabsTrigger value="campaign">Outreach Campaign</TabsTrigger>
                  <TabsTrigger value="search">Search Schools</TabsTrigger>
                  <TabsTrigger value="import">Import Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="campaign" className="mt-6">
                  <OutreachCampaignWizard />
                </TabsContent>
                
                <TabsContent value="search" className="mt-6">
                  <SchoolFinder />
                </TabsContent>
                
                <TabsContent value="import" className="mt-6">
                  <SchoolImporter />
                </TabsContent>
              </Tabs>
            )}
            
            {/* School Officials - Request outreach form */}
            {userRole === 'school_official' && !isAdmin && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">School Outreach Portal</h2>
                  <p className="text-muted-foreground">
                    Submit a request for STEM outreach programs at your school
                  </p>
                </div>
                <OutreachRequestForm />
              </div>
            )}
            
            {/* Learners - Mentorship request form (placeholder) */}
            {userRole === 'learner' && !isAdmin && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-card border rounded-lg p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Learner Portal</h2>
                  <p className="text-muted-foreground mb-6">
                    Request mentorship and guidance from STEM professionals
                  </p>
                  <Button size="lg" disabled>
                    Request Mentor (Coming Soon)
                  </Button>
                </div>
              </div>
            )}
            
            {/* Fallback for users without a role */}
            {!userRole && !isAdmin && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-card border rounded-lg p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
                  <p className="text-muted-foreground mb-6">
                    Please contact an administrator to assign your role
                  </p>
                  <SchoolFinder />
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Index;
