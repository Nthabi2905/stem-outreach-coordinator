import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, Search, Filter } from "lucide-react";

type QuestionnaireResponse = {
  id: string;
  questionnaire_type: 'school_needs' | 'company_offers';
  respondent_email: string;
  respondent_name: string;
  organization_name: string;
  contact_phone: string | null;
  school_province: string | null;
  school_district: string | null;
  school_type: string | null;
  grade_levels: string[] | null;
  student_count: number | null;
  subjects_interested: string[] | null;
  resources_needed: string | null;
  preferred_topics: string[] | null;
  company_type: string | null;
  services_offered: string[] | null;
  topics_can_cover: string[] | null;
  capacity_per_session: number | null;
  geographic_coverage: string[] | null;
  resources_available: string | null;
  additional_info: string | null;
  preferred_contact_method: string | null;
  status: string;
  created_at: string;
};

export const QuestionnaireResponsesTable = () => {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<QuestionnaireResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<QuestionnaireResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchResponses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [responses, typeFilter, statusFilter, searchTerm]);

  const fetchResponses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch responses: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...responses];

    if (typeFilter !== "all") {
      filtered = filtered.filter(r => r.questionnaire_type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.organization_name.toLowerCase().includes(search) ||
        r.respondent_name.toLowerCase().includes(search) ||
        r.respondent_email.toLowerCase().includes(search)
      );
    }

    setFilteredResponses(filtered);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('questionnaire_responses')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success("Status updated successfully");
      fetchResponses();
      
      if (selectedResponse?.id === id) {
        setSelectedResponse({ ...selectedResponse, status: newStatus });
      }
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'contacted': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'declined': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'school_needs' ? 'School Needs' : 'Company Offers';
  };

  const getTypeBadgeColor = (type: string) => {
    return type === 'school_needs' ? 'bg-purple-500' : 'bg-cyan-500';
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading responses...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="school_needs">School Needs</SelectItem>
              <SelectItem value="company_offers">Company Offers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredResponses.length} of {responses.length} responses
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResponses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No responses found
                </TableCell>
              </TableRow>
            ) : (
              filteredResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>
                    <Badge className={getTypeBadgeColor(response.questionnaire_type)}>
                      {getTypeLabel(response.questionnaire_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{response.organization_name}</TableCell>
                  <TableCell>{response.respondent_name}</TableCell>
                  <TableCell>{response.respondent_email}</TableCell>
                  <TableCell>
                    <Select
                      value={response.status}
                      onValueChange={(value) => updateStatus(response.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <Badge className={getStatusColor(response.status)}>
                          {response.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(response.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedResponse(response);
                        setIsDetailOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
            <DialogDescription>
              {selectedResponse && getTypeLabel(selectedResponse.questionnaire_type)} - {selectedResponse?.organization_name}
            </DialogDescription>
          </DialogHeader>

          {selectedResponse && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Contact Person</h4>
                  <p>{selectedResponse.respondent_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Email</h4>
                  <p>{selectedResponse.respondent_email}</p>
                </div>
                {selectedResponse.contact_phone && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Phone</h4>
                    <p>{selectedResponse.contact_phone}</p>
                  </div>
                )}
                {selectedResponse.preferred_contact_method && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Preferred Contact</h4>
                    <p>{selectedResponse.preferred_contact_method}</p>
                  </div>
                )}
              </div>

              {selectedResponse.questionnaire_type === 'school_needs' ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedResponse.school_province && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Province</h4>
                        <p>{selectedResponse.school_province}</p>
                      </div>
                    )}
                    {selectedResponse.school_district && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">District</h4>
                        <p>{selectedResponse.school_district}</p>
                      </div>
                    )}
                    {selectedResponse.school_type && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">School Type</h4>
                        <p>{selectedResponse.school_type}</p>
                      </div>
                    )}
                    {selectedResponse.student_count && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Student Count</h4>
                        <p>{selectedResponse.student_count}</p>
                      </div>
                    )}
                  </div>

                  {selectedResponse.grade_levels && selectedResponse.grade_levels.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Grade Levels</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResponse.grade_levels.map(grade => (
                          <Badge key={grade} variant="secondary">{grade}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResponse.subjects_interested && selectedResponse.subjects_interested.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Subjects Interested</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResponse.subjects_interested.map(subject => (
                          <Badge key={subject} variant="secondary">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResponse.preferred_topics && selectedResponse.preferred_topics.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Preferred Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResponse.preferred_topics.map(topic => (
                          <Badge key={topic} variant="secondary">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResponse.resources_needed && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Resources Needed</h4>
                      <p className="whitespace-pre-wrap">{selectedResponse.resources_needed}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {selectedResponse.company_type && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Company Type</h4>
                      <p>{selectedResponse.company_type}</p>
                    </div>
                  )}

                  {selectedResponse.services_offered && selectedResponse.services_offered.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Services Offered</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResponse.services_offered.map(service => (
                          <Badge key={service} variant="secondary">{service}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResponse.topics_can_cover && selectedResponse.topics_can_cover.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Topics Can Cover</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResponse.topics_can_cover.map(topic => (
                          <Badge key={topic} variant="secondary">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResponse.geographic_coverage && selectedResponse.geographic_coverage.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Geographic Coverage</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResponse.geographic_coverage.map(location => (
                          <Badge key={location} variant="secondary">{location}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResponse.capacity_per_session && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Capacity Per Session</h4>
                      <p>{selectedResponse.capacity_per_session} participants</p>
                    </div>
                  )}

                  {selectedResponse.resources_available && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Resources Available</h4>
                      <p className="whitespace-pre-wrap">{selectedResponse.resources_available}</p>
                    </div>
                  )}
                </>
              )}

              {selectedResponse.additional_info && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Additional Information</h4>
                  <p className="whitespace-pre-wrap">{selectedResponse.additional_info}</p>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Status</h4>
                  <Select
                    value={selectedResponse.status}
                    onValueChange={(value) => updateStatus(selectedResponse.id, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <Badge className={getStatusColor(selectedResponse.status)}>
                        {selectedResponse.status}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Submitted</h4>
                  <p>{new Date(selectedResponse.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};