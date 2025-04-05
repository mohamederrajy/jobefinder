<script lang="ts">
  const solutions = [
    {
      title: "Smart Recruiting",
      description: "AI-powered talent matching and automated screening",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>`,
      features: [
        "AI-powered candidate matching",
        "Automated resume screening",
        "Smart skill assessment",
        "Predictive analytics"
      ]
    },
    {
      title: "Employer Branding",
      description: "Build your employer brand and attract top talent",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>`,
      features: [
        "Customized company profiles",
        "Employer brand storytelling",
        "Social media integration",
        "Recruitment marketing tools"
      ]
    },
    {
      title: "Advanced Analytics",
      description: "Data-driven insights for better hiring decisions",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>`,
      features: [
        "Recruitment metrics dashboard",
        "Performance tracking",
        "Market insights",
        "ROI reporting"
      ]
    }
  ];

  const testimonials = [
    {
      quote: "The AI-powered matching has revolutionized our hiring process. We've reduced time-to-hire by 50%.",
      author: "Sarah Johnson",
      position: "HR Director",
      company: "Tech Solutions Inc."
    },
    {
      quote: "The employer branding tools helped us showcase our company culture and attract better candidates.",
      author: "Michael Chen",
      position: "Talent Acquisition Manager",
      company: "Global Innovations"
    }
  ];
</script>

<div class="talent-solutions-container">
  <div class="hero-section">
    <span class="subtitle">For Employers</span>
    <h1>Talent Solutions</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      <span class="line"></span>
    </div>
    <p class="hero-description">
      Transform your recruitment process with our innovative solutions
    </p>
    <div class="cta-buttons">
      <button class="primary-btn">Schedule Demo</button>
      <button class="secondary-btn">Contact Sales</button>
    </div>
  </div>

  <div class="solutions-grid">
    {#each solutions as solution}
      <div class="solution-card">
        <div class="icon">
          {@html solution.icon}
        </div>
        <h2>{solution.title}</h2>
        <p class="description">{solution.description}</p>
        <ul class="features-list">
          {#each solution.features as feature}
            <li>
              <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              {feature}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>

  <div class="testimonials-section">
    <h2>What Our Clients Say</h2>
    <div class="testimonials-grid">
      {#each testimonials as testimonial}
        <div class="testimonial-card">
          <svg class="quote-icon" viewBox="0 0 24 24" width="48" height="48">
            <path fill="#6356FF" d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
          </svg>
          <p class="quote">{testimonial.quote}</p>
          <div class="author-info">
            <strong>{testimonial.author}</strong>
            <span>{testimonial.position}</span>
            <span>{testimonial.company}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="contact-section">
    <div class="contact-content">
      <h2>Ready to Transform Your Hiring?</h2>
      <p>Get in touch with our team to learn how we can help you find the best talent.</p>
      <button class="primary-btn">Get Started</button>
    </div>
  </div>
</div>

<style>
  .talent-solutions-container {
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
    margin: 0 auto 2rem;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .primary-btn {
    background: #6356FF;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .primary-btn:hover {
    background: #5244E3;
  }

  .secondary-btn {
    background: transparent;
    color: #6356FF;
    border: 2px solid #6356FF;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .secondary-btn:hover {
    background: rgba(99, 86, 255, 0.1);
  }

  .solutions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .solution-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid #E5E7EB;
    transition: all 0.3s ease;
  }

  .solution-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(99, 86, 255, 0.1);
  }

  .icon {
    width: 3rem;
    height: 3rem;
    color: #6356FF;
    margin-bottom: 1.5rem;
  }

  .solution-card h2 {
    font-size: 1.5rem;
    color: #1F2937;
    margin-bottom: 0.75rem;
  }

  .description {
    color: #6B7280;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .features-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .features-list li {
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

  .testimonials-section {
    margin-bottom: 4rem;
  }

  .testimonials-section h2 {
    text-align: center;
    font-size: 2rem;
    color: #1F2937;
    margin-bottom: 2rem;
  }

  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .testimonial-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid #E5E7EB;
    position: relative;
  }

  .quote-icon {
    position: absolute;
    top: -24px;
    left: 24px;
    background: white;
    border-radius: 50%;
    padding: 0.5rem;
  }

  .quote {
    color: #4B5563;
    font-size: 1.125rem;
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }

  .author-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .author-info strong {
    color: #1F2937;
  }

  .author-info span {
    color: #6B7280;
    font-size: 0.875rem;
  }

  .contact-section {
    background: linear-gradient(135deg, #6356FF 0%, #8B5CF6 100%);
    border-radius: 1rem;
    padding: 4rem 2rem;
    text-align: center;
    color: white;
  }

  .contact-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .contact-content h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .contact-content p {
    margin-bottom: 2rem;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .talent-solutions-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .cta-buttons {
      flex-direction: column;
    }

    .primary-btn,
    .secondary-btn {
      width: 100%;
    }
  }
</style> 