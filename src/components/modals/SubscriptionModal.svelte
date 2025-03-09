<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../stores/userStore';
  import { subscription } from '../../stores/subscriptionStore';
  import { browser } from '$app/environment';

  const dispatch = createEventDispatcher();
  let loading = false;
  let error: string | null = null;
  let selectedPlan = 'monthly'; // monthly or annual

  const plans = {
    monthly: {
      price: 29,
      period: 'month',
      savings: null
    },
    annual: {
      price: 19,
      period: 'month',
      savings: '34%'
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

  async function handleSubmit() {
    try {
      loading = true;
      error = null;

      const response = await fetch(`${PUBLIC_API_URL}/users/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        },
        body: JSON.stringify({
          plan: selectedPlan === 'annual' ? 'premium_annual' : 'premium_monthly',
          months: selectedPlan === 'annual' ? 12 : 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process subscription');
      }

      // Update subscription store with the exact API response
      subscription.set(data);

      // Dispatch subscribed event and close modal
      dispatch('subscribed');
      dispatch('close');

    } catch (err) {
      console.error('Subscription error:', err);
      error = err instanceof Error ? err.message : 'Failed to process subscription';
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
      <h2>Upgrade to Premium</h2>
      <button class="close-btn" on:click={() => dispatch('close')}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>

    <div class="subscription-content">
      <!-- Plan Selection -->
      <div class="plan-toggle">
        <button 
          class:active={selectedPlan === 'monthly'} 
          on:click={() => selectedPlan = 'monthly'}
        >
          Monthly
        </button>
        <button 
          class:active={selectedPlan === 'annual'} 
          on:click={() => selectedPlan = 'annual'}
        >
          Annual
          {#if plans.annual.savings}
            <span class="savings-badge">Save {plans.annual.savings}</span>
          {/if}
        </button>
      </div>

      <!-- Premium Features -->
      <div class="features">
        <h3>Premium Features</h3>
        <ul>
          <li>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#059669" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            Access to all job listings
          </li>
          <li>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#059669" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            Early access to new jobs
          </li>
          <li>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#059669" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            Premium job alerts
          </li>
        </ul>
      </div>

      <!-- Payment Card -->
      <div class="payment-card">
        <div class="card-preview">
          <div class="card-face">
            <div class="card-chip">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            </div>
            <div class="card-number">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>
            <div class="card-details">
              <div class="card-name">
                <span class="label">Card Holder</span>
                <span class="value">{cardName || 'Your Name'}</span>
              </div>
              <div class="card-expiry">
                <span class="label">Expires</span>
                <span class="value">{cardExpiry || 'MM/YY'}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-form">
          <div class="form-group">
            <label for="cardName">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Name on card
            </label>
            <input 
              type="text" 
              id="cardName"
              bind:value={cardName}
              placeholder="John Smith"
              required
            />
          </div>

          <div class="form-group">
            <label for="cardNumber">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              Card number
            </label>
            <div class="card-input-wrapper">
              <input 
                type="text" 
                id="cardNumber"
                value={cardNumber}
                on:input={handleCardNumberInput}
                maxlength="19"
                placeholder="1234 5678 9012 3456"
                required
              />
              <div class="card-brands">
                {#each Object.entries(CARD_TYPES) as [type, details]}
                  <div class="brand" class:active={cardType === type}>
                    <svg viewBox="0 0 24 24" width="32" height="20">
                      {@html details.icon}
                    </svg>
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <div class="card-row">
            <div class="form-group">
              <label for="cardExpiry">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                Expiry date
              </label>
              <input 
                type="text" 
                id="cardExpiry"
                value={cardExpiry}
                on:input={handleExpiryInput}
                maxlength="5"
                placeholder="MM/YY"
                required
              />
            </div>

            <div class="form-group">
              <label for="cardCvc">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                CVC
              </label>
              <input 
                type="text" 
                id="cardCvc"
                bind:value={cardCvc}
                maxlength="3"
                placeholder="123"
                required
              />
            </div>
          </div>
        </div>

        <button 
          class="pay-button" 
          on:click={handleSubmit} 
          disabled={loading || !isCardValid}
        >
          {#if loading}
            <div class="spinner"></div>
          {:else}
            <span>Pay ${plans[selectedPlan].price}/month</span>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          {/if}
        </button>

        <div class="secure-badge">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.5 1.1 2.5 2.5S13.4 12 12 12s-2.5-1.1-2.5-2.5S10.6 7 12 7z"/>
          </svg>
          <span>Secure payment</span>
        </div>
      </div>

      {#if error}
        <div class="error-message">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
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
    border-radius: 16px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #E5E7EB;
  }

  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: #6B7280;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #F3F4F6;
    color: #111827;
  }

  .subscription-content {
    padding: 1.5rem;
  }

  .plan-toggle {
    display: flex;
    background: #F3F4F6;
    padding: 0.25rem;
    border-radius: 100px;
    margin-bottom: 2rem;
  }

  .plan-toggle button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    background: none;
    color: #6B7280;
    border-radius: 100px;
    cursor: pointer;
    font-weight: 500;
    position: relative;
  }

  .plan-toggle button.active {
    background: white;
    color: #111827;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .savings-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #059669;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .payment-card {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    padding: 2rem;
    margin: 1.5rem 0;
  }

  .card-preview {
    perspective: 1000px;
    margin-bottom: 2rem;
  }

  .card-face {
    background: linear-gradient(135deg, #6355FF 0%, #5346E0 100%);
    border-radius: 16px;
    padding: 1.5rem;
    color: white;
    min-height: 200px;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .card-chip {
    margin-bottom: 1.5rem;
    opacity: 0.9;
  }

  .card-number {
    font-size: 1.5rem;
    letter-spacing: 2px;
    margin-bottom: 2rem;
    font-family: monospace;
  }

  .card-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }

  .label {
    display: block;
    text-transform: uppercase;
    font-size: 0.75rem;
    opacity: 0.8;
    margin-bottom: 0.25rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.875rem;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    background: #F9FAFB;
  }

  .form-group input:focus {
    outline: none;
    border-color: #6355FF;
    background: white;
    box-shadow: 0 0 0 3px rgba(99, 85, 255, 0.1);
  }

  .card-brands {
    position: absolute;
    right: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 0.5rem;
  }

  .brand {
    opacity: 0.3;
    transition: opacity 0.2s;
  }

  .brand.active {
    opacity: 1;
  }

  .card-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .pay-button {
    width: 100%;
    padding: 1rem;
    background: #6355FF;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .pay-button:hover:not(:disabled) {
    background: #5346E0;
    transform: translateY(-1px);
  }

  .pay-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .secure-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    color: #059669;
    font-size: 0.875rem;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .features {
    margin-bottom: 2rem;
  }

  .features h3 {
    font-size: 1.25rem;
    color: #374151;
    margin-bottom: 1rem;
  }

  .features ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .features li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    color: #4B5563;
  }

  .error-message {
    background: #FEE2E2;
    color: #DC2626;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
  }

  .form-group input.valid {
    border-color: #059669;
    background-color: #F0FDF4;
  }

  .form-group input.invalid {
    border-color: #DC2626;
    background-color: #FEF2F2;
  }

  .form-group input.valid:focus {
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }

  .form-group input.invalid:focus {
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
</style> 