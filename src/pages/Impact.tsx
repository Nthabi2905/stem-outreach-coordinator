import { Calendar, Users, UserCheck, MapPin, Building2, Star, TrendingUp, MapPinned, Users2, Rocket, School as SchoolIcon, Lightbulb, Target, Quote, Globe2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { icon: Calendar, value: "1,248", label: "Outreach Events", change: "↑ 18% from last month", bg: "bg-logo-purple/10", color: "text-logo-purple" },
  { icon: Users, value: "3,452", label: "Schools Reached", change: "↑ 21% from last month", bg: "bg-logo-teal/10", color: "text-logo-teal" },
  { icon: UserCheck, value: "245,892", label: "Learners Impacted", change: "↑ 24% from last month", bg: "bg-logo-orange/10", color: "text-logo-orange" },
  { icon: MapPin, value: "9 / 9", label: "Provinces Covered", change: "100% Coverage", bg: "bg-logo-blue/10", color: "text-logo-blue" },
  { icon: Building2, value: "312", label: "Partner Organisations", change: "↑ 16% from last month", bg: "bg-logo-teal/10", color: "text-logo-teal" },
  { icon: Star, value: "82%", label: "Underserved Schools", change: "Reached in Quintiles 1–3", bg: "bg-logo-yellow/10", color: "text-logo-yellow" },
];

const growthData = [
  { month: "Dec", value: 50 },
  { month: "Jan", value: 110 },
  { month: "Feb", value: 145 },
  { month: "Mar", value: 175 },
  { month: "Apr", value: 215 },
  { month: "May", value: 250 },
];

const quintiles = [
  { name: "Quintile 1", pct: 38, color: "bg-logo-blue", dot: "bg-logo-blue" },
  { name: "Quintile 2", pct: 28, color: "bg-logo-teal", dot: "bg-logo-teal" },
  { name: "Quintile 3", pct: 16, color: "bg-logo-purple", dot: "bg-logo-purple" },
  { name: "Quintile 4", pct: 10, color: "bg-logo-orange", dot: "bg-logo-orange" },
  { name: "Quintile 5", pct: 8, color: "bg-logo-pink", dot: "bg-logo-pink" },
];

const stories = [
  { quote: "The workshop inspired me to believe I can be an engineer one day.", name: "Lwandle, Grade 10", region: "Eastern Cape", border: "border-logo-blue/30" },
  { quote: "We love the experiments! It's our first time seeing this in real life.", name: "Naledi, Grade 7", region: "Limpopo", border: "border-logo-teal/30" },
  { quote: "Now I know there are opportunities in STEM for people like me.", name: "Sipho, Grade 11", region: "KwaZulu-Natal", border: "border-logo-purple/30" },
];

const outcomes = [
  { icon: Rocket, title: "Increased Interest in STEM", desc: "87% of learners show increased interest in STEM subjects.", bg: "bg-logo-purple/10", color: "text-logo-purple" },
  { icon: SchoolIcon, title: "Stronger School Engagement", desc: "Schools report better participation and engagement over time.", bg: "bg-logo-teal/10", color: "text-logo-teal" },
  { icon: Lightbulb, title: "Skills Development", desc: "Hands-on experiences build confidence, skills and future pathways.", bg: "bg-logo-orange/10", color: "text-logo-orange" },
  { icon: Target, title: "Pathways to the Future", desc: "Learners are discovering careers in STEM and pursuing their dreams.", bg: "bg-logo-blue/10", color: "text-logo-blue" },
];

