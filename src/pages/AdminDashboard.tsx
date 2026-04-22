import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList, Users, Shield, Building2 } from "lucide-react";
import { QuestionnaireResponsesTable } from "@/components/QuestionnaireResponsesTable";
import { UserRoleManagement } from "@/components/UserRoleManagement";
import { OrganizationManagement } from "@/components/OrganizationManagement";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

      const { data: adminData, error } = await supabase.rpc('is_current_user_admin');

      if (error) throw error;

      if (!adminData) {
        toast.error("You don't have permission to access this page");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error: any) {
      console.error('Error checking admin access:', error);
      toast.error("Failed to verify access permissions");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      {/* Playful background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[hsl(var(--logo-teal))]/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-[hsl(var(--logo-purple))]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[hsl(var(--logo-orange))]/15 blur-3xl" />

      <div className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-muted-foreground">Manage your EduReach community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 relative">
        <Tabs defaultValue="questionnaires" className="space-y-6">
          <TabsList className="bg-card/70 backdrop-blur-sm border shadow-md p-1.5 h-auto rounded-2xl">
            <TabsTrigger
              value="questionnaires"
              className="gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--logo-teal))] data-[state=active]:to-[hsl(var(--logo-blue))] data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <ClipboardList className="h-4 w-4" />
              Questionnaires
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--logo-purple))] data-[state=active]:to-[hsl(var(--logo-pink))] data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger
              value="organizations"
              className="gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--logo-orange))] data-[state=active]:to-[hsl(var(--logo-yellow))] data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <Building2 className="h-4 w-4" />
              Organizations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questionnaires">
            <div className="bg-card/90 backdrop-blur-sm border rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[hsl(var(--logo-teal))] to-[hsl(var(--logo-blue))]" />
              <div className="mb-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-[hsl(var(--logo-teal))]/15 flex items-center justify-center shrink-0">
                  <ClipboardList className="h-6 w-6 text-[hsl(var(--logo-teal))]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-1">Manage Survey Responses</h2>
                  <p className="text-muted-foreground">
                    View and manage questionnaire responses from schools and companies.
                  </p>
                </div>
              </div>
              <QuestionnaireResponsesTable />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-card/90 backdrop-blur-sm border rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[hsl(var(--logo-purple))] to-[hsl(var(--logo-pink))]" />
              <div className="mb-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-[hsl(var(--logo-purple))]/15 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6 text-[hsl(var(--logo-purple))]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-1">User Role Management</h2>
                  <p className="text-muted-foreground">
                    Assign and manage roles for platform users. Promote users to organization or admin roles.
                  </p>
                </div>
              </div>
              <UserRoleManagement />
            </div>
          </TabsContent>

          <TabsContent value="organizations">
            <div className="bg-card/90 backdrop-blur-sm border rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[hsl(var(--logo-orange))] to-[hsl(var(--logo-yellow))]" />
              <div className="mb-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-[hsl(var(--logo-orange))]/15 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-[hsl(var(--logo-orange))]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-1">Organization Management</h2>
                  <p className="text-muted-foreground">
                    Create and manage organizations. Add or remove members from each organization.
                  </p>
                </div>
              </div>
              <OrganizationManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;