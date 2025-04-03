import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the signature from the request headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No signature found')
    }

    // Get the raw body
    const body = await req.text()

    // Verify the webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('No webhook secret found')
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`)
    }

    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = subscription.customer as string
        const price = subscription.items.data[0].price

        // Get the subscription plan from our database
        const { data: plan } = await supabaseClient
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', price.id)
          .single()

        if (!plan) {
          throw new Error(`No plan found for price ID: ${price.id}`)
        }

        // Get the user ID from the customer metadata
        const { data: customerData } = await stripe.customers.retrieve(customer)
        const userId = customerData.metadata.userId

        if (!userId) {
          throw new Error('No user ID found in customer metadata')
        }

        // Update or create the subscription in our database
        const { error: upsertError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customer,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan_type: plan.name,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })

        if (upsertError) {
          throw new Error(`Failed to upsert subscription: ${upsertError.message}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = subscription.customer as string

        // Get the user ID from the customer metadata
        const { data: customerData } = await stripe.customers.retrieve(customer)
        const userId = customerData.metadata.userId

        if (!userId) {
          throw new Error('No user ID found in customer metadata')
        }

        // Update the subscription status in our database
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('user_id', userId)

        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`)
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customer = session.customer as string
        const subscription = session.subscription as string

        // Get the subscription details
        const { data: subscriptionData } = await stripe.subscriptions.retrieve(subscription)
        const price = subscriptionData.items.data[0].price

        // Get the subscription plan from our database
        const { data: plan } = await supabaseClient
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', price.id)
          .single()

        if (!plan) {
          throw new Error(`No plan found for price ID: ${price.id}`)
        }

        // Get the user ID from the customer metadata
        const { data: customerData } = await stripe.customers.retrieve(customer)
        const userId = customerData.metadata.userId

        if (!userId) {
          throw new Error('No user ID found in customer metadata')
        }

        // Create the subscription in our database
        const { error: insertError } = await supabaseClient
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_customer_id: customer,
            stripe_subscription_id: subscription,
            status: subscriptionData.status,
            plan_type: plan.name,
            current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
          })

        if (insertError) {
          throw new Error(`Failed to insert subscription: ${insertError.message}`)
        }
        break
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}) 