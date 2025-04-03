'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  plan_type: string;
  current_period_end: string;
}

export default function SubscriptionManager() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);

      // Get the current subscription
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not found');
      }

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Call the cancel subscription API
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      // Refresh the page to show updated subscription status
      router.refresh();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Subscription Management
      </h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
          <p className="mt-1 text-sm text-gray-900">Premium</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p className="mt-1 text-sm text-gray-900">Active</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Next Billing Date</h3>
          <p className="mt-1 text-sm text-gray-900">
            {formatDate(new Date().toISOString())}
          </p>
        </div>
        <div className="pt-4">
          <button
            onClick={handleCancelSubscription}
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Canceling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 