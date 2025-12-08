import { Shield, Building2, GraduationCap, Users } from "lucide-react";

interface WelcomeBannerProps {
  name: string;
  subtitle: string;
  role: "admin" | "organization" | "school_official" | "learner";
}

const roleIcons = {
  admin: Shield,
  organization: Building2,
  school_official: GraduationCap,
  learner: Users,
};

export const WelcomeBanner = ({ name, subtitle, role }: WelcomeBannerProps) => {
  const Icon = roleIcons[role];
  
  return (
    <div className="mx-4 mt-4 rounded-xl bg-gradient-to-r from-primary/80 via-primary/60 to-purple-500/60 p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/30 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-primary-foreground/80">Welcome back,</p>
          <h2 className="text-xl font-bold text-primary-foreground">{name}</h2>
          <p className="text-sm text-primary-foreground/70">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
