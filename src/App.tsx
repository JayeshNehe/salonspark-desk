import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Customers from "./pages/Customers";
import Services from "./pages/Services";
import Billing from "./pages/Billing";
import Inventory from "./pages/Inventory";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import SalonRegistration from "./pages/SalonRegistration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="salon-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/salon-registration" element={<SalonRegistration />} />
              {/* Shared routes accessible by both admin and receptionist */}
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              
              {/* Receptionist routes */}
              <Route path="/appointments" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['admin', 'receptionist']}><Layout><Appointments /></Layout></RoleProtectedRoute></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['admin', 'receptionist']}><Layout><Customers /></Layout></RoleProtectedRoute></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['admin', 'receptionist']}><Layout><Billing /></Layout></RoleProtectedRoute></ProtectedRoute>} />
              
              {/* Admin-only routes */}
              <Route path="/services" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['admin']}><Layout><Services /></Layout></RoleProtectedRoute></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['admin']}><Layout><Inventory /></Layout></RoleProtectedRoute></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['admin']}><Layout><Staff /></Layout></RoleProtectedRoute></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['admin']}><Layout><Reports /></Layout></RoleProtectedRoute></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={['admin']}><Layout><Settings /></Layout></RoleProtectedRoute></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
