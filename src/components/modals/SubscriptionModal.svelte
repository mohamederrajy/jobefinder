<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../stores/userStore';
  import { subscription } from '../../stores/subscriptionStore';
  import { browser } from '$app/environment';
  import { loadStripe } from '@stripe/stripe-js';
  import type { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

  const dispatch = createEventDispatcher();
  let loading = false;
  let error: string | null = null;

  interface PriceOption {
    amount: number;
    currency: string;
    interval: string;
    intervalCount: number;
  }

  interface SubscriptionOptions {
    prices: {
      monthly: PriceOption;
      quarterly: PriceOption;
      yearly: PriceOption;
    };
  }

  type DurationType = 'monthly' | 'quarterly' | 'yearly';
  let selectedDuration: DurationType = 'monthly';
  let subscriptionOptions: SubscriptionOptions | null = null;

  let stripe: Stripe | null;
  let elements: StripeElements | null;
  let card: StripeCardElement | null;

  const plans: Record<DurationType, {
    price: number;
    period: string;
    savings: string | null;
  }> = {
    monthly: {
      price: 29,
      period: 'month',
      savings: null
    },
    quarterly: {
      price: 87,
      period: 'month',
      savings: '11%'
    },
    yearly: {
      price: 199,
      period: 'year',
      savings: '17%'
    }
  };

  let cardNumber = '';
  let cardExpiry = '';
  let cardCvc = '';
  let cardName = '';

  // Card type definitions
  const CARD_TYPES = {
    visa: {
      pattern: /^4/,
      length: [16],
      icon: `<path d="M15.4 9.8l-1.5 7h-1.8l1.5-7h1.8zm6.2 4.7v-.1c-.9-.3-1.4-.5-1.4-1 0-.3.4-.6.9-.6.8 0 1.3.3 1.7.5l.3-1.4c-.4-.2-1-.4-1.9-.4-1.6 0-2.7.9-2.7 2.1 0 1 .8 1.5 1.4 1.8.6.3 1 .5 1 .9 0 .3-.3.6-1 .6-.8 0-1.6-.3-2-.6l-.3 1.4c.5.3 1.3.6 2.2.6 1.8 0 2.8-.9 2.8-2.1 0-1.1-.7-1.6-1.4-1.9zm-9.5-4.7l-2.8 7h-1.9l-1.4-5.5c-.1-.3-.2-.4-.4-.5-.4-.2-1-.4-1.6-.5v-.2h2.7c.4 0 .7.3.7.6l.7 3.5 1.7-4.1h1.9zm3.8 4.5c0-1.6-2.2-1.7-2.2-2.4 0-.2.2-.5.7-.5.6 0 1.1.1 1.5.3l.3-1.3c-.4-.1-.8-.3-1.7-.3-1.4 0-2.4.8-2.4 1.9 0 1.3 2 1.4 2 2.3 0 .3-.3.5-.8.5-.7 0-1.3-.2-1.7-.4l-.3 1.4c.4.2 1.1.4 1.9.4 1.5 0 2.5-.8 2.5-1.9z"/>`
    },
    mastercard: {
      pattern: /^5[1-5]/,
      length: [16],
      icon: `<path d="M16 8.85A7.15 7.15 0 1 1 8.85 16 7.15 7.15 0 0 1 16 8.85m-7.15 0a7.15 7.15 0 1 1-7.15 7.15A7.15 7.15 0 0 1 8.85 8.85"/>`
    },
    amex: {
      pattern: /^3[47]/,
      length: [15],
      icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>`
    }
  };

  let cardType = '';
  let isCardValid = false;

  function formatCardNumber(input: string): string {
    const numbers = input.replace(/\D/g, '');
    return numbers.replace(/(\d{4})/g, '$1 ').trim();
  }

  function formatExpiry(input: string): string {
    const numbers = input.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  }

  function validateCard(number: string): boolean {
    // Remove spaces and non-digits
    const cleanNumber = number.replace(/\D/g, '');
    
    if (!cleanNumber) return false;

    // Luhn algorithm (mod 10)
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return (sum % 10) === 0;
  }

  function getCardType(number: string): string {
    const cleanNumber = number.replace(/\D/g, '');
    for (const [type, details] of Object.entries(CARD_TYPES)) {
      if (details.pattern.test(cleanNumber) && 
          details.length.includes(cleanNumber.length)) {
        return type;
      }
    }
    return '';
  }

  function handleCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Format with spaces
    cardNumber = value.replace(/(\d{4})/g, '$1 ').trim();
    
    // Validate and get card type
    cardType = getCardType(value);
    isCardValid = validateCard(value);

    // Update input styling based on validation
    if (value.length > 0) {
      input.classList.toggle('valid', isCardValid);
      input.classList.toggle('invalid', !isCardValid);
    } else {
      input.classList.remove('valid', 'invalid');
    }
  }

  function handleExpiryInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Format MM/YY
    if (value.length >= 2) {
      const month = parseInt(value.slice(0, 2));
      if (month > 12) value = '12' + value.slice(2);
      cardExpiry = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else {
      cardExpiry = value;
    }
  }

  function handleCvcInput(event: Event) {
    const input = event.target as HTMLInputElement;
    cardCvc = input.value.replace(/\D/g, '');
  }

  // Replace the stripePromise import with direct initialization
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51R4rJD4Uk10RuWPYVVszgdjRcFYb04CGFHLgusxonlUWAT9uCVpSSLu3vPMUpti0QVnvEmRSWVfgWRhpkKX7DTgN00bFXuBfRY';
  const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

  let stripeReady = false;
  let subscriptionOptionsLoaded = false;

  let showSuccess = false;
  let subscriptionCompleted = false;

  onMount(async () => {
    try {
      // First fetch subscription options
      await fetchSubscriptionOptions();
      subscriptionOptionsLoaded = true;

      // Initialize Stripe
      stripe = await stripePromise;
      if (!stripe) throw new Error('Failed to load Stripe');
      
      elements = stripe.elements();
      if (!elements) throw new Error('Failed to create Stripe elements');

      // Create card element
      card = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      });

      // Wait for DOM to be ready
      await tick();

      // Mount card element
      const cardElement = document.getElementById('card-element');
      if (!cardElement) {
        console.error('Card element container not found');
        return;
      }

      card.mount('#card-element');
      card.on('change', handleCardChange);
      stripeReady = true;
      console.log('Stripe card mounted successfully');
    } catch (err) {
      console.error('Setup error:', err);
      error = err instanceof Error ? err.message : 'Failed to initialize payment system';
    }
  });

  async function fetchSubscriptionOptions() {
    try {
      console.log('Fetching subscription options from:', `${PUBLIC_API_URL}/subscriptions/subscription-options`);
      const response = await fetch(`${PUBLIC_API_URL}/subscriptions/subscription-options`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      // Log the response for debugging
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription options: ${response.status}`);
      }

      subscriptionOptions = {
        prices: {
          monthly: {
            amount: data.prices.monthly.amount || 0,
            currency: data.prices.monthly.currency || 'usd',
            interval: data.prices.monthly.interval || 'month',
            intervalCount: data.prices.monthly.intervalCount || 1
          },
          quarterly: {
            amount: data.prices.quarterly.amount || 0,
            currency: data.prices.quarterly.currency || 'usd',
            interval: data.prices.quarterly.interval || 'month',
            intervalCount: data.prices.quarterly.intervalCount || 3
          },
          yearly: {
            amount: data.prices.yearly.amount || 0,
            currency: data.prices.yearly.currency || 'usd',
            interval: data.prices.yearly.interval || 'year',
            intervalCount: data.prices.yearly.intervalCount || 1
          }
        }
      };
    } catch (err) {
      console.error('Error fetching options:', err);
      error = err instanceof Error ? err.message : 'Failed to fetch subscription options';
    }
  }

  function handleCardChange(event: { error?: { message: string } }) {
    if (event.error) {
      error = event.error.message;
    } else {
      error = null;
    }
  }

  // First, define the correct types
  type ValidPlan = 'monthly' | 'quarterly' | 'yearly' | 'free';
  type SubscriptionStatus = 'active' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'free';

  // First, update the type definition to match exactly what the backend expects
  type ValidDuration = 'monthly' | 'quarterly' | 'yearly';

  // Update the handleSubmit function
  async function handleSubmit() {
    try {
      if (!stripe || !card) {
        throw new Error('Payment system not initialized');
      }

      loading = true;
      error = null;

      // Create payment method
      const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements?.getElement('card') as StripeCardElement,
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Create request data EXACTLY as specified
      const requestData = {
        duration: selectedDuration,     // Will be exactly: 'monthly', 'quarterly', or 'yearly'
        paymentMethodId: paymentMethod.id
      };

      console.log('Sending subscription request:', requestData);

      // Make the request EXACTLY as specified
      const response = await fetch(`${PUBLIC_API_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('Subscription response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      // On success, update subscription store and show success message
      subscriptionCompleted = true;
      showSuccess = true;
      subscription.set(data);
      
      setTimeout(() => {
        dispatch('subscribed');
        dispatch('close');
      }, 3000);

    } catch (err) {
      console.error('Subscription error:', err);
      error = err instanceof Error ? err.message : 'Failed to process subscription';
    } finally {
      loading = false;
    }
  }

  async function handleCancelSubscription() {
    try {
      loading = true;
      error = null;

      // Updated endpoint
      const response = await fetch(`${PUBLIC_API_URL}/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cancel response:', errorText);
        throw new Error('Failed to cancel subscription');
      }

      const data = await response.json();
      subscription.set(data);
      
      dispatch('cancelled');
      dispatch('close');

    } catch (err) {
      console.error('Cancellation error:', err);
      error = err instanceof Error ? err.message : 'Failed to cancel subscription';
    } finally {
      loading = false;
    }
  }

  // Card validation functions
  function validateCardNumber(number: string): boolean {
    return true; // Accept any input
  }

  function validateCardExpiry(expiry: string): boolean {
    return true; // Accept any input
  }

  function validateCardCvc(cvc: string): boolean {
    return true; // Accept any input
  }

  function validateCardName(name: string): boolean {
    return true; // Accept any input
  }
