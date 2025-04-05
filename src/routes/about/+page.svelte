<script lang="ts">
  const features = [
    {
      title: "Job Matching",
      description: "Advanced AI-powered matching system to connect you with the perfect job opportunities.",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>`
    },
    {
      title: "Career Growth",
      description: "Resources and tools to help you develop your career and achieve your professional goals.",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>`
    },
    {
      title: "Global Reach",
      description: "Connect with employers and opportunities from around the world.",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
    }
  ];
</script>

<div class="about-container">
  <div class="hero-section">
    <h1>About Visavar</h1>
    <p class="mission">Empowering careers, connecting opportunities, and building futures.</p>
  </div>

  <div class="about-content">
    <div class="vision-section">
      <h2>Our Vision</h2>
      <p>At Visavar, we believe everyone deserves the opportunity to find meaningful work that aligns with their skills, passions, and aspirations. Our platform is designed to bridge the gap between talented individuals and their dream careers.</p>
    </div>

    <div class="features-grid">
      {#each features as feature}
        <div class="feature-card">
          <div class="icon">
            {@html feature.icon}
          </div>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      {/each}
    </div>

    <div class="stats-section">
      <div class="stat-item">
        <span class="number">1M+</span>
        <span class="label">Active Users</span>
      </div>
      <div class="stat-item">
        <span class="number">50K+</span>
        <span class="label">Companies</span>
      </div>
      <div class="stat-item">
        <span class="number">100K+</span>
        <span class="label">Jobs Posted</span>
      </div>
    </div>
  </div>
</div>

<style>
  .about-container {
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

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  .mission {
    font-size: 1.25rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }

  .about-content {
    background: white;
    border-radius: 1rem;
    padding: 3rem;
    box-shadow: 0 4px 12px rgba(99, 86, 255, 0.1);
  }

  .vision-section {
    max-width: 800px;
    margin: 0 auto 4rem;
    text-align: center;
  }

  h2 {
    color: #6356FF;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
  }

  .vision-section p {
    color: #4B5563;
    font-size: 1.125rem;
    line-height: 1.7;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .feature-card {
    padding: 2rem;
    border: 1px solid rgba(99, 86, 255, 0.1);
    border-radius: 1rem;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(99, 86, 255, 0.1);
    border-color: #6356FF;
  }

  .icon {
    width: 3rem;
    height: 3rem;
    color: #6356FF;
    margin-bottom: 1.5rem;
  }

  .feature-card h3 {
    color: #1F2937;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .feature-card p {
    color: #6B7280;
    line-height: 1.6;
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(99, 86, 255, 0.1);
  }

  .stat-item .number {
    display: block;
    color: #6356FF;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .stat-item .label {
    color: #4B5563;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    .about-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .about-content {
      padding: 2rem 1rem;
    }

    .stats-section {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .stat-item {
      padding: 1rem;
    }
  }
</style> 