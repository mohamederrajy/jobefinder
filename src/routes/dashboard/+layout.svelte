<script lang="ts">
  import DashboardNav from '../../components/dashboard/DashboardNav.svelte';
  import DiscoverJobList from '../../components/jobs/DiscoverJobList.svelte';
  import { user } from '../../stores/userStore';
  import { subscription } from '../../stores/subscriptionStore';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import SubscriptionGuard from '$lib/components/SubscriptionGuard.svelte';
  import SubscriptionModal from '../../components/modals/SubscriptionModal.svelte';

  let searchQuery = '';
  let searchLocation = '';
  let isFirstJob: boolean | null = null;
  let savedJobsCount = 0;
  let showSubscriptionModal = false;

  // Create a store for the count instead of a regular variable
  const recentViewCount = writable(0);

  let sidebarLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/dashboard/jobs', label: 'Browse Jobs', icon: 'search' },
    { href: '/dashboard/saved', label: 'Saved Jobs', icon: 'bookmark' },
    { href: '/dashboard/recent', label: 'Recently Viewed', icon: 'history' },
    { href: '/dashboard/profile', label: 'My Profile', icon: 'person' },
    // Other links...
  ];

  // Define the subscription data interface
  interface SubscriptionData {
    isPaid: boolean;
    subscription: {
      status: 'active' | 'free' | 'incomplete';
      plan: 'monthly' | 'quarterly' | 'yearly' | 'free';
      current_period_end: number;
      current_period_start: number;
      stripe_subscription_id: string;
      stripe_price_id: string;
      cancel_at_period_end: boolean;
      isPaid: boolean;
    }
  }

  // Check subscription status function
  async function checkSubscriptionStatus(): Promise<SubscriptionData> {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/subscriptions/status`, {
        headers: {
          'x-auth-token': $user?.token || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data: SubscriptionData = await response.json();
      console.log('Subscription status:', data);

      // Update the subscription store
      subscription.set(data.subscription);
      
      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Return default free subscription status on error
      return {
        isPaid: false,
        subscription: {
          status: 'free',
          plan: 'free',
          current_period_end: 0,
          current_period_start: 0,
          stripe_subscription_id: '',
          stripe_price_id: '',
          cancel_at_period_end: false,
          isPaid: false
        }
      };
    }
  }

  onMount(async () => {
    if (!$user) {
      await goto('/login');
      return;
    }

    if ($user?.token) {
      await checkSubscriptionStatus();
    }

    await loadSavedJobsCount();

    // Initialize the count
    updateRecentViewCount();
    
    // Add event listener for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Add event listener for custom event
    window.addEventListener('recentlyViewedJobsUpdated', handleCustomEvent);
    
    // Set up an interval to check for changes (as a backup)
    const intervalId = setInterval(() => {
      updateRecentViewCount();
    }, 2000); // Check every 2 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('recentlyViewedJobsUpdated', handleCustomEvent);
      clearInterval(intervalId);
    };
  });

  async function loadSavedJobsCount() {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/users/saved-jobs`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });
      
      if (!response.ok) throw new Error('Failed to load saved jobs');
      const savedJobs = await response.json();
      savedJobsCount = savedJobs.length;
    } catch (error) {
      console.error('Error loading saved jobs count:', error);
    }
  }

  function handleSearch(event: CustomEvent) {
    searchQuery = event.detail.query;
    searchLocation = event.detail.location;
  }

  function handleNotifications() {
    console.log('Opening notifications');
  }

  function handleHelp() {
    console.log('Opening help');
  }

  function handleMenu() {
    console.log('Opening menu');
  }

  function handleFirstJobResponse(response: boolean) {
    isFirstJob = response;
  }

  // Function to get user identifier
  function getUserIdentifier() {
    if ($user && $user.id) return $user.id;
    if ($user && $user.email) return $user.email;
    return null;
  }
  
  // Function to get recently viewed jobs count
  function updateRecentViewCount() {
    try {
      const userId = getUserIdentifier();
      if (!userId) {
        recentViewCount.set(0);
        return;
      }
      
      const recentJobsJson = localStorage.getItem('recentlyViewedJobs');
      if (!recentJobsJson) {
        recentViewCount.set(0);
        return;
      }
      
      const allRecentJobs = JSON.parse(recentJobsJson) as Job[];
      const userRecentJobs = allRecentJobs.filter((job: Job) => job.userId === userId);
      recentViewCount.set(userRecentJobs.length);
    } catch (err) {
      console.error('Error counting recently viewed jobs:', err);
      recentViewCount.set(0);
    }
  }
  
  // Set up storage event listener to update count when localStorage changes
  function handleStorageChange(event: StorageEvent) {
    if (event.key === 'recentlyViewedJobs') {
      updateRecentViewCount();
    }
  }
  
  // Handle custom event
  function handleCustomEvent() {
    updateRecentViewCount();
  }

  // Fix TypeScript errors
  interface StorageEvent {
    key: string | null;
    newValue: string | null;
    oldValue: string | null;
    storageArea: Storage | null;
    url: string;
  }

  interface Job {
    userId: string;
    // add other job properties as needed
  }

  function handleUpgradeClick(event: MouseEvent) {
    event.preventDefault();
    showSubscriptionModal = true;
  }
