<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../stores/userStore';

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

  let subscriptionOptions: SubscriptionOptions | null = null;
  let loading = true;
  let error: string | null = null;

  async function fetchSubscriptionOptions() {
    try {
      console.log('Fetching subscription options from:', `${PUBLIC_API_URL}/subscriptions/subscription-options`);
      const response = await fetch(`${PUBLIC_API_URL}/subscriptions/subscription-options`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription options: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      subscriptionOptions = {
        prices: {
          monthly: {
            amount: data.prices.monthly.amount || 29,
            currency: data.prices.monthly.currency || 'usd',
            interval: data.prices.monthly.interval || 'month',
            intervalCount: data.prices.monthly.intervalCount || 1
          },
          quarterly: {
            amount: data.prices.quarterly.amount || 87,
            currency: data.prices.quarterly.currency || 'usd',
            interval: data.prices.quarterly.interval || 'month',
            intervalCount: data.prices.quarterly.intervalCount || 3
          },
          yearly: {
            amount: data.prices.yearly.amount || 199,
            currency: data.prices.yearly.currency || 'usd',
            interval: data.prices.yearly.interval || 'year',
            intervalCount: data.prices.yearly.intervalCount || 1
          }
        }
      };
    } catch (err) {
      console.error('Error fetching options:', err);
      error = err instanceof Error ? err.message : 'Failed to fetch subscription options';
      // Use fallback values if API fails
      subscriptionOptions = {
        prices: {
          monthly: { amount: 29, currency: 'usd', interval: 'month', intervalCount: 1 },
          quarterly: { amount: 87, currency: 'usd', interval: 'month', intervalCount: 3 },
          yearly: { amount: 199, currency: 'usd', interval: 'year', intervalCount: 1 }
        }
      };
    } finally {
      loading = false;
    }
  }

  onMount(fetchSubscriptionOptions);
</script>

<div class="pricing-container">
  <div class="hero-section">
    <span class="subtitle">Simple Pricing</span>
    <h1>Choose Your Plan</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
      </svg>
      <span class="line"></span>
    </div>
    <p class="hero-description">
      Find the perfect plan for your job search journey
    </p>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>Loading plans...</span>
    </div>
  {:else if error}
    <div class="error-message">
      {error}
    </div>
  {:else if subscriptionOptions}
    <div class="plans-grid">
      <!-- Monthly Plan -->
      <div class="plan-card">
        <h2>Monthly</h2>
        <div class="price">
          <span class="currency">$</span>
          <span class="amount">{subscriptionOptions.prices.monthly.amount}</span>
          <span class="period">/month</span>
        </div>
        <p class="plan-description">Basic subscription</p>
        <ul class="features">
          <li>
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Unlimited job applications
          </li>
          <li>
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Basic profile features
          </li>
          <li>
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Email support
          </li>
        </ul>
        <button class="cta-button secondary">Subscribe Monthly</button>
      </div>

      <!-- Quarterly Plan (Most Popular) -->
      <div class="plan-card popular">
        <div class="popular-badge">Most Popular</div>
        <h2>Quarterly</h2>
        <div class="price">
          <span class="currency">$</span>
          <span class="amount">{subscriptionOptions.prices.quarterly.amount}</span>
          <span class="period">/3 months</span>
        </div>
        <p class="plan-description">Save 11% on quarterly billing</p>
        <ul class="features">
          <li>
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            All Monthly features
          </li>
          <li>
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Priority application status
          </li>
          <li>
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            24/7 priority support
          </li>
        </ul>
        <button class="cta-button primary">Subscribe Quarterly</button>
      </div>

      <!-- Yearly Plan -->
      <div class="plan-card">
        <h2>Yearly</h2>
        <div class="price">
          <span class="currency">$</span>
          <span class="amount">{subscriptionOptions.prices.yearly.amount}</span>
          <span class="period">/year</span>
        </div>
        <p class="plan-description">Save 17% on yearly billing</p>
        <ul class="features">
          <li>
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            All Quarterly features
          </li>
          <li>
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Career coaching session
          </li>
          <li>
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Premium support
          </li>
        </ul>
        <button class="cta-button secondary">Subscribe Yearly</button>
      </div>
    </div>
  {/if}

  <section class="faq-section">
    <h2>Frequently Asked Questions</h2>
    <div class="faq-grid">
      <div class="faq-item">
        <h3>Can I change plans later?</h3>
        <p>Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
      </div>
      <div class="faq-item">
        <h3>What payment methods do you accept?</h3>
        <p>We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
      </div>
      <div class="faq-item">
        <h3>Is there a contract or commitment?</h3>
        <p>No, all our plans are month-to-month with no long-term commitment required.</p>
      </div>
      <div class="faq-item">
        <h3>Can I get a refund?</h3>
        <p>We offer a 14-day money-back guarantee for all paid plans if you're not satisfied.</p>
      </div>
    </div>
  </section>
</div>

<style>
  .pricing-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .hero-section {
    text-align: center;
    padding: 4rem 0;
    margin-bottom: 3rem;
  }

  .subtitle {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
    color: #6356FF;
  }

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    color: #1F2937;
  }

  .header-accent {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .line {
    width: 60px;
    height: 2px;
    background: rgba(99, 86, 255, 0.2);
    border-radius: 1px;
  }

  .hero-description {
    font-size: 1.25rem;
    color: #6B7280;
    max-width: 600px;
    margin: 0 auto;
  }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .plan-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    position: relative;
    border: 1px solid #E5E7EB;
    transition: all 0.3s ease;
  }

  .plan-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(99, 86, 255, 0.1);
  }

  .plan-card.popular {
    border-color: #6356FF;
    box-shadow: 0 8px 16px rgba(99, 86, 255, 0.1);
  }

  .popular-badge {
    position: absolute;
    top: -12px;
    right: 24px;
    background: #6356FF;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .price {
    margin: 1.5rem 0;
    display: flex;
    align-items: baseline;
  }

  .currency {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1F2937;
  }

  .amount {
    font-size: 3.5rem;
    font-weight: 800;
    color: #1F2937;
    margin: 0 0.25rem;
  }

  .period {
    color: #6B7280;
  }

  .plan-description {
    color: #6B7280;
    margin-bottom: 1.5rem;
  }

  .features {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
  }

  .features li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    color: #4B5563;
  }

  .check-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #6356FF;
    flex-shrink: 0;
  }

  .cta-button {
    width: 100%;
    padding: 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cta-button.primary {
    background: #6356FF;
    color: white;
    border: none;
  }

  .cta-button.primary:hover {
    background: #5244E3;
  }

  .cta-button.secondary {
    background: white;
    color: #6356FF;
    border: 2px solid #6356FF;
  }

  .cta-button.secondary:hover {
    background: rgba(99, 86, 255, 0.1);
  }

  .faq-section {
    margin-top: 6rem;
    padding-top: 4rem;
    border-top: 1px solid #E5E7EB;
  }

  .faq-section h2 {
    text-align: center;
    margin-bottom: 3rem;
    font-size: 2rem;
    color: #1F2937;
  }

  .faq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .faq-item h3 {
    color: #1F2937;
    font-size: 1.125rem;
    margin-bottom: 0.75rem;
  }

  .faq-item p {
    color: #6B7280;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .pricing-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .plans-grid {
      grid-template-columns: 1fr;
    }

    .plan-card {
      max-width: 400px;
      margin: 0 auto;
    }
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: #6B7280;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(99, 86, 255, 0.3);
    border-radius: 50%;
    border-top-color: #6356FF;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-message {
    margin: 2rem auto;
    padding: 1rem;
    background: #FEF2F2;
    color: #DC2626;
    border-radius: 8px;
    max-width: 600px;
    text-align: center;
  }
</style> 