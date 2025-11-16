import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SERVICES = ["Workshops", "Guest Speakers", "Mentorship Programs", "Equipment Donations", "Online Resources", "Field Trips", "Internships", "Career Guidance"];
const TOPICS = ["Space Science", "Astronomy", "Satellite Technology", "Coding/Programming", "Robotics", "Engineering", "Mathematics", "Physical Sciences", "Data Science", "AI/Machine Learning"];
const PROVINCES = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"];

export const CompanyOffersQuestionnaire = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    respondent_name: "",
    respondent_email: "",
    contact_phone: "",
    organization_name: "",
    company_type: "",
    services_offered: [] as string[],
    topics_can_cover: [] as string[],
    capacity_per_session: "",
    geographic_coverage: [] as string[],
    resources_available: "",
    preferred_contact_method: "",
    additional_info: "",
  });

  const handleCheckboxChange = (field: 'services_offered' | 'topics_can_cover' | 'geographic_coverage', value: string) => {
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
          questionnaire_type: 'company_offers',
          ...formData,
          capacity_per_session: formData.capacity_per_session ? parseInt(formData.capacity_per_session) : null,
        });

      if (error) throw error;

      toast.success("Thank you! Your questionnaire has been submitted successfully.");
      setFormData({
        respondent_name: "",
        respondent_email: "",
        contact_phone: "",
        organization_name: "",
        company_type: "",
        services_offered: [],
        topics_can_cover: [],
        capacity_per_session: "",
        geographic_coverage: [],
        resources_available: "",
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
        <CardTitle>STEM Company Partnership Questionnaire</CardTitle>
        <CardDescription>
          Tell us about the STEM education support and resources your company can provide
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Company/Organization Name *</label>
              <Input
                required
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                placeholder="Enter company name"
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
                placeholder="your.email@company.com"
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

          <div>
            <label className="text-sm font-medium mb-2 block">Company Type *</label>
            <Select value={formData.company_type} onValueChange={(value) => setFormData({ ...formData, company_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select company type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Space/Aerospace">Space/Aerospace</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Research Institution">Research Institution</SelectItem>
                <SelectItem value="NGO/Non-Profit">NGO/Non-Profit</SelectItem>
                <SelectItem value="Government Agency">Government Agency</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Services You Can Offer *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SERVICES.map(service => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={formData.services_offered.includes(service)}
                    onCheckedChange={() => handleCheckboxChange('services_offered', service)}
                  />
                  <label htmlFor={`service-${service}`} className="text-sm cursor-pointer">{service}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">STEM Topics You Can Cover *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TOPICS.map(topic => (
                <div key={topic} className="flex items-center space-x-2">
                  <Checkbox
                    id={`topic-${topic}`}
                    checked={formData.topics_can_cover.includes(topic)}
                    onCheckedChange={() => handleCheckboxChange('topics_can_cover', topic)}
                  />
                  <label htmlFor={`topic-${topic}`} className="text-sm cursor-pointer">{topic}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Geographic Coverage *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROVINCES.map(province => (
                <div key={province} className="flex items-center space-x-2">
                  <Checkbox
                    id={`province-${province}`}
                    checked={formData.geographic_coverage.includes(province)}
                    onCheckedChange={() => handleCheckboxChange('geographic_coverage', province)}
                  />
                  <label htmlFor={`province-${province}`} className="text-sm cursor-pointer">{province}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Capacity Per Session</label>
            <Input
              type="number"
              value={formData.capacity_per_session}
              onChange={(e) => setFormData({ ...formData, capacity_per_session: e.target.value })}
              placeholder="Maximum number of students/participants per session"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Resources Available</label>
            <Textarea
              value={formData.resources_available}
              onChange={(e) => setFormData({ ...formData, resources_available: e.target.value })}
              placeholder="Describe equipment, materials, or resources you can provide or share..."
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
              placeholder="Any other information about your offerings or partnership interests..."
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