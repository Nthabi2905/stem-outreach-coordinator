import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, School } from "lucide-react";

export default function SchoolResponse() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [alreadyResponded, setAlreadyResponded] = useState(false);

  useEffect(() => {
    loadRecommendation();
  }, [token]);

  const loadRecommendation = async () => {
    if (!token) {
      toast.error("Invalid response link");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("school_recommendations")
        .select("*, schools(*), outreach_campaigns(*)")
        .eq("response_token", token)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Invalid or expired response link");
        setLoading(false);
        return;
      }

      setRecommendation(data);
      
      // Check if already responded
      if (data.response_status !== 'pending') {
        setAlreadyResponded(true);
      }

    } catch (error: any) {
      console.error("Error loading recommendation:", error);
      toast.error("Failed to load invitation details");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (status: 'confirmed' | 'declined') => {
    if (!recommendation) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("school_recommendations")
        .update({
          response_status: status,
          school_response: response || null,
          responded_at: new Date().toISOString(),
        })
        .eq("response_token", token);

      if (error) throw error;

      toast.success(
        status === 'confirmed' 
          ? "Thank you! Your attendance has been confirmed." 
          : "Thank you for your response."
      );
      
      setAlreadyResponded(true);
      
    } catch (error: any) {
      console.error("Error submitting response:", error);
      toast.error("Failed to submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Link</CardTitle>
            <CardDescription>
              This response link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const schoolData = recommendation.generated_data as any;
  const schoolName = schoolData?.name || recommendation.schools?.institution_name;
  const campaign = recommendation.outreach_campaigns;
  const visitDetails = campaign?.visit_details as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <School className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">STEM Outreach Program Invitation</CardTitle>
            <CardDescription className="text-lg">
              {schoolName}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Program</h3>
              <p>{visitDetails?.programDescription || 'STEM Outreach Program'}</p>
            </div>
            
            {visitDetails?.visitDate && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Date</h3>
                <p>{new Date(visitDetails.visitDate).toLocaleDateString('en-ZA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            )}

            {visitDetails?.visitTime && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Time</h3>
                <p>{visitDetails.visitTime}</p>
              </div>
            )}

            {visitDetails?.duration && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Duration</h3>
                <p>{visitDetails.duration}</p>
              </div>
            )}

            {visitDetails?.targetGrades && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Target Grades</h3>
                <p>{visitDetails.targetGrades}</p>
              </div>
            )}

            {visitDetails?.expectedParticipants && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Expected Participants</h3>
                <p>{visitDetails.expectedParticipants}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Letter */}
        <Card>
          <CardHeader>
            <CardTitle>Invitation Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/30 p-6 rounded-lg">
              {recommendation.generated_letter}
            </div>
          </CardContent>
        </Card>

        {/* Response Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {alreadyResponded ? "Response Submitted" : "Respond to Invitation"}
            </CardTitle>
            <CardDescription>
              {alreadyResponded 
                ? `You ${recommendation.response_status === 'confirmed' ? 'confirmed' : 'declined'} attendance on ${new Date(recommendation.responded_at).toLocaleDateString()}`
                : "Please confirm whether your school can attend this event"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!alreadyResponded && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Additional Comments (Optional)
                  </label>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Any questions or special requirements?"
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => handleResponse('confirmed')}
                    disabled={submitting}
                    className="flex-1"
                    size="lg"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Confirm Attendance
                  </Button>

                  <Button
                    onClick={() => handleResponse('declined')}
                    disabled={submitting}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Decline
                  </Button>
                </div>
              </>
            )}

            {alreadyResponded && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                recommendation.response_status === 'confirmed' 
                  ? 'bg-green-50 text-green-900 border border-green-200' 
                  : 'bg-orange-50 text-orange-900 border border-orange-200'
              }`}>
                {recommendation.response_status === 'confirmed' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                <div>
                  <p className="font-semibold">
                    {recommendation.response_status === 'confirmed' 
                      ? 'Attendance Confirmed' 
                      : 'Attendance Declined'}
                  </p>
                  {recommendation.school_response && (
                    <p className="text-sm mt-1">{recommendation.school_response}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
