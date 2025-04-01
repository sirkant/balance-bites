
// Supabase Edge Function for meal image analysis using OpenAI's GPT-4o-mini
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    // Parse request body
    const { imageBase64, imageUrl } = await req.json();

    if (!imageBase64 && !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Either imageBase64 or imageUrl is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // If no API key is set, return a demo/mock analysis
    if (!openAIApiKey) {
      console.log("No OpenAI API key found. Providing demo analysis response.");
      
      // Create a realistic demo response
      const demoNutritionData = {
        "foods": ["Chicken breast", "Brown rice", "Broccoli", "Olive oil"],
        "calories": 420,
        "macronutrients": {
          "protein": 35,
          "carbs": 45,
          "fat": 15,
          "fiber": 6
        },
        "micronutrients": {
          "vitamins": {
            "vitamin_a": 25,
            "vitamin_c": 80,
            "vitamin_d": 5,
            "vitamin_e": 10,
            "vitamin_k": 45,
            "thiamine": 20,
            "riboflavin": 15,
            "niacin": 40,
            "b6": 25,
            "b12": 30,
            "folate": 15
          },
          "minerals": {
            "calcium": 8,
            "iron": 15,
            "magnesium": 20,
            "zinc": 25,
            "potassium": 15,
            "sodium": 10,
            "selenium": 30
          }
        },
        "evaluation": {
          "strengths": [
            "High in protein for muscle maintenance",
            "Good source of fiber from vegetables",
            "Contains healthy fats from olive oil",
            "Excellent source of vitamin C"
          ],
          "weaknesses": [
            "Could include more diverse vegetables for broader nutrient profile",
            "Relatively low in calcium",
            "Could use more vitamin D"
          ],
          "suggestions": [
            "Consider adding some leafy greens for more vitamins K and A",
            "Add a small portion of dairy or fortified plant milk for calcium",
            "Include some nuts or seeds for more healthy fats and minerals"
          ]
        },
        "dietaryInfo": {
          "isGlutenFree": true,
          "isVegetarian": false,
          "isVegan": false,
          "isDairyFree": true,
          "isLowCarb": false
        },
        "nutritionScore": 78,
        "confidence": "medium"
      };

      return new Response(
        JSON.stringify({ analysis: demoNutritionData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If OpenAI API key exists, use the original code
    const systemPrompt = `
      You are a nutrition expert AI that analyzes images of food and provides detailed nutritional information.
      Your task is to:
      1. Identify all food items in the image with high accuracy
      2. Estimate the total calories
      3. Break down macronutrients (proteins, carbs, fats)
      4. Provide micronutrient information (vitamins and minerals)
      5. Evaluate the meal's nutritional strengths and weaknesses
      6. Offer improvement suggestions
      
      Your response should be formatted exactly like this JSON:
      {
        "foods": ["item1", "item2", ...],
        "calories": number,
        "macronutrients": {
          "protein": number,
          "carbs": number,
          "fat": number,
          "fiber": number
        },
        "micronutrients": {
          "vitamins": {
            "vitamin_a": number,
            "vitamin_c": number,
            "vitamin_d": number,
            "vitamin_e": number,
            "vitamin_k": number,
            "thiamine": number,
            "riboflavin": number,
            "niacin": number,
            "b6": number,
            "b12": number,
            "folate": number
          },
          "minerals": {
            "calcium": number,
            "iron": number,
            "magnesium": number,
            "zinc": number,
            "potassium": number,
            "sodium": number,
            "selenium": number
          }
        },
        "evaluation": {
          "strengths": ["strength1", "strength2", ...],
          "weaknesses": ["weakness1", "weakness2", ...],
          "suggestions": ["suggestion1", "suggestion2", ...]
        },
        "dietaryInfo": {
          "isGlutenFree": boolean,
          "isVegetarian": boolean,
          "isVegan": boolean,
          "isDairyFree": boolean,
          "isLowCarb": boolean
        },
        "nutritionScore": number,
        "confidence": "high|medium|low"
      }
      
      For micronutrient values, represent them as percentage of recommended daily intake (0-100).
      The nutrition score should be from 0-100, with 100 being perfectly balanced.
    `;

    // Prepare the API call to OpenAI
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food image and provide detailed nutritional information in JSON format."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64 || imageUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    };

    console.log("Sending request to OpenAI API...");
    const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!gptResponse.ok) {
      const errorData = await gptResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const gptData = await gptResponse.json();
    console.log("Received response from OpenAI");

    // Parse the GPT response
    let nutritionData;
    try {
      nutritionData = JSON.parse(gptData.choices[0].message.content);
      
      // Basic validation of the response structure
      if (!nutritionData.foods || 
          !nutritionData.calories || 
          !nutritionData.macronutrients || 
          !nutritionData.evaluation) {
        throw new Error("Invalid response format from GPT");
      }
    } catch (error) {
      console.error("Failed to parse GPT response:", error);
      throw new Error("Failed to parse nutrition data from AI response");
    }

    // Return the structured nutrition data
    return new Response(
      JSON.stringify({ analysis: nutritionData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in meal-analysis function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
