import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;
  onSignOut: () => void;
}

export const DashboardHeader = ({ title, onSignOut }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <Button variant="ghost" size="icon" onClick={onSignOut}>
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};
