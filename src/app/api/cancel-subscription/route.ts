import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/config/env';

/**
 * SERVER-SIDE CODE ONLY - Access to backend secrets is safe here
 * This code never gets bundled with the frontend
 */

// Validate required environment variable
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required for subscription management');
}

// Initialize Stripe with server-side secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the request body
    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.cancel(subscriptionId);

    // Update the subscription status in our database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        current_period_end: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 