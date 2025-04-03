import { useState } from 'react';
// Remove Next.js specific import
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  user_id: string;
  status: 'active' | 'canceled' | 'past_due';
  plan_type: 'Free' | 'Premium';
}

export function useSubscription() {
  // Temporary simple implementation - hardcode the premium status for testing
  const [subscription] = useState<Subscription | null>({
    user_id: 'test-user',
    status: 'active',
    plan_type: 'Premium'
  });
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);
  const [isPremium] = useState(true); // Set to true for testing premium features

  const isSubscribed = true;
  const isCanceled = false;

  return {
    subscription,
    isLoading,
    error,
    isSubscribed,
    isPremium,
    isCanceled,
  };
} 