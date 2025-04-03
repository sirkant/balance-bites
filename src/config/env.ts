import { z } from 'zod';

const envSchema = z.object({
  // Supabase Configuration
  SUPABASE_URL: z.string().url().optional().default('https://ozyzkeddhldosnxwrnok.supabase.co'),
  SUPABASE_ANON_KEY: z.string().optional().default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96eXprZWRkaGxkb3NueHdybm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTQxMTIsImV4cCI6MjA1NjU3MDExMn0.UnLM7Ggbw_6PUxh_wfqfNd3WhugT1ljMnwUzP8vHGb4'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),

  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_PUBLISHABLE_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),

  // OpenAI Configuration
  OPENAI_API_KEY: z.string().optional().default('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'),

  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().optional().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables
const parseEnvVars = () => {
  try {
    return envSchema.parse({
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: import.meta.env.VITE_STRIPE_SECRET_KEY,
      STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET,
      OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
      NEXT_PUBLIC_APP_URL: import.meta.env.VITE_NEXT_PUBLIC_APP_URL,
      NODE_ENV: import.meta.env.MODE || 'development',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join('.')).join(', ');
      console.warn(`Warning: Some environment variables are missing or invalid: ${missingVars}`);
      // Return defaults instead of throwing
      return envSchema.parse({});
    }
    console.error('Error parsing environment variables:', error);
    return envSchema.parse({});
  }
};

export const env = parseEnvVars();

// Export a type for the environment variables
export type Env = z.infer<typeof envSchema>; 