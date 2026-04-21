import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  MapPin,
  Settings,
  MessageCircle,
  LogOut,
  Bell,
  Home,
  Bookmark,
  Lightbulb,
  Send,
  Clock,
  ArrowRight,
  Search,
  Atom,
  FlaskConical,
  Rocket,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface LearnerDashboardViewProps {
  userEmail: string;
  userName: string;
}

const mentors = [
  {
    name: "Dr. Naledi Khumalo",
    field: "Engineering & Robotics",
    org: "UCT",
    bg: "bg-[hsl(160,40%,88%)]",
    initial: "N",
  },
  {
    name: "Sipho Dlamini",
    field: "Software & AI",
    org: "Microsoft ZA",
    bg: "bg-[hsl(35,90%,88%)]",
    initial: "S",
  },
  {
    name: "Aisha Patel",
    field: "Medicine & Biotech",
    org: "Stellenbosch Uni",
    bg: "bg-[hsl(280,40%,90%)]",
    initial: "A",
  },
];

const tutoringSpots = [
  {
    name: "Khayelitsha Library Tutoring",
    subjects: "Maths, Science",
    schedule: "Mon–Thu, 15:00–17:00",
    distance: "2.4 km",
    bg: "bg-[hsl(160,40%,88%)]",
  },
  {
    name: "IkamvaYouth Nyanga Branch",
    subjects: "Maths, Physics, English",
    schedule: "Sat, 09:00–13:00",
    distance: "4.1 km",
    bg: "bg-[hsl(35,90%,88%)]",
  },
  {
    name: "Equal Education — Mitchells Plain",
    subjects: "All STEM subjects",
    schedule: "Tue & Thu, 16:00",
    distance: "6.8 km",
    bg: "bg-[hsl(215,70%,90%)]",
  },
];

const stemEvents = [
  {
    title: "SciFest Cape Town 2025",
    date: "Sat, 17 May",
    location: "Two Oceans Aquarium",
    distance: "5 km",
    icon: FlaskConical,
    bg: "bg-[hsl(160,40%,88%)]",
  },
  {
    title: "Girls in STEM Workshop",
    date: "Wed, 21 May",
    location: "UWC Bellville",
    distance: "12 km",
    icon: Rocket,
    bg: "bg-[hsl(35,90%,88%)]",
  },
  {
    title: "Coding Bootcamp Open Day",
    date: "Sat, 31 May",
    location: "WeThinkCode_ Cape Town",
    distance: "8 km",
    icon: Atom,
    bg: "bg-[hsl(215,70%,90%)]",
  },
];

