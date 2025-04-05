<script lang="ts">
  const resources = [
    {
      category: "Job Search Tips",
      items: [
        {
          title: "Resume Writing Guide",
          description: "Learn how to create a professional resume that stands out",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>`
        },
        {
          title: "Interview Preparation",
          description: "Essential tips and common questions for job interviews",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>`
        }
      ]
    },
    {
      category: "Career Development",
      items: [
        {
          title: "Skill Assessment Tools",
          description: "Evaluate and improve your professional skills",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>`
        },
        {
          title: "Career Path Planning",
          description: "Map out your professional journey and set goals",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>`
        }
      ]
    },
    {
      category: "Industry Insights",
      items: [
        {
          title: "Market Trends",
          description: "Stay updated with the latest industry developments",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>`
        },
        {
          title: "Salary Guide",
          description: "Compare salaries and benefits across industries",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`
        }
      ]
    }
  ];
</script>

<div class="resources-container">
  <div class="hero-section">
    <span class="subtitle">Knowledge Hub</span>
    <h1>Career Resources</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <span class="line"></span>
    </div>
    <p class="hero-description">
      Explore our comprehensive collection of career development resources
    </p>
  </div>

  <div class="resources-grid">
    {#each resources as category}
      <div class="category-section">
        <h2>{category.category}</h2>
        <div class="resources-cards">
          {#each category.items as item}
            <div class="resource-card">
              <div class="icon">
                {@html item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button class="view-resource">Learn More</button>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="newsletter-section">
    <div class="newsletter-content">
      <h2>Stay Updated</h2>
      <p>Subscribe to our newsletter for the latest career insights and resources</p>
      <div class="newsletter-form">
        <input type="email" placeholder="Enter your email" />
        <button class="subscribe-btn">Subscribe</button>
      </div>
    </div>
  </div>
</div>

<style>
  .resources-container {
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

  .resources-grid {
    display: grid;
    gap: 4rem;
    margin-bottom: 4rem;
  }

  .category-section h2 {
    font-size: 1.875rem;
    color: #1F2937;
    margin-bottom: 2rem;
  }

  .resources-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .resource-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid #E5E7EB;
    transition: all 0.3s ease;
  }

  .resource-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(99, 86, 255, 0.1);
  }

  .icon {
    width: 3rem;
    height: 3rem;
    color: #6356FF;
    margin-bottom: 1.5rem;
  }

  .resource-card h3 {
    font-size: 1.25rem;
    color: #1F2937;
    margin-bottom: 0.75rem;
  }

  .resource-card p {
    color: #6B7280;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .view-resource {
    background: transparent;
    color: #6356FF;
    border: 2px solid #6356FF;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-resource:hover {
    background: rgba(99, 86, 255, 0.1);
  }

  .newsletter-section {
    background: linear-gradient(135deg, #6356FF 0%, #8B5CF6 100%);
    border-radius: 1rem;
    padding: 4rem 2rem;
    text-align: center;
    color: white;
  }

  .newsletter-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .newsletter-content h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .newsletter-content p {
    margin-bottom: 2rem;
    opacity: 0.9;
  }

  .newsletter-form {
    display: flex;
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .newsletter-form input {
    flex: 1;
    padding: 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
  }

  .subscribe-btn {
    background: white;
    color: #6356FF;
    border: none;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .subscribe-btn:hover {
    background: #F3F4F6;
  }

  @media (max-width: 768px) {
    .resources-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .newsletter-form {
      flex-direction: column;
    }

    .subscribe-btn {
      width: 100%;
    }
  }
</style> 