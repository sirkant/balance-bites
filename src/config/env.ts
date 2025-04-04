import { z } from 'zod';

/**
 * Frontend-safe environment variables schema
 * IMPORTANT: Only add variables here that are safe to expose to the browser
 */
const clientEnvSchema = z.object({
  // Supabase Configuration (public keys only)
  SUPABASE_URL: z.string().url().min(1, "Supabase URL is required"),
  SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  
  // Stripe Configuration (public keys only)
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  
  // Application Configuration
  APP_URL: z.string().url().min(1, "App URL is required"),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

/**
 * Parse and validate client environment variables from import.meta.env
 * Only use variables with the VITE_ prefix
 */
const parseClientEnv = () => {
  // Log what environment we're using in development mode
  if (import.meta.env.MODE === 'development') {
    console.log(`Environment: ${import.meta.env.MODE}`);
  }
  
  const parsed = clientEnvSchema.safeParse({
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    APP_URL: import.meta.env.VITE_APP_URL,
    NODE_ENV: import.meta.env.MODE || 'development',
  });

  if (!parsed.success) {
    const missingVars = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    console.error(`[env.ts] Environment variable validation failed: ${missingVars}`);
    throw new Error(`Missing or invalid environment variables: ${missingVars}`);
  }

  return parsed.data;
};

/**
 * IMPORTANT: These are the ONLY environment variables that should be used in the frontend
 * Do NOT access import.meta.env directly from other files
 */
export const env = parseClientEnv();

/**
 * Type definition for frontend environment variables
 */
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Initialize environment with default values
 * (for tests, storybook, etc.)
 * @param overrides - Override default values
 */
export const initTestEnv = (overrides: Partial<ClientEnv> = {}) => {
  const testEnv = {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    APP_URL: 'http://localhost:8080',
    NODE_ENV: 'test',
    ...overrides,
  };
  
  return clientEnvSchema.parse(testEnv);
};