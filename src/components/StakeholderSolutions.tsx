import { Building2, School as SchoolIcon, Landmark, Users, Flag, GraduationCap, Brain, Shield, Smartphone, Workflow, BarChart3, Network, CheckCircle2, Rocket, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Stakeholder = {
  icon: typeof Building2;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  accent: string; // tailwind text color class
  iconBg: string; // tailwind bg class
  preview: React.ReactNode;
};

const PreviewCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-background/60 p-3 text-xs space-y-2">
    {children}
  </div>
);

const stakeholders: Stakeholder[] = [
  {
    icon: Building2,
    title: "Organisations",
    subtitle: "Offer & Manage STEM Support",
    description: "Streamline program management, find the right schools, and track your impact in real time.",
    bullets: [
      "AI-matched school opportunities",
      "Program & event management",
      "Route planning & scheduling",
      "Impact tracking & reporting",
    ],
    accent: "text-purple-600",
    iconBg: "bg-purple-100 text-purple-600",
    preview: (
      <PreviewCard>
        <p className="font-semibold text-foreground">My Programs</p>
        {[
          { name: "Robotics Workshop", meta: "12 Schools", status: "In Progress", color: "bg-blue-100 text-blue-700" },
          { name: "Space Science Talk", meta: "8 Schools", status: "Upcoming", color: "bg-orange-100 text-orange-700" },
          { name: "Career in STEM", meta: "15 Schools", status: "Completed", color: "bg-green-100 text-green-700" },
        ].map((p) => (
          <div key={p.name} className="flex items-center justify-between rounded-lg border border-border bg-card px-2 py-1.5">
            <div>
              <p className="font-medium text-foreground">{p.name}</p>
              <p className="text-muted-foreground">{p.meta}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.color}`}>{p.status}</span>
          </div>
        ))}
      </PreviewCard>
    ),
  },
  {
    icon: SchoolIcon,
    title: "Schools",
    subtitle: "Access Opportunities & Invite Learners",
    description: "Discover relevant programs, invite learners, and manage participation with ease.",
    bullets: [
      "Browse matched opportunities",
      "Invite & manage learners",
      "Track attendance & feedback",
      "Access resources & toolkits",
    ],
    accent: "text-primary",
    iconBg: "bg-primary/10 text-primary",
    preview: (
      <PreviewCard>
        <p className="font-semibold text-foreground">Upcoming Programs</p>
        {[
          { name: "Science Lab Visit", date: "May 20, 2024" },
          { name: "Astronomy Workshop", date: "May 28, 2024" },
          { name: "Rocketry Challenge", date: "Jun 05, 2024" },
        ].map((p) => (
          <div key={p.name} className="flex items-center justify-between rounded-lg border border-border bg-card px-2 py-1.5">
            <div>
              <p className="font-medium text-foreground">{p.name}</p>
              <p className="text-muted-foreground">{p.date}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">Confirm</span>
          </div>
        ))}
      </PreviewCard>
    ),
  },
  {
    icon: Landmark,
    title: "District Officials",
    subtitle: "Oversee & Support Outreach",
    description: "Monitor outreach activity, identify gaps, and support schools and organisations in your district.",
    bullets: [
      "District outreach overview",
      "Underserved schools insights",
      "Performance & impact reports",
      "Data-driven decision making",
    ],
    accent: "text-orange-600",
    iconBg: "bg-orange-100 text-orange-600",
    preview: (
      <PreviewCard>
        <p className="font-semibold text-foreground">District Overview</p>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full border-4 border-primary/30 border-t-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">682</p>
            <p className="text-muted-foreground">of 1,340 reached</p>
          </div>
        </div>
        <p className="font-medium text-foreground pt-1">Top Needs</p>
        <ol className="space-y-1 text-muted-foreground">
          <li>1. Science Labs</li>
          <li>2. Transport Support</li>
          <li>3. Teacher Training</li>
        </ol>
      </PreviewCard>
    ),
  },
  {
    icon: Users,
    title: "Sponsors",
    subtitle: "Fund & Track Impact",
    description: "See the impact of your investment with real-time data, reports, and stories from the ground.",
    bullets: [
      "Real-time impact dashboard",
      "Reach & demographic reports",
      "Stories, photos & evidence",
      "Download funder-ready reports",
    ],
    accent: "text-blue-600",
    iconBg: "bg-blue-100 text-blue-600",
    preview: (
      <PreviewCard>
        <p className="font-semibold text-foreground">Impact Summary</p>
        <p className="text-muted-foreground">Learners Impacted</p>
        <p className="text-2xl font-bold text-foreground">245,892</p>
        <p className="text-green-600 text-[10px]">↑ 24% from last month</p>
        <p className="font-medium text-foreground pt-1">By Province</p>
        {[
          { name: "Gauteng", value: 78, count: "78,456" },
          { name: "KwaZulu-Natal", value: 56, count: "56,125" },
          { name: "Eastern Cape", value: 28, count: "28,765" },
          { name: "Limpopo", value: 18, count: "18,456" },
        ].map((p) => (
          <div key={p.name} className="space-y-0.5">
            <div className="flex justify-between text-muted-foreground">
              <span>{p.name}</span>
              <span>{p.count}</span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${p.value}%` }} />
            </div>
          </div>
        ))}
      </PreviewCard>
    ),
  },
  {
    icon: Flag,
    title: "National Officials",
    subtitle: "Coordinate. Monitor. Transform.",
    description: "Gain a national view of outreach coverage, gaps, and impact to drive equitable STEM access.",
    bullets: [
      "National visibility dashboard",
      "Coverage & equity heatmaps",
      "Policy & planning insights",
      "Export & data integrations",
    ],
    accent: "text-primary",
    iconBg: "bg-primary/10 text-primary",
    preview: (
      <PreviewCard>
        <p className="font-semibold text-foreground">National Coverage</p>
        <div className="h-24 rounded-lg bg-gradient-to-br from-primary/30 via-primary/10 to-primary/40 flex items-center justify-center text-primary font-medium">
          SA Heatmap
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>● High</span>
          <span>● Medium</span>
          <span>● Low</span>
        </div>
        <div className="flex justify-between items-end pt-1 border-t border-border">
          <div>
            <p className="text-muted-foreground">Underserved Schools</p>
            <p className="text-2xl font-bold text-foreground">2,341</p>
          </div>
          <span className="text-primary text-[10px]">View Details →</span>
        </div>
      </PreviewCard>
    ),
  },
  {
    icon: GraduationCap,
    title: "Learners",
    subtitle: "Discover. Register. Get Inspired.",
    description: "Find exciting STEM opportunities, register, participate, and grow your skills and future.",
    bullets: [
      "View upcoming opportunities",
      "Register & track participation",
      "Earn certificates & badges",
      "Access learning resources",
    ],
    accent: "text-primary",
    iconBg: "bg-primary/10 text-primary",
    preview: (
      <PreviewCard>
        <p className="font-semibold text-foreground">My Dashboard</p>
        <p className="text-muted-foreground">Upcoming</p>
        {[
          { name: "Coding Basics", date: "May 22, 2024" },
          { name: "Robotics Challenge", date: "Jun 10, 2024" },
        ].map((p) => (
          <div key={p.name} className="flex items-center justify-between rounded-lg border border-border bg-card px-2 py-1.5">
            <div>
              <p className="font-medium text-foreground">{p.name}</p>
              <p className="text-muted-foreground">{p.date}</p>
            </div>
            <span className="text-primary">›</span>
          </div>
        ))}
        <p className="font-medium text-foreground pt-1">My Progress</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-card p-2 text-center">
            <p className="text-muted-foreground text-[10px]">Badges Earned</p>
            <p className="text-lg font-bold text-foreground">5</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-2 text-center">
            <p className="text-muted-foreground text-[10px]">Certificates</p>
            <p className="text-lg font-bold text-foreground">3</p>
          </div>
        </div>
      </PreviewCard>
    ),
  },
];

