<script lang="ts">
  let formData = {
    companyName: '',
    name: '',
    email: '',
    phone: '',
    employeeCount: '',
    message: ''
  };

  let loading = false;
  let success = false;
  let error: string | null = null;

  const employeeRanges = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501+ employees'
  ];

  async function handleSubmit() {
    loading = true;
    error = null;
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      success = true;
      formData = {
        companyName: '',
        name: '',
        email: '',
        phone: '',
        employeeCount: '',
        message: ''
      };
    } catch (err) {
      error = 'Failed to send message. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="contact-sales-container">
  <div class="hero-section">
    <span class="subtitle">Get in Touch</span>
    <h1>Contact Sales</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
      <span class="line"></span>
    </div>
    <p class="hero-description">
      Let's discuss how we can help you find and hire the best talent
    </p>
  </div>

  <div class="content-grid">
    <div class="form-section">
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="companyName">Company Name *</label>
          <input
            type="text"
            id="companyName"
            bind:value={formData.companyName}
            required
            placeholder="Your company name"
          />
        </div>

        <div class="form-group">
          <label for="name">Your Name *</label>
          <input
            type="text"
            id="name"
            bind:value={formData.name}
            required
            placeholder="Full name"
          />
        </div>

        <div class="form-group">
          <label for="email">Business Email *</label>
          <input
            type="email"
            id="email"
            bind:value={formData.email}
            required
            placeholder="you@company.com"
          />
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            bind:value={formData.phone}
            placeholder="Your phone number"
          />
        </div>

        <div class="form-group">
          <label for="employeeCount">Company Size *</label>
          <select
            id="employeeCount"
            bind:value={formData.employeeCount}
            required
          >
            <option value="">Select company size</option>
            {#each employeeRanges as range}
              <option value={range}>{range}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="message">Message *</label>
          <textarea
            id="message"
            bind:value={formData.message}
            required
            placeholder="Tell us about your hiring needs"
            rows="4"
          ></textarea>
        </div>

        <button type="submit" class="submit-btn" disabled={loading}>
          {#if loading}
            <div class="spinner"></div>
            Sending...
          {:else}
            Send Message
          {/if}
        </button>

        {#if error}
          <div class="error-message">
            {error}
          </div>
        {/if}

        {#if success}
          <div class="success-message">
            Thank you for contacting us! We'll get back to you shortly.
          </div>
        {/if}
      </form>
    </div>

    <div class="info-section">
      <div class="info-card">
        <h2>Why Choose Us?</h2>
        <ul class="benefits-list">
          <li>
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            AI-powered talent matching
          </li>
          <li>
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Customized recruitment solutions
          </li>
          <li>
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Advanced analytics and insights
          </li>
          <li>
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            24/7 dedicated support
          </li>
        </ul>

        <div class="contact-info">
          <h3>Other Ways to Reach Us</h3>
          <div class="contact-method">
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            <a href="mailto:sales@jobefinder.com">sales@jobefinder.com</a>
          </div>
          <div class="contact-method">
            <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            <span>+1 (555) 123-4567</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .contact-sales-container {
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

  .content-grid {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 4rem;
    align-items: start;
  }

  .form-section {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid #E5E7EB;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
    font-weight: 500;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #6356FF;
    box-shadow: 0 0 0 3px rgba(99, 86, 255, 0.1);
  }

  .submit-btn {
    width: 100%;
    padding: 1rem;
    background: #6356FF;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    background: #5244E3;
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }

  .success-message {
    margin-top: 1rem;
    padding: 1rem;
    background: #ECFDF5;
    color: #059669;
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }

  .info-section {
    position: sticky;
    top: 2rem;
  }

  .info-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid #E5E7EB;
  }

  .info-card h2 {
    font-size: 1.5rem;
    color: #1F2937;
    margin-bottom: 1.5rem;
  }

  .benefits-list {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem;
  }

  .benefits-list li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    color: #4B5563;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #6356FF;
    flex-shrink: 0;
  }

  .contact-info {
    border-top: 1px solid #E5E7EB;
    padding-top: 1.5rem;
  }

  .contact-info h3 {
    font-size: 1.125rem;
    color: #1F2937;
    margin-bottom: 1rem;
  }

  .contact-method {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .contact-method a {
    color: #6356FF;
    text-decoration: none;
  }

  .contact-method a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .content-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .info-section {
      position: static;
    }

    .contact-sales-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }
  }
</style> 