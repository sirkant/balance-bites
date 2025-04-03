import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TestEdgeFunction = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [isPremiumTest, setIsPremiumTest] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      if (!data.session) {
        toast({
          title: "Not logged in",
          description: "This test requires authentication. Please log in first.",
          variant: "destructive"
        });
      }
    };
    
    checkAuth();
  }, [toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const testMealsFunction = async () => {
    if (!preview || !isAuthenticated) {
      toast({
        title: "Error",
        description: "Please upload an image and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResponse(null);
    setRawResponse(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('You need to be logged in');
      }

      // Use environment variable for Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ozyzkeddhldosnxwrnok.supabase.co";
      
      console.log("Using Supabase URL:", supabaseUrl);
      console.log("Testing /meals edge function...");
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/meals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            imageBase64: preview,
            mealName: "Test Meal",
            description: "Testing edge function"
          }),
        }
      );
      
      // Store the raw response text
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      setRawResponse(responseText);
      
      // Try to parse as JSON if possible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        setResponse({
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        setError(`Non-JSON response (${response.status} ${response.statusText}): ${responseText}`);
        throw new Error(`Non-JSON response: ${responseText}`);
      }
      
      if (!response.ok) {
        setError(`Error: ${response.status} ${response.statusText}. Check raw response for details.`);
        toast({
          title: "Edge Function Error",
          description: `Error: ${response.status} ${response.statusText}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Edge function responded successfully",
          variant: "default"
        });
      }
    } catch (err: any) {
      console.error("Error testing edge function:", err);
      setError(err.message || "Unknown error occurred");
      toast({
        title: "Error",
        description: err.message || "Failed to test edge function",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const testMealAnalysisFunction = async () => {
    if (!preview || !isAuthenticated) {
      toast({
        title: "Error",
        description: "Please upload an image and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResponse(null);
    setRawResponse(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('You need to be logged in');
      }

      // Use environment variable for Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ozyzkeddhldosnxwrnok.supabase.co";
      
      console.log("Using Supabase URL:", supabaseUrl);
      console.log(`Testing /meal-analysis edge function with isPremium=${isPremiumTest}...`);
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/meal-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            imageBase64: preview,
            mealName: "Test Meal",
            description: "Testing edge function analysis",
            isPremium: isPremiumTest
          }),
        }
      );
      
      // Store the raw response text
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      setRawResponse(responseText);
      
      // Try to parse as JSON if possible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        setResponse({
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        setError(`Non-JSON response (${response.status} ${response.statusText}): ${responseText}`);
        throw new Error(`Non-JSON response: ${responseText}`);
      }
      
      if (!response.ok) {
        setError(`Error: ${response.status} ${response.statusText}. Check raw response for details.`);
        toast({
          title: "Edge Function Error",
          description: `Error: ${response.status} ${response.statusText}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Edge function responded successfully",
          variant: "default"
        });
      }
    } catch (err: any) {
      console.error("Error testing edge function:", err);
      setError(err.message || "Unknown error occurred");
      toast({
        title: "Error",
        description: err.message || "Failed to test edge function",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Test Supabase Edge Functions</h1>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Test Image</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
                    Select Image
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-violet-50 file:text-violet-700
                      hover:file:bg-violet-100"
                  />
                </div>
                
                {preview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-60 rounded-md object-contain" 
                    />
                  </div>
                )}
              </div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Test /meals Function</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Tests the Supabase Edge Function at /functions/v1/meals
                </p>
                <Button
                  onClick={testMealsFunction}
                  disabled={!preview || isProcessing || !isAuthenticated}
                  className="w-full"
                >
                  {isProcessing ? 'Testing...' : 'Test /meals Function'}
                </Button>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Test /meal-analysis Function</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Tests the Supabase Edge Function at /functions/v1/meal-analysis
                </p>
                <div className="flex items-center mb-4">
                  <label className="flex items-center cursor-pointer">
                    <div className="mr-2 text-sm font-medium">Premium Mode:</div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={isPremiumTest}
                        onChange={() => setIsPremiumTest(!isPremiumTest)}
                      />
                      <div className={`block w-14 h-8 rounded-full ${isPremiumTest ? 'bg-indigo-600' : 'bg-gray-400'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPremiumTest ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>
                <Button
                  onClick={testMealAnalysisFunction}
                  disabled={!preview || isProcessing || !isAuthenticated}
                  className="w-full"
                >
                  {isProcessing ? 'Testing...' : `Test /meal-analysis (${isPremiumTest ? 'Premium' : 'Free'})`}
                </Button>
              </Card>
            </div>
            
            {error && (
              <Card className="p-6 border-red-200 bg-red-50">
                <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
                <p className="text-red-600 whitespace-pre-wrap">{error}</p>
              </Card>
            )}
            
            {rawResponse && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Raw Response</h2>
                <div className="bg-gray-100 p-4 rounded-md overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {rawResponse}
                  </pre>
                </div>
              </Card>
            )}
            
            {response && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Parsed Response</h2>
                <div className="bg-gray-100 p-4 rounded-md overflow-auto">
                  <pre className="text-sm">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestEdgeFunction; 