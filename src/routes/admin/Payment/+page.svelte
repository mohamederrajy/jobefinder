<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '../../../stores/userStore';
  import { goto } from '$app/navigation';
  import { PUBLIC_API_URL } from '$env/static/public';

  interface StripeSettings {
    stripeSecretKey: string;
    stripePublishableKey: string;
    stripeWebhookSecret: string;
    stripePriceIds: {
      monthly: string;
      quarterly: string;
      yearly: string;
    };
  }

  let settings: StripeSettings = {
    stripeSecretKey: '',
    stripePublishableKey: '',
    stripeWebhookSecret: '',
    stripePriceIds: {
      monthly: '',
      quarterly: '',
      yearly: ''
    }
  };

  let loading = false;
  let saving = false;
  let error: string | null = null;
  let success: string | null = null;

  onMount(async () => {
    if (!$user?.token) {
      goto('/login');
      return;
    }
    await fetchSettings();
  });

  async function fetchSettings() {
    try {
      loading = true;
      error = null;
      console.log('Fetching settings...');

      const response = await fetch(`${PUBLIC_API_URL}/subscriptions/settings`, {
        headers: {
          'x-auth-token': $user?.token || ''
        }
      });

      const data = await response.json();
      console.log('Fetched settings:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch Stripe settings');
      }

      // Update settings with fetched data
      settings = {
        stripeSecretKey: data.stripeSecretKey || '',
        stripePublishableKey: data.stripePublishableKey || '',
        stripeWebhookSecret: data.stripeWebhookSecret || '',
        stripePriceIds: {
          monthly: data.stripePriceIds?.monthly || '',
          quarterly: data.stripePriceIds?.quarterly || '',
          yearly: data.stripePriceIds?.yearly || ''
        }
      };

      console.log('Settings updated:', settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      error = err instanceof Error ? err.message : 'Failed to fetch settings';
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    try {
      saving = true;
      error = null;
      success = null;

      // Validate key formats
      if (!settings.stripePublishableKey.startsWith('pk_test_')) {
        throw new Error('Invalid publishable key format. Must start with pk_test_');
      }

      if (!settings.stripeSecretKey.startsWith('sk_test_')) {
        throw new Error('Invalid secret key format. Must start with sk_test_');
      }

      // Update all settings at once
      const response = await fetch(`${PUBLIC_API_URL}/subscriptions/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        },
        body: JSON.stringify({
          stripePublishableKey: settings.stripePublishableKey.trim(),
          stripeSecretKey: settings.stripeSecretKey.trim(),
          stripeWebhookSecret: settings.stripeWebhookSecret.trim(),
          stripePriceIds: {
            monthly: settings.stripePriceIds.monthly.trim(),
            quarterly: settings.stripePriceIds.quarterly.trim(),
            yearly: settings.stripePriceIds.yearly.trim()
          }
        })
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }

      success = 'Settings updated successfully';
      await fetchSettings(); // Refresh settings after update
    } catch (err) {
      console.error('Error saving settings:', err);
      error = err instanceof Error ? err.message : 'Failed to save settings';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Stripe Settings - Admin Dashboard</title>
</svelte:head>

<div class="settings-page">
  <div class="header">
    <h1>Stripe Settings</h1>
    <p class="subtitle">Configure your Stripe integration settings</p>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>Loading settings...</span>
    </div>
  {:else}
    <form class="settings-form" on:submit|preventDefault={handleSubmit}>
      <!-- API Keys Section -->
      <div class="section">
        <h2>API Keys</h2>
        <div class="form-group">
          <label for="publishableKey">
            Publishable Key
            <span class="required">*</span>
          </label>
          <input
            type="text"
            id="publishableKey"
            bind:value={settings.stripePublishableKey}
            placeholder="pk_test_..."
            required
          />
          <span class="help-text">Your Stripe publishable key (starts with pk_)</span>
        </div>

        <div class="form-group">
          <label for="secretKey">
            Secret Key
            <span class="required">*</span>
          </label>
          <input
            type="password"
            id="secretKey"
            bind:value={settings.stripeSecretKey}
            placeholder="sk_test_..."
            required
          />
          <span class="help-text">Your Stripe secret key (starts with sk_)</span>
        </div>

        <div class="form-group">
          <label for="webhookSecret">
            Webhook Secret
            <span class="required">*</span>
          </label>
          <input
            type="password"
            id="webhookSecret"
            bind:value={settings.stripeWebhookSecret}
            placeholder="whsec_..."
            required
          />
          <span class="help-text">Your Stripe webhook signing secret (starts with whsec_)</span>
        </div>
      </div>

      <!-- Price IDs Section -->
      <div class="section">
        <h2>Subscription Price IDs</h2>
        <div class="form-group">
          <label for="monthlyPrice">
            Monthly Price ID
            <span class="required">*</span>
          </label>
          <input
            type="text"
            id="monthlyPrice"
            bind:value={settings.stripePriceIds.monthly}
            placeholder="price_..."
            required
          />
          <span class="help-text">Monthly subscription price ID</span>
        </div>

        <div class="form-group">
          <label for="quarterlyPrice">
            Quarterly Price ID
            <span class="required">*</span>
          </label>
          <input
            type="text"
            id="quarterlyPrice"
            bind:value={settings.stripePriceIds.quarterly}
            placeholder="price_..."
            required
          />
          <span class="help-text">Quarterly subscription price ID</span>
        </div>

        <div class="form-group">
          <label for="yearlyPrice">
            Yearly Price ID
            <span class="required">*</span>
          </label>
          <input
            type="text"
            id="yearlyPrice"
            bind:value={settings.stripePriceIds.yearly}
            placeholder="price_..."
            required
          />
          <span class="help-text">Yearly subscription price ID</span>
        </div>
      </div>

      <div class="actions">
        <button type="submit" class="save-btn" disabled={saving}>
          {#if saving}
            <div class="spinner small"></div>
            <span>Saving...</span>
          {:else}
            <span>Save Settings</span>
          {/if}
        </button>
      </div>

      {#if error}
        <div class="error-message">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      {/if}

      {#if success}
        <div class="success-message">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          {success}
          <p class="note">Note: A server restart may be required for changes to take effect</p>
        </div>
      {/if}
    </form>
  {/if}
</div>

<style lang="scss">
  :global(body) {
    background: #F9FAFB;
  }

  .settings-page {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    background: #F9FAFB;
  }

  .header {
    margin-bottom: 2rem;

    h1 {
      font-size: 2rem;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #6B7280;
      font-size: 1.125rem;
    }
  }

  .settings-form {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .required {
      color: #DC2626;
      margin-left: 0.25rem;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #E5E7EB;
      border-radius: 6px;
      font-size: 1rem;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #6355FF;
        box-shadow: 0 0 0 3px rgba(99, 85, 255, 0.1);
      }
    }

    .help-text {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #6B7280;
    }
  }

  .actions {
    margin-top: 2rem;
  }

  .save-btn {
    padding: 0.75rem 1.5rem;
    background: #6355FF;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #5346E0;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;

    &.small {
      width: 16px;
      height: 16px;
      border-width: 2px;
    }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-message, .success-message {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 6px;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .error-message {
    background: #FEF2F2;
    color: #DC2626;
    border: 1px solid #FEE2E2;
  }

  .success-message {
    background: #F0FDF4;
    color: #059669;
    border: 1px solid #D1FAE5;
    flex-direction: column;

    .note {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #065F46;
    }
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem;
    background: white;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    color: #6B7280;
  }

  .section {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #E5E7EB;

    h2 {
      font-size: 1.25rem;
      color: #111827;
      margin-bottom: 1.5rem;
    }

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  }
</style>