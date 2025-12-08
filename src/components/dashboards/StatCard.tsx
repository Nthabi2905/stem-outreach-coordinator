import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  variant: "primary" | "purple" | "amber" | "orange";
}

const variantStyles = {
  primary: "bg-primary/10 border-primary/30 text-primary",
  purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  orange: "bg-orange-500/10 border-orange-500/30 text-orange-400",
};

const iconVariantStyles = {
  primary: "bg-primary/20 text-primary",
  purple: "bg-purple-500/20 text-purple-400",
  amber: "bg-amber-500/20 text-amber-400",
  orange: "bg-orange-500/20 text-orange-400",
};

export const StatCard = ({ icon: Icon, value, label, variant }: StatCardProps) => {
  return (
    <div className={`rounded-xl border p-4 ${variantStyles[variant]}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${iconVariantStyles[variant]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};
