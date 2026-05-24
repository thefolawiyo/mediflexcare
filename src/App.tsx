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
import Reports from "./pages/Reports";
import Departments from "./pages/Departments";
import AuditLogs from "./pages/AuditLogs";
import DoctorPatients from "./pages/DoctorPatients";
import NurseCare from "./pages/NurseCare";
import NurseVitals from "./pages/NurseVitals";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientLabResults from "./pages/patient/PatientLabResults";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";

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
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/nurse/care" element={<NurseCare />} />
            <Route path="/nurse/vitals" element={<NurseVitals />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/departments" element={<Departments />} />
            <Route path="/admin/audit" element={<AuditLogs />} />
            <Route path="/portal/appointments" element={<PatientAppointments />} />
            <Route path="/portal/labs" element={<PatientLabResults />} />
            <Route path="/portal/prescriptions" element={<PatientPrescriptions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
