import { Database, Network, Calendar, ClipboardCheck, BarChart3, Globe2, Sparkles, Building2, School as SchoolIcon, Landmark, DollarSign, GraduationCap, Shield, CheckCircle2, ChevronRight } from "lucide-react";
import dashboardPreview from "@/assets/dashboard-preview.png";

const steps = [
  {
    num: 1, icon: Database, title: "Identify & Prioritise Underserved Schools",
    desc: "We use DBE data and AI to automatically identify underserved schools based on quintile, location, language, and capacity.",
    tag: "Equity-driven prioritisation",
    iconBg: "bg-logo-teal/10", iconText: "text-logo-teal", tagBg: "bg-logo-teal/10", tagText: "text-logo-teal",
  },
  {
    num: 2, icon: Network, title: "AI Matchmaking",
    desc: "Our AI Matching Engine connects schools with the most suitable organisations based on needs, expertise, location, and availability.",
    tag: "Right match, greater impact",
    iconBg: "bg-logo-purple/10", iconText: "text-logo-purple", tagBg: "bg-logo-purple/10", tagText: "text-logo-purple",
  },
  {
    num: 3, icon: Calendar, title: "Automate & Schedule",
    desc: "Invitations, scheduling, routes, and reminders are automated, reducing admin time and ensuring smooth coordination.",
    tag: "Up to 80% less admin",
    iconBg: "bg-logo-blue/10", iconText: "text-logo-blue", tagBg: "bg-logo-blue/10", tagText: "text-logo-blue",
  },
  {
    num: 4, icon: ClipboardCheck, title: "Deliver & Verify On-Site",
    desc: "Field reps capture attendance, photos, and evidence on-site using our mobile app — even offline.",
    tag: "Verified impact, real evidence",
    iconBg: "bg-logo-orange/10", iconText: "text-logo-orange", tagBg: "bg-logo-orange/10", tagText: "text-logo-orange",
  },
  {
    num: 5, icon: BarChart3, title: "Report Instantly",
    desc: "Real-time dashboards and AI-generated reports show attendance, demographics, reach maps and outcomes in seconds.",
    tag: "From days to seconds",
    iconBg: "bg-logo-teal/10", iconText: "text-logo-teal", tagBg: "bg-logo-teal/10", tagText: "text-logo-teal",
  },
  {
    num: 6, icon: Globe2, title: "Drive National Impact",
    desc: "Stakeholders get real-time visibility of outreach coverage, gaps, and impact — enabling better decisions and more equitable reach.",
    tag: "Data that drives change",
    iconBg: "bg-logo-purple/10", iconText: "text-logo-purple", tagBg: "bg-logo-purple/10", tagText: "text-logo-purple",
  },
];

const stakeholders = [
  { icon: Building2, label: "Organisations", desc: "Offer & manage programs", color: "text-logo-blue", bg: "bg-logo-blue/10" },
  { icon: SchoolIcon, label: "Schools", desc: "Access opportunities & invite learners", color: "text-logo-teal", bg: "bg-logo-teal/10" },
  { icon: Landmark, label: "District Officials", desc: "Oversee & support outreach", color: "text-logo-orange", bg: "bg-logo-orange/10" },
  { icon: DollarSign, label: "Sponsors", desc: "Fund & track impact", color: "text-logo-blue", bg: "bg-logo-blue/10" },
  { icon: GraduationCap, label: "Learners", desc: "Discover, register & engage", color: "text-logo-teal", bg: "bg-logo-teal/10" },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        {/* Heading */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-logo-blue" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              How <span className="bg-gradient-hero bg-clip-text text-transparent">EduReach AI</span> Works
            </h1>
            <Sparkles className="w-5 h-5 text-logo-teal" />
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our AI-powered platform automates and coordinates every step of STEM and space science outreach,
            from matching to measurable impact.
          </p>
        </div>

        {/* Timeline numbers with dotted connectors */}
        <div className="hidden lg:flex items-center justify-between max-w-6xl mx-auto mb-6 px-4">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center shadow-md ring-4 ring-secondary/15 shrink-0">
                {s.num}
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 flex items-center px-2">
                  <div className="flex-1 border-t-2 border-dashed border-secondary/40" />
                  <ChevronRight className="w-4 h-4 text-secondary/60 -ml-1" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {steps.map((s) => (
            <div key={s.num} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              {/* mobile number */}
              <div className="lg:hidden mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                  {s.num}
                </span>
              </div>
              <div className={`w-16 h-16 rounded-2xl ${s.iconBg} flex items-center justify-center mb-4 mx-auto`}>
                <s.icon className={`w-8 h-8 ${s.iconText}`} />
              </div>
              <h3 className="text-sm font-bold text-foreground text-center mb-2 leading-snug">
                {s.title}
              </h3>
              <p className="text-xs text-muted-foreground text-center leading-relaxed mb-4 flex-1">
                {s.desc}
              </p>
              <div className={`${s.tagBg} ${s.tagText} rounded-lg px-3 py-2 text-xs font-medium flex items-center justify-center gap-1.5`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {s.tag}
              </div>
            </div>
          ))}
        </div>

        {/* Stakeholder + dashboard panel */}
        <div className="mt-12 bg-secondary/5 border border-secondary/15 rounded-3xl p-6 lg:p-10">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: stakeholders */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                A Platform Built for Every Stakeholder
              </h2>
              <p className="text-muted-foreground mb-8">
                EduReach AI connects the entire outreach ecosystem on one intelligent platform.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                {stakeholders.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                      <s.icon className={`w-7 h-7 ${s.color}`} />
                    </div>
                    <div className="text-xs font-bold text-foreground">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight mt-1">{s.desc}</div>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-logo-blue/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-logo-blue" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">Secure. Compliant. Trusted.</h4>
                  <p className="text-sm text-muted-foreground">
                    Built with enterprise-grade security and aligned to POPIA and DBE standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: dashboard preview */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-card">
              <img
                src={dashboardPreview}
                alt="EduReach AI national dashboard preview showing outreach metrics, coverage map, and provincial impact"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
