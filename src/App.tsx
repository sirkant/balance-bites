import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import { RenderTest } from "./utils/renderTest";
import { supabase } from "@/integrations/supabase/client";
import GoogleAdsScript from "@/components/GoogleAdsScript";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";
import MealUploadPage from "./pages/MealUploadPage";
import TestPage from "./pages/TestPage";
import TestEdgeFunction from "./pages/TestEdgeFunction";

// Create a client
const queryClient = new QueryClient();

// Add your Google AdSense client ID here 
const GOOGLE_AD_CLIENT = "YOUR_GOOGLE_AD_CLIENT_ID"; // Replace with actual client ID when provided

function App() {
  console.log('App component rendering');
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  
  useEffect(() => {
    console.log('App component mounted');
    
    // Verify Supabase initialization
    const checkSupabase = async () => {
      try {
        // Test if Supabase client is properly initialized by making a simple call
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.log("Auth session check:", data.session ? "Active session" : "No active session");
        setSupabaseInitialized(true);
        setAuthReady(true);
        console.log("Supabase client initialized successfully");
        
        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log("Auth state changed:", event, session ? "Session exists" : "No session");
          }
        );
        
        return () => {
          authListener.subscription.unsubscribe();
        };
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
            <Route path="/auth/callback" element={<AuthRedirect />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/meal-upload" element={<MealUploadPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/test-edge" element={<TestEdgeFunction />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Component to handle auth redirects
function AuthRedirect() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // Redirect to dashboard on successful auth
        navigate('/dashboard');
      } catch (error) {
        console.error('Error handling auth redirect:', error);
        setError(error instanceof Error ? error.message : String(error));
        navigate('/auth');
      }
    };
    
    handleRedirect();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? (
        <div className="text-red-500">Authentication error: {error}</div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Completing authentication...</p>
        </div>
      )}
    </div>
  );
}

export default App;
