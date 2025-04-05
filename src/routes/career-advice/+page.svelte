<script lang="ts">
  interface Article {
    id: string;
    title: string;
    category: string;
    icon: string;
    summary: string;
    readTime: number;
    date: string;
  }

  const articles: Article[] = [
    {
      id: '1',
      title: 'How to Write a Winning Resume in 2024',
      category: 'Resume Tips',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>`,
      summary: 'Learn the latest trends in resume writing and how to make your application stand out to recruiters.',
      readTime: 8,
      date: 'Mar 15, 2024'
    },
    {
      id: '2',
      title: 'Mastering the Remote Job Interview',
      category: 'Interview Prep',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>`,
      summary: 'Essential tips for succeeding in virtual interviews and making a great impression online.',
      readTime: 10,
      date: 'Mar 12, 2024'
    },
    {
      id: '3',
      title: 'Negotiating Your Salary: A Complete Guide',
      category: 'Career Growth',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,
      summary: 'Expert strategies for negotiating your salary and benefits package with confidence.',
      readTime: 12,
      date: 'Mar 10, 2024'
    }
  ];

  const categories = [
    'Resume Tips',
    'Interview Prep',
    'Career Growth',
    'Job Search',
    'Workplace Success',
    'Industry Insights'
  ];

  let selectedCategory = '';
  let searchQuery = '';

  $: filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
</script>

<div class="career-advice-container">
  <div class="hero-section">
    <span class="subtitle">Career Resources</span>
    <h1>Career Advice</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <span class="line"></span>
    </div>
    <p class="hero-description">
      Expert insights and guidance for every stage of your career journey
    </p>
  </div>

  <div class="content-section">
    <aside class="sidebar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
        </svg>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search articles..."
        />
      </div>

      <div class="categories">
        <h2>Categories</h2>
        <ul>
          <li>
            <button
              class:active={selectedCategory === ''}
              on:click={() => selectedCategory = ''}
            >
              All Topics
            </button>
          </li>
          {#each categories as category}
            <li>
              <button
                class:active={selectedCategory === category}
                on:click={() => selectedCategory = category}
              >
                {category}
              </button>
            </li>
          {/each}
        </ul>
      </div>

      <div class="newsletter-box">
        <h3>Stay Updated</h3>
        <p>Get the latest career advice delivered to your inbox</p>
        <input type="email" placeholder="Your email address" />
        <button class="subscribe-btn">Subscribe</button>
      </div>
    </aside>

    <main class="articles-section">
      {#if filteredArticles.length === 0}
        <div class="no-results">
          <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No articles found matching your criteria</p>
          <button class="reset-btn" on:click={() => {
            searchQuery = '';
            selectedCategory = '';
          }}>Reset Filters</button>
        </div>
      {:else}
        <div class="articles-grid">
          {#each filteredArticles as article}
            <article class="article-card">
              <div class="article-icon">
                {@html article.icon}
              </div>
              <div class="article-content">
                <span class="category-tag">{article.category}</span>
                <h2>{article.title}</h2>
                <p>{article.summary}</p>
                <div class="article-meta">
                  <span class="date">{article.date}</span>
                  <span class="read-time">{article.readTime} min read</span>
                </div>
                <button class="read-more-btn">Read More</button>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  .career-advice-container {
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

  .content-section {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
  }

  .sidebar {
    position: sticky;
    top: 2rem;
    height: fit-content;
  }

  .search-box {
    position: relative;
    margin-bottom: 2rem;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
    height: 1.25rem;
    color: #6B7280;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    padding-left: 2.75rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #6356FF;
    box-shadow: 0 0 0 3px rgba(99, 86, 255, 0.1);
  }

  .categories {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid #E5E7EB;
    margin-bottom: 2rem;
  }

  .categories h2 {
    font-size: 1.25rem;
    color: #1F2937;
    margin-bottom: 1rem;
  }

  .categories ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .categories button {
    width: 100%;
    text-align: left;
    padding: 0.75rem;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    color: #4B5563;
    cursor: pointer;
    transition: all 0.2s;
  }

  .categories button:hover {
    background: #F3F4F6;
  }

  .categories button.active {
    background: #6356FF;
    color: white;
  }

  .newsletter-box {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid #E5E7EB;
  }

  .newsletter-box h3 {
    font-size: 1.125rem;
    color: #1F2937;
    margin-bottom: 0.5rem;
  }

  .newsletter-box p {
    color: #6B7280;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .subscribe-btn {
    width: 100%;
    padding: 0.75rem;
    background: #6356FF;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 1rem;
  }

  .subscribe-btn:hover {
    background: #5244E3;
  }

  .articles-grid {
    display: grid;
    gap: 2rem;
  }

  .article-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid #E5E7EB;
    transition: all 0.3s ease;
    display: flex;
    gap: 2rem;
  }

  .article-icon {
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(99, 86, 255, 0.1);
    border-radius: 1rem;
    color: #6356FF;
  }

  .article-icon svg {
    width: 32px;
    height: 32px;
  }

  .article-content {
    flex: 1;
  }

  .category-tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #F3F4F6;
    color: #6356FF;
    border-radius: 1rem;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .article-content h2 {
    font-size: 1.5rem;
    color: #1F2937;
    margin-bottom: 0.75rem;
  }

  .article-content p {
    color: #6B7280;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .article-meta {
    display: flex;
    justify-content: space-between;
    color: #6B7280;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .read-more-btn {
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    color: #6356FF;
    border: 2px solid #6356FF;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .read-more-btn:hover {
    background: rgba(99, 86, 255, 0.1);
  }

  .no-results {
    text-align: center;
    padding: 4rem 0;
    color: #6B7280;
  }

  .no-results-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
  }

  .reset-btn {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: #6356FF;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: #5244E3;
  }

  @media (max-width: 1024px) {
    .content-section {
      grid-template-columns: 1fr;
    }

    .sidebar {
      position: static;
      margin-bottom: 2rem;
    }
  }

  @media (max-width: 768px) {
    .career-advice-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .article-card {
      margin-bottom: 1.5rem;
    }
  }
</style> 