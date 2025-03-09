import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Subscription {
  email: string;
  subscription?: {
    isPaid: boolean;
    plan: string;
    startDate?: string;
    endDate?: string;
  };
}

// Create a function to load the initial state
function loadInitialState() {
  if (browser) {
    const stored = localStorage.getItem('subscription');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data;
      } catch (e) {
        console.error('Error parsing stored subscription:', e);
      }
    }
  }
  return { 
    email: '',
    subscription: { 
      isPaid: false,
      plan: ''
    } 
  };
}

export const subscription = writable<Subscription>(loadInitialState());

// Subscribe to changes and update localStorage
if (browser) {
  subscription.subscribe(value => {
    if (value) {
      localStorage.setItem('subscription', JSON.stringify(value));
      console.log('Subscription stored:', value);
    }
  });
} 