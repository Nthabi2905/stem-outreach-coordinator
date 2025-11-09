import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

export function LetterPreviewDialog({
  open,
  onOpenChange,
  schools,
  currentIndex,
  onNavigate,
}: LetterPreviewDialogProps) {
  const currentSchool = schools[currentIndex];
  
  if (!currentSchool) return null;

  const schoolName = currentSchool.generated_data?.name || "Unknown School";
  const letter = currentSchool.generated_letter || "No letter generated yet.";

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
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {letter}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(currentIndex + 1)}
            disabled={currentIndex === schools.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
