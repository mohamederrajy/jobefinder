import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';
import { user } from './userStore';
import { get } from 'svelte/store';

interface Subscription {
  isPaid: boolean;
  subscription?: {
    status: 'active' | 'free' | 'incomplete';
    plan: 'monthly' | 'quarterly' | 'yearly' | 'free';
    current_period_end: number;
    current_period_start: number;
    stripe_subscription_id: string;
    stripe_price_id: string;
    cancel_at_period_end: boolean;
    isPaid: boolean;
  }
}

export const subscription = writable<Subscription>({
  isPaid: false,
  subscription: {
    status: 'free',
    plan: 'free',
    current_period_end: 0,
    current_period_start: 0,
    stripe_subscription_id: '',
    stripe_price_id: '',
    cancel_at_period_end: false,
    isPaid: false
  }
});

// Function to update subscription status
export async function checkStatus(token: string) {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/subscriptions/status`, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription status');
    }

    const data = await response.json();
    subscription.set(data.subscription);

    return data.isPaid;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    subscription.set({
      isPaid: false,
      subscription: {
        status: 'free',
        plan: 'free',
        current_period_end: 0,
        current_period_start: 0,
        stripe_subscription_id: '',
        stripe_price_id: '',
        cancel_at_period_end: false,
        isPaid: false
      }
    });
    return false;
  }
}

// Subscribe to changes and update localStorage
if (browser) {
  subscription.subscribe(value => {
    if (value) {
      localStorage.setItem('subscription', JSON.stringify(value));
    }
  });
} 