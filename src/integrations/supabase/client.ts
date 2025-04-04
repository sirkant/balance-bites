// This file handles the Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/config/env';

// Use environment variables from our validated env config
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

// Validate required configuration is present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or anonymous key is missing. Check your environment variables.');
  throw new Error('Missing Supabase configuration');
}

// Create the client with proper options
const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

// Export the supabase client
export const supabase = supabaseClient;
