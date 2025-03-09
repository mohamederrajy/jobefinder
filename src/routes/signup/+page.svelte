<script lang="ts">
  import { goto } from '$app/navigation';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { signup } from '$lib/api';
  import { APP_NAME } from '$lib/config';
  
  let email = '';
  let zipCode = '';
  let password = '';
  let emailTouched = false;
  let zipCodeTouched = false;
  let passwordTouched = false;
  let showPassword = false;
  let showNextStep = false;
  let error = '';
  let loading = false;
  let emailConsent = true;

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePassword(password: string): boolean {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  }

  function validateZipCode(zipCode: string): boolean {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  }

  function getPasswordStrength(password: string): string {
    if (!password) return 'weak';
    const score = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ].filter(Boolean).length;
    
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  function handleEmailInput() {
    emailTouched = true;
    validateForm();
  }

  function handlePasswordInput() {
    passwordTouched = true;
    validateForm();
  }

  function handleZipCodeInput() {
    zipCodeTouched = true;
    validateForm();
  }

  function validateForm(): boolean {
    if (!email || !validateEmail(email)) {
      error = 'Please enter a valid email address';
      return false;
    }

    if (showNextStep) {
      if (!password || !validatePassword(password)) {
        error = 'Password must be at least 8 characters with uppercase, lowercase, and numbers';
        return false;
      }

      if (!zipCode || !validateZipCode(zipCode)) {
        error = 'Please enter a valid ZIP code';
        return false;
      }
    }

    error = '';
    return true;
  }

  async function handleSubmit() {
    try {
      if (!validateForm()) return;
      
      if (email && !showNextStep) {
        showNextStep = true;
        return;
      }

      loading = true;
      error = '';
      
      const userData = {
        email,
        password,
        zipCode,
        emailConsent
      };

      const response = await fetch(`${PUBLIC_API_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      if (!data.token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', data.token);
      goto('/dashboard');

    } catch (err) {
      console.error('Signup error:', err);
      error = err instanceof Error ? err.message : 'Something went wrong during signup';
    } finally {
      loading = false;
    }
  }

  function togglePassword() {
    showPassword = !showPassword;
  }
</script>

<div class="signup-container">
  <a href="/" class="logo">
    <div class="logo-container">
      <span class="job">Job</span>
      <span class="separator">|</span>
      <span class="finder">Finder</span>
    </div>
  </a>

  <div class="signup-content">
    <div class="left-section">
      <h1>Create your free account</h1>
      
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
        <div class="error-banner">
          {error}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} novalidate>
        {#if !showNextStep}
          <div class="form-group">
            <input 
              type="email" 
              placeholder="Email address"
              bind:value={email}
              on:blur={handleEmailInput}
              on:input={handleEmailInput}
              class={emailTouched && !validateEmail(email) ? 'invalid' : ''}
              disabled={loading}
              required
              aria-invalid={emailTouched && !validateEmail(email)}
            />
            {#if emailTouched && !validateEmail(email)}
              <div class="error-message" role="alert">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#dc3545" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>Please enter a valid email address</span>
              </div>
            {/if}
          </div>

          <button type="submit" class="continue-button" disabled={loading}>
            {loading ? 'Processing...' : 'Next'}
          </button>

          <div class="login-account">
            <p>Already have an account?</p>
            <a href="/login" class="login-button">
              Log in
            </a>
          </div>
        {:else}
          <div class="form-group">
            <input 
              type="text" 
              placeholder="ZIP code"
              bind:value={zipCode}
              on:blur={handleZipCodeInput}
              on:input={handleZipCodeInput}
              class={zipCodeTouched && !validateZipCode(zipCode) ? 'invalid' : ''}
              disabled={loading}
              required
              aria-invalid={zipCodeTouched && !validateZipCode(zipCode)}
            />
            {#if zipCodeTouched && !validateZipCode(zipCode)}
              <div class="error-message" role="alert">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#dc3545" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>Please enter a valid ZIP code (e.g., 12345 or 12345-6789)</span>
              </div>
            {/if}
          </div>

          <div class="form-group">
            <div class="password-input">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                bind:value={password}
                on:blur={handlePasswordInput}
                on:input={handlePasswordInput}
                class={passwordTouched && !validatePassword(password) ? 'invalid' : ''}
                disabled={loading}
                required
                aria-invalid={passwordTouched && !validatePassword(password)}
              />
              <button 
                type="button" 
                class="toggle-password"
                on:click={togglePassword}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>
            </div>
            {#if password}
              <div class="password-strength">
                <div class="strength-meter">
                  <div class="strength-bar {getPasswordStrength(password)}"></div>
                </div>
                <span class="strength-text">Password strength: {getPasswordStrength(password)}</span>
              </div>
            {/if}
            {#if passwordTouched && !validatePassword(password)}
              <div class="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li class={password.length >= 8 ? 'met' : ''}>At least 8 characters</li>
                  <li class={/[A-Z]/.test(password) ? 'met' : ''}>One uppercase letter</li>
                  <li class={/[a-z]/.test(password) ? 'met' : ''}>One lowercase letter</li>
                  <li class={/[0-9]/.test(password) ? 'met' : ''}>One number</li>
                </ul>
              </div>
            {/if}
          </div>

          <button type="submit" class="next-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        {/if}

        <div class="consent-section">
          <label class="consent-checkbox" for="email-consent">
            <div class="checkbox-wrapper">
              <input 
                type="checkbox" 
                id="email-consent"
                checked
              />
              <span class="checkmark">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
            </div>
            <span class="consent-text">
              Yes! I want <strong>JobFinder</strong> to email me job alerts and information relevant to my job search.
            </span>
          </label>
        </div>

        <div class="terms">
          By continuing, you accept the <a href="/terms">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>
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

  .login-account {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e0e0e0;
  }

  .login-account p {
    color: #666;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .login-button {
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

  .login-button:hover {
    background: #6355FF;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .consent-section {
    margin: 1.5rem 0;
  }

  .consent-checkbox {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-wrapper {
    position: relative;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .consent-checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    background-color: white;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .consent-checkbox:hover input ~ .checkmark {
    border-color: #6355FF;
    background-color: rgba(99, 85, 255, 0.05);
  }

  .consent-checkbox input:checked ~ .checkmark {
    background-color: #6355FF;
    border-color: #6355FF;
  }

  .consent-checkbox input:focus ~ .checkmark {
    box-shadow: 0 0 0 3px rgba(99, 85, 255, 0.2);
  }

  .checkmark svg {
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
  }

  .consent-checkbox input:checked ~ .checkmark svg {
    opacity: 1;
    transform: scale(1);
  }

  .consent-text {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .consent-text strong {
    color: #333;
    font-weight: 600;
  }

  .consent-checkbox input:disabled ~ .checkmark {
    background-color: #f5f5f5;
    border-color: #e0e0e0;
    cursor: not-allowed;
  }

  .consent-checkbox input:disabled ~ .consent-text {
    color: #999;
    cursor: not-allowed;
  }

  .terms {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .terms a {
    color: #6355FF;
    text-decoration: none;
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

  label {
    display: block;
    font-size: 1rem;
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  small {
    display: block;
    color: #666;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .password-input {
    position: relative;
    margin-bottom: 0.5rem;
  }

  .toggle-password {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #666;
  }

  .toggle-password:hover {
    color: #333;
  }

  .next-button {
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
    transition: all 0.2s ease;
  }

  .next-button:hover {
    background: #5346E0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .error-banner {
    background: #fff2f2;
    color: #dc3545;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    text-align: center;
    border: 1px solid #ffcdd2;
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  .password-strength {
    margin-top: 0.5rem;
  }

  .strength-meter {
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    margin-bottom: 0.25rem;
  }

  .strength-bar {
    height: 100%;
    width: 0;
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  .strength-bar.weak {
    width: 33.33%;
    background: #dc3545;
  }

  .strength-bar.medium {
    width: 66.66%;
    background: #ffc107;
  }

  .strength-bar.strong {
    width: 100%;
    background: #28a745;
  }

  .strength-text {
    font-size: 0.85rem;
    color: #666;
  }

  .password-requirements {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .password-requirements p {
    color: #666;
    margin-bottom: 0.5rem;
  }

  .password-requirements ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .password-requirements li {
    color: #dc3545;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .password-requirements li::before {
    content: "×";
    font-weight: bold;
  }

  .password-requirements li.met {
    color: #28a745;
  }

  .password-requirements li.met::before {
    content: "✓";
  }
</style> 