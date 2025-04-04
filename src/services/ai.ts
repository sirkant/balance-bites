import { env } from '@/config/env';
import { supabase } from '@/integrations/supabase/client';

interface MealAnalysis {
  calories: number;
  macronutrients: {
    protein: number;
    carbs: number;
    fat: number;
  };
  micronutrients?: {
    fiber: number;
    sugar: number;
    sodium: number;
  };
  ingredients: string[];
  healthScore: number;
  recommendations: string[];
}

const FREE_MODEL = 'gpt-4-vision-preview';
const PREMIUM_MODEL = 'gpt-4-vision-preview';

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

const PREMIUM_PROMPT = `Analyze this meal image and provide detailed nutritional information. Include:
1. Precise calorie estimation
2. Detailed macronutrients (protein, carbs, fat)
3. Comprehensive micronutrients (fiber, sugar, sodium)
4. Complete list of ingredients with quantities
5. A detailed health score (1-10) with explanation
6. 5-7 specific recommendations for improvement
7. Potential allergens
8. Nutritional benefits and drawbacks
9. Suggestions for healthier alternatives
10. Meal timing recommendations

Format the response as JSON with the following structure:
{
  "calories": number,
  "macronutrients": {
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "micronutrients": {
    "fiber": number,
    "sugar": number,
    "sodium": number
  },
  "ingredients": string[],
  "healthScore": number,
  "recommendations": string[],
  "allergens": string[],
  "benefits": string[],
  "drawbacks": string[],
  "alternatives": string[],
  "timingRecommendations": string[]
}`;

/**
 * SECURE IMPLEMENTATION: This function calls our Supabase Edge Function
 * instead of using OpenAI directly from the frontend
 */
export async function analyzeMeal(
  imageUrl: string,
  isPremium: boolean
): Promise<MealAnalysis> {
  try {
    // First, ensure we have an authenticated session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required to analyze meals');
    }
    
    // Call our secure backend endpoint
    const response = await fetch(
      `${env.SUPABASE_URL}/functions/v1/meal-analysis`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          imageUrl,
          isPremium
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze meal');
    }
    
    const { analysis } = await response.json();
    
    // Validate required fields and provide fallbacks
    return {
      calories: analysis.calories || 0,
      macronutrients: {
        protein: analysis.macronutrients?.protein || 0,
        carbs: analysis.macronutrients?.carbs || 0,
        fat: analysis.macronutrients?.fat || 0
      },
      micronutrients: isPremium ? {
        fiber: analysis.micronutrients?.fiber || 0,
        sugar: analysis.micronutrients?.sugar || 0,
        sodium: analysis.micronutrients?.sodium || 0
      } : undefined,
      ingredients: Array.isArray(analysis.foods) ? analysis.foods : [],
      healthScore: analysis.healthScore || 5,
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : []
    };
  } catch (error) {
    console.error('Error analyzing meal:', error);
    throw new Error('Failed to analyze meal');
  }
}

/**
 * SECURE IMPLEMENTATION: This function calls our Supabase Edge Function
 * instead of using OpenAI directly from the frontend
 */
export async function generateMealRecommendations(
  userPreferences: {
    dietaryRestrictions: string[];
    healthGoals: string[];
    allergies: string[];
  },
  isPremium: boolean
): Promise<string[]> {
  try {
    // First, ensure we have an authenticated session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required to generate recommendations');
    }
    
    // Call our secure backend endpoint
    const response = await fetch(
      `${env.SUPABASE_URL}/functions/v1/meal-recommendations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userPreferences,
          isPremium
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate recommendations');
    }
    
    const { recommendations } = await response.json();
    return Array.isArray(recommendations) ? recommendations : [];
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate recommendations');
  }
} 