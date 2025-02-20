<script>
  import { APP_NAME } from '$lib/config';
  let email = '';
  let zipCode = '';
  let password = '';
  let emailTouched = false;
  let showPassword = false;
  let showNextStep = false;

  function handleSubmit() {
    emailTouched = true;
    if (email && !showNextStep) {
      showNextStep = true;
      return;
    }
    console.log({ email, zipCode, password });
  }

  function handleEmailInput() {
    emailTouched = true;
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
      <form on:submit|preventDefault={handleSubmit}>
        {#if !showNextStep}
          <div class="form-group">
            <input 
              type="email" 
              placeholder="Email address"
              bind:value={email}
              on:blur={handleEmailInput}
              required
            />
            {#if emailTouched && !email}
              <div class="error-message">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#dc3545" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>An email address or social account is required.</span>
              </div>
            {/if}
          </div>

          <button type="submit" class="continue-button">
            Continue with email
          </button>

          <div class="social-divider">
            <span>or use a social account</span>
          </div>

          <button type="button" class="social-login-button">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        {:else}
          <div class="form-group">
            <input 
              type="text" 
              placeholder="Zip code"
              bind:value={zipCode}
              required
            />
          </div>

          <div class="form-group">
            <div class="password-input">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                bind:value={password}
                minlength="8"
                required
              />
              <button 
                type="button" 
                class="toggle-password"
                on:click={togglePassword}
              >
                {#if showPassword}
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                {:else}
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                {/if}
              </button>
            </div>
            <small>Your password must be at least 8 characters.</small>
          </div>

          <button type="submit" class="next-button">
            Submit
          </button>
        {/if}

        <div class="consent-checkbox">
          <input 
            type="checkbox" 
            id="email-consent"
            checked
          />
          <label for="email-consent">
            Yes! I want {APP_NAME} to email me job alerts and information relevant to my job search.
          </label>
        </div>

        <div class="terms">
          By continuing, you accept the <a href="/terms">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>
        </div>
      </form>

      <div class="login-prompt">
        Already have an account? Log in as a:
        <div class="login-options">
          <a href="/login/job-seeker">Job-seeker</a> | <a href="/login/employer">Employer</a>
        </div>
      </div>
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

  .social-divider {
    text-align: center;
    position: relative;
    margin: 2rem 0;
    color: #666;
    font-size: 0.9rem;
  }

  .social-divider::before,
  .social-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background: #e0e0e0;
  }

  .social-divider::before {
    left: 0;
  }

  .social-divider::after {
    right: 0;
  }

  .social-login-button {
    width: 100%;
    padding: 0.875rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    font-size: 1rem;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 2rem;
    font-weight: 500;
  }

  .social-login-button:hover {
    background: #f8f9fa;
    border-color: #d0d0d0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  .social-login-button svg {
    flex-shrink: 0;
  }

  .consent-checkbox {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: flex-start;
  }

  .consent-checkbox input {
    margin-top: 0.25rem;
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

  .login-prompt {
    text-align: center;
    color: #333;
  }

  .login-options {
    margin-top: 0.5rem;
  }

  .login-options a {
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
    color: #666;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
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
</style> 