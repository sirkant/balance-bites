
// Supabase Edge Function for meal image analysis using OpenAI's GPT-4o-mini
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Parse request body
    const { imageBase64, imageUrl } = await req.json();

    if (!imageBase64 && !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Either imageBase64 or imageUrl is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Construct prompt for GPT
    const systemPrompt = `
      You are a nutrition expert AI that analyzes images of food and provides detailed nutritional information.
      Your task is to:
      1. Identify all food items in the image
      2. Estimate the total calories
      3. Break down the macronutrients (proteins, carbs, fats)
      4. Respond with structured JSON data only, no explanations or comments

      Your response should be formatted exactly like this:
      {
        "foods": ["item1", "item2", ...],
        "calories": number,
        "macronutrients": {
          "protein": number,
          "carbs": number,
          "fat": number
        },
        "confidence": "high|medium|low"
      }
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
              text: "Analyze this food image and provide nutritional information in JSON format."
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
      max_tokens: 1000
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
      
      // Validate the response structure
      if (!nutritionData.foods || !nutritionData.calories || !nutritionData.macronutrients) {
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
