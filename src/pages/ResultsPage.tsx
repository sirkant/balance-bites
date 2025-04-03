import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Analysis from '@/components/Analysis';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Clock, ArrowLeft, Share2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

interface LocationState {
  mealData?: any;
  mealId?: string;
}

interface FoodDetail {
  category?: string;
  description?: string;
  nutritionalValue?: string;
}

interface FoodGroupsEvaluation {
  count: number;
  missing: string[];
  explanation: string;
}

interface MealAnalysis {
  foods: string[];
  calories: number;
  nutritionScore?: number;
  nutritionScoreExplanation?: string;
  confidence: 'high' | 'medium' | 'low';
  macronutrients?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  micronutrients?: {
    fiber?: number;
    sugar?: number;
    sodium?: number;
    vitamins?: string[];
    minerals?: string[];
  };
  evaluation?: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  foodDetails?: Record<string, FoodDetail>;
  foodGroupsEvaluation?: FoodGroupsEvaluation;
  // Premium features
  overallNutriScore?: string; // A-E grade
  nutrientBreakdown?: {
    sugar?: {
      amount: number;
      unit: string;
      level: string; // "low", "moderate", or "high"
    };
    salt?: {
      amount: number;
      unit: string;
      level: string; // "low", "moderate", or "high"
    };
    fiber?: {
      amount: number;
      unit: string;
      level: string; // "low", "moderate", "good", or "excellent"
    };
    proteinQuality?: string; // "incomplete", "moderate", or "complete"
    saturatedFat?: {
      amount: number;
      unit: string;
      level: string; // "low", "moderate", or "high"
    };
  };
  personalizedRecommendations?: string[];
}

interface Meal {
  id: string;
  user_id: string;
  meal_name: string;
  description?: string;
  meal_time: string;
  image_url: string;
  created_at: string;
  analysis: MealAnalysis;
}

