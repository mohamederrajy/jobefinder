<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { user } from '../../stores/userStore';
  import { goto } from '$app/navigation';
  import type { SearchEvent } from '../../types/events';
  import { onMount } from 'svelte';
  
  const dispatch = createEventDispatcher<{
    search: SearchEvent;
  }>();
  
  export let searchQuery = "";
  export let searchLocation = "";
  let showDropdown = false;
  let mounted = false;
  let showMobileSearch = false;

  onMount(() => {
    mounted = true;
  });

  // Handle search input with immediate dispatch
  function handleSearch() {
    console.log('Dispatching search:', { searchQuery, searchLocation });
    dispatch('search', {
      query: searchQuery.trim(),
      location: searchLocation.trim()
    });
  }

  // Clear individual search fields
  function clearSearchQuery() {
    searchQuery = "";
    handleSearch();
  }
  
  function clearSearchLocation() {
    searchLocation = "";
    handleSearch();
  }

  async function handleLogout() {
    try {
      await user.logout();
      showDropdown = false;
      await goto('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (!mounted) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      showDropdown = false;
    }
  }

  // Handle click outside listener
  $: if (mounted) {
    if (showDropdown) {
      window.addEventListener('click', handleClickOutside);
    } else {
      window.removeEventListener('click', handleClickOutside);
    }
  }

  function toggleMobileSearch() {
    showMobileSearch = !showMobileSearch;
  }
</script>

<nav class="nav">
  <div class="nav-content">
    <a href="/" class="logo">
      <span class="logo-text">JobFinder</span>
    </a>

    <div class="search-bar">
      <div class="search-input-wrapper">
        <input 
          type="text" 
          placeholder="Search jobs by title or company"
          bind:value={searchQuery}
          on:input={handleSearch}
          class="search-input"
        />
        {#if searchQuery}
          <button class="clear-search" on:click={clearSearchQuery}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        {/if}
      </div>

      <div class="location-wrapper">
        <div class="location-icon">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#6355FF" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Enter ZIP code"
          bind:value={searchLocation}
          on:input={handleSearch}
          class="location-input"
        />
        {#if searchLocation}
          <button class="clear-search" on:click={clearSearchLocation}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        {/if}
      </div>
    </div>

    <div class="nav-actions">
      <button class="mobile-search-button" on:click={toggleMobileSearch}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </button>

      <button class="icon-button notification-button">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="#6355FF" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
        </svg>
      </button>

      <div class="dropdown-container">
        <button class="menu-button" on:click|stopPropagation={() => showDropdown = !showDropdown}>
          <div class="menu-button-content">
            <div class="user-avatar">
              {#if $user}
                {$user.email[0].toUpperCase()}
              {/if}
            </div>
            <svg 
              class="dropdown-arrow" 
              class:open={showDropdown}
              viewBox="0 0 24 24" 
              width="20" 
              height="20"
            >
              <path fill="currentColor" d="M12 15.375l-6-6 1.4-1.4 4.6 4.6 4.6-4.6 1.4 1.4z"/>
            </svg>
          </div>
        </button>

        {#if showDropdown}
          <div class="dropdown-menu" transition:fade={{ duration: 150 }}>
            {#if $user}
              <div class="user-section">
                <div class="user-avatar">
                  {$user.email[0].toUpperCase()}
                </div>
                <div class="account-info">
                  <h3>{$user.email}</h3>
                  <div class="profile-progress">
                    <div class="progress-bar">
                      <div class="progress" style="width: 14%"></div>
                    </div>
                    <a href="/profile" class="progress-text">14% of profile complete →</a>
                  </div>
                </div>
              </div>

              <div class="menu-section">
                <a href="/profile" class="menu-item">Profile</a>
                <a href="/dashboard" class="menu-item">Dashboard</a>
                <a href="/interviews" class="menu-item">Interviews</a>
                <a href="/applications" class="menu-item">Applications</a>
                <a href="/saved" class="menu-item">Saved jobs</a>
                <a href="/history" class="menu-item">History</a>
              </div>

              <div class="menu-section">
                <a href="/settings" class="menu-item">Settings & notifications</a>
                <a href="/security" class="menu-item">Password & security</a>
              </div>

              <div class="menu-section">
                <a href="/blog" class="menu-item">Blog</a>
                <a href="/contact" class="menu-item">Contact us</a>
              </div>

              <div class="menu-section">
                <button class="logout-button" on:click={handleLogout}>
                  Log out
                </button>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</nav>

{#if showMobileSearch}
  <div class="mobile-search-overlay" transition:fade={{ duration: 200 }}>
    <div class="mobile-search-header">
      <h2 class="mobile-search-title">Search Jobs</h2>
      <button class="mobile-search-close" on:click={toggleMobileSearch}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
    
    <div class="mobile-search-form">
      <div class="mobile-search-input-group">
        <span class="mobile-search-icon">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="Search jobs by title or company"
          bind:value={searchQuery}
          class="mobile-search-input"
        />
      </div>
      
      <div class="mobile-search-input-group">
        <span class="mobile-search-icon">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="Enter ZIP code or location"
          bind:value={searchLocation}
          class="mobile-search-input"
        />
      </div>
      
      <button 
        class="mobile-search-button-submit"
        on:click={() => {
          handleSearch();
          toggleMobileSearch();
        }}
      >
        Search Jobs
      </button>
    </div>
  </div>
{/if}

<style>
  .nav {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    height: 72px;
    display: flex;
    align-items: center;
  }

  .nav-content {
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 0 24px;
  }

  .logo {
    text-decoration: none;
  }

  .logo-text {
    color: #6355FF;
    font-size: 1.5rem;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .search-bar {
    flex: 1;
    max-width: 800px;
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border-radius: 100px;
    padding: 4px;
    margin: 0 1rem;
    border: 1px solid #e0e0e0;
  }

  .search-input-wrapper {
    flex: 1;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: #333;
  }

  .location-wrapper {
    position: relative;
    min-width: 140px;
    border-left: 1px solid #e0e0e0;
  }

  .location-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
  }

  .location-input {
    width: 100%;
    padding: 12px 16px 12px 42px;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: #333;
    cursor: text;
  }

  input:focus {
    outline: none;
  }

  .search-input::placeholder,
  .location-input::placeholder {
    color: #9CA3AF;
    font-size: 0.95rem;
  }

  .search-button {
    background: #6355FF;
    color: white;
    border: none;
    border-radius: 100px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-right: 2px;
  }

  .search-button:hover {
    background: #5346E0;
    transform: translateY(-1px);
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-left: auto;
  }

  .icon-button {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    position: relative;
  }

  .icon-button:hover {
    opacity: 0.8;
  }

  .notification-button {
    padding: 8px;
  }

  .menu-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }

  .menu-button-content {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
    border-radius: 30px;
    transition: background-color 0.2s;
    color: #666;
  }

  .menu-button:hover .menu-button-content {
    background: rgba(99, 85, 255, 0.05);
    color: #6355FF;
  }

  .profile-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .dropdown-arrow {
    margin-left: 2px;
    transition: all 0.2s ease;
  }

  .dropdown-arrow.open {
    transform: rotate(180deg);
    color: #6355FF;
  }

  .menu-button:hover .dropdown-arrow {
    color: #6355FF;
  }

  .dropdown-container {
    position: relative;
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    width: 320px;
    overflow: hidden;
  }

  .user-section {
    display: flex;
    gap: 16px;
    padding: 24px;
    background: white;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #6355FF;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }

  .account-info h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #111;
    margin: 0 0 8px 0;
    word-break: break-all;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .progress {
    height: 100%;
    background: #4CAF50;
    border-radius: 3px;
  }

  .progress-text {
    color: #666;
    font-size: 0.9rem;
    text-decoration: none;
  }

  .progress-text:hover {
    color: #6355FF;
  }

  .menu-section {
    padding: 12px 24px;
    border-bottom: 1px solid #f0f0f0;
  }

  .menu-section:last-child {
    border-bottom: none;
    padding: 16px 24px;
  }

  .menu-item {
    display: block;
    padding: 8px 0;
    color: #111;
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s;
  }

  .menu-item:hover {
    color: #6355FF;
  }

  .logout-button {
    width: 100%;
    padding: 12px;
    background: none;
    border: 1px solid #DC2626;
    border-radius: 100px;
    color: #DC2626;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .logout-button:hover {
    background: #DC2626;
    color: white;
  }

  @media (max-width: 1024px) {
    .nav-content {
      gap: 1.5rem;
      padding: 0 16px;
    }
    
    .search-bar {
      max-width: 600px;
    }
  }
  
  @media (max-width: 768px) {
    .nav {
      height: 64px;
    }
    
    .nav-content {
      gap: 1rem;
      padding: 0 12px;
    }
    
    .logo-text {
      font-size: 1.25rem;
    }
    
    .search-bar {
      max-width: none;
      background: transparent;
      padding: 0;
    }
    
    .search-input-wrapper {
      display: none;
    }
    
    .location-wrapper {
      border-left: none;
      padding-left: 0;
    }
    
    .location-input {
      width: 120px;
    }
    
    .dropdown-menu {
      width: 280px;
      right: -12px;
    }
    
    .user-section {
      padding: 16px;
    }
    
    .menu-section {
      padding: 8px 16px;
    }
  }
  
  @media (max-width: 640px) {
    .nav {
      height: 60px;
    }
    
    .nav-content {
      padding: 0 8px;
    }
    
    .logo-text {
      font-size: 1.2rem;
    }
    
    .search-bar {
      display: none;
    }
    
    .nav-actions {
      gap: 0.75rem;
    }
    
    .icon-button {
      padding: 6px;
    }
    
    .notification-button {
      padding: 6px;
    }
    
    .notification-button svg {
      width: 22px;
      height: 22px;
    }
    
    .user-avatar {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }
    
    .dropdown-menu {
      width: 260px;
      right: -8px;
    }
    
    .mobile-search-button {
      display: flex;
      background: none;
      border: none;
      padding: 6px;
      cursor: pointer;
    }
    
    .mobile-search-button svg {
      width: 22px;
      height: 22px;
      color: #6355FF;
    }
  }
  
  .mobile-search-button {
    display: none;
  }
  
  .mobile-search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 2000;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .mobile-search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .mobile-search-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #111827;
  }
  
  .mobile-search-close {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
  }
  
  .mobile-search-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .mobile-search-input-group {
    position: relative;
  }
  
  .mobile-search-input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    font-size: 1rem;
  }
  
  .mobile-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6B7280;
  }
  
  .mobile-search-button-submit {
    background: #6355FF;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px;
    font-weight: 600;
    cursor: pointer;
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
  
  .reset-search-button {
    background: #F3F4F6;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 0.875rem;
    color: #4B5563;
    cursor: pointer;
    margin-left: 8px;
    transition: all 0.2s;
  }
  
  .reset-search-button:hover {
    background: #E5E7EB;
    color: #1F2937;
  }
</style> 