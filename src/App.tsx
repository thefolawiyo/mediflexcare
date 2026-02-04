import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import LabTests from "./pages/LabTests";
import Pharmacy from "./pages/Pharmacy";
import AdminStaff from "./pages/AdminStaff";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/lab" element={<LabTests />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/settings" element={<Settings />} />
            {/* Placeholder routes for other sections */}
            <Route path="/doctor/patients" element={<Dashboard />} />
            <Route path="/nurse/care" element={<Dashboard />} />
            <Route path="/nurse/vitals" element={<Dashboard />} />
            <Route path="/admin/reports" element={<Dashboard />} />
            <Route path="/admin/departments" element={<Dashboard />} />
            <Route path="/admin/audit" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
