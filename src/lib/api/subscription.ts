import { subscription } from '../../stores/subscriptionStore';
import type { Subscription } from '../../stores/subscriptionStore';
import { PUBLIC_API_URL } from '$env/static/public';

export async function checkSubscription(token: string): Promise<Subscription> {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/users/subscription`, {
      headers: {
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription status');
    }

    const data = await response.json();
    subscription.set(data.subscription);
    return data.subscription;
  } catch (error) {
    console.error('Error checking subscription:', error);
    subscription.set({ isPaid: false, plan: 'free' });
    throw error;
  }
}

export async function subscribe(token: string, plan: string, months: number) {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/users/subscribe`, {
      method: 'POST',
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ plan, months })
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe');
    }

    const data = await response.json();
    subscription.set(data.subscription);
    return data.subscription;
  } catch (error) {
    console.error('Error subscribing:', error);
    throw error;
  }
} 