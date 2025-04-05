<script lang="ts">
  const lastUpdated = "March 20, 2024";
</script>

<div class="terms-container">
  <div class="hero-section">
    <span class="subtitle">Platform Guidelines</span>
    <h1>Terms of Use</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z"/>
      </svg>
      <span class="line"></span>
    </div>
  </div>

  <div class="terms-content">
    <div class="last-updated">
      Last Updated: {lastUpdated}
    </div>

    <section class="terms-section">
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using Visavar's platform, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.</p>
    </section>

    <section class="terms-section">
      <h2>2. User Responsibilities</h2>
      <div class="info-grid">
        <div class="info-card">
          <h3>Account Security</h3>
          <ul>
            <li>Maintain confidentiality of credentials</li>
            <li>Report unauthorized access</li>
            <li>Regular password updates</li>
            <li>Secure logout after sessions</li>
          </ul>
        </div>

        <div class="info-card">
          <h3>Content Guidelines</h3>
          <ul>
            <li>Accurate profile information</li>
            <li>Professional communication</li>
            <li>Respect intellectual property</li>
            <li>No misleading information</li>
          </ul>
        </div>

        <div class="info-card">
          <h3>Platform Usage</h3>
          <ul>
            <li>No harmful activities</li>
            <li>Respect other users</li>
            <li>Follow job posting rules</li>
            <li>Maintain professionalism</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="terms-section">
      <h2>3. Service Rules</h2>
      <ul class="rules-list">
        <li>Users must be at least 18 years old</li>
        <li>One account per individual or company</li>
        <li>No unauthorized automated access</li>
        <li>No interference with platform functionality</li>
        <li>Respect intellectual property rights</li>
        <li>Maintain accurate and current information</li>
      </ul>
    </section>

    <section class="terms-section">
      <h2>4. Intellectual Property</h2>
      <p>All content on Visavar, including but not limited to text, graphics, logos, and software, is the property of Visavar and protected by applicable laws.</p>
    </section>

    <section class="terms-section">
      <h2>5. Termination</h2>
      <p>Visavar reserves the right to terminate or suspend access to our services, without prior notice or liability, for any reason whatsoever.</p>
    </section>

    <section class="terms-section">
      <h2>6. Contact Information</h2>
      <p>For any questions about these Terms of Use, please contact us at:</p>
      <div class="contact-info">
        <p>Email: legal@visavar.com</p>
        <p>Address: 123 Business District, New York, NY 10001</p>
      </div>
    </section>
  </div>
</div>

<style>
  .terms-container {
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

  .terms-content {
    background: white;
    border-radius: 1rem;
    padding: 3rem;
    box-shadow: 0 4px 12px rgba(99, 86, 255, 0.1);
  }

  .last-updated {
    color: #6B7280;
    font-size: 0.875rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #E5E7EB;
  }

  .terms-section {
    margin-bottom: 3rem;
  }

  h2 {
    color: #6356FF;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
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

  h3 {
    color: #1F2937;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .rules-list li {
    color: #4B5563;
    margin-bottom: 0.75rem;
    padding-left: 1.5rem;
    position: relative;
  }

  .rules-list li::before {
    content: "•";
    color: #6356FF;
    position: absolute;
    left: 0;
  }

  .info-card ul li {
    color: #4B5563;
    margin-bottom: 0.5rem;
    padding-left: 1.25rem;
    position: relative;
  }

  .info-card ul li::before {
    content: "→";
    color: #6356FF;
    position: absolute;
    left: 0;
  }

  p {
    color: #4B5563;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .contact-info {
    background: #F9FAFB;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-top: 1rem;
  }

  .contact-info p {
    color: #4B5563;
    margin: 0.5rem 0;
  }

  @media (max-width: 768px) {
    .terms-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .terms-content {
      padding: 2rem 1rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 