export const LearnerDashboardView = ({ userEmail, userName }: LearnerDashboardViewProps) => {
  const navigate = useNavigate();
  const firstName = (userName || "Learner").split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  const [mentorOpen, setMentorOpen] = useState(false);
  const [uniOpen, setUniOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleMentorRequest = () => {
    setMentorOpen(false);
    toast.success("Mentor request sent! We'll match you within 48 hours.");
  };

  const handleUniRequest = () => {
    setUniOpen(false);
    toast.success("University application help requested!");
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
            <button className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md" title="Home">
              <Home className="h-5 w-5" />
            </button>
            <button className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-foreground/70 hover:bg-muted/80" title="Saved">
              <Bookmark className="h-5 w-5" />
            </button>
            <button className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-foreground/70 hover:bg-muted/80" title="Tips">
              <Lightbulb className="h-5 w-5" />
            </button>
            <button className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-foreground/70 hover:bg-muted/80" title="Universities">
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
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                Hi {firstName} <span className="inline-block">👋</span>
              </h1>
              <p className="mt-1 text-muted-foreground">
                Find a mentor, get help with university applications, and explore STEM near you.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 bg-orange-50 text-orange-600 font-medium hover:bg-orange-100 transition-colors">
              <Sparkles className="h-4 w-4" />
              Ask AI
            </button>
          </div>

          {/* Quick actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dialog open={mentorOpen} onOpenChange={setMentorOpen}>
              <DialogTrigger asChild>
                <button className="text-left rounded-2xl p-5 bg-[hsl(160,40%,88%)] hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="w-11 h-11 rounded-xl bg-card flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-foreground">Request a Mentor</h3>
                  <p className="text-sm text-foreground/70 mt-1">
                    Connect 1-on-1 with professionals in STEM, business and beyond.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                    Get matched <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request a mentor</DialogTitle>
                  <DialogDescription>
                    Tell us what you'd like guidance on. We'll match you with a mentor within 48 hours.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Field of interest (e.g. Engineering)" />
                  <Input placeholder="Your grade / age" />
                  <Textarea placeholder="What do you hope to learn from a mentor?" rows={4} />
                </div>
                <DialogFooter>
                  <Button onClick={handleMentorRequest}>
                    <Send className="h-4 w-4" /> Send request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={uniOpen} onOpenChange={setUniOpen}>
              <DialogTrigger asChild>
                <button className="text-left rounded-2xl p-5 bg-[hsl(35,90%,88%)] hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="w-11 h-11 rounded-xl bg-card flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-foreground">University Application Help</h3>
                  <p className="text-sm text-foreground/70 mt-1">
                    Get assistance with applications, NSFAS funding and bursaries.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                    Ask for help <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>University application help</DialogTitle>
                  <DialogDescription>
                    Tell us where you'd like to apply and what support you need.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Universities you're interested in" />
                  <Input placeholder="Intended course of study" />
                  <Textarea placeholder="What do you need help with? (applications, funding, choosing a course...)" rows={4} />
                </div>
                <DialogFooter>
                  <Button onClick={handleUniRequest}>
                    <Send className="h-4 w-4" /> Request assistance
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Free tutoring */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Free tutoring near you</h2>
            <button className="text-sm font-medium text-orange-500 hover:text-orange-600">View all</button>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Search by suburb, subject or organisation"
            />
          </div>

          <div className="mt-4 space-y-3">
            {tutoringSpots.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap"
              >
                <div className={`w-12 h-12 rounded-xl ${t.bg} flex items-center justify-center shrink-0`}>
                  <BookOpen className="h-6 w-6 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <h4 className="font-semibold text-foreground">{t.name}</h4>
                  <p className="text-sm text-muted-foreground">{t.subjects}</p>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">When</p>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {t.schedule}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {t.distance}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full px-5">
                  Details
                </Button>
              </div>
            ))}
          </div>

          {/* STEM Events */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">STEM events near you</h2>
            <button className="text-sm font-medium text-orange-500 hover:text-orange-600">View all</button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {stemEvents.map((e) => (
              <div key={e.title} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className={`${e.bg} p-4 h-28 relative`}>
                  <span className="px-3 py-1 rounded-full bg-card text-xs font-medium text-foreground border border-border flex items-center gap-1 w-fit">
                    <CalendarDays className="h-3 w-3" /> {e.date}
                  </span>
                  <e.icon className="absolute right-4 bottom-2 h-14 w-14 text-foreground/20" strokeWidth={1.2} />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{e.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {e.location} · {e.distance}
                  </p>
                  <Button size="sm" variant="outline" className="rounded-full mt-3 w-full">
                    RSVP
                  </Button>
                </div>
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
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: Users, val: "0", label: "Mentors", fg: "text-emerald-600" },
                { icon: GraduationCap, val: "0", label: "Apps", fg: "text-orange-500" },
                { icon: Trophy, val: "120", label: "Points", fg: "text-purple-600" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border p-3 text-center">
                  <s.icon className={`h-5 w-5 mx-auto ${s.fg}`} />
                  <p className="mt-1 font-bold text-foreground">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested mentors */}
          <div className="bg-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Suggested mentors</h3>
              <button className="text-xs font-medium text-orange-500 hover:text-orange-600">See all</button>
            </div>
            <div className="mt-4 space-y-3">
              {mentors.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${m.bg} flex items-center justify-center font-bold text-foreground/80`}>
                    {m.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.field} · {m.org}</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full h-8 px-3 text-xs">
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tip card */}
          <div className="bg-[hsl(35,90%,88%)] rounded-3xl p-5 shadow-sm">
            <Lightbulb className="h-6 w-6 text-orange-600" />
            <h4 className="mt-2 font-bold text-foreground">NSFAS deadline reminder</h4>
            <p className="text-sm text-foreground/70 mt-1">
              Applications for the next academic year close 30 November. Need help? Tap "University Application Help".
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
