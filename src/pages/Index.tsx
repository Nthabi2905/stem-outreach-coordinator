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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Use RPC function instead of direct table query for better security
        const { data, error } = await supabase.rpc('is_current_user_admin');

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
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
            {isAdmin && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                Admin
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
        {isAdmin && !isLoading && (
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
        
        {!isAdmin && <SchoolFinder />}
      </section>
    </div>
  );
};

export default Index;
