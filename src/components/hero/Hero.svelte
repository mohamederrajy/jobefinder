<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  
  const dispatch = createEventDispatcher<{
    search: { query: string; location: string };
  }>();
  
  let searchQuery = '';
  let location = '';
  
  // Watch for changes in search inputs and dispatch search event
  $: {
    // Dispatch search event whenever inputs change
    dispatch('search', {
      query: searchQuery,
      location: location
    });
  }
  
  function handleSearch() {
    // Dispatch search event to parent component
    dispatch('search', {
      query: searchQuery,
      location: location
    });
  }
  
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
  
  // Clear individual search fields
  function clearSearchQuery() {
    searchQuery = "";
  }
  
  function clearSearchLocation() {
    location = "";
  }
</script>

<div class="hero">
  <div class="hero-content">
    <div class="hero-text">
      <h1>Find work you'll love, fast.</h1>
      <p class="hero-subtitle">Discover your next career move with personalized job matches</p>
    </div>
    
    <div class="search-container">
      <div class="search-input">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#666" d="M12.7 13.4c-.9.9-2.2 1.5-3.6 1.5-2.8 0-5.1-2.3-5.1-5.1s2.3-5.1 5.1-5.1 5.1 2.3 5.1 5.1c0 1.4-.6 2.7-1.5 3.6l4.2 4.2c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0l-4.2-4.2zm-3.6.1c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4z"/>
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="Job title, keyword, or company"
          bind:value={searchQuery}
          on:keypress={handleKeyPress}
        >
        {#if searchQuery}
          <button class="clear-search" on:click={clearSearchQuery}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        {/if}
      </div>
      
      <div class="location-input">
        <span class="location-icon">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#666" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="City or zip code"
          bind:value={location}
          on:keypress={handleKeyPress}
        >
        {#if location}
          <button class="clear-search" on:click={clearSearchLocation}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        {/if}
      </div>

      <button class="search-button" on:click={handleSearch}>
        Search Jobs
      </button>
    </div>

    <div class="search-tags">
      <div class="popular-label">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
        <span>Popular searches</span>
      </div>
      <div class="tags-container">
        <a href="/jobs/remote" class="tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Remote
        </a>
        <a href="/jobs/part-time" class="tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 6V12L16 14M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Part-time
        </a>
        <a href="/jobs/full-time" class="tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Full-time
        </a>
        <a href="/jobs/entry-level" class="tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 19.5C4 18.6716 4.67157 18 5.5 18H18.5C19.3284 18 20 18.6716 20 19.5C20 20.3284 19.3284 21 18.5 21H5.5C4.67157 21 4 20.3284 4 19.5Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 3L20 14H4L12 3Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Entry Level
        </a>
      </div>
    </div>
  </div>

  <div class="experience-wrapper">
    <div class="experience-section">
      <div class="experience-content">
        <h2>Experience the new way to work</h2>
        <p>See jobs we've picked just for you</p>
      </div>
      <a href="/get-started" class="get-started-button">Get started</a>
    </div>
  </div>
</div>

<style>
  .hero {
    background: linear-gradient(
      to bottom,
      rgba(25, 25, 40, 0.8),
      rgba(25, 25, 40, 0.9)
    ), url('/images/herosec.jpg');
    background-size: cover;
    background-position: center;
    min-height: 85vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    margin-bottom: 6rem;
  }

  .hero-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 8rem 2rem 0;
    width: 100%;
  }

  .hero-text {
    text-align: center;
    margin-bottom: 3.5rem;
  }

  h1 {
    font-size: 4.5rem;
    font-weight: 600;
    color: white;
    margin-bottom: 1.5rem;
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-family: serif;
  }

  .hero-subtitle {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2rem;
    font-family: serif;
  }

  .search-container {
    background: white;
    padding: 0.75rem;
    border-radius: 50px;
    display: grid;
    grid-template-columns: 1.5fr 1fr auto;
    gap: 0.75rem;
    max-width: 900px;
    margin: 0 auto;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  }

  .search-input, 
  .location-input {
    position: relative;
  }

  input {
    width: 100%;
    padding: 1.25rem 1.5rem 1.25rem 3.5rem;
    border: 2px solid transparent;
    border-radius: 50px;
    font-size: 1.1rem;
    transition: all 0.3s;
    background: #f8f9fa;
    font-family: serif;
  }

  input:focus {
    border-color: #6355FF;
    background: white;
    box-shadow: 0 0 0 4px rgba(99, 85, 255, 0.1);
    outline: none;
  }

  .search-icon,
  .location-icon {
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .search-button {
    background: #6355FF;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 0 3rem;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    font-family: serif;
  }

  .search-button:hover {
    background: #5346E0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .search-tags {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 4rem;
    gap: 1rem;
  }

  .popular-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 500;
    font-family: serif;
  }

  .popular-label svg {
    opacity: 0.9;
  }

  .tags-container {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    text-decoration: none;
    padding: 0.6rem 1.25rem;
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    font-family: serif;
  }

  .tag:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .tag svg {
    opacity: 0.9;
  }

  .experience-wrapper {
    background: rgba(99, 85, 255, 0.97);
    padding: 2.5rem;
    margin-top: auto;
    backdrop-filter: blur(10px);
    margin-bottom: -6rem;
  }

  .experience-section {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h2 {
    font-size: 2.5rem;
    color: white;
    font-weight: 600;
    margin-bottom: 0.75rem;
    font-family: serif;
  }

  .experience-content p {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    font-family: serif;
  }

  .get-started-button {
    background: white;
    color: #6355FF;
    padding: 1.25rem 3rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    font-family: serif;
  }

  .get-started-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    .hero {
      margin-bottom: 4rem;
    }

    .hero-content {
      padding: 4rem 1rem 0;
    }

    h1 {
      font-size: 2.75rem;
    }

    .hero-subtitle {
      font-size: 1.25rem;
    }

    .search-container {
      grid-template-columns: 1fr;
      border-radius: 16px;
      padding: 1rem;
    }

    input {
      padding: 1rem 1rem 1rem 3rem;
      font-size: 1rem;
    }

    .search-button {
      padding: 1rem;
    }

    .search-tags {
      margin-top: 1.5rem;
      margin-bottom: 3rem;
    }

    .tags-container {
      gap: 0.5rem;
      padding: 0 1rem;
    }

    .tag {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .experience-section {
      flex-direction: column;
      text-align: center;
      gap: 2rem;
    }

    h2 {
      font-size: 2.25rem;
    }

    .get-started-button {
      padding: 1rem 2.5rem;
      width: 100%;
      text-align: center;
    }

    .experience-wrapper {
      margin-bottom: -4rem;
    }
  }

  @media (max-width: 480px) {
    .hero {
      margin-bottom: 3rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .hero-subtitle {
      font-size: 1.1rem;
    }

    .popular-label {
      font-size: 0.9rem;
    }

    .tag {
      padding: 0.4rem 0.875rem;
      font-size: 0.85rem;
    }

    .tag svg {
      width: 12px;
      height: 12px;
    }

    .experience-wrapper {
      padding: 2rem 1.5rem;
      margin-bottom: -3rem;
    }

    .search-tags {
      margin-bottom: 2.5rem;
    }
  }

  .clear-search {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #9CA3AF;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .clear-search:hover {
    color: #6B7280;
  }
</style> 