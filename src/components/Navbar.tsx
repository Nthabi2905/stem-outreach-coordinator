import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const publicLinks = [
    { label: "How It Works", to: "/how-it-works" },
    { label: "Solutions", to: "/solutions" },
    { label: "Impact", to: "/impact" },
    { label: "Resources", to: "/resources" },
    { label: "About Us", to: "/#about" },
  ];

  const authLinks = [
    { label: "Dashboard", to: "/" },
    { label: "Campaigns", to: "/campaigns" },
    { label: "Planning", to: "/planning" },
    { label: "Partner with Us", to: "/questionnaires" },
  ];

  const links = user ? authLinks : publicLinks;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="EduReach AI" className="w-10 h-10 object-contain" />
            <span className="font-bold text-lg text-foreground hidden sm:block">
              EduReach <span className="text-primary">AI</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="border-secondary/40 text-secondary hover:bg-secondary/5">
                    Log In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { setIsOpen(false); handleSignOut(); }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-destructive hover:bg-muted rounded-md"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-primary hover:bg-muted rounded-md"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
