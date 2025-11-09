import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const outreachRequestSchema = z.object({
  schoolName: z.string().trim().min(1, "School name is required").max(200, "School name must be less than 200 characters"),
  contactPerson: z.string().trim().min(1, "Contact person is required").max(100, "Name must be less than 100 characters"),
  contactEmail: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  contactPhone: z.string().trim().max(20, "Phone number must be less than 20 characters").optional(),
  outreachType: z.string().min(1, "Please select an outreach type"),
  workshopTopic: z.string().trim().max(500, "Topic must be less than 500 characters").optional(),
  expectedParticipants: z.number().int().positive("Must be a positive number").max(10000, "Number seems too large").optional(),
  additionalNotes: z.string().trim().max(2000, "Notes must be less than 2000 characters").optional(),
});

export const OutreachRequestForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    outreachType: "",
    workshopTopic: "",
    preferredDate: "",
    alternativeDate: "",
    expectedParticipants: "",
    gradeLevels: [] as string[],
    additionalNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    try {
      const validationData = {
        schoolName: formData.schoolName,
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        outreachType: formData.outreachType,
        workshopTopic: formData.workshopTopic || undefined,
        expectedParticipants: formData.expectedParticipants ? parseInt(formData.expectedParticipants) : undefined,
        additionalNotes: formData.additionalNotes || undefined,
      };

      outreachRequestSchema.parse(validationData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to submit a request");
        return;
      }

      const { error } = await supabase.from("outreach_requests").insert({
        user_id: user.id,
        school_name: formData.schoolName.trim(),
        contact_person: formData.contactPerson.trim(),
        contact_email: formData.contactEmail.trim(),
        contact_phone: formData.contactPhone.trim() || null,
        outreach_type: formData.outreachType,
        workshop_topic: formData.workshopTopic.trim() || null,
        preferred_date: formData.preferredDate || null,
        alternative_date: formData.alternativeDate || null,
        expected_participants: formData.expectedParticipants ? parseInt(formData.expectedParticipants) : null,
        grade_levels: formData.gradeLevels.length > 0 ? formData.gradeLevels : null,
        additional_notes: formData.additionalNotes.trim() || null,
      });

      if (error) throw error;

      toast.success("Outreach request submitted successfully! Organizations will review your request.");
      
      // Reset form
      setFormData({
        schoolName: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        outreachType: "",
        workshopTopic: "",
        preferredDate: "",
        alternativeDate: "",
        expectedParticipants: "",
        gradeLevels: [],
        additionalNotes: "",
      });
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGradeLevelToggle = (grade: string) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: prev.gradeLevels.includes(grade)
        ? prev.gradeLevels.filter(g => g !== grade)
        : [...prev.gradeLevels, grade]
    }));
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Outreach Request</CardTitle>
        <CardDescription>
          Request a STEM outreach visit, workshop, or mentorship program for your school
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">School Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="Enter school name"
                required
                maxLength={200}
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Full name"
                  required
                  maxLength={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="email@school.edu"
                  required
                  maxLength={255}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number (Optional)</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+27 12 345 6789"
                maxLength={20}
              />
            </div>
          </div>

          {/* Outreach Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Outreach Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="outreachType">Type of Outreach *</Label>
              <Select
                value={formData.outreachType}
                onValueChange={(value) => setFormData({ ...formData, outreachType: value })}
              >
                <SelectTrigger id="outreachType">
                  <SelectValue placeholder="Select outreach type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="mentorship">Mentorship Program</SelectItem>
                  <SelectItem value="career_day">Career Day</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workshopTopic">Workshop/Program Topic (Optional)</Label>
              <Input
                id="workshopTopic"
                value={formData.workshopTopic}
                onChange={(e) => setFormData({ ...formData, workshopTopic: e.target.value })}
                placeholder="e.g., Robotics, Coding, Environmental Science"
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date (Optional)</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alternativeDate">Alternative Date (Optional)</Label>
                <Input
                  id="alternativeDate"
                  type="date"
                  value={formData.alternativeDate}
                  onChange={(e) => setFormData({ ...formData, alternativeDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedParticipants">Expected Number of Participants (Optional)</Label>
              <Input
                id="expectedParticipants"
                type="number"
                value={formData.expectedParticipants}
                onChange={(e) => setFormData({ ...formData, expectedParticipants: e.target.value })}
                placeholder="e.g., 50"
                min="1"
                max="10000"
              />
            </div>

            <div className="space-y-2">
              <Label>Target Grade Levels (Optional)</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {["R", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((grade) => (
                  <Button
                    key={grade}
                    type="button"
                    variant={formData.gradeLevels.includes(grade) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGradeLevelToggle(grade)}
                    className="w-full"
                  >
                    {grade === "R" ? "R" : `Gr ${grade}`}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                placeholder="Any specific requirements, topics of interest, or additional information..."
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.additionalNotes.length}/2000 characters
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};