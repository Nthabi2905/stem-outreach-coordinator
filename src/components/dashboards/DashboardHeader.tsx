import { LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  title: string;
  onSignOut: () => void;
  role?: "admin" | "organization" | "school_official" | "learner";
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  organization: "Organization",
  school_official: "School Official",
  learner: "Learner",
};

const roleVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  admin: "destructive",
  organization: "default",
  school_official: "secondary",
  learner: "outline",
};

export const DashboardHeader = ({ title, onSignOut, role, notificationCount = 0, onNotificationClick }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {role && (
          <Badge variant={roleVariants[role]}>{roleLabels[role]}</Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onNotificationClick} className="relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={onSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
