<script>
  import { onMount } from 'svelte';
  
  let email = '';
  let zipCode = '';
  let password = '';
  let showPassword = false;

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    email = params.get('email') || '';
  });

  function togglePassword() {
    showPassword = !showPassword;
  }

  function handleSubmit() {
    console.log({ email, zipCode, password });
  }
</script>

<div class="signup-container">
  <a href="/" class="logo">
    <span class="logo-text">snagajob</span>
  </a>

  <div class="signup-content">
    <h1>Let's get you hired!</h1>

    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label>Where are you looking for jobs?</label>
        <input 
          type="text" 
          placeholder="Zip code"
          bind:value={zipCode}
          class="input-field"
          required
        />
      </div>

      <div class="form-group">
        <label>Add a password to secure your account.</label>
        <small>Your password must be at least 8 characters.</small>
        <div class="password-input">
          <input 
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            bind:value={password}
            class="input-field"
            minlength="8"
            required
          />
          <button 
            type="button" 
            class="toggle-password"
            on:click={togglePassword}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </button>
        </div>
      </div>

      <button type="submit" class="next-button">
        Next
      </button>
    </form>
  </div>
</div>

<style>
  .signup-container {
    min-height: 100vh;
    padding: 2rem;
    background: white;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .logo {
    position: absolute;
    top: 2rem;
    left: 2rem;
    text-decoration: none;
  }

  .logo-text {
    color: #6355FF;
    font-size: 1.5rem;
    font-weight: bold;
    font-family: serif;
  }

  .signup-content {
    max-width: 480px;
    width: 100%;
    margin-top: 6rem;
    padding: 0 1rem;
  }

  h1 {
    font-size: 2.75rem;
    color: #333;
    margin-bottom: 3rem;
    text-align: center;
    font-family: serif;
    font-weight: 600;
    line-height: 1.2;
  }

  .form-group {
    margin-bottom: 2rem;
  }

  label {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.75rem;
  }

  small {
    display: block;
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  .input-field {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    transition: all 0.2s ease;
  }

  .input-field:focus {
    outline: none;
    border-color: #6355FF;
    box-shadow: 0 0 0 3px rgba(99, 85, 255, 0.1);
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
    color: #666;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
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
    transition: all 0.2s ease;
    margin-top: 1rem;
  }

  .next-button:hover {
    background: #5346E0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  @media (max-width: 768px) {
    .signup-container {
      padding: 1rem;
    }

    .signup-content {
      margin-top: 4rem;
    }

    h1 {
      font-size: 2.25rem;
      margin-bottom: 2rem;
    }
  }

  @media (max-width: 480px) {
    h1 {
      font-size: 2rem;
    }

    .input-field {
      padding: 0.875rem;
    }
  }
</style> 