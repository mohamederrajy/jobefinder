<script lang="ts">
  import { user } from '../../stores/userStore';
  import { subscription } from '../../stores/subscriptionStore';
  import { checkSubscription } from '../../lib/api/subscription';
  import { goto } from '$app/navigation';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { login } from '../../stores/userStore';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  
  let email = '';
  let password = '';
  let emailTouched = false;
  let passwordTouched = false;
  let showPassword = false;
  let error: string | null = null;
  let loading = false;
  let showError = false;
  let redirectTo = '/dashboard';

  onMount(() => {
    // Check if there's a redirect parameter in the URL
    const urlParams = new URLSearchParams($page.url.search);
    if (urlParams.has('redirect')) {
      redirectTo = urlParams.get('redirect');
    }
  });

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  async function handleLogin() {
    try {
      loading = true;
      error = null;
      
      const response = await fetch(`${PUBLIC_API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }
      
      const userData = await response.json();
      
      // Set user data in store with all required fields
      user.set({
        id: userData.user._id,
        email: userData.user.email,
        name: userData.user.name || email.split('@')[0],
        isAdmin: userData.user.role === 'admin',
        token: userData.token,
        role: userData.user.role,
        profile: userData.user.profile || {},
        subscription: userData.user.subscription || { isPaid: false, plan: 'free' }
      });

      // Redirect based on user role
      if (userData.user.role === 'admin') {
        await goto('/admin');
      } else {
        await goto(redirectTo);
      }

    } catch (err: any) {
      console.error('Login error:', err);
      error = err.message || 'An error occurred during login. Please try again.';
    } finally {
      loading = false;
    }
  }

  function handleEmailInput() {
    emailTouched = true;
    if (email && !validateEmail(email)) {
      error = 'Please enter a valid email address';
    } else {
      error = '';
    }
  }

  function handlePasswordInput() {
    passwordTouched = true;
    if (password && !validatePassword(password)) {
      error = 'Password must be at least 6 characters long';
    } else {
      error = '';
    }
  }

  function togglePassword() {
    showPassword = !showPassword;
  }

  function returnHome() {
    goto('/');
  }
</script>

<div class="signup-container">
  {#if showError}
    <div class="error-overlay">
      <div class="error-content">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path fill="#dc3545" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button class="return-button" on:click={returnHome}>
          Return to JobFinder
        </button>
      </div>
    </div>
  {/if}

  

  <div class="signup-content">
    <div class="left-section">
      <h1>Welcome back!</h1>
      
      <div class="benefits">
        <div class="benefit-item">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#4CAF50" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          <span>Instantly schedule interviews</span>
        </div>
        <div class="benefit-item">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#4CAF50" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          <span>Track your applications</span>
        </div>
        <div class="benefit-item">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#4CAF50" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          <span>Apply to these popular brands (and many more) with a single click:</span>
        </div>
      </div>

      <div class="brand-logos">
        <img src="/images/best_buy.svg" alt="Best Buy" />
        <img src="/images/dunkin.svg" alt="Dunkin" />
        <img src="/images/hilton.svg" alt="Hilton" />
        <img src="/images/buffalo-wild-wings.svg" alt="Buffalo Wild Wings" />
      </div>
    </div>

    <div class="right-section">
      {#if error}
        <div class="error-banner" role="alert">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{error}</span>
        </div>
      {/if}

      <form on:submit|preventDefault={handleLogin} novalidate>
        <div class="form-group">
          <input 
            type="email" 
            placeholder="Email address"
            bind:value={email}
            on:blur={handleEmailInput}
            on:input={handleEmailInput}
            disabled={loading}
            class={emailTouched && !validateEmail(email) ? 'invalid' : ''}
            required
            aria-invalid={emailTouched && !validateEmail(email)}
          />
          {#if emailTouched && !email}
            <div class="error-message" role="alert">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="#dc3545" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>Email address is required</span>
            </div>
          {/if}
        </div>

        <div class="form-group">
          <div class="password-input">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              bind:value={password}
              on:blur={handlePasswordInput}
              on:input={handlePasswordInput}
              disabled={loading}
              class={passwordTouched && !validatePassword(password) ? 'invalid' : ''}
              required
              aria-invalid={passwordTouched && !validatePassword(password)}
            />
            <button 
              type="button" 
              class="toggle-password"
              on:click={togglePassword}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {#if showPassword}
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <button type="submit" class="continue-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <div class="forgot-password">
          <a href="/forgot-password">Forgot password?</a>
        </div>

        <div class="create-account">
          <p>Don't have an account?</p>
          <a href="/signup" class="create-account-button">
            Create Account
          </a>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  .signup-container {
    min-height: 100vh;
    padding: 2rem;
    background: white;
    position: relative;
  }

  .logo {
    text-decoration: none;
    position: absolute;
    top: 2rem;
    left: 2rem;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .job {
    color: #333;
    font-size: 1.5rem;
    font-weight: bold;
    font-family: serif;
  }

  .separator {
    color: #6355FF;
    font-size: 1.5rem;
    opacity: 0.7;
  }

  .finder {
    color: #6355FF;
    font-size: 1.5rem;
    font-weight: bold;
    font-family: serif;
  }

  .signup-content {
    max-width: 1200px;
    margin: 6rem auto 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6rem;
    padding: 0 2rem;
  }

  .left-section {
    max-width: 480px;
  }

  h1 {
    font-size: 3rem;
    color: #333;
    margin-bottom: 2.5rem;
    font-family: serif;
    font-weight: 600;
    line-height: 1.2;
  }

  .benefits {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 2.5rem;
  }

  .benefit-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.1rem;
    color: #333;
  }

  .brand-logos {
    display: flex;
    align-items: center;
    gap: 2.5rem;
  }

  .brand-logos img {
    height: 32px;
    object-fit: contain;
  }

  .right-section {
    max-width: 480px;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  input {
    width: 100%;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #6355FF;
    box-shadow: 0 0 0 3px rgba(99, 85, 255, 0.1);
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #dc3545;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .continue-button {
    width: 100%;
    padding: 1rem;
    background: #6355FF;
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 2rem;
  }

  .forgot-password {
    text-align: center;
    margin: 1rem 0;
  }

  .forgot-password a {
    color: #6355FF;
    text-decoration: none;
    font-size: 0.9rem;
  }

  .forgot-password a:hover {
    text-decoration: underline;
  }

  .create-account {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e0e0e0;
  }

  .create-account p {
    color: #666;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .create-account-button {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: white;
    border: 2px solid #6355FF;
    color: #6355FF;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .create-account-button:hover {
    background: #6355FF;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  @media (max-width: 1200px) {
    .signup-content {
      gap: 4rem;
      padding: 0 1rem;
    }
  }

  @media (max-width: 1024px) {
    .signup-content {
      grid-template-columns: 1fr;
      max-width: 600px;
      gap: 3rem;
    }

    .left-section,
    .right-section {
      max-width: 100%;
    }
  }

  @media (max-width: 768px) {
    .signup-container {
      padding: 1rem;
    }

    .signup-content {
      margin-top: 4rem;
    }

    h1 {
      font-size: 2.5rem;
    }

    .brand-logos {
      flex-wrap: wrap;
      justify-content: center;
      gap: 2rem;
    }
  }

  .error-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .error-content {
    text-align: center;
    padding: 2rem;
    max-width: 400px;
  }

  .error-content h2 {
    color: #dc3545;
    font-size: 1.5rem;
    margin: 1rem 0;
  }

  .error-content p {
    color: #666;
    margin-bottom: 1.5rem;
  }

  .return-button {
    background: #6355FF;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .return-button:hover {
    background: #5346E0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .invalid {
    border-color: #dc3545;
    background-color: #fff8f8;
  }

  .invalid:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff2f2;
    color: #dc3545;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    border: 1px solid #ffcdd2;
  }

  .password-input {
    position: relative;
  }

  .toggle-password {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-radius: 50%;
  }

  .toggle-password:hover {
    color: #333;
    background: rgba(0, 0, 0, 0.05);
  }

  .toggle-password:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 85, 255, 0.2);
  }

  .toggle-password:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .password-input input {
    padding-right: 3rem;
  }

  .password-input input:focus + .toggle-password {
    color: #6355FF;
  }
</style> 