<script lang="ts">
  import { slide } from 'svelte/transition';
  import { user } from '../../stores/userStore';
  import { onMount } from 'svelte';
  
  let showDropdown = false;
  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  function toggleDropdown(event: Event) {
    event.preventDefault();
    showDropdown = !showDropdown;
  }
  
  async function handleLogout() {
    try {
      await user.logout();
      showDropdown = false;
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
</script>

<nav>
  <div class="nav-content">
    <a href="/" class="logo">
      <div class="logo-container">
        <span class="job">Job</span>
        <span class="separator">|</span>
        <span class="finder">Finder</span>
      </div>
    </a>
    
    <div class="nav-right">
      <a href="/employers" class="employers-link">Employers</a>
      
      {#if $user && $user.token}
        <!-- Show for logged in users -->
        <a href="/dashboard" class="dashboard-link">Dashboard</a>
        <div class="user-menu-container">
          <button class="user-menu-button" on:click={toggleDropdown}>
            <div class="user-avatar">
              {#if $user.name}
                {$user.name.charAt(0).toUpperCase()}
              {:else}
                U
              {/if}
            </div>
          </button>
        </div>
      {:else}
        <!-- Show for logged out users -->
        <a href="/signup" class="sign-up-button">Sign up</a>
        <button class="menu-button" on:click={toggleDropdown}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      {/if}
    </div>
  </div>

  {#if showDropdown}
    <div class="dropdown-menu" transition:slide>
      {#if $user && $user.token}
        <!-- Logged in dropdown menu -->
        <a href="/dashboard" class="menu-item">Dashboard</a>
        <a href="/profile" class="menu-item">Profile</a>
        <a href="/saved-jobs" class="menu-item">Saved Jobs</a>
        <a href="/applications" class="menu-item">Applications</a>
        <div class="menu-divider"></div>
        <a href="/settings" class="menu-item">Settings</a>
        <button class="logout-button" on:click={handleLogout}>Log out</button>
      {:else}
        <!-- Logged out dropdown menu -->
        <a href="/salary-calculator" class="menu-item">Salary calculator</a>
        <a href="/blog" class="menu-item">Blog</a>
        <a href="/contact" class="menu-item">Contact us</a>
        <a href="/help" class="menu-item">Help Center</a>
        <div class="menu-divider"></div>
        <a href="/signup" class="create-account">Create an account</a>
        <a href="/login" class="login">Log in</a>
      {/if}
    </div>
  {/if}
</nav>

<style>
  nav {
    background: white;
    padding: 1rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
    font-family: serif;
  }

  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
  }

  .logo {
    text-decoration: none;
    display: flex;
    align-items: center;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .job {
    color: #333;
    font-size: 1.5rem;
    font-weight: bold;
    font-family: serif;
  }

  .separator {
    color: #6355FF;
    font-size: 1.5rem;
    opacity: 0.7;
  }

  .finder {
    color: #6355FF;
    font-size: 1.5rem;
    font-weight: bold;
    font-family: serif;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .employers-link {
    color: #333;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
    font-family: serif;
    font-size: 1.1rem;
  }

  .employers-link:hover {
    color: #6355FF;
  }

  .sign-up-button {
    background: #6355FF;
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.2s ease;
    font-family: serif;
    font-size: 1.1rem;
  }

  .sign-up-button:hover {
    background: #5346E0;
  }

  .menu-button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #333;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 250px;
    border-radius: 8px;
    margin-top: 0.5rem;
    margin-right: 1rem;
  }

  .menu-item {
    color: #333;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
    font-weight: 500;
    transition: background-color 0.2s ease;
    font-family: serif;
  }

  .menu-item:hover {
    background-color: #f5f5f5;
  }

  .menu-divider {
    height: 1px;
    background: #eee;
    margin: 0.5rem 0;
  }

  .create-account {
    background: #6355FF;
    color: white;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    text-align: center;
    font-weight: 500;
    margin: 0.5rem 1rem;
    transition: background-color 0.2s ease;
    font-family: serif;
    font-size: 1.1rem;
  }

  .create-account:hover {
    background: #5346E0;
  }

  .login {
    color: #6355FF;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    text-align: center;
    font-weight: 500;
    border: 2px solid #6355FF;
    border-radius: 50px;
    margin: 0.5rem 1rem;
    transition: all 0.2s ease;
    font-family: serif;
    font-size: 1.1rem;
  }

  .login:hover {
    background: #f5f5f5;
  }

  .dashboard-link {
    color: #333;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
    font-family: serif;
    font-size: 1.1rem;
  }

  .dashboard-link:hover {
    color: #6355FF;
  }
  
  .user-menu-container {
    position: relative;
  }
  
  .user-menu-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    background: #6355FF;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .logout-button {
    background: none;
    border: none;
    color: #EF4444;
    padding: 0.75rem 1.5rem;
    text-align: left;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    font-family: serif;
  }
  
  .logout-button:hover {
    background-color: #FEE2E2;
  }

  @media (max-width: 768px) {
    .nav-content {
      padding: 0.75rem 1rem;
    }

    .logo-text {
      font-size: 1.25rem;
    }

    .employers-link, .sign-up-button, .dashboard-link {
      display: none;
    }

    .menu-button, .user-menu-button {
      display: block;
    }

    .dropdown-menu {
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      margin: 0;
      border-radius: 0;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      max-height: calc(100vh - 60px);
      overflow-y: auto;
    }
  }

  @media (max-width: 480px) {
    .nav-content {
      padding: 0 1rem;
    }
    
    .logo-text {
      font-size: 1.25rem;
    }

    .dropdown-menu {
      margin-right: 0;
      border-radius: 0;
    }
  }
</style> 