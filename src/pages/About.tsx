import { Users, Eye, Star, Calendar, GraduationCap, Rocket, BookOpen, TrendingUp, Quote } from "lucide-react";
import learnersImg from "@/assets/about-learners.jpg";
import founderImg from "@/assets/founder-portrait.jpg";

const pillars = [
  { icon: Users, title: "Our Mission", desc: "Ensure equitable access to STEM opportunities for all learners.", tint: "bg-logo-teal/10 text-logo-teal" },
  { icon: Eye, title: "Our Vision", desc: "A South Africa where every young mind can explore, innovate and shape the future.", tint: "bg-logo-purple/10 text-logo-purple" },
  { icon: Star, title: "Our Purpose", desc: "To coordinate, simplify and amplify STEM outreach for greater impact and equity.", tint: "bg-logo-blue/10 text-logo-blue" },
];

const stats = [
  { icon: Calendar, value: "5+", label: "Years of Experience", tint: "bg-logo-purple/10 text-logo-purple" },
  { icon: GraduationCap, value: "STEM Education", label: "Specialist", tint: "bg-logo-teal/10 text-logo-teal" },
  { icon: Users, value: "1000s", label: "of Learners Reached", tint: "bg-logo-blue/10 text-logo-blue" },
  { icon: Rocket, value: "1 Mission", label: "Equitable STEM Access", tint: "bg-logo-orange/10 text-logo-orange" },
];

const journey = [
  { icon: BookOpen, period: "2016 – 2019", title: "Free State DoE", desc: "Taught Natural Sciences and Life Sciences in the Free State.", tint: "bg-logo-teal/10 text-logo-teal" },
  { icon: Users, period: "2021 – 2024", title: "SANSA", desc: "Science Engagement Officer — delivered STEM workshops, coding programmes and teacher training.", tint: "bg-logo-purple/10 text-logo-purple" },
  { icon: TrendingUp, period: "2025 – Present", title: "Somerset College", desc: "Director: Saturday School — managing operations, curriculum and outreach at scale.", tint: "bg-logo-blue/10 text-logo-blue" },
  { icon: GraduationCap, period: "The Vision Realised", title: "EduReach AI", desc: "Combined years of experience, insight and a passion for equity to build EduReach AI.", tint: "bg-logo-teal/10 text-logo-teal" },
  { icon: Rocket, period: "The Future", title: "A Connected SA", desc: "A connected South Africa where every child can explore, learn and thrive in STEM.", tint: "bg-logo-orange/10 text-logo-orange" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-8">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-logo-teal mb-4">About EduReach AI</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-5">
              Built on purpose.
              <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">Driven by impact.</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-xl">
              EduReach AI is the first national, AI-powered coordination system for STEM and space science outreach in South Africa.
              We connect schools, organisations, districts, sponsors and learners to ensure every child — no matter where they are — has access to life-changing STEM opportunities.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {pillars.map((p) => (
                <div key={p.title}>
                  <div className={`w-10 h-10 rounded-xl ${p.tint} flex items-center justify-center mb-3`}>
                    <p.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src={learnersImg}
              alt="South African learners exploring robotics"
              className="w-full h-auto rounded-2xl shadow-lg object-cover"
              width={1024}
              height={704}
              loading="lazy"
            />
            <div className="absolute -bottom-6 left-6 right-6 bg-card border border-border rounded-2xl p-4 shadow-md">
              <div className="flex gap-3">
                <Quote className="w-6 h-6 text-logo-teal flex-shrink-0" />
                <p className="text-sm text-foreground">
                  Closing the gap. Creating opportunities. Building a future where every learner can{" "}
                  <span className="text-logo-blue font-semibold">reach for the stars.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Founder + Inspiration */}
        <div className="grid lg:grid-cols-2 gap-6 pt-8">
          {/* Founder */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-logo-purple mb-6">Our Founder</h2>
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <img
                src={founderImg}
                alt="Nthabiseng Moloi, Founder of EduReach AI"
                className="w-32 h-32 rounded-full object-cover border-4 border-logo-teal/20 flex-shrink-0"
                width={512}
                height={512}
                loading="lazy"
              />
              <div>
                <h3 className="text-lg font-bold text-foreground">Nthabiseng Moloi</h3>
                <p className="text-sm text-logo-blue font-semibold mb-3">Founder & STEM Outreach Specialist</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  Nthabiseng Moloi is a results-driven Project and Education Specialist with 5+ years of experience managing STEM education programmes, workshops, and large-scale initiatives across South Africa.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  Her career spans teaching Natural and Life Sciences in the Free State, leading science engagement at SANSA, and now directing the Somerset College Saturday School.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Her dedication to education equity and innovation led to the creation of EduReach AI.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              {stats.map((s) => (
                <div key={s.label} className="flex items-start gap-2">
                  <div className={`w-8 h-8 rounded-lg ${s.tint} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground leading-tight">{s.value}</div>
                    <div className="text-[11px] text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspiration */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-logo-teal mb-5">What Inspired EduReach AI?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Despite the passion and commitment of many organisations, STEM outreach in South Africa has long been fragmented, manual and unequal.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Schools in underserved communities often miss out — not because of lack of need, but because of lack of visibility, coordination and capacity.
            </p>
            <p className="text-sm font-bold text-foreground mb-3">EduReach AI was born out of a simple belief:</p>
            <div className="bg-logo-teal/5 border-l-4 border-logo-teal rounded-r-lg p-4 flex gap-3">
              <Quote className="w-5 h-5 text-logo-teal flex-shrink-0" />
              <p className="text-sm text-foreground italic">
                Every learner deserves access to the opportunities that can change their future.
              </p>
            </div>
          </div>
        </div>

        {/* Journey */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-logo-blue mb-8">Our Journey So Far</h2>
          <div className="relative">
            <div className="hidden lg:block absolute top-7 left-0 right-0 h-px bg-border" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {journey.map((j) => (
                <div key={j.title} className="text-center">
                  <div className={`w-14 h-14 mx-auto rounded-full ${j.tint} flex items-center justify-center mb-3 relative z-10 bg-card border-2 border-current`}>
                    <j.icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">{j.period}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{j.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Future belief */}
        <div className="bg-gradient-to-br from-logo-blue/5 to-logo-teal/5 border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-logo-blue mb-4">A Future We Believe In</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-3xl">
            We believe in a South Africa where talent is everywhere, but opportunity is not. EduReach AI exists to change that — with data, technology and heart.
          </p>
          <p className="text-base font-semibold text-logo-teal max-w-3xl">
            Together, we can reach every learner, in every community, every time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