const ResultsPage = () => {
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;
  const { isPremium: subscriptionPremium } = useSubscription();
  const [overridePremium, setOverridePremium] = useState(false);
  const isPremium = subscriptionPremium || overridePremium; // Use either the subscription or override

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to view meal analysis results."
        });
        navigate('/auth', { replace: true });
        return;
      }
      
      if (state?.mealData) {
        console.log("Using meal data from navigation state");
        setMeal(state.mealData);
        setLoading(false);
      } else if (state?.mealId) {
        console.log("Fetching meal with ID:", state.mealId);
        fetchMealById(state.mealId, data.session.access_token);
      } else {
        console.log("No meal data in state, fetching most recent meal");
        fetchMostRecentMeal(data.session.access_token);
      }
    };

    checkAuth();
  }, [navigate, state, toast]);

  // Ensure meal analysis has a valid structure
  useEffect(() => {
    if (meal && (!meal.analysis || !meal.analysis.foods)) {
      // If meal exists but analysis is missing proper structure, add default values
      setMeal(prevMeal => ({
        ...prevMeal,
        analysis: {
          ...prevMeal.analysis || {},
          foods: prevMeal.analysis?.foods || [],
          calories: prevMeal.analysis?.calories || 0,
          nutritionScore: prevMeal.analysis?.nutritionScore || 0,
          confidence: prevMeal.analysis?.confidence || 'medium',
          macronutrients: prevMeal.analysis?.macronutrients || {
            protein: 0,
            carbs: 0,
            fat: 0
          },
          evaluation: prevMeal.analysis?.evaluation || {
            strengths: [],
            weaknesses: [],
            suggestions: []
          }
        }
      }));
    }
  }, [meal]);

  const fetchMealById = async (mealId: string, token: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meals?id=${mealId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch meal');
      }

      const mealData = await response.json();
      setMeal(mealData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meal by ID:', error);
      toast({
        variant: "destructive",
        title: "Error loading meal",
        description: "Could not retrieve the meal data. Please try again."
      });
      setLoading(false);
    }
  };

  const fetchMostRecentMeal = async (token: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meals`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }

      const meals = await response.json();
      if (meals && meals.length > 0) {
        const mostRecentMeal = meals[0];
        setMeal(mostRecentMeal);
        setLoading(false);
      } else {
        toast({
          variant: "destructive",
          title: "No meal data found",
          description: "Please upload a meal image for analysis."
        });
        navigate('/upload', { replace: true });
      }
    } catch (error) {
      console.error('Error fetching most recent meal:', error);
      toast({
        variant: "destructive",
        title: "Error loading meal data",
        description: "Could not retrieve meal data. Please try again."
      });
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNutritionGradeExplanation = (score?: number): string => {
    // If we have a custom explanation from the API, use that
    if (meal?.analysis?.nutritionScoreExplanation) {
      return meal.analysis.nutritionScoreExplanation;
    }
    
    // Otherwise fall back to the default explanation
    if (score === undefined) return "No nutrition score data available.";
    
    if (score >= 80) {
      return "Grade A: Excellent! This meal is highly nutritious with a balanced mix of macronutrients and likely contains important micronutrients.";
    } else if (score >= 60) {
      return "Grade B: Good. This meal provides good nutrition but may be lacking in some areas.";
    } else if (score >= 40) {
      return "Grade C: Average. This meal provides some nutritional value but has significant room for improvement.";
    } else if (score >= 20) {
      return "Grade D: Below Average. This meal lacks nutritional diversity and may be high in processed ingredients or empty calories.";
    } else {
      return "Grade F: Poor. This meal provides minimal nutritional value and is likely dominated by processed foods, sugars, or unhealthy fats.";
    }
  };

  const getFoodGroupsExplanation = (foodCount: number): string => {
    // If we have a custom food groups evaluation from the API, use that
    if (meal?.analysis?.foodGroupsEvaluation?.explanation) {
      return meal.analysis.foodGroupsEvaluation.explanation;
    }
    
    // Otherwise fall back to the default explanation
    if (foodCount >= 5) {
      return "Excellent variety! Your meal contains 5 or more food groups, providing a diverse range of nutrients.";
    } else if (foodCount >= 3) {
      return `Your meal contains ${foodCount}/5 recommended food groups. Try to include more variety in future meals.`;
    } else if (foodCount >= 1) {
      return `Limited variety. Your meal only contains ${foodCount}/5 recommended food groups. Try to include proteins, vegetables, fruits, grains, and dairy for optimal nutrition.`;
    } else {
      return "No food groups detected. Try to include a variety of food groups in your meals for balanced nutrition.";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-20 pb-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between mb-8">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-64" />
              </div>
              <div className="flex space-x-3">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Skeleton className="h-96 w-full rounded-lg" />
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!meal || !meal.analysis) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-20 pb-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center text-center p-8">
              <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Analysis Data Not Available</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find the analysis data for this meal. This could be due to an error during processing.
              </p>
              <Button asChild>
                <Link to="/upload">Try Again with New Image</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-fade-in">
            <div>
              <Link 
                to="/upload"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2 transition-colors"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Upload
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Your Meal Analysis</h1>
            </div>
            
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Button variant="outline" size="sm" asChild>
                <Link to="/upload">
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Another
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                toast({
                  title: "Sharing not yet implemented",
                  description: "Sharing functionality will be available in a future update."
                });
              }}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </Button>
            </div>
          </div>
          
          <div className="mb-8">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="mt-2">
              <label className="flex items-center cursor-pointer">
                <span className="mr-2 text-sm font-medium">Premium Mode (Test):</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={overridePremium}
                    onChange={() => setOverridePremium(!overridePremium)}
                  />
                  <div className={`block w-14 h-6 rounded-full ${overridePremium ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${overridePremium ? 'transform translate-x-8' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24 animate-scale-in">
                <h2 className="text-xl font-semibold mb-4">Meal Details</h2>
                
                <div className="relative mb-6">
                  <img 
                    src={meal.image_url} 
                    alt="Analyzed meal" 
                    className="w-full h-auto rounded-lg object-cover" 
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(meal.created_at)}
                  </div>
                </div>
                
                <h3 className="font-medium mb-2">Detected Items</h3>
                <ul className="space-y-2 mb-6">
                  {meal.analysis.foods && meal.analysis.foods.map((food: string, index: number) => (
                    <li key={index} className="flex flex-col text-sm bg-secondary/50 p-3 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{food}</span>
                        {meal.analysis.foodDetails?.[food] && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {meal.analysis.foodDetails[food].category || 'Unknown category'}
                          </span>
                        )}
                      </div>
                      {meal.analysis.foodDetails?.[food] && (
                        <p className="text-xs text-muted-foreground">
                          {meal.analysis.foodDetails[food].description || `No detailed information available for ${food}.`}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Nutrition Score Explanation</h3>
                  <div className="bg-secondary/50 p-3 rounded text-sm">
                    {getNutritionGradeExplanation(meal.analysis.nutritionScore)}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Food Groups</h3>
                  <div className="bg-secondary/50 p-3 rounded text-sm">
                    {getFoodGroupsExplanation(meal.analysis.foods?.length || 0)}
                  </div>
                  
                  {meal.analysis.foodGroupsEvaluation?.missing && meal.analysis.foodGroupsEvaluation.missing.length > 0 && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-100 p-3 rounded text-sm">
                      <p className="font-medium text-yellow-800 mb-1">Missing Food Groups:</p>
                      <ul className="list-disc pl-5 text-yellow-700">
                        {meal.analysis.foodGroupsEvaluation.missing.map((group: string, index: number) => (
                          <li key={index}>{group}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-xl font-bold">{meal.analysis.calories || 'N/A'}</p>
                  </div>
                  {meal.analysis.nutritionScore !== undefined && (
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-xl font-bold text-green-500">
                        {meal.analysis.nutritionScore > 80 ? 'A' : 
                         meal.analysis.nutritionScore > 60 ? 'B' : 
                         meal.analysis.nutritionScore > 40 ? 'C' : 
                         meal.analysis.nutritionScore > 20 ? 'D' : 'F'}
                      </p>
                    </div>
                  )}
                </div>
                
                <Button className="w-full" onClick={() => {
                  toast({
                    title: "Saved to Dashboard",
                    description: "This meal has already been saved to your dashboard."
                  });
                  navigate('/dashboard');
                }}>
                  View in Dashboard
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-2 order-1 lg:order-2">
              {meal.analysis && (
                <Analysis mealAnalysis={meal.analysis as any} isPremium={isPremium} />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResultsPage;
