<script lang="ts">
  import { onMount } from 'svelte';
  import { notifications } from '../../stores/notificationStore';

  let formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  async function handleSubmit() {
    try {
      // Add your form submission logic here
      notifications.add({
        type: 'success',
        message: 'Message sent successfully!'
      });
      formData = { name: '', email: '', subject: '', message: '' };
    } catch (error) {
      notifications.add({
        type: 'error',
        message: 'Failed to send message'
      });
    }
  }
</script>

<div class="contact-container">
  <div class="hero-section">
    <span class="subtitle">Get in Touch</span>
    <h1>Contact Us</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
      <span class="line"></span>
    </div>
  </div>

  <div class="contact-content">
    <div class="contact-grid">
      <div class="contact-info">
        <h2>Let's Connect</h2>
        <p>Have questions about Visavar? We're here to help you find your perfect job opportunity.</p>
        
        <div class="info-cards">
          <div class="info-card">
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3>Email Us</h3>
            <p>support@visavar.com</p>
          </div>

          <div class="info-card">
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3>Call Us</h3>
            <p>+1 (555) 123-4567</p>
          </div>

          <div class="info-card">
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <h3>Visit Us</h3>
            <p>123 Business District<br>New York, NY 10001</p>
          </div>
        </div>
      </div>

      <form class="contact-form" on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" bind:value={formData.name} required />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" bind:value={formData.email} required />
        </div>

        <div class="form-group">
          <label for="subject">Subject</label>
          <input type="text" id="subject" bind:value={formData.subject} required />
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" bind:value={formData.message} required rows="5"></textarea>
        </div>

        <button type="submit">Send Message</button>
      </form>
    </div>
  </div>
</div>

<style>
  .contact-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .hero-section {
    text-align: center;
    padding: 4rem 0;
    background: linear-gradient(135deg, #6356FF 0%, #8B5CF6 100%);
    border-radius: 1rem;
    color: white;
    margin-bottom: 3rem;
  }

  .subtitle {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  .header-accent {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .line {
    width: 60px;
    height: 2px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 1px;
  }

  .contact-content {
    background: white;
    border-radius: 1rem;
    padding: 3rem;
    box-shadow: 0 4px 12px rgba(99, 86, 255, 0.1);
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }

  .contact-info h2 {
    color: #6356FF;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .contact-info > p {
    color: #4B5563;
    font-size: 1.125rem;
    margin-bottom: 3rem;
  }

  .info-cards {
    display: grid;
    gap: 1.5rem;
  }

  .info-card {
    padding: 1.5rem;
    border: 1px solid rgba(99, 86, 255, 0.1);
    border-radius: 1rem;
    transition: all 0.3s ease;
  }

  .info-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(99, 86, 255, 0.1);
    border-color: #6356FF;
  }

  .icon {
    width: 2.5rem;
    height: 2.5rem;
    color: #6356FF;
    margin-bottom: 1rem;
  }

  .info-card h3 {
    color: #1F2937;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .info-card p {
    color: #6B7280;
    line-height: 1.5;
  }

  .contact-form {
    display: grid;
    gap: 1.5rem;
  }

  .form-group {
    display: grid;
    gap: 0.5rem;
  }

  label {
    color: #4B5563;
    font-size: 0.875rem;
    font-weight: 500;
  }

  input, textarea {
    padding: 0.75rem 1rem;
    border: 1px solid #E5E7EB;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #6356FF;
    box-shadow: 0 0 0 3px rgba(99, 86, 255, 0.1);
  }

  button {
    background: #6356FF;
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover {
    background: #5244E3;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .contact-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .contact-content {
      padding: 2rem 1rem;
    }

    .contact-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .info-cards {
      margin-bottom: 2rem;
    }
  }
</style> 