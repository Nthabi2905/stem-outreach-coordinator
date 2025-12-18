import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboards/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignDashboard from "@/components/CampaignDashboard";
import CampaignMapView from "@/components/CampaignMapView";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  CheckCircle2, 
  Clock,
  XCircle,
  Sparkles,
  ArrowRight,
  FileText,
  List,
  Map
} from "lucide-react";

interface Campaign {
  id: string;
  province: string;
  district: string;
  school_type: string;
  status: string;
  visit_date: string | null;
  created_at: string;
  visit_details: any;
  stats?: {
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
  };
}

interface SchoolRecommendation {
  id: string;
  response_status: string;
  generated_data: any;
  campaign_id: string;
}

const Campaigns = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allRecommendations, setAllRecommendations] = useState<SchoolRecommendation[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const selectedCampaignId = searchParams.get("id");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    loadCampaigns();
  };

  const loadCampaigns = async () => {
    try {
      // Load campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("outreach_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      // Load all recommendations for map view
      const campaignIds = (campaignsData || []).map(c => c.id);
      let allRecs: SchoolRecommendation[] = [];
      
      if (campaignIds.length > 0) {
        const { data: recsData, error: recsError } = await supabase
          .from("school_recommendations")
          .select("id, response_status, generated_data, campaign_id")
          .in("campaign_id", campaignIds)
          .eq("is_accepted", true);
        
        if (!recsError && recsData) {
          allRecs = recsData;
        }
      }
      
      setAllRecommendations(allRecs);

      // Load stats for each campaign
      const campaignsWithStats = (campaignsData || []).map(campaign => {
        const recs = allRecs.filter(r => r.campaign_id === campaign.id);
        const stats = {
          total: recs.length,
          confirmed: recs.filter(r => r.response_status === 'confirmed').length,
          declined: recs.filter(r => r.response_status === 'declined').length,
          pending: recs.filter(r => r.response_status === 'pending').length,
        };
        return { ...campaign, stats };
      });

      setCampaigns(campaignsWithStats);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-muted text-muted-foreground";
      case "letters_sent": return "bg-blue-100 text-blue-700";
      case "in_progress": return "bg-amber-100 text-amber-700";
      case "completed": return "bg-green-100 text-green-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "Draft";
      case "letters_sent": return "Letters Sent";
      case "in_progress": return "In Progress";
      case "completed": return "Completed";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  // If a campaign is selected, show the detailed view
  if (selectedCampaignId) {
    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
    
    return (
      <div className="min-h-screen bg-background pb-24">
        <DashboardHeader title="Campaign Details" onSignOut={handleSignOut} />
        
        <div className="px-4 py-6 space-y-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSearchParams({})}
            className="-ml-2 text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to All Campaigns
          </Button>

          {selectedCampaign && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">
                        {selectedCampaign.province} - {selectedCampaign.district}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(selectedCampaign.created_at).toLocaleDateString('en-ZA', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(selectedCampaign.status)}>
                    {getStatusLabel(selectedCampaign.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <CampaignDashboard campaignId={selectedCampaignId} />
        </div>
      </div>
    );
  }

  // Show campaign list
  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader title="Campaigns" onSignOut={handleSignOut} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background px-4 py-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/")}
          className="mb-4 -ml-2 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Campaign Tracker</h1>
              <p className="text-muted-foreground">Monitor school responses & engagement</p>
            </div>
          </div>
          <Button onClick={() => navigate("/planning")}>
            <Sparkles className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                  <p className="text-xs text-muted-foreground">Total Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {campaigns.reduce((sum, c) => sum + (c.stats?.confirmed || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {campaigns.reduce((sum, c) => sum + (c.stats?.pending || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {campaigns.reduce((sum, c) => sum + (c.stats?.total || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Schools Reached</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle and Content */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Your Campaigns</h2>
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="space-y-3 mt-0">
            {campaigns.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No campaigns yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first outreach campaign using the AI Planning Tool
                  </p>
                  <Button onClick={() => navigate("/planning")}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              campaigns.map(campaign => {
                const responseRate = campaign.stats?.total 
                  ? Math.round(((campaign.stats.confirmed + campaign.stats.declined) / campaign.stats.total) * 100)
                  : 0;

                return (
                  <Card 
                    key={campaign.id}
                    className="cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => setSearchParams({ id: campaign.id })}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{campaign.province}</h3>
                            <p className="text-sm text-muted-foreground">{campaign.district}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusLabel(campaign.status)}
                        </Badge>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{campaign.stats?.total || 0} schools</span>
                        </div>
                        {campaign.visit_date && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(campaign.visit_date).toLocaleDateString('en-ZA', {
                              month: 'short',
                              day: 'numeric'
                            })}</span>
                          </div>
                        )}
                      </div>

                      {/* Response Progress */}
                      {(campaign.stats?.total || 0) > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Response rate</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">{campaign.stats?.confirmed} confirmed</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-blue-600">{campaign.stats?.pending} pending</span>
                            </div>
                          </div>
                          <Progress value={responseRate} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-end mt-3">
                        <Button variant="ghost" size="sm" className="text-primary">
                          View Details
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            {allRecommendations.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Map className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No schools to display</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a campaign and add schools to see them on the map
                  </p>
                  <Button onClick={() => navigate("/planning")}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <CampaignMapView recommendations={allRecommendations} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Campaigns;