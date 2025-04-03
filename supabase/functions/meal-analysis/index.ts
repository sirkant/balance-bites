// NutriVision Meal Analysis Supabase Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.0.0';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    // Parse request body and support both imageUrl and imageBase64
    const { imageUrl, imageBase64, mealName, description, isPremium } = await req.json();
    // Use either imageUrl or imageBase64
    const imageToAnalyze = imageUrl || imageBase64;
    if (!imageToAnalyze) {
      return new Response(JSON.stringify({
        error: 'Image URL or base64 is required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });
    // Enhanced prompt with meal name and description if provided
    const mealInfo = `
Meal Name: ${mealName || 'Unknown'}
Description: ${description || 'No description provided'}
`;
    const prompt = isPremium ? `Analyze this meal image in detail.${mealInfo} Respond strictly in JSON format as follows:
{
  "analysis": string, // Brief analysis of the meal's nutritional content
  "foods": string[], // Array of detected food items
  "foodDetails": {  // Details for each food item
    "food name": {
      "category": string, // Food group category (Protein, Grain, Vegetable, Fruit, Dairy)
      "description": string, // Brief nutritional description of this food item
      "nutritionalValue": string // Key nutrients and health value
    }
  },
  "calories": number, // Estimated calories
  "nutritionScore": number, // 0-100 score based on nutritional quality
  "nutritionScoreExplanation": string, // Why this score was given
  "macronutrients": { 
    "protein": number, // in grams
    "carbs": number, // in grams
    "fat": number // in grams
  },
  "micronutrients": {
    "fiber": number,
    "sugar": number,
    "sodium": number,
    "vitamins": string[], // Key vitamins present in the meal
    "minerals": string[] // Key minerals present in the meal
  },
  "evaluation": {
    "strengths": string[], // Nutritional strengths of this meal
    "weaknesses": string[], // Nutritional weaknesses
    "suggestions": string[] // Suggestions for improvement
  },
  "foodGroupsEvaluation": {
    "count": number, // Number of food groups present (0-5)
    "missing": string[], // Missing food groups
    "explanation": string // Explanation of food group balance
  },
  "healthScore": number, // 1-10 score
  "recommendations": string[], // Detailed recommendations
  "overallNutriScore": string, // A to E grade based on nutritional criteria
  "nutrientBreakdown": {
    "sugar": {
      "amount": number,
      "unit": string,
      "level": string // "low", "moderate", or "high"
    },
    "salt": {
      "amount": number,
      "unit": string,
      "level": string // "low", "moderate", or "high"
    },
    "fiber": {
      "amount": number,
      "unit": string,
      "level": string // "low", "moderate", "good", or "excellent"
    },
    "proteinQuality": string, // "incomplete", "moderate", or "complete"
    "saturatedFat": {
      "amount": number,
      "unit": string,
      "level": string // "low", "moderate", or "high"
    }
  },
  "personalizedRecommendations": string[] // Context-specific recommendations based on the meal
}` : `Analyze this meal image briefly.${mealInfo} Respond strictly in JSON format as follows:
{
  "analysis": string, // Brief analysis of the meal's nutritional content
  "foods": string[], // Array of detected food items
  "foodDetails": {  // Details for each food item
    "food name": {
      "category": string, // Food group category (Protein, Grain, Vegetable, Fruit, Dairy)
      "description": string // Brief nutritional description of this food item
    }
  },
  "calories": number, // Estimated calories
  "nutritionScore": number, // 0-100 score based on nutritional quality
  "nutritionScoreExplanation": string, // Why this score was given
  "macronutrients": { 
    "protein": number, // in grams
    "carbs": number, // in grams
    "fat": number // in grams
  },
  "evaluation": {
    "strengths": string[], // Nutritional strengths of this meal
    "weaknesses": string[], // Nutritional weaknesses
    "suggestions": string[] // Suggestions for improvement
  },
  "foodGroupsEvaluation": {
    "count": number, // Number of food groups present (0-5)
    "missing": string[], // Missing food groups
    "explanation": string // Explanation of food group balance
  },
  "healthScore": number, // 1-10 score
  "recommendations": string[] // Basic recommendations
}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageToAnalyze
              }
            }
          ]
        }
      ],
      max_tokens: 1800,
      temperature: 0.5,
      response_format: {
        type: 'json_object'
      }
    });
    const content = response.choices[0].message.content || '{}';
    let analysis;
    try {
      analysis = JSON.parse(content);
      const requiredFields = [
        'analysis',
        'foods',
        'foodDetails',
        'calories',
        'nutritionScore',
        'nutritionScoreExplanation',
        'macronutrients',
        'evaluation',
        'foodGroupsEvaluation',
        'healthScore',
        'recommendations'
      ];
      const missingFields = requiredFields.filter((field)=>analysis[field] === undefined);
      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
      }
      const { macronutrients } = analysis;
      if (typeof macronutrients.protein !== 'number' || typeof macronutrients.carbs !== 'number' || typeof macronutrients.fat !== 'number') {
        throw new Error('Macronutrients fields (protein, carbs, fat) must be numbers');
      }
      if (isPremium) {
        const micronutrients = analysis.micronutrients;
        if (!micronutrients || typeof micronutrients.fiber !== 'number' || typeof micronutrients.sugar !== 'number' || typeof micronutrients.sodium !== 'number') {
          throw new Error('Micronutrients fields (fiber, sugar, sodium) missing or invalid');
        }
        
        // Validate premium-specific fields
        if (!analysis.overallNutriScore || typeof analysis.overallNutriScore !== 'string' || !['A', 'B', 'C', 'D', 'E'].includes(analysis.overallNutriScore)) {
          throw new Error('overallNutriScore must be a string with values A, B, C, D, or E');
        }
        
        // Validate nutrientBreakdown fields
        const nutrientBreakdown = analysis.nutrientBreakdown;
        if (!nutrientBreakdown) {
          throw new Error('nutrientBreakdown is required for premium users');
        }
        
        // Validate sugar data
        if (!nutrientBreakdown.sugar || typeof nutrientBreakdown.sugar.amount !== 'number' || 
            typeof nutrientBreakdown.sugar.unit !== 'string' || typeof nutrientBreakdown.sugar.level !== 'string') {
          throw new Error('Invalid sugar data in nutrientBreakdown');
        }
        
        // Validate salt data
        if (!nutrientBreakdown.salt || typeof nutrientBreakdown.salt.amount !== 'number' || 
            typeof nutrientBreakdown.salt.unit !== 'string' || typeof nutrientBreakdown.salt.level !== 'string') {
          throw new Error('Invalid salt data in nutrientBreakdown');
        }
        
        // Validate fiber data
        if (!nutrientBreakdown.fiber || typeof nutrientBreakdown.fiber.amount !== 'number' || 
            typeof nutrientBreakdown.fiber.unit !== 'string' || typeof nutrientBreakdown.fiber.level !== 'string') {
          throw new Error('Invalid fiber data in nutrientBreakdown');
        }
        
        // Validate proteinQuality
        if (typeof nutrientBreakdown.proteinQuality !== 'string') {
          throw new Error('proteinQuality must be a string');
        }
        
        // Validate saturatedFat data
        if (!nutrientBreakdown.saturatedFat || typeof nutrientBreakdown.saturatedFat.amount !== 'number' || 
            typeof nutrientBreakdown.saturatedFat.unit !== 'string' || typeof nutrientBreakdown.saturatedFat.level !== 'string') {
          throw new Error('Invalid saturatedFat data in nutrientBreakdown');
        }
        
        // Validate personalizedRecommendations
        if (!Array.isArray(analysis.personalizedRecommendations)) {
          throw new Error('personalizedRecommendations must be an array');
        }
        
        // Check for vitamins and minerals in micronutrients
        if (!Array.isArray(micronutrients.vitamins) || !Array.isArray(micronutrients.minerals)) {
          throw new Error('vitamins and minerals must be arrays in micronutrients');
        }
      }
      if (!Array.isArray(analysis.foods) || !Array.isArray(analysis.evaluation.strengths) || !Array.isArray(analysis.evaluation.weaknesses) || !Array.isArray(analysis.evaluation.suggestions) || !Array.isArray(analysis.recommendations) || !Array.isArray(analysis.foodGroupsEvaluation.missing)) {
        throw new Error('Arrays fields must be arrays');
      }
      if (typeof analysis.foodDetails !== 'object') {
        throw new Error('foodDetails must be an object');
      }
      // Validate foodDetails structure
      for (const food of analysis.foods){
        if (!analysis.foodDetails[food]) {
          console.warn(`Missing food details for: ${food}`);
          analysis.foodDetails[food] = {
            category: "Unknown",
            description: `No detailed information available for ${food}.`
          };
        }
      }
    } catch (parseError) {
      console.error('Parsing failed:', parseError, content);
      return new Response(JSON.stringify({
        error: 'Invalid JSON response from OpenAI',
        details: parseError.message,
        raw: content.substring(0, 200) + '...'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    // Return analysis with the enhanced format
    return new Response(JSON.stringify({
      analysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error processing meal:', error);
    return new Response(JSON.stringify({
      error: 'Meal processing failed',
      details: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
