import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Map from "./pages/Map";
import Dashboard from "./pages/Dashboard";
import Weather from "./pages/Weather";
import Emergency from "./pages/Emergency";
import Safety from "./pages/Safety";
import Settings from "./pages/Settings";
import SignReader from "./pages/SignReader";
import AROverlay from "./pages/AROverlay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <FloatingSidebar />
          <main className="lg:pl-24">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/map" element={<Map />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/sign-reader" element={<SignReader />} />
              <Route path="/ar-overlay" element={<AROverlay />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
