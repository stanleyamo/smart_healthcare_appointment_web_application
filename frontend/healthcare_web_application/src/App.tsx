import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import PatientSearch from "./pages/PatientSearch";
import Registration from "./pages/Registration";
import Appointments from "./pages/Appointments";
import Consultations from "./pages/Consultations";
import Prescriptions from "./pages/Prescriptions";
import ProtectedRoute from "@/components/ProtectedRoute.tsx";
import Labs from "./pages/Labs";
import AuditLogs from "./pages/AuditLogs";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PatientDetail from "./pages/PatientDetail";
import { SettingsProvider } from "./context/SettingsContext";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Base Protected Routes (Shared by all staff) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Index />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/patients" element={<PatientSearch />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
              </Route>

              {/* Front Desk / OPD Routes */}
              <Route element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN"]} />}>
                <Route path="/register" element={<Registration />} />
              </Route>

              {/* Clinical & Nursing Routes */}
              <Route element={<ProtectedRoute allowedRoles={["DOCTOR", "NURSE", "RECEPTIONIST", "ADMIN"]} />}>
                <Route path="/appointments" element={<Appointments />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["DOCTOR", "ADMIN", "NURSE"]} />}>
                <Route path="/consultations" element={<Consultations />} />
              </Route>


              <Route element={<ProtectedRoute allowedRoles={["DOCTOR", "LAB_TECH", "NURSE", "ADMIN"]} />}>
                <Route path="/labs" element={<Labs />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["DOCTOR", "PHARMACIST", "ADMIN"]} />}>
                <Route path="/prescriptions" element={<Prescriptions />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/audit" element={<AuditLogs />} />
                <Route path="/users" element={<UserManagement />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </QueryClientProvider>
);

export default App;