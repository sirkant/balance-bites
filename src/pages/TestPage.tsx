import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';
import { analyzeMeal } from '@/services/ai';
import OpenAI from 'openai';
import { env } from '@/config/env';

const TestPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleAnalyze = async () => {
    if (!preview) {
      toast({
        title: "Image required",
        description: "Please upload an image to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setRawResponse(null);
    
    try {
      // Use the local analyzeMeal function directly
      const result = await analyzeMeal(preview, false);
      setAnalysis(result);
      
      toast({
        title: "Analysis Complete",
        description: "Your meal has been successfully analyzed",
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze meal. Please try again.');
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your meal",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Direct call to OpenAI for testing
  const handleDirectOpenAICall = async () => {
    if (!preview) {
      toast({
        title: "Image required",
        description: "Please upload an image to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setRawResponse(null);
    setAnalysis(null);
    
    try {
      // Initialize OpenAI client directly
      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const FREE_PROMPT = `Analyze this meal image and provide basic nutritional information. Include:
1. Estimated calories
2. Basic macronutrients (protein, carbs, fat)
3. List of main ingredients
4. A simple health score (1-10)
5. 2-3 basic recommendations for improvement

Format the response as JSON with the following structure:
{
  "calories": number,
  "macronutrients": {
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "ingredients": string[],
  "healthScore": number,
  "recommendations": string[]
}`;

      console.log('Making direct OpenAI API call...');
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: FREE_PROMPT,
              },
              {
                type: 'image_url',
                image_url: {
                  url: preview,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      // Store the raw response for inspection
      const content = response.choices[0].message.content || '{}';
      setRawResponse(content);
      
      // Try to parse it as JSON
      try {
        const parsedAnalysis = JSON.parse(content);
        setAnalysis(parsedAnalysis);
        toast({
          title: "Direct OpenAI Call Successful",
          description: "Response received and parsed successfully",
        });
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        setError('Response was not valid JSON. See raw response below.');
        toast({
          title: "JSON Parsing Failed",
          description: "The response was not valid JSON",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Direct OpenAI error:', err);
      setError('Failed to call OpenAI API directly. See console for details.');
      toast({
        title: "Direct OpenAI Call Failed",
        description: "Failed to connect to OpenAI API",
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
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleAnalyze}
                      disabled={!selectedFile || isAnalyzing}
                      className="flex-1"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Using Service'}
                    </Button>
                    
                    <Button
                      onClick={handleDirectOpenAICall}
                      disabled={!selectedFile || isAnalyzing}
                      className="flex-1"
                      variant="secondary"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Direct OpenAI Call'}
                    </Button>
                  </div>
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
                    <h2 className="text-lg font-semibold mb-2">Raw OpenAI Response</h2>
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
                          <Progress value={analysis.healthScore / 10} className="w-full" />
                          <span className="font-medium">{analysis.healthScore}/10</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.ingredients?.map((ingredient: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {ingredient}
                            </Badge>
                          )) || <p>No ingredients found</p>}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                        <ul className="list-disc list-inside space-y-2">
                          {analysis.recommendations?.map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          )) || <p>No recommendations found</p>}
                        </ul>
                      </div>

                      <Button onClick={() => {
                        setAnalysis(null);
                        setRawResponse(null);
                      }} variant="outline">
                        Analyze Another Image
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestPage; 