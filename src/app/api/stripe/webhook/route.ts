import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { DatabaseService } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')!;
  const buf = await request.arrayBuffer();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription as string;
    if (userId && subscriptionId) {
      // Get subscription details
      const sub = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
      await DatabaseService.upsertSubscription({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        plan: sub.items.data[0].price.id === process.env.STRIPE_PRICE_ID_PRO ? 'pro' : 'business',
        status: sub.status,
        current_period_start: new Date(sub.items.data[0].current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.items.data[0].current_period_end * 1000).toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
} 