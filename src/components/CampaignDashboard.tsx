import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, Mail, Calendar, School } from "lucide-react";

interface CampaignDashboardProps {
  campaignId: string;
}

interface RecommendationWithSchool {
  id: string;
  response_status: string;
  responded_at: string | null;
  school_response: string | null;
  generated_data: any;
  schools: {
    institution_name: string;
  } | null;
}

export default function CampaignDashboard({ campaignId }: CampaignDashboardProps) {
  const [recommendations, setRecommendations] = useState<RecommendationWithSchool[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    loadData();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('campaign-responses')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'school_recommendations',
          filter: `campaign_id=eq.${campaignId}`
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  useEffect(() => {
    // Update countdown every second
    if (campaign?.event_date) {
      const interval = setInterval(() => {
        updateCountdown();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [campaign]);

  const loadData = async () => {
    try {
      // Load campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from("outreach_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Load recommendations
      const { data: recsData, error: recsError } = await supabase
        .from("school_recommendations")
        .select("*, schools(*)")
        .eq("campaign_id", campaignId)
        .eq("is_accepted", true)
        .not("letter_sent_at", "is", null)
        .order("responded_at", { ascending: false });

      if (recsError) throw recsError;
      setRecommendations(recsData || []);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!campaign?.event_date) return;

    const now = new Date().getTime();
    const eventTime = new Date(campaign.event_date).getTime();
    const distance = eventTime - now;

    if (distance < 0) {
      setCountdown("Event has started!");
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
  };

  const stats = {
    total: recommendations.length,
    confirmed: recommendations.filter(r => r.response_status === 'confirmed').length,
    declined: recommendations.filter(r => r.response_status === 'declined').length,
    pending: recommendations.filter(r => r.response_status === 'pending').length,
  };

  const progressPercentage = stats.total > 0 
    ? Math.round(((stats.confirmed + stats.declined) / stats.total) * 100)
    : 0;

  const allConfirmed = stats.total > 0 && stats.confirmed === stats.total;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading campaign dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invited</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <Mail className="w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confirmed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.confirmed}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Declined</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.declined}</CardTitle>
          </CardHeader>
          <CardContent>
            <XCircle className="w-4 h-4 text-orange-600" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Response Progress</CardTitle>
          <CardDescription>
            {stats.confirmed + stats.declined} of {stats.total} schools have responded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">{progressPercentage}% complete</p>
        </CardContent>
      </Card>

      {/* Countdown */}
      {allConfirmed && campaign?.event_date && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <CardTitle className="text-green-900">All Schools Confirmed! 🎉</CardTitle>
                <CardDescription className="text-green-700">
                  Event starts in:
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-900 text-center py-4">
              {countdown}
            </div>
          </CardContent>
        </Card>
      )}

      {/* School Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>School Response Checklist</CardTitle>
          <CardDescription>Track which schools have responded to the invitation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const schoolData = rec.generated_data as any;
              const schoolName = schoolData?.name || rec.schools?.institution_name || "Unknown School";
              
              return (
                <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="mt-0.5">
                    {rec.response_status === 'confirmed' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {rec.response_status === 'declined' && (
                      <XCircle className="w-5 h-5 text-orange-600" />
                    )}
                    {rec.response_status === 'pending' && (
                      <Clock className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <School className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{schoolName}</p>
                      <Badge 
                        variant={
                          rec.response_status === 'confirmed' ? 'default' :
                          rec.response_status === 'declined' ? 'secondary' :
                          'outline'
                        }
                        className={
                          rec.response_status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
                          rec.response_status === 'declined' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }
                      >
                        {rec.response_status === 'confirmed' ? 'Confirmed' :
                         rec.response_status === 'declined' ? 'Declined' :
                         'Awaiting Response'}
                      </Badge>
                    </div>
                    
                    {rec.responded_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Responded on {new Date(rec.responded_at).toLocaleDateString('en-ZA', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                    
                    {rec.school_response && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{rec.school_response}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {recommendations.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No letters have been sent yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
