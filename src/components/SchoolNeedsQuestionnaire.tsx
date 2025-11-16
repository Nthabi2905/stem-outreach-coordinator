import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PROVINCES = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"];
const SUBJECTS = ["Mathematics", "Physical Sciences", "Life Sciences", "Technology", "Engineering", "Coding/Programming", "Robotics", "Space Science"];
const TOPICS = ["Career Guidance", "Hands-on Workshops", "Lab Equipment", "Guest Speakers", "Field Trips", "Online Resources", "Mentorship Programs"];
const GRADES = ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

export const SchoolNeedsQuestionnaire = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    respondent_name: "",
    respondent_email: "",
    contact_phone: "",
    organization_name: "",
    school_province: "",
    school_district: "",
    school_type: "",
    student_count: "",
    subjects_interested: [] as string[],
    preferred_topics: [] as string[],
    grade_levels: [] as string[],
    resources_needed: "",
    preferred_contact_method: "",
    additional_info: "",
  });

  const handleCheckboxChange = (field: 'subjects_interested' | 'preferred_topics' | 'grade_levels', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('questionnaire_responses')
        .insert({
          questionnaire_type: 'school_needs',
          ...formData,
          student_count: formData.student_count ? parseInt(formData.student_count) : null,
        });

      if (error) throw error;

      toast.success("Thank you! Your questionnaire has been submitted successfully.");
      setFormData({
        respondent_name: "",
        respondent_email: "",
        contact_phone: "",
        organization_name: "",
        school_province: "",
        school_district: "",
        school_type: "",
        student_count: "",
        subjects_interested: [],
        preferred_topics: [],
        grade_levels: [],
        resources_needed: "",
        preferred_contact_method: "",
        additional_info: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit questionnaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>School STEM Needs Assessment</CardTitle>
        <CardDescription>
          Help us understand your school's STEM education needs and interests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">School Name *</label>
              <Input
                required
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                placeholder="Enter school name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Contact Person *</label>
              <Input
                required
                value={formData.respondent_name}
                onChange={(e) => setFormData({ ...formData, respondent_name: e.target.value })}
                placeholder="Your name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email *</label>
              <Input
                type="email"
                required
                value={formData.respondent_email}
                onChange={(e) => setFormData({ ...formData, respondent_email: e.target.value })}
                placeholder="your.email@school.co.za"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phone Number</label>
              <Input
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="0XX XXX XXXX"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Province *</label>
              <Select value={formData.school_province} onValueChange={(value) => setFormData({ ...formData, school_province: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">District</label>
              <Input
                value={formData.school_district}
                onChange={(e) => setFormData({ ...formData, school_district: e.target.value })}
                placeholder="District name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">School Type</label>
              <Select value={formData.school_type} onValueChange={(value) => setFormData({ ...formData, school_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Independent">Independent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Number of Students</label>
            <Input
              type="number"
              value={formData.student_count}
              onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
              placeholder="Total number of students"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Grade Levels Interested *</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {GRADES.map(grade => (
                <div key={grade} className="flex items-center space-x-2">
                  <Checkbox
                    id={`grade-${grade}`}
                    checked={formData.grade_levels.includes(grade)}
                    onCheckedChange={() => handleCheckboxChange('grade_levels', grade)}
                  />
                  <label htmlFor={`grade-${grade}`} className="text-sm cursor-pointer">{grade}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">STEM Subjects of Interest *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SUBJECTS.map(subject => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subject-${subject}`}
                    checked={formData.subjects_interested.includes(subject)}
                    onCheckedChange={() => handleCheckboxChange('subjects_interested', subject)}
                  />
                  <label htmlFor={`subject-${subject}`} className="text-sm cursor-pointer">{subject}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Preferred Support Topics *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TOPICS.map(topic => (
                <div key={topic} className="flex items-center space-x-2">
                  <Checkbox
                    id={`topic-${topic}`}
                    checked={formData.preferred_topics.includes(topic)}
                    onCheckedChange={() => handleCheckboxChange('preferred_topics', topic)}
                  />
                  <label htmlFor={`topic-${topic}`} className="text-sm cursor-pointer">{topic}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Specific Resources Needed</label>
            <Textarea
              value={formData.resources_needed}
              onChange={(e) => setFormData({ ...formData, resources_needed: e.target.value })}
              placeholder="Describe specific equipment, materials, or resources your school needs..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Preferred Contact Method</label>
            <Select value={formData.preferred_contact_method} onValueChange={(value) => setFormData({ ...formData, preferred_contact_method: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional Information</label>
            <Textarea
              value={formData.additional_info}
              onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
              placeholder="Any other information you'd like to share..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Questionnaire"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};