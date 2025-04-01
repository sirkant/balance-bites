
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mock data to return when no API key is available
const generateMockAnalysis = (imageUrl: string) => {
  console.log("Generating mock analysis for image:", imageUrl);
  
  // Create randomized nutrition values for testing
  const calories = Math.floor(Math.random() * 400) + 300; // 300-700 calories
  const proteins = Math.floor(Math.random() * 30) + 15; // 15-45g proteins
  const carbs = Math.floor(Math.random() * 50) + 30; // 30-80g carbs
  const fats = Math.floor(Math.random() * 20) + 5; // 5-25g fats
  const nutritionScore = Math.floor(Math.random() * 40) + 50; // 50-90 score
  
  // Array of possible foods to randomly select from
  const possibleFoods = [
    "Grilled chicken breast", 
    "Steamed rice", 
    "Mixed vegetables", 
    "Salad with olive oil", 
    "Pasta with tomato sauce",
    "Roasted potatoes",
    "Salmon fillet",
    "Avocado",
    "Quinoa",
    "Greek yogurt",
    "Sweet potato"
  ];
  
  // Select 2-4 random foods
  const foodCount = Math.floor(Math.random() * 3) + 2;
  const selectedFoods = [];
  for (let i = 0; i < foodCount; i++) {
    const randomIndex = Math.floor(Math.random() * possibleFoods.length);
    selectedFoods.push(possibleFoods[randomIndex]);
    possibleFoods.splice(randomIndex, 1); // Remove selected food
  }
  
  return {
    foods: selectedFoods,
    calories: `${calories}kcal`,
    macros: {
      proteins: `${proteins}g`,
      carbohydrates: `${carbs}g`,
      fats: `${fats}g`,
      fiber: `${Math.floor(Math.random() * 8) + 2}g`
    },
    nutritionScore: nutritionScore,
    nutritionalAnalysis: "This is a balanced meal with a good mix of proteins, carbohydrates, and healthy fats. It provides essential nutrients and energy to fuel your body.",
    healthInsights: [
      "Good source of lean protein",
      "Contains complex carbohydrates for sustained energy",
      "Provides dietary fiber for digestive health",
      "Contains essential vitamins and minerals"
    ],
    improvementSuggestions: [
      "Consider adding more vegetables for additional fiber and micronutrients",
      "Include a source of healthy fats like avocado or olive oil",
      "Ensure portion sizes align with your dietary goals"
    ]
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Get the OpenAI API Key from environment variable
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // Parse the request body to get the image URL
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }
    
    let analysis;
    
    if (!openAIApiKey) {
      console.log('OPENAI_API_KEY is not set in environment variables, using mock response');
      // Generate mock data for testing without API key
      analysis = generateMockAnalysis(imageUrl);
    } else {
      // If we have an API key, make the actual API call to OpenAI
      console.log('Using OpenAI API to analyze image');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a nutritionist expert that analyzes food images and provides detailed nutritional information.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this meal image and provide detailed nutritional information in the following JSON format: { "foods": ["list of identified food items"], "calories": "total calories (e.g. 450kcal)", "macros": { "proteins": "amount in grams", "carbohydrates": "amount in grams", "fats": "amount in grams", "fiber": "amount in grams" }, "nutritionScore": number from 0-100, "nutritionalAnalysis": "brief paragraph with overall nutritional assessment", "healthInsights": ["list of 3-4 nutritional benefits"], "improvementSuggestions": ["list of 2-3 suggestions to improve nutritional value"] }' },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.5,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response from OpenAI
      analysis = JSON.parse(content);
    }

    // Return the analysis
    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in meal-analysis function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to analyze meal',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
})
