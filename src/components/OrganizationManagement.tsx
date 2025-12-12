import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Plus, 
  Users, 
  Search, 
  RefreshCw, 
  UserPlus,
  Trash2,
  Eye,
  Pencil,
  Upload,
  FileSpreadsheet,
  History
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityLog {
  id: string;
  organization_id: string | null;
  organization_name: string;
  action: string;
  details: any;
  performed_by: string;
  created_at: string;
  performer_profile?: {
    email: string;
    full_name: string | null;
  };
}

interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count?: number;
}

interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  created_at: string;
  profile?: {
    email: string;
    full_name: string | null;
  };
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create organization dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // View members dialog
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  
  // Add member dialog
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  // Edit organization dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editOrgName, setEditOrgName] = useState("");
  const [editOrgDescription, setEditOrgDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Bulk import
  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: string[];
    notFound: string[];
    alreadyMember: string[];
  } | null>(null);

  // Delete confirmation
  const [memberToDelete, setMemberToDelete] = useState<OrganizationMember | null>(null);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Activity logs
  const [isActivityLogDialogOpen, setIsActivityLogDialogOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const logActivity = async (
    orgId: string | null,
    orgName: string,
    action: string,
    details: Record<string, any> = {}
  ) => {
    if (!currentUserId) return;
    
    try {
      await supabase.from("organization_activity_logs").insert({
        organization_id: orgId,
        organization_name: orgName,
        action,
        details,
        performed_by: currentUserId
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const fetchActivityLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const { data: logs, error } = await supabase
        .from("organization_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      if (logs && logs.length > 0) {
        const performerIds = [...new Set(logs.map(l => l.performed_by))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", performerIds);

        const profileMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {} as Record<string, UserProfile>);

        const logsWithProfiles = logs.map(log => ({
          ...log,
          performer_profile: profileMap[log.performed_by]
        }));

        setActivityLogs(logsWithProfiles);
      } else {
        setActivityLogs([]);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      // Fetch organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (orgsError) throw orgsError;

      // Fetch member counts
      const { data: memberCounts, error: countError } = await supabase
        .from("organization_members")
        .select("organization_id");

      if (countError) throw countError;

      // Count members per organization
      const countMap = memberCounts?.reduce((acc, member) => {
        acc[member.organization_id] = (acc[member.organization_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const orgsWithCounts = (orgsData || []).map(org => ({
        ...org,
        member_count: countMap[org.id] || 0
      }));

      setOrganizations(orgsWithCounts);
    } catch (error: any) {
      console.error("Error fetching organizations:", error);
      toast.error("Failed to load organizations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      toast.error("Organization name is required");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("organizations")
        .insert({
          name: newOrgName.trim(),
          description: newOrgDescription.trim() || null
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity(data.id, newOrgName.trim(), "created", {
        description: newOrgDescription.trim() || null
      });

      toast.success("Organization created successfully");
      setIsCreateDialogOpen(false);
      setNewOrgName("");
      setNewOrgDescription("");
      fetchOrganizations();
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditOrganization = (org: Organization) => {
    setEditingOrg(org);
    setEditOrgName(org.name);
    setEditOrgDescription(org.description || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrganization = async () => {
    if (!editingOrg) return;
    
    if (!editOrgName.trim()) {
      toast.error("Organization name is required");
      return;
    }

    setIsUpdating(true);
    try {
      const changes: Record<string, { from: any; to: any }> = {};
      if (editOrgName.trim() !== editingOrg.name) {
        changes.name = { from: editingOrg.name, to: editOrgName.trim() };
      }
      if ((editOrgDescription.trim() || null) !== editingOrg.description) {
        changes.description = { from: editingOrg.description, to: editOrgDescription.trim() || null };
      }

      const { error } = await supabase
        .from("organizations")
        .update({
          name: editOrgName.trim(),
          description: editOrgDescription.trim() || null
        })
        .eq("id", editingOrg.id);

      if (error) throw error;

      await logActivity(editingOrg.id, editOrgName.trim(), "updated", { changes });

      toast.success("Organization updated successfully");
      setIsEditDialogOpen(false);
      setEditingOrg(null);
      fetchOrganizations();
    } catch (error: any) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!orgToDelete) return;

    setIsDeleting(true);
    try {
      const deletedMemberCount = orgToDelete.member_count || 0;
      
      // First, delete all members of the organization
      const { error: membersError } = await supabase
        .from("organization_members")
        .delete()
        .eq("organization_id", orgToDelete.id);

      if (membersError) throw membersError;

      // Log before deleting (org_id will be set to null due to ON DELETE SET NULL)
      await logActivity(null, orgToDelete.name, "deleted", {
        members_removed: deletedMemberCount
      });

      // Then delete the organization itself
      const { error: orgError } = await supabase
        .from("organizations")
        .delete()
        .eq("id", orgToDelete.id);

      if (orgError) throw orgError;

      toast.success(`Organization "${orgToDelete.name}" deleted successfully`);
      setOrgToDelete(null);
      fetchOrganizations();
    } catch (error: any) {
      console.error("Error deleting organization:", error);
      toast.error("Failed to delete organization");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchMembers = async (orgId: string) => {
    setIsLoadingMembers(true);
    try {
      const { data: membersData, error: membersError } = await supabase
        .from("organization_members")
        .select("*")
        .eq("organization_id", orgId);

      if (membersError) throw membersError;

      // Fetch profiles for members
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        const profileMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, UserProfile>);

        const membersWithProfiles = membersData.map(member => ({
          ...member,
          profile: profileMap[member.user_id]
        }));

        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load organization members");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleViewMembers = (org: Organization) => {
    setSelectedOrg(org);
    setIsMembersDialogOpen(true);
    fetchMembers(org.id);
  };

  const fetchAvailableUsers = async (orgId: string) => {
    try {
      // Get all profiles
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (profilesError) throw profilesError;

      // Get existing members
      const { data: existingMembers, error: membersError } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", orgId);

      if (membersError) throw membersError;

      const existingUserIds = new Set((existingMembers || []).map(m => m.user_id));
      const available = (allProfiles || []).filter(p => !existingUserIds.has(p.id));
      
      setAvailableUsers(available);
    } catch (error: any) {
      console.error("Error fetching available users:", error);
      toast.error("Failed to load available users");
    }
  };

  const handleOpenAddMember = () => {
    if (selectedOrg) {
      setIsAddMemberDialogOpen(true);
      fetchAvailableUsers(selectedOrg.id);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !selectedOrg) {
      toast.error("Please select a user");
      return;
    }

    setIsAddingMember(true);
    try {
      const selectedUser = availableUsers.find(u => u.id === selectedUserId);
      
      const { error } = await supabase
        .from("organization_members")
        .insert({
          organization_id: selectedOrg.id,
          user_id: selectedUserId
        });

      if (error) throw error;

      await logActivity(selectedOrg.id, selectedOrg.name, "member_added", {
        member_email: selectedUser?.email,
        member_name: selectedUser?.full_name
      });

      toast.success("Member added successfully");
      setIsAddMemberDialogOpen(false);
      setSelectedUserId("");
      setUserSearchQuery("");
      fetchMembers(selectedOrg.id);
      fetchOrganizations();
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete || !selectedOrg) return;

    try {
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberToDelete.id);

      if (error) throw error;

      await logActivity(selectedOrg.id, selectedOrg.name, "member_removed", {
        member_email: memberToDelete.profile?.email,
        member_name: memberToDelete.profile?.full_name
      });

      toast.success("Member removed successfully");
      setMemberToDelete(null);
      fetchMembers(selectedOrg.id);
      fetchOrganizations();
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const parseCSV = (text: string): string[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const emails: string[] = [];
    
    for (const line of lines) {
      const cells = line.split(/[,;\t]/).map(cell => cell.trim().replace(/^["']|["']$/g, ''));
      for (const cell of cells) {
        if (cell && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cell)) {
          emails.push(cell.toLowerCase());
        }
      }
    }
    
    return [...new Set(emails)];
  };

  const handleBulkImport = async () => {
    if (!csvFile || !selectedOrg) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const text = await csvFile.text();
      const emails = parseCSV(text);

      if (emails.length === 0) {
        toast.error("No valid email addresses found in the CSV file");
        setIsImporting(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("email", emails);

      if (profilesError) throw profilesError;

      const foundEmails = new Set((profiles || []).map(p => p.email.toLowerCase()));
      const notFoundEmails = emails.filter(e => !foundEmails.has(e));

      const { data: existingMembers, error: membersError } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", selectedOrg.id);

      if (membersError) throw membersError;

      const existingUserIds = new Set((existingMembers || []).map(m => m.user_id));
      const newProfiles = (profiles || []).filter(p => !existingUserIds.has(p.id));
      const alreadyMemberEmails = (profiles || [])
        .filter(p => existingUserIds.has(p.id))
        .map(p => p.email);

      if (newProfiles.length > 0) {
        const { error: insertError } = await supabase
          .from("organization_members")
          .insert(newProfiles.map(p => ({
            organization_id: selectedOrg.id,
            user_id: p.id
          })));

        if (insertError) throw insertError;
      }

      setImportResults({
        success: newProfiles.map(p => p.email),
        notFound: notFoundEmails,
        alreadyMember: alreadyMemberEmails
      });

      if (newProfiles.length > 0) {
        await logActivity(selectedOrg.id, selectedOrg.name, "bulk_import", {
          members_added: newProfiles.length,
          emails: newProfiles.map(p => p.email)
        });

        toast.success(`Successfully added ${newProfiles.length} member(s)`);
        fetchMembers(selectedOrg.id);
        fetchOrganizations();
      }
    } catch (error: any) {
      console.error("Error importing members:", error);
      toast.error("Failed to import members");
    } finally {
      setIsImporting(false);
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setIsActivityLogDialogOpen(true);
            fetchActivityLogs();
          }}>
            <History className="h-4 w-4 mr-2" />
            Activity Log
          </Button>
          <Button variant="outline" size="sm" onClick={fetchOrganizations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrganizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No organizations match your search" : "No organizations yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{org.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {org.description || <span className="text-muted-foreground italic">No description</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {org.member_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(org.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOrganization(org)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewMembers(org)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Members
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setOrgToDelete(org)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Organization Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                placeholder="Enter organization name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter organization description"
                value={newOrgDescription}
                onChange={(e) => setNewOrgDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrganization} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                placeholder="Enter organization name"
                value={editOrgName}
                onChange={(e) => setEditOrgName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter organization description"
                value={editOrgDescription}
                onChange={(e) => setEditOrgDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrganization} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Manage Members Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedOrg?.name} - Members
            </DialogTitle>
            <DialogDescription>
              Manage organization members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                setCsvFile(null);
                setImportResults(null);
                setIsBulkImportDialogOpen(true);
              }}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
              <Button size="sm" onClick={handleOpenAddMember}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
            
            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No members in this organization yet.
              </div>
            ) : (
              <div className="rounded-md border max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {member.profile?.full_name || "Unknown"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.profile?.email || member.user_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setMemberToDelete(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to {selectedOrg?.name}</DialogTitle>
            <DialogDescription>
              Select a user to add to this organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-[200px] overflow-auto border rounded-md">
              {filteredAvailableUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {userSearchQuery ? "No users match your search" : "No available users"}
                </div>
              ) : (
                filteredAvailableUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${
                      selectedUserId === user.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <p className="font-medium">{user.full_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!selectedUserId || isAddingMember}>
              {isAddingMember ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={isBulkImportDialogOpen} onOpenChange={setIsBulkImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Bulk Import Members
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file with email addresses to add multiple members at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => {
                  setCsvFile(e.target.files?.[0] || null);
                  setImportResults(null);
                }}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {csvFile ? csvFile.name : "Click to upload CSV"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  CSV file with email addresses (one per row or comma-separated)
                </p>
              </label>
            </div>

            {importResults && (
              <div className="space-y-3 text-sm">
                {importResults.success.length > 0 && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Added ({importResults.success.length}):
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                      {importResults.success.join(", ")}
                    </p>
                  </div>
                )}
                {importResults.alreadyMember.length > 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Already members ({importResults.alreadyMember.length}):
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                      {importResults.alreadyMember.join(", ")}
                    </p>
                  </div>
                )}
                {importResults.notFound.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Not found ({importResults.notFound.length}):
                    </p>
                    <p className="text-red-700 dark:text-red-300 text-xs mt-1">
                      {importResults.notFound.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkImportDialogOpen(false)}>
              {importResults ? "Close" : "Cancel"}
            </Button>
            {!importResults && (
              <Button onClick={handleBulkImport} disabled={!csvFile || isImporting}>
                {isImporting ? "Importing..." : "Import Members"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Member Confirmation */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{memberToDelete?.profile?.full_name || memberToDelete?.profile?.email}</strong>{" "}
              from this organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Organization Confirmation */}
      <AlertDialog open={!!orgToDelete} onOpenChange={() => setOrgToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{orgToDelete?.name}</strong>?
              {orgToDelete?.member_count && orgToDelete.member_count > 0 && (
                <span className="block mt-2 text-destructive">
                  This will also remove {orgToDelete.member_count} member(s) from this organization.
                </span>
              )}
              <span className="block mt-2">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrganization} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Organization"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Log Dialog */}
      <Dialog open={isActivityLogDialogOpen} onOpenChange={setIsActivityLogDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Organization Activity Log
            </DialogTitle>
            <DialogDescription>
              Recent activity across all organizations.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {isLoadingLogs ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity logged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          log.action === "created" ? "default" :
                          log.action === "updated" ? "secondary" :
                          log.action === "deleted" ? "destructive" :
                          "outline"
                        }>
                          {log.action}
                        </Badge>
                        <span className="font-medium">{log.organization_name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by {log.performer_profile?.full_name || log.performer_profile?.email || "Unknown"}
                    </p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-xs bg-muted/50 rounded p-2 mt-2">
                        {log.action === "updated" && log.details.changes && (
                          <div className="space-y-1">
                            {Object.entries(log.details.changes).map(([key, value]: [string, any]) => (
                              <div key={key}>
                                <span className="font-medium capitalize">{key}:</span>{" "}
                                <span className="text-muted-foreground">{value.from || "(empty)"}</span>
                                {" → "}
                                <span>{value.to || "(empty)"}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {log.action === "deleted" && log.details.members_removed > 0 && (
                          <span>{log.details.members_removed} member(s) removed</span>
                        )}
                        {log.action === "member_added" && (
                          <span>Added: {log.details.member_email}</span>
                        )}
                        {log.action === "member_removed" && (
                          <span>Removed: {log.details.member_email}</span>
                        )}
                        {log.action === "bulk_import" && (
                          <span>{log.details.members_added} member(s) imported</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
