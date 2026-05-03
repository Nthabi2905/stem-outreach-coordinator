import { Link } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  BarChart3,
  Layers,
  Users,
  Link2,
  Download,
  ArrowRight,
  Calendar,
  UserCircle2,
  Camera,
  LineChart,
  Upload,
  Mail,
  Heart,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  {
    icon: BookOpen,
    title: "Guides & Manuals",
    desc: "Step-by-step guides to plan and run successful STEM outreach programs.",
    cta: "Explore Guides",
    color: "logo-purple",
  },
  {
    icon: Briefcase,
    title: "Toolkits & Templates",
    desc: "Practical templates, checklists and tools to simplify your outreach journey.",
    cta: "Explore Toolkits",
    color: "logo-teal",
  },
  {
    icon: BarChart3,
    title: "Reports & Insights",
    desc: "Data, research and insights on STEM outreach and learner impact.",
    cta: "Explore Reports",
    color: "logo-blue",
  },
  {
    icon: Layers,
    title: "Training & Webinars",
    desc: "Build your skills with training materials and expert-led webinars.",
    cta: "Explore Training",
    color: "logo-orange",
  },
  {
    icon: Users,
    title: "Best Practices",
    desc: "Learn from what works. Real-world examples and proven approaches.",
    cta: "Explore Practices",
    color: "logo-teal",
  },
  {
    icon: Link2,
    title: "Partnership Resources",
    desc: "Information and tools to collaborate, partner and drive change.",
    cta: "Explore Resources",
    color: "logo-purple",
  },
];

const featured = [
  {
    title: "Planning a STEM Outreach Program",
    desc: "A comprehensive guide to help organisations design impactful and inclusive outreach programs.",
    tag: "Guide",
    tagColor: "bg-logo-purple/10 text-logo-purple",
    bg: "bg-gradient-to-br from-logo-blue to-logo-navy",
    label: "Planning a STEM Outreach Program",
  },
  {
    title: "Outreach Planning Checklist",
    desc: "Use this step-by-step checklist to ensure you don't miss anything when planning an outreach event.",
    tag: "Toolkit",
    tagColor: "bg-logo-teal/10 text-logo-teal",
    bg: "bg-gradient-to-br from-muted to-background border border-border",
    label: "Outreach Planning Checklist",
    dark: false,
  },
  {
    title: "STEM Outreach Impact Report 2024",
    desc: "National insights into outreach reach, learner impact and underserved communities.",
    tag: "Report",
    tagColor: "bg-logo-blue/10 text-logo-blue",
    bg: "bg-gradient-to-br from-logo-teal to-logo-blue",
    label: "STEM Outreach Impact Report 2024",
  },
  {
    title: "Engaging Learners in STEM",
    desc: "Practical strategies to spark curiosity and build lasting interest in STEM subjects.",
    tag: "Guide",
    tagColor: "bg-logo-orange/10 text-logo-orange",
    bg: "bg-gradient-to-br from-logo-purple to-logo-pink",
    label: "Engaging Learners in STEM",
  },
];

const toolkits = [
  { icon: Calendar, title: "Event Planning Toolkit", desc: "Everything you need to plan a successful event.", bg: "bg-logo-teal/5", color: "text-logo-teal" },
  { icon: UserCircle2, title: "School Engagement Toolkit", desc: "Resources to connect and engage schools effectively.", bg: "bg-logo-purple/5", color: "text-logo-purple" },
  { icon: Camera, title: "On-site Verification Toolkit", desc: "Guides and templates for evidence collection.", bg: "bg-logo-orange/5", color: "text-logo-orange" },
  { icon: LineChart, title: "Impact Reporting Toolkit", desc: "Templates and tools to measure and report impact.", bg: "bg-logo-blue/5", color: "text-logo-blue" },
];

