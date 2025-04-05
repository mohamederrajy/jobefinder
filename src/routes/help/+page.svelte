<script lang="ts">
  const faqCategories = [
    {
      title: "Getting Started",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>`,
      questions: [
        {
          q: "How do I create an account?",
          a: "Click the 'Sign Up' button, fill in your details, and follow the verification process to create your account."
        },
        {
          q: "How do I complete my profile?",
          a: "Navigate to your profile settings, fill in your professional information, upload a photo, and add your work experience."
        }
      ]
    },
    {
      title: "Job Search",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>`,
      questions: [
        {
          q: "How do I search for jobs?",
          a: "Use the search bar to enter keywords, location, or job titles. You can also use filters to refine your search."
        },
        {
          q: "How do I save a job?",
          a: "Click the bookmark icon on any job listing to save it to your favorites for later viewing."
        }
      ]
    },
    {
      title: "Applications",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>`,
      questions: [
        {
          q: "How do I apply for a job?",
          a: "Click the 'Apply Now' button on the job listing, review your profile information, and submit your application."
        },
        {
          q: "How do I track my applications?",
          a: "Visit your dashboard to see all your submitted applications and their current status."
        }
      ]
    }
  ];

  let searchQuery = '';
  let selectedCategory = null;

  $: filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);
</script>

<div class="help-container">
  <div class="hero-section">
    <span class="subtitle">Support & Resources</span>
    <h1>Help Center</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
      </svg>
      <span class="line"></span>
    </div>
    
    <div class="search-box">
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Search for help..."
      />
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>

  <div class="help-content">
    {#if filteredCategories.length === 0}
      <div class="no-results">
        <p>No results found for "{searchQuery}"</p>
        <button on:click={() => searchQuery = ''}>Clear Search</button>
      </div>
    {:else}
      {#each filteredCategories as category}
        <section class="faq-section">
          <div class="category-header">
            <div class="icon">
              {@html category.icon}
            </div>
            <h2>{category.title}</h2>
          </div>

          <div class="questions-grid">
            {#each category.questions as qa}
              <div class="qa-card">
                <h3>{qa.q}</h3>
                <p>{qa.a}</p>
              </div>
            {/each}
          </div>
        </section>
      {/each}
    {/if}

    <section class="contact-support">
      <h2>Still Need Help?</h2>
      <p>Our support team is here to assist you</p>
      <div class="support-options">
        <a href="/contact" class="support-card">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <span>Contact Support</span>
        </a>
        <a href="mailto:support@visavar.com" class="support-card">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
          </svg>
          <span>Email Us</span>
        </a>
      </div>
    </section>
  </div>
</div>

<style>
  .help-container {
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
    margin-bottom: 2rem;
  }

  .line {
    width: 60px;
    height: 2px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 1px;
  }

  .search-box {
    max-width: 600px;
    margin: 0 auto;
    position: relative;
  }

  .search-box input {
    width: 100%;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    backdrop-filter: blur(10px);
  }

  .search-box input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .search-box svg {
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.6);
  }

  .help-content {
    background: white;
    border-radius: 1rem;
    padding: 3rem;
    box-shadow: 0 4px 12px rgba(99, 86, 255, 0.1);
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .icon {
    width: 2.5rem;
    height: 2.5rem;
    color: #6356FF;
  }

  h2 {
    color: #1F2937;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .questions-grid {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .qa-card {
    padding: 1.5rem;
    border: 1px solid rgba(99, 86, 255, 0.1);
    border-radius: 1rem;
    transition: all 0.3s ease;
  }

  .qa-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(99, 86, 255, 0.1);
    border-color: #6356FF;
  }

  .qa-card h3 {
    color: #1F2937;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .qa-card p {
    color: #6B7280;
    line-height: 1.6;
  }

  .contact-support {
    text-align: center;
    margin-top: 4rem;
    padding-top: 3rem;
    border-top: 1px solid #E5E7EB;
  }

  .contact-support h2 {
    color: #1F2937;
    margin-bottom: 0.5rem;
  }

  .contact-support p {
    color: #6B7280;
    margin-bottom: 2rem;
  }

  .support-options {
    display: flex;
    justify-content: center;
    gap: 2rem;
  }

  .support-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: #F9FAFB;
    border-radius: 0.75rem;
    color: #1F2937;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .support-card:hover {
    background: #F3F4F6;
    transform: translateY(-2px);
  }

  .no-results {
    text-align: center;
    padding: 3rem;
  }

  .no-results p {
    color: #6B7280;
    margin-bottom: 1rem;
  }

  .no-results button {
    background: #6356FF;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .no-results button:hover {
    background: #5244E3;
  }

  @media (max-width: 768px) {
    .help-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .help-content {
      padding: 2rem 1rem;
    }

    .support-options {
      flex-direction: column;
      gap: 1rem;
    }

    .support-card {
      justify-content: center;
    }
  }
</style> 