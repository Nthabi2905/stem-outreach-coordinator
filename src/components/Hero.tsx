import { Button } from "@/components/ui/button";
import { GraduationCap, Target, Users, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
          <Rocket className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            AI-Powered STEM Outreach
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Connect Schools with
          <br />
          <span className="text-primary">
            Space & STEM Education
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Automate outreach coordination, discover underserved schools, and create
          lasting impact in STEM education across South Africa.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow transition-all hover:scale-105 gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/questionnaires">
            <Button 
              size="lg" 
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              Learn More
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              AI School Finder
            </h3>
            <p className="text-muted-foreground text-sm">
              Discover underserved schools based on location, infrastructure, and STEM needs
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Smart Coordination
            </h3>
            <p className="text-muted-foreground text-sm">
              Auto-generate schedules, routes, and professional communication templates
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Impact Reports
            </h3>
            <p className="text-muted-foreground text-sm">
              Automatically generate visual impact reports with photos and metrics
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;