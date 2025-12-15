import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, AlertCircle, Mail, Lock, User, GraduationCap, Building2, School, UserCheck, ChevronRight } from "lucide-react";
import { validatePassword } from "@/utils/passwordValidation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"school_official" | "learner">("learner");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Signed in successfully!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      return;
    }
    
    setPasswordErrors([]);
    setIsLoading(true);

    try {
      const metadata = {
        full_name: fullName,
        role: role,
      };

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Account created successfully!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: "Admin",
      email: "admin@stemreach.org",
      password: "demo123456",
      description: "System oversight & analytics",
      icon: UserCheck,
      color: "bg-primary/10 text-primary",
    },
    {
      role: "Organization",
      email: "org@stemreach.org",
      password: "demo123456",
      description: "Plan outreach activities",
      icon: Building2,
      color: "bg-amber-100 text-amber-600",
    },
    {
      role: "School Official",
      email: "school@stemreach.org",
      password: "demo123456",
      description: "Request STEM support",
      icon: School,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      role: "Learner",
      email: "learner@stemreach.org",
      password: "demo123456",
      description: "Access learning resources",
      icon: GraduationCap,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Welcome to</p>
            <h1 className="text-3xl font-bold text-primary">EduReach AI</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Revolutionizing STEM Outreach<br />
              Across South Africa
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Select value={role} onValueChange={(value: "school_official" | "learner") => setRole(value)}>
                  <SelectTrigger className="h-12 bg-card border-border">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school_official">School/Departmental Official</SelectItem>
                    <SelectItem value="learner">Learner (Request mentorship)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground px-1">
                  Organizations can contact us directly to set up admin accounts
                </p>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordErrors.length > 0) {
                        setPasswordErrors([]);
                      }
                    }}
                    className="pl-10 h-12 bg-card border-border"
                    required
                    minLength={12}
                  />
                </div>
                {passwordErrors.length > 0 && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-muted-foreground px-1">
                  Password must be at least 12 characters with uppercase, lowercase, number, and special character
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Demo Accounts */}
        <div className="space-y-3">
          <p className="text-center text-sm font-medium text-foreground">Demo Accounts</p>
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${account.color}`}>
                  <account.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-foreground">{account.role}</p>
                  <p className="text-xs text-muted-foreground">{account.email}</p>
                  <p className="text-xs text-muted-foreground">{account.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;