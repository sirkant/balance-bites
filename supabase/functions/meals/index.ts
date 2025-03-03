
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

// Initialize Supabase client using environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

interface Food {
  name: string;
  confidence: number;
}

interface Macronutrients {
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionAnalysis {
  calories: number;
  macronutrients: Macronutrients;
  foods: string[];
}

// Mock function for image recognition (placeholder for future integration)
async function someImageRecognitionAPI(imageUrl: string): Promise<Food[]> {
  console.log('Analyzing image:', imageUrl);
  
  // Mock data - in a real implementation, this would call an actual image recognition API
  const mockFoods: Food[] = [
    { name: 'chicken', confidence: 0.92 },
    { name: 'rice', confidence: 0.89 },
    { name: 'broccoli', confidence: 0.85 },
    { name: 'carrots', confidence: 0.72 }
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Only return foods with high confidence
  return mockFoods.filter(food => food.confidence > 0.7);
}

// Mock function for nutrition information (placeholder for future integration)
async function someNutritionAPI(foods: Food[]): Promise<NutritionAnalysis> {
  console.log('Getting nutrition for foods:', foods.map(f => f.name).join(', '));
  
  // Mock nutritional data based on recognized foods
  // In a real implementation, this would call an actual nutrition API
  const foodNames = foods.map(food => food.name);
  
  // Calculate mock nutrition values based on the foods
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  
  for (const food of foods) {
    switch (food.name) {
      case 'chicken':
        calories += 165;
        protein += 31;
        carbs += 0;
        fat += 3.6;
        break;
      case 'rice':
        calories += 130;
        protein += 2.7;
        carbs += 28;
        fat += 0.3;
        break;
      case 'broccoli':
        calories += 55;
        protein += 3.7;
        carbs += 11.2;
        fat += 0.6;
        break;
      case 'carrots':
        calories += 50;
        protein += 1.2;
        carbs += 12;
        fat += 0.3;
        break;
      case 'salmon':
        calories += 208;
        protein += 20;
        carbs += 0;
        fat += 13;
        break;
      case 'pasta':
        calories += 200;
        protein += 7;
        carbs += 40;
        fat += 1;
        break;
      case 'beef':
        calories += 250;
        protein += 26;
        carbs += 0;
        fat += 17;
        break;
      case 'potato':
        calories += 160;
        protein += 4;
        carbs += 36;
        fat += 0;
        break;
      default:
        // Default values for unknown foods
        calories += 100;
        protein += 5;
        carbs += 10;
        fat += 5;
    }
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    calories,
    macronutrients: {
      protein,
      carbs,
      fat
    },
    foods: foodNames
  };
}

// Function to decode base64 to Uint8Array for file upload
function decodeBase64(base64String: string): Uint8Array {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 204,
    });
  }
  
  // Set CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
  
  try {
    // Create Supabase admin client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // Create Supabase client with the token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: corsHeaders }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    // Verify the user token and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Handle GET request: Fetch user's meals
    if (req.method === 'GET') {
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (mealsError) {
        return new Response(
          JSON.stringify({ error: 'Error fetching meals', details: mealsError.message }),
          { status: 500, headers: corsHeaders }
        );
      }
      
      return new Response(
        JSON.stringify(meals),
        { status: 200, headers: corsHeaders }
      );
    }
    
    // Handle POST request: Upload and analyze a meal
    if (req.method === 'POST') {
      const { imageBase64, otherMetadata } = await req.json();
      
      if (!imageBase64) {
        return new Response(
          JSON.stringify({ error: 'Missing image data' }),
          { status: 400, headers: corsHeaders }
        );
      }
      
      try {
        // Create a unique filename for the image
        const timestamp = new Date().getTime();
        const fileName = `${user.id}_${timestamp}.png`;
        
        // Decode the base64 image
        const fileData = decodeBase64(imageBase64);
        
        // Upload the image to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('meal-images')
          .upload(fileName, fileData, {
            contentType: 'image/png',
            upsert: false
          });
        
        if (uploadError) {
          throw new Error(`Upload error: ${uploadError.message}`);
        }
        
        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('meal-images')
          .getPublicUrl(fileName);
        
        // Analyze the image using the mock functions
        const recognizedFoods = await someImageRecognitionAPI(publicUrl);
        const nutritionAnalysis = await someNutritionAPI(recognizedFoods);
        
        // Store the meal record in the database
        const { data: mealData, error: mealError } = await supabaseAdmin
          .from('meals')
          .insert([
            {
              user_id: user.id,
              image_url: publicUrl,
              analysis: nutritionAnalysis
            }
          ])
          .select()
          .single();
        
        if (mealError) {
          throw new Error(`Database error: ${mealError.message}`);
        }
        
        return new Response(
          JSON.stringify(mealData),
          { status: 201, headers: corsHeaders }
        );
      } catch (error) {
        console.error('Error processing meal:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to process meal', details: error.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }
    
    // If the request method is not supported
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
})
