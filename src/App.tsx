import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SchoolResponse from "./pages/SchoolResponse";
import Questionnaires from "./pages/Questionnaires";
import AdminDashboard from "./pages/AdminDashboard";
import PlanningTool from "./pages/PlanningTool";
import Campaigns from "./pages/Campaigns";
import HowItWorks from "./pages/HowItWorks";
import Solutions from "./pages/Solutions";
import Impact from "./pages/Impact";
import Resources from "./pages/Resources";
import About from "./pages/About";
import Schools from "./pages/Schools";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/questionnaires" element={<Questionnaires />} />
          <Route path="/admin/responses" element={<AdminDashboard />} />
          <Route path="/planning" element={<PlanningTool />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/school-response/:token" element={<SchoolResponse />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
