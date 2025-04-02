
# NutriVision: AI-Powered Meal Analysis

## Project Overview

NutriVision is an AI-powered web application that analyzes photos of meals and provides detailed nutritional information. Users simply take a photo of their food, and our AI instantly identifies the items and returns comprehensive nutritional data including calories, macronutrients, and more.

### Key Features

- **Instant Meal Analysis**: Upload photos and get immediate AI-powered nutritional analysis
- **Nutritional Breakdown**: Detailed information on calories, protein, carbs, fats, and vitamins
- **Meal History**: Track and review past meals for better diet awareness
- **User Accounts**: Secure authentication system to store user data and meal history

## Business Model

NutriVision operates on a freemium business model with two tiers:

### Free Tier (Ad-supported)
- Limited meal analyses per month
- Basic nutritional information (calories and macros)
- Ad-supported experience
- Limited meal history storage

### Premium Tier
- Unlimited meal analyses
- Advanced nutritional breakdown (micronutrients, vitamins, minerals)
- Ad-free experience
- Unlimited meal history storage
- Personalized nutrition recommendations
- Diet tracking and goal setting

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account for backend services

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: OpenAI API Key (for production)
VITE_OPENAI_API_KEY=your_openai_api_key

# Optional: Google AdSense Client ID (for ad-supported tier)
VITE_GOOGLE_AD_CLIENT=your_google_ad_client_id
```

### Installation

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd nutrivision

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Backend Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up the database tables and edge functions using the provided SQL and TypeScript files in the `supabase` directory
3. Configure authentication providers in the Supabase dashboard
4. Update environment variables with your Supabase project details

## User Flows

### Account Creation
1. User visits the homepage
2. User clicks "Sign Up" or "Get Started"
3. User enters email and password
4. User receives confirmation email (optional - can be disabled in testing)
5. User confirms email and is redirected to dashboard

### Meal Upload & Analysis
1. User logs into their account
2. User navigates to the Upload page
3. User uploads a photo of their meal (via drag-and-drop or file browser)
4. System displays loading animation while processing the image
5. AI analyzes the image and identifies food items
6. System calculates nutritional information
7. Results are displayed to the user with detailed breakdown
8. Meal information is stored in the user's history

### Viewing Meal History
1. User logs into their account
2. User navigates to the Dashboard
3. System displays all previously analyzed meals
4. User can click on any meal to view detailed nutritional information

### Premium Subscription Management
1. User logs into their account
2. User navigates to their Profile or Settings page
3. User selects "Upgrade to Premium"
4. User completes payment process
5. Account is upgraded to premium with additional features unlocked

## Development Resources

- [Supabase Dashboard](https://app.supabase.com): Manage your backend, database, and authentication
- [Vite Documentation](https://vitejs.dev/): Learn about the build tool
- [React Documentation](https://reactjs.org/): Learn about the frontend framework
- [Tailwind CSS Documentation](https://tailwindcss.com/): Learn about the styling framework
- [TypeScript Documentation](https://www.typescriptlang.org/): Learn about the programming language

## Deploying to Production

To deploy NutriVision to production:

1. Set up all required environment variables in your hosting platform
2. Build the production bundle: `npm run build`
3. Deploy the built files to your hosting provider of choice

For automated deployments, you can use the built-in deployment features in Lovable or connect your project to a service like Vercel, Netlify, or GitHub Pages.
