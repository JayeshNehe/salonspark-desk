import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/salon-registration" element={<PageTransition><SalonRegistration /></PageTransition>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><PageTransition><Dashboard /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Layout><PageTransition><Appointments /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Layout><PageTransition><Customers /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Layout><PageTransition><Services /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Layout><PageTransition><Billing /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Layout><PageTransition><Inventory /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><Layout><PageTransition><Staff /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><PageTransition><Reports /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><PageTransition><Settings /></PageTransition></Layout></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="salon-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AnimatedRoutes />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
