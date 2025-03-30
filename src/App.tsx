
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import { RenderTest } from "./utils/renderTest";
import { supabase } from "@/integrations/supabase/client";
import GoogleAdsScript from "@/components/GoogleAdsScript";
import UploadPage from "./pages/UploadPage";

// Create a client
const queryClient = new QueryClient();

// Add your Google AdSense client ID here 
const GOOGLE_AD_CLIENT = "YOUR_GOOGLE_AD_CLIENT_ID"; // Replace with actual client ID when provided

function App() {
  console.log('App component rendering');
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('App component mounted');
    
    // Verify Supabase initialization
    const checkSupabase = async () => {
      try {
        // Test if Supabase client is properly initialized by making a simple call
        await supabase.auth.getSession();
        setSupabaseInitialized(true);
        console.log("Supabase client initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Supabase client:", error);
        setInitError(error instanceof Error ? error.message : String(error));
      }
    };
    
    checkSupabase();
    
    return () => console.log('App component unmounting');
  }, []);

  if (initError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">Initialization Error</h1>
          <p className="mb-4">There was a problem initializing the application:</p>
          <div className="bg-gray-100 p-3 rounded overflow-auto">
            <code className="text-sm break-all">{initError}</code>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            This could be due to missing environment variables. Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are properly set.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* Include Google Ads Script */}
        <GoogleAdsScript adClient={GOOGLE_AD_CLIENT} />
        {/* Add render test component */}
        <RenderTest id="app-level-test" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
