import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, School, BookOpen, Bot, FlaskConical, GraduationCap, Users } from "lucide-react";
import { z } from "zod";

const requestSchema = z.object({
  schoolName: z.string().trim().min(1, "School name is required").max(200, "School name must be less than 200 characters"),
  contactPerson: z.string().trim().min(1, "Contact person is required").max(100, "Name must be less than 100 characters"),
  contactEmail: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  contactPhone: z.string().trim().max(20, "Phone number must be less than 20 characters").optional(),
  outreachType: z.string().min(1, "Please select a support type"),
  workshopTopic: z.string().trim().max(500, "Topic must be less than 500 characters").optional(),
  expectedParticipants: z.number().int().positive("Must be a positive number").max(10000, "Number seems too large").optional(),
  additionalNotes: z.string().trim().max(2000, "Notes must be less than 2000 characters").optional(),
});

const OUTREACH_TYPES = [
  { value: "teacher_workshop", label: "Teacher Development Workshop", icon: GraduationCap, description: "Professional development for educators" },
  { value: "learner_outreach", label: "Learner Outreach Programme", icon: Users, description: "STEM engagement activities for students" },
  { value: "robotics_support", label: "Robotics & Coding Support", icon: Bot, description: "Hands-on robotics and programming sessions" },
  { value: "practical_experiments", label: "Practical Science Experiments", icon: FlaskConical, description: "Interactive science demonstrations" },
  { value: "space_science", label: "Space Science Programme", icon: BookOpen, description: "Astronomy and space exploration activities" },
  { value: "career_guidance", label: "STEM Career Guidance", icon: School, description: "Career awareness and mentorship" },
];

export const SchoolRequestForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

      requestSchema.parse(validationData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Check if user is logged in (optional)
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("outreach_requests").insert({
        user_id: user?.id || null, // Allow null for public submissions
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

      setSubmitted(true);
      toast.success("Request submitted successfully!");
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

  const resetForm = () => {
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
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for your request. Our AI will match your school with the most suitable STEM organisation. 
            You will receive a confirmation email at <strong>{formData.contactEmail}</strong>.
          </p>
          <Button onClick={resetForm} variant="outline">
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <School className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Request STEM Support</CardTitle>
        <CardDescription className="text-base">
          Submit a request for teacher workshops, learner outreach, robotics support, or practical experiments. 
          Our AI will match your school with the best organisation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              School Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="e.g., Soweto High School"
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
                  placeholder="email@school.edu.za"
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

          {/* Support Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What Support Do You Need?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OUTREACH_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.outreachType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, outreachType: type.value })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-md ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Details</h3>

            <div className="space-y-2">
              <Label htmlFor="workshopTopic">Specific Topic or Focus Area (Optional)</Label>
              <Input
                id="workshopTopic"
                value={formData.workshopTopic}
                onChange={(e) => setFormData({ ...formData, workshopTopic: e.target.value })}
                placeholder="e.g., Introduction to Python, Rocket building, Space weather"
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
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {["R", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((grade) => (
                  <Button
                    key={grade}
                    type="button"
                    variant={formData.gradeLevels.includes(grade) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGradeLevelToggle(grade)}
                    className="w-full"
                  >
                    {grade === "R" ? "R" : `${grade}`}
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
                placeholder="Any specific requirements, topics of interest, or additional information about your school's needs..."
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.additionalNotes.length}/2000 characters
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !formData.outreachType}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By submitting, you agree to be contacted by STEM organisations regarding your request.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
