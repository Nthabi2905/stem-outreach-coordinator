import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { QuestionnaireResponsesTable } from "@/components/QuestionnaireResponsesTable";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="bg-background border-b sticky top-0 z-10">
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
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold">Questionnaire Responses</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Manage Survey Responses</h2>
            <p className="text-muted-foreground">
              View and manage questionnaire responses from schools and companies. Filter by type, status, and search to find specific responses.
            </p>
          </div>

          <QuestionnaireResponsesTable />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;