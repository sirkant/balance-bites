
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

// Initialize Supabase client using environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

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
      // Check if specific meal ID is requested
      const url = new URL(req.url);
      const mealId = url.searchParams.get('id');
      
      if (mealId) {
        // Fetch specific meal
        const { data: meal, error: mealError } = await supabase
          .from('meals')
          .select('*')
          .eq('id', mealId)
          .eq('user_id', user.id)
          .single();
        
        if (mealError) {
          return new Response(
            JSON.stringify({ error: 'Error fetching meal', details: mealError.message }),
            { status: 404, headers: corsHeaders }
          );
        }
        
        return new Response(
          JSON.stringify(meal),
          { status: 200, headers: corsHeaders }
        );
      } else {
        // Fetch all meals for the user
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
        
        // Check if storage bucket exists, create if not
        const { data: buckets } = await supabaseAdmin
          .storage
          .listBuckets();
        
        const mealImagesBucket = buckets?.find(b => b.name === 'meal-images');
        
        if (!mealImagesBucket) {
          // Create the bucket if it doesn't exist
          const { error: bucketError } = await supabaseAdmin
            .storage
            .createBucket('meal-images', {
              public: true,
              fileSizeLimit: 10485760, // 10MB
            });
          
          if (bucketError) {
            throw new Error(`Failed to create storage bucket: ${bucketError.message}`);
          }
          
          // Add public policy to the bucket
          await supabaseAdmin.storage.from('meal-images').createSignedUrl('test.txt', 60);
        }
        
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
        
        // Call the meal-analysis function to analyze the image using GPT-4o-mini
        console.log("Calling meal-analysis function with image URL:", publicUrl);
        const analysisResponse = await fetch(`${supabaseUrl}/functions/v1/meal-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ imageUrl: publicUrl })
        });
        
        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json();
          throw new Error(`Analysis error: ${errorData.error || 'Unknown error'}`);
        }
        
        const { analysis } = await analysisResponse.json();
        console.log("Received analysis results:", analysis);
        
        // Store the meal record in the database
        const { data: mealData, error: mealError } = await supabaseAdmin
          .from('meals')
          .insert([
            {
              user_id: user.id,
              image_url: publicUrl,
              analysis: analysis
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