</script>

<div class="dashboard-layout">
  <DashboardNav
    bind:searchQuery
    bind:searchLocation
    on:search={handleSearch}
    on:notifications={handleNotifications}
    on:help={handleHelp}
    on:menu={handleMenu}
  />

  <main class="dashboard-container">
    <h1 class="welcome-title">Welcome!</h1>

    <!-- Dashboard Cards Section -->
    <div class="dashboard-section">
      <div class="dashboard-grid">
        <a href="/dashboard" class="dashboard-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#6355FF" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
          </div>
          <h2>Jobs</h2>
        </a>

        <a href="/dashboard/profile" class="dashboard-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#6355FF" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h2>Profile</h2>
        </a>

        <a href="/dashboard/saved" class="dashboard-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#6355FF" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div class="card-content">
            <h2>Saved jobs</h2>
            <span class="count">{savedJobsCount}</span>
          </div>
        </a>

        <a href="/dashboard/recent" class="dashboard-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#6355FF" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </div>
          <div class="card-content">
            <h2>Recently viewed</h2>
            {#if $recentViewCount > 0}
              <span class="count">{$recentViewCount}</span>
            {/if}
          </div>
        </a>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="two-column-grid">
      <div class="main-content">
        <slot />
      </div>
    </div>

    <!-- Bottom Sections -->
    <div class="bottom-sections">
      <!-- Discover Section - Only show for paid users -->
      {#if $subscription?.isPaid}
        <div class="discover-section">
          <h2 class="section-title">Discover more great jobs</h2>
          <p class="section-subtitle">Job matches based on your preferences</p>
          <DiscoverJobList />
        </div>
      {:else}
        <div class="discover-section upgrade-prompt">
          <div class="upgrade-content">
            <div class="upgrade-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6355FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#6355FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#6355FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="section-title">Unlock Premium Features</h2>
            <p class="section-subtitle">Get access to exclusive job recommendations and premium features</p>
            
            <div class="features-grid">
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Personalized job matches</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Early access to new jobs</span>
              </div>
              <div class="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Advanced search filters</span>
              </div>
            </div>

            <button 
              class="upgrade-button" 
              on:click|preventDefault={handleUpgradeClick}
            >
              <span>Upgrade to Premium</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      {/if}

      <!-- Get Better Matches Section -->
      <div class="matches-section">
        <h2 class="section-title">Get better matches</h2>
        <p class="section-subtitle">We'll use your responses to give you better matches in the future. Update your answers anytime on <a href="/profile" class="profile-link">your profile</a></p>
        
        <div class="first-job-card">
          <h3>Are you looking for your first job?</h3>
          <div class="choice-buttons">
            <button 
              class="choice-button" 
              class:active={isFirstJob === true}
              on:click={() => handleFirstJobResponse(true)}
            >
              Yes
            </button>
            <button 
              class="choice-button" 
              class:active={isFirstJob === false}
              on:click={() => handleFirstJobResponse(false)}
            >
              No
            </button>
          </div>
          <div class="action-buttons">
            <button class="skip-button">Skip</button>
            <button class="save-button" disabled={isFirstJob === null}>Save</button>
          </div>
        </div>

        <div class="profile-strength">
          <div class="strength-header">
            <span>Profile Strength</span>
            <span>60%</span>
          </div>
          <div class="strength-bar">
            <div class="strength-progress" style="width: 60%"></div>
          </div>
          <a href="/dashboard/profile" class="edit-profile-link">Complete Profile</a>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- Add the subscription modal -->
{#if showSubscriptionModal}
  <SubscriptionModal
    on:subscribed={() => {
      showSubscriptionModal = false;
    }}
    on:close={() => showSubscriptionModal = false}
  />
{/if}

<style>
  .dashboard-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #F9FAFB;
    padding-top: 80px;
  }

  .dashboard-container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 32px 24px;
    width: 100%;
  }

  .dashboard-section {
    margin-bottom: 3rem;
    padding: 0 12px;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .dashboard-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-decoration: none;
    border: 1px solid #f0f0f0;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    min-height: 140px;
    justify-content: center;
  }

  .dashboard-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: #6355FF;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    background: rgba(99, 85, 255, 0.08);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }

  .dashboard-card h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
    font-family: inherit;
    line-height: 1.4;
  }

  .two-column-grid {
    margin-top: 2rem;
  }

  .main-content {
    background: white;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    padding: 1.5rem;
  }

  .bottom-sections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .discover-section, .matches-section {
    background: white;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #f0f0f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .section-subtitle {
    color: #6B7280;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .first-job-card {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 16px;
    padding: 24px;
    margin-top: 16px;
  }

  .choice-buttons {
    display: flex;
    gap: 12px;
    margin: 16px 0;
  }

  .choice-button {
    flex: 1;
    padding: 12px;
    border: 1.5px solid #E5E7EB;
    border-radius: 100px;
    background: white;
    color: #4B5563;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .choice-button.active {
    background: #6355FF;
    border-color: #6355FF;
    color: white;
  }

  .choice-button:hover:not(.active) {
    border-color: #6355FF;
    color: #6355FF;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .skip-button, .save-button {
    flex: 1;
    padding: 12px 24px;
    border-radius: 100px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .skip-button {
    background: white;
    border: 1.5px solid #E5E7EB;
    color: #6B7280;
  }

  .skip-button:hover {
    border-color: #D1D5DB;
    color: #4B5563;
  }

  .save-button {
    background: #6355FF;
    border: none;
    color: white;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .save-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(99, 85, 255, 0.3);
  }

  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .profile-link {
    color: #6355FF;
    text-decoration: none;
    font-weight: 500;
  }

  .profile-link:hover {
    text-decoration: underline;
  }

  .footer-wrapper {
    display: none;
  }

  @media (max-width: 1400px) {
    .dashboard-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .dashboard-container {
      padding: 24px 16px;
    }
    
    /* Force bottom sections to single column on tablets and below */
    .bottom-sections {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
  
  @media (max-width: 768px) {
    .bottom-sections {
      grid-template-columns: 1fr; /* Ensure single column */
      gap: 1rem;
      margin: 1.5rem 0;
    }
    
    .discover-section, .matches-section {
      padding: 20px;
    }
    
    .section-title {
      font-size: 1.2rem;
    }
    
    .section-subtitle {
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }
    
    .first-job-card {
      padding: 20px;
      margin-top: 14px;
    }
    
    .first-job-card h3 {
      font-size: 1rem;
    }
    
    .choice-buttons {
      gap: 10px;
      margin: 14px 0;
    }
    
    .choice-button {
      padding: 10px;
      font-size: 0.85rem;
    }
    
    .action-buttons {
      gap: 10px;
      margin-top: 20px;
    }
    
    .skip-button, .save-button {
      padding: 10px 20px;
      font-size: 0.85rem;
    }
    
    .profile-strength {
      margin-top: 20px;
    }
  }
  
  @media (max-width: 640px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .dashboard-container {
      padding: 16px 12px;
    }
    .dashboard-card {
      min-height: 120px;
    }
    
    /* Reinforce single column layout */
    .bottom-sections {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin: 1rem 0;
    }
  }
  
  @media (max-width: 480px) {
    .bottom-sections {
      gap: 0.75rem;
      margin: 1rem 0;
    }
    
    .discover-section, .matches-section {
      padding: 16px;
      border-radius: 12px;
    }
    
    .section-title {
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
    }
    
    .section-subtitle {
      font-size: 0.8rem;
      margin-bottom: 1rem;
    }
    
    .first-job-card {
      padding: 16px;
      margin-top: 12px;
      border-radius: 12px;
    }
    
    .first-job-card h3 {
      font-size: 0.95rem;
    }
    
    .choice-buttons {
      gap: 8px;
      margin: 12px 0;
    }
    
    .choice-button {
      padding: 8px;
      font-size: 0.8rem;
    }
    
    .action-buttons {
      gap: 8px;
      margin-top: 16px;
    }
    
    .skip-button, .save-button {
      padding: 8px 16px;
      font-size: 0.8rem;
    }
    
    .profile-strength {
      margin-top: 16px;
    }
    
    .strength-header {
      font-size: 0.8rem;
      margin-bottom: 6px;
    }
    
    .strength-bar {
      height: 8px;
    }
  }

  .card-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .count {
    background-color: #6355FF;
    color: white;
    border-radius: 9999px;
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 1.5rem;
    text-align: center;
  }

  .welcome-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 2rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.02em;
  }

  .upgrade-prompt {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
    border: 1px solid rgba(99, 85, 255, 0.1);
    box-shadow: 0 4px 24px rgba(99, 85, 255, 0.06);
  }

  .upgrade-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
  }

  .upgrade-icon {
    background: rgba(99, 85, 255, 0.08);
    padding: 1rem;
    border-radius: 16px;
    margin-bottom: 1.5rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    width: 100%;
    margin: 1.5rem 0;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    border: 1px solid rgba(99, 85, 255, 0.08);
  }

  .feature-item span {
    color: #374151;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .upgrade-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #6355FF;
    color: white;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .upgrade-button:hover {
    background: #5346E8;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 85, 255, 0.3);
  }

  .upgrade-button svg {
    transition: transform 0.3s ease;
  }

  .upgrade-button:hover svg {
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    .features-grid {
      grid-template-columns: 1fr;
    }

    .upgrade-content {
      padding: 1.5rem;
    }

    .feature-item {
      padding: 0.5rem;
    }
  }
</style> 