const features = [
  { icon: Brain, title: "AI-Powered Matching", desc: "Smarter matches, greater impact.", color: "text-purple-600" },
  { icon: Shield, title: "Secure & Compliant", desc: "POPIA & DBE aligned with enterprise security.", color: "text-green-600" },
  { icon: Smartphone, title: "Mobile First", desc: "Access anywhere, work everywhere.", color: "text-orange-600" },
  { icon: Workflow, title: "Integrated & Automated", desc: "End-to-end automation saves time & effort.", color: "text-blue-600" },
  { icon: BarChart3, title: "Data-Driven Insights", desc: "Make informed decisions with confidence.", color: "text-pink-600" },
  { icon: Network, title: "Collaborative Network", desc: "Stronger together for greater reach.", color: "text-primary" },
];

const StakeholderSolutions = () => {
  return (
    <section className="py-20 px-6 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Solutions for{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Every Stakeholder
              </span>
            </h2>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            EduReach AI brings the entire STEM and space science outreach ecosystem together with
            role-based solutions designed to simplify, connect and amplify impact.
          </p>
        </div>

        {/* Stakeholder Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {stakeholders.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="group bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${s.accent}`}>{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-foreground/80 mb-4">{s.description}</p>

                <ul className="space-y-2 mb-4">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${s.accent}`} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {s.preview}

                <Link
                  to="/auth"
                  className={`inline-flex items-center gap-1 text-sm font-medium mt-4 ${s.accent} hover:gap-2 transition-all`}
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* One Platform Section */}
        <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              One Platform. Endless Possibilities.
            </h3>
            <p className="text-muted-foreground">
              Powerful features that work for everyone, in one connected system.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="text-center">
                  <Icon className={`w-10 h-10 mx-auto mb-3 ${f.color}`} />
                  <h4 className={`font-semibold mb-1 ${f.color}`}>{f.title}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Rocket className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Ready to transform STEM outreach?</h4>
                <p className="text-sm text-muted-foreground">
                  Join the national movement for equitable STEM access.
                </p>
              </div>
            </div>
            <Link to="/auth">
              <Button size="lg" className="shadow-glow">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StakeholderSolutions;
