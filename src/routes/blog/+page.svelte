<script lang="ts">
  interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    date: string;
    author: {
      name: string;
      role: string;
    };
  }

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'How to Write a Winning Resume in 2024',
      excerpt: 'Learn the latest trends and best practices for creating a resume that stands out to employers and beats ATS systems.',
      category: 'Career Tips',
      readTime: '5 min read',
      date: 'Mar 15, 2024',
      author: {
        name: 'Sarah Johnson',
        role: 'Career Coach'
      }
    },
    {
      id: '2',
      title: 'Top 10 Interview Questions and How to Answer Them',
      excerpt: 'Master the most common interview questions and learn how to craft compelling answers that showcase your value.',
      category: 'Interviews',
      readTime: '7 min read',
      date: 'Mar 12, 2024',
      author: {
        name: 'Michael Chen',
        role: 'HR Specialist'
      }
    },
    {
      id: '3',
      title: 'The Future of Remote Work: Trends and Opportunities',
      excerpt: 'Discover emerging trends in remote work and how to position yourself for success in the digital workplace.',
      category: 'Work Trends',
      readTime: '6 min read',
      date: 'Mar 10, 2024',
      author: {
        name: 'Alex Rivera',
        role: 'Workplace Analyst'
      }
    }
  ];

  let selectedCategory: string = 'All';
  let searchQuery: string = '';

  $: filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...new Set(blogPosts.map(post => post.category))];
</script>

<div class="blog-container">
  <div class="blog-header">
    <h1>Career Insights & Tips</h1>
    <p>Expert advice to help you succeed in your career journey</p>
  </div>

  <div class="filters">
    <div class="search-bar">
      <input
        type="text"
        placeholder="Search articles..."
        bind:value={searchQuery}
        class="search-input"
      />
    </div>
    
    <div class="categories">
      {#each categories as category}
        <button
          class="category-btn"
          class:active={selectedCategory === category}
          on:click={() => selectedCategory = category}
        >
          {category}
        </button>
      {/each}
    </div>
  </div>

  <div class="blog-grid">
    {#each filteredPosts as post}
      <article class="blog-card">
        <div class="card-content">
          <div class="card-header">
            <span class="category">{post.category}</span>
            <span class="read-time">{post.readTime}</span>
          </div>
          
          <h2>{post.title}</h2>
          <p class="excerpt">{post.excerpt}</p>
          
          <div class="card-footer">
            <div class="author">
              <div class="author-info">
                <span class="author-name">{post.author.name}</span>
                <span class="author-role">{post.author.role}</span>
              </div>
            </div>
            <span class="date">{post.date}</span>
          </div>
        </div>
      </article>
    {/each}
  </div>
</div>

<style>
  .blog-container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .blog-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .blog-header h1 {
    font-size: 2.5rem;
    color: #6355FF;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .blog-header p {
    color: #6B7280;
    font-size: 1.1rem;
  }

  .filters {
    margin-bottom: 2rem;
  }

  .search-bar {
    margin-bottom: 1.5rem;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #6355FF;
    box-shadow: 0 0 0 3px rgba(99, 85, 255, 0.1);
  }

  .categories {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .category-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #E5E7EB;
    border-radius: 20px;
    background: white;
    color: #6B7280;
    cursor: pointer;
    transition: all 0.2s;
  }

  .category-btn:hover {
    border-color: #6355FF;
    color: #6355FF;
  }

  .category-btn.active {
    background: #6355FF;
    color: white;
    border-color: #6355FF;
  }

  .blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  .blog-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
  }

  .blog-card:hover {
    transform: translateY(-4px);
  }

  .card-content {
    padding: 1.5rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .category {
    color: #6355FF;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .read-time {
    color: #6B7280;
    font-size: 0.875rem;
  }

  .blog-card h2 {
    font-size: 1.25rem;
    color: #111827;
    margin-bottom: 0.75rem;
    font-weight: 600;
    line-height: 1.4;
  }

  .excerpt {
    color: #6B7280;
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
  }

  .author {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .author-info {
    display: flex;
    flex-direction: column;
  }

  .author-name {
    color: #111827;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .author-role {
    color: #6B7280;
    font-size: 0.75rem;
  }

  .date {
    color: #6B7280;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .blog-header h1 {
      font-size: 2rem;
    }

    .blog-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 