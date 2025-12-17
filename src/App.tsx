import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SchoolResponse from "./pages/SchoolResponse";
import Questionnaires from "./pages/Questionnaires";
import AdminDashboard from "./pages/AdminDashboard";
import PlanningTool from "./pages/PlanningTool";
import Campaigns from "./pages/Campaigns";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
