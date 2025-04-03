'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { env } from '@/config/env';

// Initialize Stripe
const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

interface StripeCheckoutProps {
  priceId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function StripeCheckout({
  priceId,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Load Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Redirect to checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Checkout error:', error);
      onError?.(error instanceof Error ? error : new Error('Checkout failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`w-full py-3 px-4 border border-transparent rounded-md shadow text-center text-sm font-medium text-white ${
        isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700'
      }`}
    >
      {isLoading ? 'Processing...' : 'Subscribe Now'}
    </button>
  );
} 