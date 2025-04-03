import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface MealData {
  imageBase64: string;
  mealName: string;
  description: string;
  mealTime: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fats?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the user from the JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user')
    }

    // Parse the request body
    const { imageBase64, mealName, description, mealTime, nutritionalInfo } = await req.json() as MealData

    if (!imageBase64 || !mealName || !mealTime) {
      throw new Error('Missing required fields')
    }

    // Upload the image to Supabase Storage
    const imageBuffer = Uint8Array.from(atob(imageBase64.split(',')[1]), c => c.charCodeAt(0))
    const fileName = `${user.id}/${Date.now()}.jpg`
    
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('meal-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('meal-images')
      .getPublicUrl(fileName)

    // Call the meal-analysis function to get analysis data
    console.log("Calling meal-analysis function with image URL:", publicUrl)
    
    let analysis = null
    try {
      // Check if user has premium subscription
      const { data: subscriptionData, error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .select('status, plan_type')
        .eq('user_id', user.id)
        .single()
        
      // Determine if user is premium based on active subscription with Premium plan
      const isPremium = subscriptionData && 
                       subscriptionData.status === 'active' && 
                       subscriptionData.plan_type === 'Premium'
                       
      console.log(`User has premium status: ${isPremium}`)
      
      const analysisResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/meal-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            imageUrl: publicUrl,
            mealName: mealName,
            description: description,
            nutritionalInfo: nutritionalInfo,
            isPremium: isPremium // Pass the premium status flag
          })
        }
      )
      
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json()
        console.log("Received analysis results:", analysisData.analysis)
        analysis = analysisData.analysis
      } else {
        console.error("Failed to get analysis:", await analysisResponse.text())
      }
    } catch (analysisError) {
      console.error("Error calling meal-analysis:", analysisError)
    }

    // Insert the meal record into the database
    const { data: mealData, error: insertError } = await supabaseClient
      .from('meals')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        meal_name: mealName,
        description: description,
        meal_time: mealTime,
        analysis: analysis,
        calories: nutritionalInfo?.calories,
        protein: nutritionalInfo?.protein,
        carbohydrates: nutritionalInfo?.carbohydrates,
        fats: nutritionalInfo?.fats,
        fiber: nutritionalInfo?.fiber,
        sugar: nutritionalInfo?.sugar,
        sodium: nutritionalInfo?.sodium,
        cholesterol: nutritionalInfo?.cholesterol,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to insert meal: ${insertError.message}`)
    }

    // Return the created meal data
    return new Response(
      JSON.stringify(mealData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
