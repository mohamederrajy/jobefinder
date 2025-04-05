<script lang="ts">
  const lastUpdated = "March 20, 2024";
</script>

<div class="privacy-container">
  <div class="hero-section">
    <span class="subtitle">Our Commitment</span>
    <h1>Privacy Policy</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
      <span class="line"></span>
    </div>
  </div>

  <div class="privacy-content">
    <div class="last-updated">
      Last Updated: {lastUpdated}
    </div>

    <section class="policy-section">
      <h2>Introduction</h2>
      <p>At Visavar, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job search platform.</p>
    </section>

    <section class="policy-section">
      <h2>Information We Collect</h2>
      <div class="info-grid">
        <div class="info-card">
          <h3>Personal Information</h3>
          <ul>
            <li>Name and contact details</li>
            <li>Professional experience</li>
            <li>Educational background</li>
            <li>Employment preferences</li>
          </ul>
        </div>

        <div class="info-card">
          <h3>Usage Data</h3>
          <ul>
            <li>Browser type and version</li>
            <li>Time spent on platform</li>
            <li>Pages visited</li>
            <li>Interaction patterns</li>
          </ul>
        </div>

        <div class="info-card">
          <h3>Communication Data</h3>
          <ul>
            <li>Email correspondence</li>
            <li>Chat messages</li>
            <li>Support tickets</li>
            <li>Feedback submissions</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="policy-section">
      <h2>How We Use Your Information</h2>
      <ul class="usage-list">
        <li>To provide and maintain our job search services</li>
        <li>To match you with relevant job opportunities</li>
        <li>To communicate with you about platform updates</li>
        <li>To improve our services and user experience</li>
        <li>To protect against fraudulent or illegal activity</li>
        <li>To comply with legal obligations</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>Your Rights</h2>
      <p>You have the right to:</p>
      <ul class="rights-list">
        <li>Access your personal data</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of your data</li>
        <li>Withdraw consent at any time</li>
        <li>Object to data processing</li>
        <li>Request data portability</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at:</p>
      <div class="contact-info">
        <p>Email: privacy@visavar.com</p>
        <p>Address: 123 Business District, New York, NY 10001</p>
      </div>
    </section>
  </div>
</div>

<style>
  .privacy-container {
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

  .privacy-content {
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

  .policy-section {
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

  .usage-list li, .rights-list li {
    color: #4B5563;
    margin-bottom: 0.75rem;
    padding-left: 1.5rem;
    position: relative;
  }

  .usage-list li::before, .rights-list li::before {
    content: "•";
    color: #6356FF;
    position: absolute;
    left: 0;
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
    .privacy-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .privacy-content {
      padding: 2rem 1rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 