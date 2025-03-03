
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper function to generate unique filenames
const generateUniqueFileName = (userId: string): string => {
  const timestamp = new Date().getTime()
  return `${userId}_${timestamp}.png`
}

// Placeholder for image recognition API
const someImageRecognitionAPI = async (imageUrl: string): Promise<string[]> => {
  console.log('Called image recognition API with URL:', imageUrl)
  // In a real implementation, this would call an external API
  // For now, return mock food items
  return ['apple', 'banana', 'chicken', 'rice']
}

// Placeholder for nutrition API
const someNutritionAPI = async (identifiedFoods: string[]): Promise<Record<string, any>> => {
  console.log('Called nutrition API with foods:', identifiedFoods)
  // In a real implementation, this would call an external API
  // For now, return mock nutritional data
  return {
    calories: 450,
    macronutrients: {
      protein: 20,
      carbs: 55,
      fat: 15
    },
    vitamins: {
      A: '10%',
      C: '25%',
      D: '5%'
    },
    minerals: {
      calcium: '8%',
      iron: '12%',
      potassium: '15%'
    },
    foods: identifiedFoods
  }
}

// Decode base64 image to Uint8Array
const decodeBase64Image = (base64String: string): Uint8Array => {
  // Remove data URL prefix if present
  const base64 = base64String.replace(/^data:image\/\w+;base64,/, '')
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}

serve(async (req) => {
  // Set up CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // GET /api/meals - Retrieve all meals for the authenticated user
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (mealsError) {
        return new Response(
          JSON.stringify({ error: 'Error fetching meals', details: mealsError }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(meals),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (req.method === 'POST') {
      // POST /api/meals - Upload a meal image, analyze it, and save to the database
      const { imageBase64, otherMetadata } = await req.json()
      
      if (!imageBase64) {
        return new Response(
          JSON.stringify({ error: 'Missing image data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Decode the base64 image
      const imageBuffer = decodeBase64Image(imageBase64)
      
      // Generate a unique filename
      const fileName = generateUniqueFileName(user.id)
      
      // Upload the image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('meal-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: false
        })

      if (uploadError) {
        return new Response(
          JSON.stringify({ error: 'Error uploading image', details: uploadError }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase
        .storage
        .from('meal-images')
        .getPublicUrl(fileName)

      // Call the image recognition API (placeholder)
      const identifiedFoods = await someImageRecognitionAPI(publicUrl)
      
      // Call the nutrition API with the identified foods (placeholder)
      const nutritionalAnalysis = await someNutritionAPI(identifiedFoods)
      
      // Save the meal record to the database
      const { data: meal, error: insertError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          analysis: nutritionalAnalysis
        })
        .select()
        .single()

      if (insertError) {
        return new Response(
          JSON.stringify({ error: 'Error saving meal', details: insertError }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(meal),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
