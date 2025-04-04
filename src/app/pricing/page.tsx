import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Check } from 'lucide-react';
import StripeCheckout from '@/components/StripeCheckout';

const features = {
  free: [
    'Basic meal tracking',
    'Daily nutritional insights',
    'Basic AI meal analysis',
    'Up to 5 meals per month',
  ],
  premium: [
    'Unlimited meal tracking',
    'Advanced nutritional insights',
    'Detailed AI meal analysis',
    'Custom meal recommendations',
    'Priority support',
    'Export meal data',
  ],
};

export default async function PricingPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get subscription plans
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });

  // Get current subscription if user is logged in
  let currentSubscription = null;
  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    currentSubscription = subscription;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white"
            >
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                {currentSubscription?.plan_type === plan.name ? (
                  <button
                    disabled
                    className="mt-8 block w-full py-3 px-4 border border-transparent rounded-md shadow text-center text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : plan.name === 'Free' ? (
                  <button
                    className="mt-8 block w-full py-3 px-4 border border-transparent rounded-md shadow text-center text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Get Started
                  </button>
                ) : (
                  <div className="mt-8">
                    <StripeCheckout
                      priceId={plan.stripe_price_id}
                      onSuccess={() => {
                        // Handle success (e.g., show a toast notification)
                      }}
                      onError={(error) => {
                        // Handle error (e.g., show an error toast)
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h4>
                <ul className="mt-6 space-y-4">
                  {(plan.name === 'Free' ? features.free : features.premium).map(
                    (feature) => (
                      <li key={feature} className="flex space-x-3">
                        <Check
                          className="flex-shrink-0 h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 