import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  BookOpen,
  Briefcase,
  FlaskConical,
  Atom,
  Globe,
  Settings,
  MessageCircle,
  Award,
  Medal,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Hourglass,
  LogOut,
  Bell,
  Home,
  Bookmark,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LearnerDashboardViewProps {
  userEmail: string;
  userName: string;
}

const subjectFilters = [
  { label: "All Subject", icon: Sparkles, bg: "bg-orange-100", fg: "text-orange-600" },
  { label: "English", icon: BookOpen, bg: "bg-purple-100", fg: "text-purple-600" },
  { label: "Business", icon: Briefcase, bg: "bg-lime-100", fg: "text-lime-700" },
  { label: "Chemistry", icon: FlaskConical, bg: "bg-emerald-100", fg: "text-emerald-600" },
  { label: "Physics", icon: Atom, bg: "bg-amber-100", fg: "text-amber-600" },
];

const upcomingClasses = [
  {
    subject: "Physics",
    title: "Unlock the Laws of Nature",
    time: "11:30",
    bg: "bg-[hsl(80,55%,88%)]",
    icon: Atom,
  },
  {
    subject: "Chemistry",
    title: "Unlock the Secrets of Matter",
    time: "11:30",
    bg: "bg-[hsl(160,40%,88%)]",
    icon: FlaskConical,
  },
];

const learningContent = [
  {
    tag: "Physics",
    title: "Unlock the Laws of Nature",
    materials: 5,
    progress: 44,
    days: 1,
    icon: BookOpen,
    iconBg: "bg-emerald-100",
    iconFg: "text-emerald-600",
  },
  {
    tag: "Geographic",
    title: "Mapping the Earth's Secrets",
    materials: 5,
    progress: 44,
    days: 1,
    icon: Globe,
    iconBg: "bg-fuchsia-100",
    iconFg: "text-fuchsia-600",
  },
  {
    tag: "Chemistry",
    title: "Foundations of Chemistry",
    materials: 5,
    progress: 44,
    days: 1,
    icon: FlaskConical,
    iconBg: "bg-orange-100",
    iconFg: "text-orange-600",
  },
];

