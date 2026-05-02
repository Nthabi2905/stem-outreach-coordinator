import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, School, Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-map-illustration.png";

const stats = [
  { icon: TrendingUp, value: "1,248", label: "Outreach Events", change: "+18%", note: "from last month", tint: "bg-logo-purple/10 text-logo-purple" },
  { icon: School, value: "3,452", label: "Schools Reached", change: "+21%", note: "from last month", tint: "bg-logo-teal/10 text-logo-teal" },
  { icon: Users, value: "245,892", label: "Learners Impacted", change: "+24%", note: "from last month", tint: "bg-logo-orange/10 text-logo-orange" },
  { icon: MapPin, value: "9 / 9", label: "Provinces Covered", change: "100%", note: "Coverage", tint: "bg-logo-blue/10 text-logo-blue" },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 lg:pt-24 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-6">
              Smarter Outreach.
              <br />
              Stronger Communities.
              <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Powered by AI.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              EduReach AI is the first national, AI-powered coordination system for
              STEM and space science outreach — solving a long-standing challenge.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2 shadow-md">
                  Request a Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/questionnaires">
                <Button size="lg" variant="outline" className="border-secondary/40 text-secondary hover:bg-secondary/5">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: illustration */}
          <div className="relative">
            <img
              src={heroIllustration}
              alt="South Africa STEM outreach network with learners and connected science icons"
              className="w-full h-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-10 lg:mt-14 bg-card/80 backdrop-blur border border-border rounded-2xl shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-4 p-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.tint}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground leading-tight">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-[11px] mt-0.5">
                    <span className="text-logo-teal font-semibold">{s.change}</span>{" "}
                    <span className="text-muted-foreground">{s.note}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