</script>

<div class="modal-overlay" on:click|self={() => dispatch('close')}>
  <div class="modal-content">
    <div class="modal-header">
      <h2>Choose Your Plan</h2>
      <button class="close-btn" on:click={() => dispatch('close')}>×</button>
    </div>

    <div class="subscription-content">
      {#if !subscriptionOptionsLoaded}
        <div class="loading">
          <div class="spinner"></div>
          <span>Loading plans...</span>
        </div>
      {:else if subscriptionOptions}
        <div class="plan-options">
          <!-- Monthly Plan -->
          <div 
            class="plan-card" 
            class:selected={selectedDuration === 'monthly'}
            on:click={() => {
              selectedDuration = 'monthly' as ValidDuration;
              console.log('Selected duration:', selectedDuration);
            }}
          >
            <h3>Monthly</h3>
            <div class="price">
              ${subscriptionOptions.prices.monthly.amount}
              <span>/month</span>
            </div>
            <div class="billing-info">Billed monthly</div>
          </div>

          <!-- Quarterly Plan -->
          <div 
            class="plan-card" 
            class:selected={selectedDuration === 'quarterly'}
            on:click={() => {
              selectedDuration = 'quarterly' as ValidDuration;
              console.log('Selected duration:', selectedDuration);
            }}
          >
            <h3>Quarterly</h3>
            <div class="price">
              ${subscriptionOptions.prices.quarterly.amount}
              <span>/quarter</span>
            </div>
            <div class="billing-info">Billed every 3 months</div>
            <div class="savings">Save 11%</div>
          </div>

          <!-- Yearly Plan -->
          <div 
            class="plan-card" 
            class:selected={selectedDuration === 'yearly'}
            on:click={() => {
              selectedDuration = 'yearly' as ValidDuration;
              console.log('Selected duration:', selectedDuration);
            }}
          >
            <h3>Yearly</h3>
            <div class="price">
              ${subscriptionOptions.prices.yearly.amount}
              <span>/year</span>
            </div>
            <div class="billing-info">Billed annually</div>
            <div class="savings">Save 17%</div>
          </div>
        </div>

        <div class="payment-section">
          <div id="card-element" class="card-element-container"></div>
          
          {#if stripeReady}
            <button 
              class="subscribe-btn" 
              on:click={handleSubmit} 
              disabled={loading}
            >
              {#if loading}
                <div class="spinner"></div>
              {:else}
                Subscribe Now for ${subscriptionOptions.prices[selectedDuration].amount}
              {/if}
            </button>
          {:else}
            <div class="loading">
              <div class="spinner"></div>
              <span>Loading payment form...</span>
            </div>
          {/if}
        </div>

        {#if error}
          <div class="error-message">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        {/if}
      {:else}
        <div class="error-message">
          Failed to load subscription options. Please try again later.
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showSuccess}
  <div class="success-overlay" class:show={subscriptionCompleted}>
    <div class="confetti-container">
      {#each Array(50) as _, i}
        <div 
          class="confetti-piece" 
          style="--delay: {Math.random() * 3}s; --rotation: {Math.random() * 360}deg; --speed: {2 + Math.random() * 2}s; --left: {Math.random() * 100}%"
        ></div>
      {/each}
    </div>
    <div class="success-content">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" width="80" height="80">
          <path fill="#059669" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h2 class="success-title">Congratulations!</h2>
      <p class="success-message">Your subscription has been activated successfully.</p>
      <div class="checkmark-circle"></div>
    </div>
  </div>
{/if}

<style lang="scss">
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #111827;
    }
  }

  .subscription-content {
    padding: 2rem;
  }

  .plan-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .plan-card {
    border: 2px solid #E5E7EB;
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #6355FF;
    }

    &.selected {
      border-color: #6355FF;
      background: #F5F3FF;
    }

    h3 {
      margin: 0 0 1rem;
      color: #111827;
    }

    .price {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;

      span {
        font-size: 1rem;
        color: #6B7280;
      }
    }

    .billing-info {
      color: #6B7280;
      font-size: 0.875rem;
    }

    .savings {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #059669;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
    }
  }

  .payment-section {
    margin-top: 2rem;
  }

  #card-element {
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 1rem;
    background: #F9FAFB;
    margin-bottom: 1.5rem;
  }

  .subscribe-btn {
    width: 100%;
    padding: 1rem;
    background: #6355FF;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
      background: #5346E0;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-message {
    margin-top: 1rem;
    padding: 1rem;
    background: #FEF2F2;
    color: #DC2626;
    border-radius: 8px;
    font-size: 0.875rem;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: #6B7280;
  }

  .success-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.98);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.5s ease;
    z-index: 9999;

    &.show {
      opacity: 1;
      visibility: visible;
    }
  }

  .success-content {
    text-align: center;
    position: relative;
    z-index: 2;
    animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .success-icon {
    margin-bottom: 1.5rem;
    animation: pulseScale 2s infinite;
    
    svg {
      filter: drop-shadow(0 4px 12px rgba(5, 150, 105, 0.3));
    }
  }

  .success-title {
    color: #059669;
    font-size: 3rem;
    font-weight: 700;
    margin: 1rem 0;
    opacity: 0;
    animation: slideUpFade 0.6s ease forwards 0.3s;
  }

  .success-message {
    color: #374151;
    font-size: 1.5rem;
    margin-bottom: 2rem;
    opacity: 0;
    animation: slideUpFade 0.6s ease forwards 0.5s;
  }

  .confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .confetti-piece {
    position: absolute;
    width: 10px;
    height: 30px;
    background: linear-gradient(
      45deg,
      #6355FF,
      #059669,
      #3B82F6,
      #EC4899
    );
    top: -20px;
    left: var(--left);
    opacity: 0;
    transform: rotate(var(--rotation));
    animation: confettiFall var(--speed) ease-in infinite var(--delay);

    &:nth-child(even) {
      width: 15px;
      height: 15px;
      border-radius: 50%;
    }

    &:nth-child(4n) {
      width: 20px;
      height: 20px;
      background: radial-gradient(
        circle,
        #FCD34D,
        #F59E0B
      );
    }
  }

  .checkmark-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    border-radius: 50%;
    border: 4px solid #059669;
    opacity: 0;
    animation: circleExpand 1s ease-out forwards 0.2s;
    z-index: -1;
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pulseScale {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  @keyframes slideUpFade {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes confettiFall {
    0% {
      opacity: 1;
      transform: translateY(0) rotate(var(--rotation));
    }
    100% {
      opacity: 0;
      transform: translateY(100vh) rotate(calc(var(--rotation) + 720deg));
    }
  }

  @keyframes circleExpand {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.1;
    }
  }
</style> 