import React from 'react';
import { useState } from 'react';
import { analyzeMeal, generateMealRecommendations } from '@/services/ai';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/UpgradePrompt';

interface MealAnalysisProps {
  imageUrl: string;
  onAnalysisComplete: (analysis: any, recommendations: string[]) => void;
  onError: (error: Error) => void;
  isPremium: boolean;
}

export function MealAnalysis({ imageUrl, onAnalysisComplete, onError, isPremium }: MealAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { isLoading } = useSubscription();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      const result = await analyzeMeal(imageUrl, isPremium);
      
      // Validate the result has required fields
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from meal analysis');
      }
      
      // Ensure required fields exist
      if (!result.calories || !result.macronutrients || !result.ingredients || 
          !result.healthScore || !result.recommendations) {
        console.warn('Missing required fields in analysis result:', result);
      }
      
      // Set defaults for any missing fields to prevent UI errors
      const validatedResult = {
        calories: result.calories || 0,
        macronutrients: {
          protein: result.macronutrients?.protein || 0,
          carbs: result.macronutrients?.carbs || 0,
          fat: result.macronutrients?.fat || 0
        },
        micronutrients: isPremium ? {
          fiber: result.micronutrients?.fiber || 0,
          sugar: result.micronutrients?.sugar || 0,
          sodium: result.micronutrients?.sodium || 0
        } : undefined,
        ingredients: Array.isArray(result.ingredients) ? result.ingredients : [],
        healthScore: result.healthScore || 5,
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
      };
      
      setAnalysis(validatedResult);
      
      // Get recommendations
      let recommendations = validatedResult.recommendations || [];
      if (isPremium) {
        try {
          const generatedRecommendations = await generateMealRecommendations({
            dietaryRestrictions: [],
            healthGoals: [],
            allergies: [],
          }, true);
          if (generatedRecommendations && generatedRecommendations.length > 0) {
            recommendations = generatedRecommendations;
          }
        } catch (recError) {
          console.error('Error generating recommendations:', recError);
        }
      }
      
      onAnalysisComplete?.(validatedResult, recommendations);
    } catch (err) {
      setError('Failed to analyze meal. Please try again.');
      console.error(err);
      onError?.(err as Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500">{error}</div>
        <Button onClick={handleAnalyze} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  if (!analysis) {
    return (
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
          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Meal'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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

          {isPremium && analysis.micronutrients && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Micronutrients</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Fiber</div>
                  <div className="font-medium">{analysis.micronutrients.fiber}g</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Sugar</div>
                  <div className="font-medium">{analysis.micronutrients.sugar}g</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Sodium</div>
                  <div className="font-medium">{analysis.micronutrients.sodium}mg</div>
                </div>
              </div>
            </div>
          )}

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
              {analysis.ingredients.map((ingredient: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
            <ul className="list-disc list-inside space-y-2">
              {analysis.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>

          {isPremium && (
            <>
              {analysis.allergens && analysis.allergens.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Potential Allergens</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.allergens.map((allergen: string, index: number) => (
                      <Badge key={index} variant="destructive">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.benefits && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Nutritional Benefits</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {analysis.benefits.map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.alternatives && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Healthier Alternatives</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {analysis.alternatives.map((alt: string, index: number) => (
                      <li key={index}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.timingRecommendations && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Meal Timing</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {analysis.timingRecommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <Button onClick={handleAnalyze} variant="outline">
            Reanalyze
          </Button>
        </div>
      </Card>

      {!isPremium && <UpgradePrompt />}
    </div>
  );
}

export default MealAnalysis; 