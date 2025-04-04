import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/config/env';

// TestPage for meal analysis functionality
const TestPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication on load
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (!data.session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to use the test features",
          variant: "destructive"
        });
      }
    };
    
    checkAuth();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    const file = event.target.files[0];
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!preview) {
      toast({
        title: "No image selected",
        description: "Please select an image to analyze",
        variant: "destructive"
      });
      return;
    }
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use this feature",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setRawResponse(null);
    setAnalysis(null);
    
    try {
      // Get the authentication session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }
      
      // Call the secure Edge Function endpoint
      const response = await fetch(
        `${env.SUPABASE_URL}/functions/v1/meal-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            imageBase64: preview,
            mealName: 'Test Meal',
            description: 'Meal from test page',
            isPremium: false
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze meal');
      }
      
      const data = await response.json();
      setRawResponse(JSON.stringify(data, null, 2));
      
      // Set the analysis data
      if (data.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Analysis Successful",
          description: "Meal analyzed successfully"
        });
      } else {
        throw new Error('No analysis data returned');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze meal');
      toast({
        title: "Analysis Failed",
        description: err.message || "An error occurred during analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Test Meal Analysis</h1>
          
          <div className="max-w-3xl mx-auto">
            {!analysis && !rawResponse ? (
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
                      Upload Image
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
                    {selectedFile && (
                      <p className="mt-2 text-sm text-gray-500">{selectedFile.name}</p>
                    )}
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
                  
                  <Button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isAnalyzing || !isAuthenticated}
                    className="w-full"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Using Secure API'}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {error && (
                  <Card className="p-4 border-red-300 bg-red-50">
                    <div className="text-red-600">{error}</div>
                  </Card>
                )}
                
                {rawResponse && (
                  <Card className="p-4">
                    <h2 className="text-lg font-semibold mb-2">Raw API Response</h2>
                    <div className="bg-gray-100 p-4 rounded-md overflow-auto">
                      <pre className="text-sm whitespace-pre-wrap">
                        {rawResponse}
                      </pre>
                    </div>
                  </Card>
                )}
                
                {analysis && (
                  <Card className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Calories</h3>
                        <div className="flex items-center gap-2">
                          <Progress value={analysis.calories / 2000} className="w-full" />
                          <span className="font-medium">{analysis.calories} kcal</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Macronutrients</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Protein</div>
                            <div className="font-medium">{analysis.macronutrients.protein}g</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Carbs</div>
                            <div className="font-medium">{analysis.macronutrients.carbs}g</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Fat</div>
                            <div className="font-medium">{analysis.macronutrients.fat}g</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Health Score</h3>
                        <div className="flex items-center gap-2">
                          <Progress value={analysis.healthScore / 10 * 100} className="w-full" />
                          <span className="font-medium">{analysis.healthScore}/10</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {analysis.foods && analysis.foods.map((ingredient: string, i: number) => (
                            <li key={i}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {analysis.recommendations && analysis.recommendations.map((rec: string, i: number) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}
                
                <Button onClick={() => {
                  setAnalysis(null);
                  setRawResponse(null);
                  setError(null);
                }}>
                  Test Another Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestPage; 