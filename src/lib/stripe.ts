import { loadStripe } from '@stripe/stripe-js';

// Replace this with your actual publishable key from your .env file
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51R4rJD4Uk10RuWPYVVszgdjRcFYb04CGFHLgusxonlUWAT9uCVpSSLu3vPMUpti0QVnvEmRSWVfgWRhpkKX7DTgN00bFXuBfRY';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY); 