const Impact = () => {
  const max = Math.max(...growthData.map((d) => d.value));

  // Donut chart math
  let cumulative = 0;
  const donutSegments = quintiles.map((q) => {
    const start = cumulative;
    cumulative += q.pct;
    return { ...q, start, end: cumulative };
  });
  const segmentColors: Record<string, string> = {
    "bg-logo-blue": "hsl(var(--logo-blue))",
    "bg-logo-teal": "hsl(var(--logo-teal))",
    "bg-logo-purple": "hsl(var(--logo-purple))",
    "bg-logo-orange": "hsl(var(--logo-orange))",
    "bg-logo-pink": "hsl(var(--logo-pink))",
  };
  const conicGradient = `conic-gradient(${donutSegments
    .map((s) => `${segmentColors[s.color]} ${s.start}% ${s.end}%`)
    .join(", ")})`;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-logo-blue" />
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
              Real Impact. <span className="bg-gradient-hero bg-clip-text text-transparent">Measurable Change.</span>
            </h1>
            <Sparkles className="w-5 h-5 text-logo-teal" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            EduReach AI is driving equitable access to STEM and space science opportunities across South Africa — creating brighter futures, one connection at a time.
          </p>
        </div>

        {/* Stats strip */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-[10px] text-logo-teal mt-0.5">{s.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Three chart cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Outreach Growth */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Outreach Growth Over Time</h3>
              <span className="text-xs text-muted-foreground border border-border rounded px-2 py-1">This Year</span>
            </div>
            <div className="h-48 flex items-end gap-2 relative">
              <svg viewBox="0 0 300 180" className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="hsl(var(--logo-blue))"
                  strokeWidth="3"
                  points={growthData
                    .map((d, i) => `${(i / (growthData.length - 1)) * 280 + 10},${170 - (d.value / max) * 150}`)
                    .join(" ")}
                />
                {growthData.map((d, i) => (
                  <circle
                    key={d.month}
                    cx={(i / (growthData.length - 1)) * 280 + 10}
                    cy={170 - (d.value / max) * 150}
                    r="4"
                    fill="hsl(var(--logo-blue))"
                  />
                ))}
              </svg>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              {growthData.map((d) => <span key={d.month}>{d.month}</span>)}
            </div>
            <div className="mt-4 bg-logo-teal/5 border border-logo-teal/20 rounded-lg p-3 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-logo-teal shrink-0" />
              <div>
                <p className="text-sm font-semibold text-logo-teal">+24% Increase in learners impacted</p>
                <p className="text-xs text-muted-foreground">compared to the same period last year</p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4">Impact Across South Africa</h3>
            <div className="h-48 rounded-lg bg-gradient-to-br from-logo-blue/30 via-logo-blue/10 to-logo-blue/40 flex items-center justify-center text-logo-blue font-medium">
              SA Heatmap
            </div>
            <div className="flex justify-end gap-3 text-xs mt-2 text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-logo-blue" />High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-logo-blue/50" />Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-logo-blue/20" />Low</span>
            </div>
            <div className="mt-4 bg-logo-blue/5 border border-logo-blue/20 rounded-lg p-3 flex items-center gap-3">
              <MapPinned className="w-5 h-5 text-logo-blue shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Highest impact in underserved communities.</p>
                <p className="text-xs text-muted-foreground">We are closing the gap, province by province.</p>
              </div>
            </div>
          </div>

          {/* Donut */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4">Who We Reach</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 shrink-0">
                <div
                  className="w-full h-full rounded-full"
                  style={{ background: conicGradient }}
                />
                <div className="absolute inset-3 bg-card rounded-full flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-bold text-foreground">82%</span>
                  <span className="text-[8px] text-muted-foreground leading-tight px-1">Learners from Underserved Communities</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {quintiles.map((q) => (
                  <div key={q.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-foreground">
                      <span className={`w-2 h-2 rounded-full ${q.dot}`} />
                      {q.name}
                    </span>
                    <span className="font-semibold">{q.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 bg-logo-purple/5 border border-logo-purple/20 rounded-lg p-3 flex items-center gap-3">
              <Users2 className="w-5 h-5 text-logo-purple shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Our focus is equity.</p>
                <p className="text-xs text-muted-foreground">82% of learners come from Quintile 1–3 schools.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stories + Outcomes + Quote */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Stories */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-foreground">Stories of Change</h3>
            <p className="text-xs text-muted-foreground mb-4">Real stories from real communities.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stories.map((s) => (
                <div key={s.name} className={`rounded-xl border-2 ${s.border} bg-background p-3`}>
                  <div className="h-16 rounded-lg bg-gradient-to-br from-logo-blue/20 to-logo-teal/20 mb-2" />
                  <Quote className="w-3 h-3 text-muted-foreground mb-1" />
                  <p className="text-xs text-foreground leading-snug mb-2">"{s.quote}"</p>
                  <p className="text-[10px] font-semibold text-foreground">— {s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.region}</p>
                </div>
              ))}
            </div>
            <Link to="/" className="inline-flex items-center gap-1 text-xs font-medium text-logo-blue mt-4 hover:gap-2 transition-all">
              View More Stories <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Outcomes */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-foreground">Outcomes That Matter</h3>
            <p className="text-xs text-muted-foreground mb-4">We don't just run programs. We create lasting outcomes.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outcomes.map((o) => (
                <div key={o.title} className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full ${o.bg} flex items-center justify-center shrink-0`}>
                    <o.icon className={`w-5 h-5 ${o.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{o.title}</p>
                    <p className="text-xs text-muted-foreground">{o.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="bg-logo-blue/5 border border-logo-blue/20 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <Quote className="w-6 h-6 text-logo-blue mb-3" />
              <p className="text-sm text-foreground leading-relaxed">
                EduReach AI has transformed how we coordinate outreach. It's data-driven, efficient, and most importantly — it's helping us reach the learners who need it most.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-logo-blue/20">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-logo-purple to-logo-pink shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">— Dr. Amanda Radebe</p>
                <p className="text-xs text-muted-foreground">STEM Outreach Coordinator</p>
                <p className="text-xs text-muted-foreground">CSIR</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-logo-teal/5 border border-logo-teal/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-logo-teal/10 flex items-center justify-center shrink-0">
              <Globe2 className="w-6 h-6 text-logo-teal" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Together, we can build a future where every learner has the chance to explore, dream and thrive in STEM.</p>
              <p className="text-sm text-muted-foreground">Join the movement. Be part of the impact.</p>
            </div>
          </div>
          <Link to="/auth">
            <Button size="lg" className="bg-logo-blue hover:bg-logo-blue/90 text-white shadow-glow">
              Get Started Today <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Impact;