export const LearnerDashboardView = ({ userEmail, userName }: LearnerDashboardViewProps) => {
  const navigate = useNavigate();
  const firstName = (userName || "Learner").split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-[hsl(60,15%,92%)] p-3 sm:p-6">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4">
        {/* Left rail */}
        <aside className="hidden lg:flex flex-col items-center gap-4 bg-card rounded-3xl py-6 px-3 w-20 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold">
            S
          </div>
          <div className="relative w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Bell className="h-5 w-5 text-foreground/70" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md">
              <Home className="h-5 w-5" />
            </button>
            <button className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-foreground/70 hover:bg-muted/80">
              <Bookmark className="h-5 w-5" />
            </button>
            <button className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-foreground/70 hover:bg-muted/80">
              <Lightbulb className="h-5 w-5" />
            </button>
            <button className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-foreground/70 hover:bg-muted/80">
              <GraduationCap className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-3 items-center">
            <button className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-foreground/70">
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-foreground/70 hover:bg-destructive/10 hover:text-destructive"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-rose-300 flex items-center justify-center text-foreground font-semibold">
              {initial}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-card rounded-3xl p-5 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Good Morning, {firstName} <span className="inline-block">👋</span>
            </h1>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 bg-orange-50 text-orange-600 font-medium hover:bg-orange-100 transition-colors">
              <Sparkles className="h-4 w-4" />
              Ask AI
            </button>
          </div>

          {/* Subject filters */}
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {subjectFilters.map((s) => (
              <button
                key={s.label}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card hover:shadow-sm transition-all whitespace-nowrap"
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.fg}`} />
                </span>
                <span className="font-medium text-foreground">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Upcoming Class */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Your Upcoming Class</h2>
            <button className="text-sm font-medium text-orange-500 hover:text-orange-600">View all</button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingClasses.map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className={`${c.bg} p-4 h-32 relative`}>
                  <span className="px-3 py-1 rounded-full bg-card text-xs font-medium text-foreground border border-border">
                    Start: {c.time}
                  </span>
                  <c.icon className="absolute right-4 bottom-2 h-16 w-16 text-foreground/20" strokeWidth={1.2} />
                </div>
                <div className="p-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {c.subject}
                  </span>
                  <h3 className="mt-3 font-semibold text-foreground">{c.title}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[
                        "bg-rose-200",
                        "bg-amber-200",
                        "bg-emerald-200",
                        "bg-foreground",
                      ].map((bg, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-full border-2 border-card ${bg} flex items-center justify-center text-xs font-bold ${
                            i === 3 ? "text-card" : "text-foreground/70"
                          }`}
                        >
                          {i === 3 ? "40+" : ""}
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full px-5">
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* In Progress */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">In progress learning content</h2>
            <button className="text-sm font-medium text-orange-500 hover:text-orange-600">View all</button>
          </div>

          <div className="mt-4 space-y-3">
            {learningContent.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap"
              >
                <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`h-6 w-6 ${item.iconFg}`} />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <span className="inline-block px-3 py-0.5 rounded-full border border-border text-xs font-medium text-muted-foreground">
                    {item.tag}
                  </span>
                  <h4 className="mt-1.5 font-semibold text-foreground">{item.title}</h4>
                </div>
                <div className="hidden md:flex items-center gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground">Content</p>
                    <p className="text-sm font-semibold text-foreground">{item.materials} Material</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Content</p>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full border-2 border-emerald-500" />
                      {item.progress}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Content</p>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.days} day
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full px-5">
                  Start
                </Button>
              </div>
            ))}
          </div>
        </main>

        {/* Right rail */}
        <aside className="lg:w-80 flex flex-col gap-4">
          {/* Profile card */}
          <div className="bg-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-foreground/70" />
              </button>
              <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <Settings className="h-4 w-4 text-foreground/70" />
              </button>
            </div>
            <div className="mt-2 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-200 to-teal-300 flex items-center justify-center text-3xl font-bold text-foreground/80">
                {initial}
              </div>
              <h3 className="mt-3 text-lg font-bold text-foreground">{userName || "Learner"}</h3>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: MapPin, val: "100", label: "Point", fg: "text-orange-500" },
                { icon: Medal, val: "32", label: "Badges", fg: "text-lime-600" },
                { icon: Award, val: "32", label: "Certificates", fg: "text-purple-600" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border p-3 text-center">
                  <s.icon className={`h-5 w-5 mx-auto ${s.fg}`} />
                  <p className="mt-1 font-bold text-foreground">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity card */}
          <div className="bg-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activity</p>
                <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                  3.5h
                  <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    👍 Great result!
                  </span>
                </p>
              </div>
              <button className="px-3 py-1 rounded-full border border-border text-sm font-medium text-foreground">
                Year ▾
              </button>
            </div>

            {/* Donut chart */}
            <div className="mt-4 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {[
                    { color: "hsl(150 60% 65%)", val: 43, offset: 0 },
                    { color: "hsl(35 90% 60%)", val: 17, offset: 43 },
                    { color: "hsl(45 90% 65%)", val: 8, offset: 60 },
                    { color: "hsl(215 70% 70%)", val: 32, offset: 68 },
                  ].map((seg, i) => (
                    <circle
                      key={i}
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="5"
                      strokeDasharray={`${seg.val * 0.88} ${100 * 0.88}`}
                      strokeDashoffset={-seg.offset * 0.88}
                      pathLength="88"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground">Contents</p>
                  <p className="text-3xl font-bold text-foreground">140</p>
                </div>
                <span className="absolute top-2 left-1 px-2 py-0.5 rounded-full bg-card border border-border text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Passed
                </span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: FileText, val: "120", label: "Content", fg: "text-rose-500", bg: "bg-rose-100" },
              { icon: Hourglass, val: "120", label: "Learning", fg: "text-amber-600", bg: "bg-amber-100" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-3xl p-4 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.fg}`} />
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">{s.val}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <button className="mt-3 w-full py-1.5 rounded-full border border-border text-xs font-medium text-foreground hover:bg-muted">
                  View all
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