const webinars = [
  { month: "MAY", day: "22", title: "Measuring Impact That Matters", time: "10:00 AM – 11:30 AM SAST" },
  { month: "JUN", day: "05", title: "Engaging Underserved Schools", time: "02:00 PM – 03:30 PM SAST" },
  { month: "JUN", day: "19", title: "Effective STEM Communication", time: "10:00 AM – 11:00 AM SAST" },
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-logo-blue" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Resources to <span className="text-logo-teal">Empower</span>{" "}
              <span className="text-logo-blue">Your Impact</span>
            </h1>
            <Sparkles className="w-4 h-4 text-logo-blue" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore guides, toolkits, reports and training materials to help you plan, deliver and scale high-quality STEM and space science outreach.
          </p>
        </div>

        {/* Categories */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {categories.map((c) => (
              <div key={c.title}>
                <div className={`w-12 h-12 rounded-full bg-${c.color} flex items-center justify-center mb-3`}>
                  <c.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1.5">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{c.desc}</p>
                <button className={`text-xs font-semibold text-${c.color} flex items-center gap-1 hover:gap-2 transition-all`}>
                  {c.cta} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3-column section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Featured Resources */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Featured Resources</h2>
              <button className="text-xs font-semibold text-logo-blue flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-3">
              {featured.map((f) => (
                <div key={f.title} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-20 h-20 rounded-lg ${f.bg} flex items-center justify-center text-white text-[9px] font-bold p-2 text-center flex-shrink-0`}>
                    {f.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground leading-tight">{f.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${f.tagColor} flex-shrink-0`}>{f.tag}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug mb-2 line-clamp-2">{f.desc}</p>
                    <button className="text-xs font-semibold text-logo-blue border border-border rounded px-2 py-1 inline-flex items-center gap-1 hover:bg-muted">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Toolkits */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Toolkits You'll Love</h2>
              <button className="text-xs font-semibold text-logo-blue flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {toolkits.map((t) => (
                <div key={t.title} className={`${t.bg} rounded-xl p-4 text-center`}>
                  <div className={`w-10 h-10 mx-auto rounded-full bg-card flex items-center justify-center mb-2`}>
                    <t.icon className={`w-5 h-5 ${t.color}`} />
                  </div>
                  <h3 className="font-semibold text-xs text-foreground mb-1">{t.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-snug mb-2">{t.desc}</p>
                  <button className={`text-[10px] font-semibold ${t.color} inline-flex items-center gap-0.5`}>
                    Download <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Webinars + Help */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground">Upcoming Webinars</h2>
                <button className="text-xs font-semibold text-logo-blue flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
              </div>
              <div className="space-y-3">
                {webinars.map((w) => (
                  <div key={w.title} className="flex items-center gap-3">
                    <div className="w-12 text-center bg-muted rounded-lg py-1.5 flex-shrink-0">
                      <div className="text-[10px] font-bold text-logo-blue">{w.month}</div>
                      <div className="text-lg font-bold text-foreground leading-none">{w.day}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs text-foreground leading-tight">{w.title}</h3>
                      <p className="text-[10px] text-muted-foreground">{w.time}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-logo-blue/40 text-logo-blue">Register</Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-logo-blue/5 border border-logo-blue/10 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-foreground mb-1">Can't find what you need?</h3>
                  <p className="text-xs text-muted-foreground mb-3">Our team is here to help you find the right resources for your needs.</p>
                  <Button size="sm" variant="outline" className="border-logo-blue/40 text-logo-blue text-xs">
                    Contact Us <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                <MessageCircle className="w-12 h-12 text-logo-blue flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="bg-logo-teal/5 border border-logo-teal/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-logo-teal flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">Have something valuable to share?</h3>
              <p className="text-xs text-muted-foreground mb-3">Contribute your resources and help strengthen the STEM outreach ecosystem across South Africa.</p>
              <Button size="sm" variant="outline" className="text-xs">Submit a Resource <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-logo-teal flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">Stay Updated</h3>
              <p className="text-xs text-muted-foreground mb-3">Subscribe to our newsletter and be the first to know about new resources and events.</p>
              <div className="flex gap-2">
                <Input placeholder="Enter your email address" className="h-9 text-xs" />
                <Button size="sm" className="bg-logo-teal hover:bg-logo-teal/90 text-white">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-2 text-sm text-foreground font-medium mb-1">
            <Heart className="w-4 h-4 text-logo-pink" />
            Knowledge shared is impact multiplied.
          </div>
          <p className="text-sm text-muted-foreground">Together, we can inspire the next generation of innovators.</p>
        </div>
      </div>
    </div>
  );
};

export default Resources;
