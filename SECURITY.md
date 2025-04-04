# NutriVision Security Guidelines

## Environment Variable Management

We follow a strict protocol for managing environment variables to protect sensitive credentials. Here's what you need to know:

### 🔐 Secret Management Overview

1. **Frontend vs. Backend Separation**
   - **Frontend-safe** variables use the `VITE_` prefix
   - **Backend-only** variables NEVER use the `VITE_` prefix
   - Frontend code should NEVER directly access API keys or secrets

2. **Local Development**
   - Copy `.env.example` to `.env.local` and fill in your values
   - NEVER commit `.env.local` or any file containing real secrets
   - For team secrets, use a secure sharing method (1Password, etc.)

3. **Supabase Edge Functions**
   - All OpenAI API calls should happen in Edge Functions, never client-side
   - Set secrets in Supabase dashboard: Settings > API > Edge Functions > Environment Variables
   - Access variables in Edge Functions with `Deno.env.get('VARIABLE_NAME')`

## 🚫 What NOT to do:

1. ❌ **NEVER prefix sensitive variables with `VITE_`**
   ```
   # BAD - will be exposed in the browser
   VITE_OPENAI_API_KEY=sk-...
   
   # GOOD - backend only, not exposed
   OPENAI_API_KEY=sk-...
   ```

2. ❌ **NEVER use OpenAI directly in the frontend**
   ```js
   // BAD - exposes API key in browser
   const openai = new OpenAI({
     apiKey: import.meta.env.VITE_OPENAI_API_KEY,
     dangerouslyAllowBrowser: true // Major security risk!
   });
   
   // GOOD - call a secure API endpoint
   const response = await fetch('/api/analyze-meal', {
     method: 'POST',
     body: JSON.stringify({ imageUrl })
   });
   ```

3. ❌ **NEVER hardcode fallback values for sensitive variables**
   ```js
   // BAD - hardcoded API key
   const apiKey = import.meta.env.VITE_API_KEY || "sk-actual-key-here";
   
   // GOOD - validation without exposing the key
   if (!process.env.API_KEY) {
     throw new Error("API_KEY is required");
   }
   ```

## ✅ Secure Implementation Patterns

1. **Frontend Environment Access**
   - Use our validated `env` object from `src/config/env.ts`
   - Only contains frontend-safe variables

2. **Backend API Routes**
   - Use `process.env` variables (not `import.meta.env`)
   - Validate required variables are present

3. **Supabase Edge Functions**
   - Use `Deno.env.get('VARIABLE_NAME')`
   - Check for undefined values

## 🔄 Adding New Environment Variables

1. Add to `.env.example` with placeholder value
2. Add to `env.ts` schema if frontend-safe
3. Update team documentation
4. If backend-only, add to deployment environments

## 🔍 Security Checks

Before committing code, verify:
1. No secrets in source files
2. No `VITE_` prefix on sensitive variables
3. No `dangerouslyAllowBrowser: true` in production code
4. No direct OpenAI API calls in frontend
5. No hardcoded secrets or fallbacks

For questions, contact the security team. 