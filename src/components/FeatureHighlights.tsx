import { Brain, UserCheck, Settings, ClipboardCheck, BarChart3, Globe2, Sparkles } from "lucide-react";

const features = [
  {
    num: 1,
    icon: Brain,
    title: "AI Matching Engine (First in SA)",
    desc: "Matches schools with the right organisations using data on province, quintile, language, and capacity — ensuring fair, data-driven outreach.",
    iconBg: "bg-logo-blue/10", iconText: "text-logo-blue", badge: "bg-logo-blue",
  },
  {
    num: 2,
    icon: UserCheck,
    title: "Underserved School Identification",
    desc: "Automatically generates batches of underserved schools using DBE data — no guesswork, no bias, just equity.",
    iconBg: "bg-logo-purple/10", iconText: "text-logo-purple", badge: "bg-logo-purple",
  },
  {
    num: 3,
    icon: Settings,
    title: "End-to-End Automation",
    desc: "Automates invitations, scheduling, routes, and reminders — cutting admin by up to 80% so organisations can focus on impact.",
    iconBg: "bg-logo-teal/10", iconText: "text-logo-teal", badge: "bg-logo-teal",
  },
  {
    num: 4,
    icon: ClipboardCheck,
    title: "On-Site Verification & Evidence Collection",
    desc: "Field reps collect attendance, photos, and proof of impact — building credible, funder-ready evidence.",
    iconBg: "bg-logo-orange/10", iconText: "text-logo-orange", badge: "bg-logo-orange",
  },
  {
    num: 5,
    icon: BarChart3,
    title: "Instant Impact Reporting",
    desc: "Generates reports with attendance, demographics, and reach maps — turning days of admin into seconds.",
    iconBg: "bg-logo-pink/10", iconText: "text-logo-pink", badge: "bg-logo-pink",
  },
  {
    num: 6,
    icon: Globe2,
    title: "National Visibility Dashboard",
    desc: "Shows real-time insights on underserved areas, outreach coverage, and gaps — enabling true national coordination.",
    iconBg: "bg-logo-teal/10", iconText: "text-logo-teal", badge: "bg-logo-teal",
  },
];

const partners = ["SAASTA", "NRF", "CSIR", "SANSA", "ESA", "Vodacom Foundation"];

const FeatureHighlights = () => {
  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-3xl shadow-sm p-8 lg:p-12">
          {/* Heading */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="hidden md:block flex-1 h-px bg-border" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-logo-blue" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                What Makes <span className="bg-gradient-hero bg-clip-text text-transparent">EduReach AI</span> Unique
              </h2>
            </div>
            <div className="hidden md:block flex-1 h-px bg-border" />
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {features.map((f) => (
              <div key={f.num} className="group">
                <div className="relative mb-4 inline-block">
                  <div className={`w-14 h-14 rounded-2xl bg-${f.color}/10 flex items-center justify-center`}>
                    <f.icon className={`w-7 h-7 text-${f.color}`} />
                  </div>
                  <span className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-${f.color} text-white text-xs font-bold flex items-center justify-center shadow-md`}>
                    {f.num}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2 leading-snug">
                  {f.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partners band */}
        <div className="mt-6 bg-card border border-border rounded-2xl px-6 py-5 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          <p className="text-sm text-muted-foreground max-w-[14rem] text-center lg:text-left leading-snug">
            Trusted by organisations, schools, districts and sponsors across South Africa.
          </p>
          <div className="flex-1 flex flex-wrap items-center justify-around gap-x-8 gap-y-3">
            {partners.map((p) => (
              <span
                key={p}
                className="text-sm font-semibold text-muted-foreground/80 tracking-wide uppercase"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
