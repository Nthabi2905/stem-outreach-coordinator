import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, Save, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface LetterPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schools: Array<{
    id: string;
    generated_data: any;
    generated_letter: string | null;
  }>;
  currentIndex: number;
  onNavigate: (index: number) => void;
  onSave: (schoolId: string, editedLetter: string) => Promise<void>;
}

export function LetterPreviewDialog({
  open,
  onOpenChange,
  schools,
  currentIndex,
  onNavigate,
  onSave,
}: LetterPreviewDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentSchool = schools[currentIndex];
  
  if (!currentSchool) return null;

  const schoolName = currentSchool.generated_data?.name || "Unknown School";
  const letter = currentSchool.generated_letter || "No letter generated yet.";

  const handleEdit = () => {
    setEditedContent(letter);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(currentSchool.id, editedContent);
      setIsEditing(false);
      setEditedContent("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigate = (index: number) => {
    // Exit edit mode when navigating
    if (isEditing) {
      setIsEditing(false);
      setEditedContent("");
    }
    onNavigate(index);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{schoolName}</span>
            <span className="text-sm text-muted-foreground font-normal">
              Letter {currentIndex + 1} of {schools.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Edit letter content..."
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {letter}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center sm:justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate(currentIndex - 1)}
              disabled={currentIndex === 0 || isEditing}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate(currentIndex + 1)}
              disabled={currentIndex === schools.length - 1 || isEditing}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Letter
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
