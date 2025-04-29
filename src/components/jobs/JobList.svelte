<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { subscription } from '../../stores/subscriptionStore';
  import { user } from '../../stores/userStore';
  import { goto } from '$app/navigation';
  import type { SearchEvent } from '../../types/events';
  import SubscriptionModal from '../modals/SubscriptionModal.svelte';
  import EditJobModal from '../modals/EditJobModal.svelte';

  // Basic job interface for both preview and full jobs
  interface Job {
    title: string;
    company: string;
    address: {
      city: string;
      street?: string;
      state?: string;
      zipCode?: string;
    };
    hourlyRate: number;
    _id?: string;
    tags: string[];
    isUrgent: boolean;
    createdAt?: string;
    createdBy?: {
      email: string;
    };
    logo?: string;
    imageUrl?: string;
    about?: string;
    jobUrl?: string;
    contactDetails?: {
      name: string;
      email: string;
      phone: string;
    };
  }

  // Make sure these are exported props so they can be passed from parent components
  export let searchQuery = '';
  export let searchLocation = '';
  
  let allJobs: Job[] = []; // Store all jobs
  let filteredJobs: Job[] = []; // Store filtered jobs
  let loading = true;
  let error: string | null = null;
  let favorites = new Set();
  let showSubscriptionModal = false;
  let showEditModal = false;
  let selectedJob: Job | undefined;

  // Track saved jobs
  let savedJobs = new Set<string>();

  // Add a variable to track the first job for preview
  let firstJobId: string | undefined = undefined;

  // Define icon styles and colors for company logos
  const iconStyles = {
    tech: [
      {
        url: 'https://api.dicebear.com/7.x/identicon/svg',
        colors: ['4F46E5', '2563EB', '7C3AED', '6366F1']
      },
      {
        url: 'https://api.dicebear.com/7.x/shapes/svg',
        colors: ['059669', '0EA5E9', '8B5CF6', 'EC4899']
      }
    ],
    startup: [
      {
        url: 'https://api.dicebear.com/7.x/rings/svg',
        colors: ['DC2626', 'EA580C', 'D97706', 'CA8A04']
      },
      {
        url: 'https://api.dicebear.com/7.x/cells/svg',
        colors: ['2DD4BF', '06B6D4', '818CF8', 'F472B6']
      }
    ],
    enterprise: [
      {
        url: 'https://api.dicebear.com/7.x/micah/svg',
        colors: ['0891B2', '4F46E5', '7C3AED', '6366F1']
      }
    ]
  };

  // Function to generate two letters from company name
  function getCompanyInitials(company: string): string {
    return company
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Background colors for company icons
  const bgColors = [
    { bg: '#4F46E5', text: '#FFFFFF' }, // Indigo
    { bg: '#0EA5E9', text: '#FFFFFF' }, // Sky
    { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
    { bg: '#EC4899', text: '#FFFFFF' }, // Pink
    { bg: '#10B981', text: '#FFFFFF' }, // Emerald
    { bg: '#F59E0B', text: '#FFFFFF' }, // Amber
    { bg: '#6366F1', text: '#FFFFFF' }  // Blue
  ];

  // Function to get consistent color for a company
  function getCompanyColor(company: string) {
    const hash = company.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return bgColors[hash % bgColors.length];
  }

  // Function to generate unique icon for each company
  function generateCompanyIcon(company: string) {
    const hash = company.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    
    // Select icon style based on company name
    let styleCategory;
    if (company.toLowerCase().includes('tech') || company.toLowerCase().includes('software')) {
      styleCategory = iconStyles.tech;
    } else if (company.toLowerCase().includes('inc') || company.toLowerCase().includes('corp')) {
      styleCategory = iconStyles.enterprise;
    } else {
      styleCategory = iconStyles.startup;
    }

    // Get random style from category
    const style = styleCategory[hash % styleCategory.length];
    const color = style.colors[hash % style.colors.length];

    // Generate unique icon URL with consistent parameters
    return `${style.url}?seed=${encodeURIComponent(company)}&backgroundColor=${color}&radius=12`;
  }

  // Update tag color mapping with more relevant tech tags
  const tagColors = {
    'software': { bg: '#EFF6FF', text: '#2563EB' },
    'engineering': { bg: '#F0FDF4', text: '#16A34A' },
    'senior': { bg: '#FDF2F8', text: '#DB2777' },
    'frontend': { bg: '#FEF3C7', text: '#D97706' },
    'backend': { bg: '#F3E8FF', text: '#7C3AED' },
    'fullstack': { bg: '#ECFDF5', text: '#059669' },
    'react': { bg: '#E0F2FE', text: '#0284C7' },
    'node': { bg: '#F0FDF4', text: '#15803D' },
    'python': { bg: '#FEF9C3', text: '#CA8A04' },
    'java': { bg: '#FFE4E6', text: '#BE123C' },
    'devops': { bg: '#F3F4F6', text: '#4B5563' }
  };

  // Function to get tag color with text transform
  function getTagColor(tag: string) {
    const normalizedTag = tag.toLowerCase();
    const defaultColor = { bg: '#F3F4F6', text: '#4B5563' };
    return tagColors[normalizedTag] || defaultColor;
  }

  // Function to format tag text
  function formatTag(tag: string) {
    return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
  }

  // Update the filter function to use the search parameters
  function filterJobs() {
    console.log('Filtering jobs with:', { searchQuery, searchLocation, allJobs: allJobs.length });
    
    if (!searchQuery && !searchLocation) {
      filteredJobs = [...allJobs];
      return;
    }

    filteredJobs = allJobs.filter(job => {
      const matchQuery = !searchQuery || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchLocation = !searchLocation ||
        (job.address?.city && job.address.city.toLowerCase().includes(searchLocation.toLowerCase())) ||
        (job.address?.state && job.address.state.toLowerCase().includes(searchLocation.toLowerCase())) ||
        (job.address?.zipCode && job.address.zipCode.includes(searchLocation));

      return matchQuery && matchLocation;
    });
    
    console.log('Filtered jobs count:', filteredJobs.length);
  }

  // Watch for search changes and refilter
  $: if (mounted) {
    console.log('Search params changed:', { searchQuery, searchLocation });
    filterJobs();
  }
  
  // Also refilter when allJobs changes
  $: if (mounted && allJobs.length > 0) {
    filterJobs();
  }

  let mounted = false;
  
  // Update the subscription status check
  $: isPremium = $subscription?.isPaid || false;

  onMount(() => {
    mounted = true;
    fetchJobs();
  });

  // Update the fetchJobs function
  async function fetchJobs() {
    try {
      loading = true;
      error = null;

      // Determine which endpoint to use based on subscription status
      let endpoint = '/jobs/preview';
      let headers = {
        'Content-Type': 'application/json'
      };
      
      if ($user?.token) {
        headers['x-auth-token'] = $user.token;
        
        // Check if user has paid subscription
        if ($subscription?.isPaid) {
          endpoint = '/jobs';
        }
      }
      
      console.log('Fetching jobs from:', endpoint, 'isPaid:', $subscription?.isPaid);
      
      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch jobs');
      }

      const data = await response.json();
      console.log('Fetched jobs:', data);

      if (Array.isArray(data)) {
        allJobs = data;
        filteredJobs = data;
        
        // Set the first job ID for preview only if user is not premium
        if (data.length > 0 && (!$user?.token || !$subscription?.isPaid)) {
          firstJobId = data[0]._id;
        }
      } else {
        throw new Error('Invalid data format received from server');
      }

    } catch (err) {
      console.error('Error fetching jobs:', err);
      error = err instanceof Error ? err.message : 'Failed to load jobs. Please try again later.';
      allJobs = [];
      filteredJobs = [];
    } finally {
      loading = false;
    }
  }

  // Load saved jobs on mount
  async function loadSavedJobs() {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/users/saved-jobs`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) throw new Error('Failed to load saved jobs');
      
      const data = await response.json();
      savedJobs = new Set(data.map((job: Job) => job._id));
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  }

  // Toggle job save status
  async function toggleSaveJob(jobId: string, event?: Event) {
    if (event) {
      event.stopPropagation(); // Prevent job card click
    }

    if (!$user) {
      showSubscriptionModal = true;
      return;
    }

    try {
      const isSaved = savedJobs.has(jobId);
      const method = isSaved ? 'DELETE' : 'POST';
      
      const response = await fetch(
        `${PUBLIC_API_URL}/users/saved-jobs/${jobId}`, 
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': $user.token
          }
        }
      );

      if (!response.ok) throw new Error('Failed to update saved job');

      // Update local state
      if (isSaved) {
        savedJobs.delete(jobId);
      } else {
        savedJobs.add(jobId);
      }
      savedJobs = savedJobs; // Trigger reactivity
      
    } catch (error) {
      console.error('Error toggling saved job:', error);
    }
  }

  // Load saved jobs when component mounts
  onMount(async () => {
    if ($user) {
      await loadSavedJobs();
    }
  });

  function toggleFavorite(jobId: string) {
    if (favorites.has(jobId)) {
      favorites.delete(jobId);
    } else {
      favorites.add(jobId);
    }
    favorites = favorites; // trigger reactivity
  }

  let scrollContainer: HTMLElement;
  
  function scrollLeft() {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -scrollContainer.offsetWidth, behavior: 'smooth' });
    }
  }

  function scrollRight() {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: scrollContainer.offsetWidth, behavior: 'smooth' });
    }
  }

  // Update the handleUpgradeClick function to redirect non-logged in users
  function handleUpgradeClick() {
    if (!$user || !$user.token) {
      // If user is not logged in, redirect to login page
      goto('/login?source=upgrade');
    } else {
      // If user is logged in, show subscription modal
      showSubscriptionModal = true;
    }
  }

  function handleSubscribed() {
    showSubscriptionModal = false;
    fetchJobs(); // Refresh jobs after subscription
  }

  function handleJobClick(jobId: string) {
    if (!$user || !$user.token) {
      // If user is not logged in, redirect to login
      goto('/login?redirect=' + encodeURIComponent(`/jobs/${jobId}`));
    } else {
      // If user is logged in, navigate to job details
      window.location.href = `/dashboard/jobs/${jobId}`;
    }
  }

  // Add this function for generating background color
  function getLogoBackground(company: string): string {
    const colors = [
      '#4F46E5', // Indigo
      '#0EA5E9', // Sky
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#6366F1'  // Blue
    ];
    
    const hash = company.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  }

  // Add state for failed logos
  let failedLogos = new Set<string>();

  // Update the image error handler
  function handleImageError(event: Event, jobId: string) {
    const img = event.target as HTMLImageElement;
    if (!failedLogos.has(jobId)) {
      failedLogos.add(jobId);
      failedLogos = failedLogos; // Trigger reactivity
    }
  }

  // Update the shouldShowPreview function
  function shouldShowPreview(job: Job): boolean {
    // If user has premium subscription, don't show preview
    if ($subscription?.isPaid) {
      return false;
    }
    
    // For non-premium users, only show first job without preview
    return job._id !== firstJobId;
  }

  // Add a function to handle job updates from the EditJobModal
  function handleJobUpdated(event) {
    const updatedJob = event.detail;
    
    // Update the job in the allJobs array
    allJobs = allJobs.map(job => 
      job._id === updatedJob._id ? updatedJob : job
    );
    
    // Also update the filtered jobs
    filteredJobs = filteredJobs.map(job => 
      job._id === updatedJob._id ? updatedJob : job
    );
    
    // If the logo was updated, remove it from failedLogos if it was there
    if (updatedJob.logo && failedLogos.has(updatedJob._id)) {
      failedLogos.delete(updatedJob._id);
      failedLogos = failedLogos; // Trigger reactivity
    }
  }

  // Update the shouldBlurJob function
  function shouldBlurJob(job: Job): boolean {
    // If user has a paid subscription, don't blur any jobs
    if ($subscription?.isPaid) {
      return false;
    }
    
    // For non-premium users, only show the first job without blur
    return job._id !== firstJobId;
  }
  
  // Update the handleBlurredJobClick function
  function handleBlurredJobClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!$user || !$user.token) {
      // If user is not logged in, redirect to login page
      goto('/login?source=job_preview');
    } else {
      // If user is logged in but doesn't have subscription, show subscription modal
      showSubscriptionModal = true;
    }
  }

  // Update the shouldShowPremiumOverlay function
  function shouldShowPremiumOverlay(): boolean {
    return !$subscription?.isPaid && filteredJobs.length > 1;
  }

  // Add these variables to the script section
  let currentSlide = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  
  // Function to navigate to a specific slide
  function goToSlide(index) {
    if (index >= 0 && index < filteredJobs.length) {
      currentSlide = index;
    }
  }
  
  // Function to go to the next slide
  function nextSlide() {
    if (currentSlide < filteredJobs.length - 1) {
      currentSlide++;
    }
  }
  
  // Function to go to the previous slide
  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
    }
  }
  
  // Touch event handlers for swipe
  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
  }
  
  function handleTouchMove(e) {
    touchEndX = e.touches[0].clientX;
  }
  
  function handleTouchEnd() {
    if (touchStartX - touchEndX > 50) {
      // Swipe left, go to next slide
      nextSlide();
    } else if (touchEndX - touchStartX > 50) {
      // Swipe right, go to previous slide
      prevSlide();
    }
    // Reset touch coordinates
    touchStartX = 0;
    touchEndX = 0;
  }

  // Add these variables for desktop scrolling
  let scrollPosition = 0;
  let maxScroll = 0;
  
  function updateScrollPosition() {
    if (scrollContainer) {
      scrollPosition = scrollContainer.scrollLeft;
      maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    }
  }
  
  function handleScrollLeft() {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(updateScrollPosition, 300);
    }
  }
  
  function handleScrollRight() {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(updateScrollPosition, 300);
    }
  }

  // Update the job card rendering
  function renderJob(job) {
    const isBlurred = !isPremium && job.isUrgent;
    return {
      ...job,
      isBlurred
    };
  }

  // Watch for subscription changes
  $: if ($subscription?.isPaid && mounted) {
    console.log('Subscription status changed, refetching jobs');
    fetchJobs(); // Refetch jobs when subscription becomes paid
  }
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="jobs-container">
  {#if loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">
        <span>Loading jobs...</span>
        <span class="loading-subtext">Please wait while we fetch the latest opportunities</span>
      </div>
    </div>
  {:else if error}
    <div class="error">
      <svg viewBox="0 0 24 24" width="24" height="24" class="error-icon">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <span>{error}</span>
      <button class="retry-button" on:click={fetchJobs}>
        Try Again
      </button>
    </div>
  {:else if filteredJobs.length === 0}
    <div class="no-jobs">
      <svg viewBox="0 0 24 24" width="48" height="48" class="empty-icon">
        <path fill="#9CA3AF" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
      </svg>
      {#if searchQuery || searchLocation}
        <p>No jobs found matching your search criteria</p>
        <button class="clear-search" on:click={() => { searchQuery = ''; searchLocation = ''; }}>
          Clear Search
        </button>
      {:else}
        <p>No jobs available at the moment</p>
        <p class="check-back">Please check back later for new opportunities</p>
      {/if}
    </div>
  {:else}
  <div class="jobs-header">
      <div class="header-content">
        <h2>Latest Jobs {#if searchQuery || searchLocation}({filteredJobs.length} found){/if}</h2>
        
        {#if !$subscription?.isPaid}
          <button class="upgrade-btn" on:click={handleUpgradeClick}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.92c0 4.54-3.2 8.79-7 9.78-3.8-.99-7-5.24-7-9.78V6.3l7-3.12z"/>
            </svg>
            Upgrade to Premium
            <span class="premium-badge">PRO</span>
          </button>
        {/if}
    </div>

      <div class="scroll-buttons">
        <button class="scroll-button left" on:click={scrollLeft}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="none" stroke="currentColor" stroke-width="2" d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button class="scroll-button right" on:click={scrollRight}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="none" stroke="currentColor" stroke-width="2" d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Desktop job list with horizontal scrolling -->
    <div class="desktop-job-list">
      <div class="job-list-container" bind:this={scrollContainer} on:scroll={updateScrollPosition}>
        {#each filteredJobs as job, i}
          <div 
            class="job-card {i === currentSlide ? 'active' : ''}"
            on:click={shouldBlurJob(job) ? handleBlurredJobClick : () => handleJobClick(job._id)}
            class:preview={shouldShowPreview(job)}
            class:blurred-job-card={shouldBlurJob(job)}
          >
            <div class="card-header">
              <div class="company-logo">
                {#if !failedLogos.has(job._id)}
                  <img
                    src={job.logo || generateCompanyIcon(job.company)}
                    alt={`${job.company} logo`}
                    on:error={(e) => handleImageError(e, job._id)}
                    loading="lazy"
                  />
                {:else}
                  <div 
                    class="company-initials"
                    style="background-color: {getLogoBackground(job.company)}"
                  >
                    {getCompanyInitials(job.company)}
                  </div>
                {/if}
              </div>
              <div class="rate-badge">
                <span class="currency">$</span>{job.hourlyRate}
                <span class="rate-period">/hr</span>
              </div>
            </div>

            {#if job.imageUrl}
              <div class="demo-image-container">
                <img 
                  src={job.imageUrl} 
                  alt="Job demonstration" 
                  class="demo-image"
                  loading="lazy"
                />
              </div>
            {/if}

            <div class="card-content">
              <h3 class="job-title">{job.title}</h3>
              
              <div class="company-info">
                <span class="company-name">
                  <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                  </svg>
                  {job.company}
                </span>
                <div class="location">
                  <svg viewBox="0 0 24 24" width="16" height="16" class="icon">
                    <path fill="#6B7280" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>
                    {job.address.city}, {job.address.state}
                    {#if job.address.zipCode}
                      <span class="zip-code">{job.address.zipCode}</span>
                    {/if}
                  </span>
                </div>
              </div>

              <div class="tags-wrapper">
                <div class="tags">
              {#if job.isUrgent}
                    <span class="tag urgent">
                      <svg class="icon" viewBox="0 0 24 24" width="14" height="14">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      Urgently hiring
                    </span>
              {/if}
                  {#each job.tags || [] as tag}
                    <span 
                      class="tag" 
                      style="background-color: {getTagColor(tag).bg}; color: {getTagColor(tag).text};"
                    >
                      {formatTag(tag)}
                    </span>
                  {/each}
                </div>
              </div>
            </div>

            <div class="action-row">
              <button class="apply-button">
                <svg class="icon" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
                Easy Apply
              </button>
              <button 
                class="favorite-button" 
                class:active={savedJobs.has(job._id)}
                on:click={(e) => toggleSaveJob(job._id, e)}
                title={savedJobs.has(job._id) ? "Remove from saved" : "Save job"}
              >
                <svg class="heart-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    d={savedJobs.has(job._id) 
                      ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      : "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  }
                />
              </svg>
              </button>
            </div>

            <!-- Preview Overlay -->
            {#if !$subscription?.isPaid && !job._id}
              <div class="preview-overlay">
                <button class="unlock-button" on:click={handleUpgradeClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Unlock All Jobs
                </button>
              </div>
            {/if}

            <!-- Update the blurred job card section -->
            {#if shouldBlurJob(job)}
              <div class="blur-overlay">
                <!-- Remove the button from here -->
              </div>
            {/if}
          </div>
        {/each}
      </div>
      
      <!-- Desktop scroll controls -->
      <div class="desktop-scroll-controls">
        <button 
          class="scroll-button" 
          on:click={handleScrollLeft}
          disabled={scrollPosition <= 0}
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button 
          class="scroll-button" 
          on:click={handleScrollRight}
          disabled={scrollPosition >= maxScroll}
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile job slider -->
    <div class="mobile-job-slider">
      <div class="slider-container">
        {#each filteredJobs as job}
          <div class="job-card"
            on:click={shouldBlurJob(job) ? handleBlurredJobClick : () => handleJobClick(job._id)}
            class:preview={shouldShowPreview(job)}
            class:blurred-job-card={shouldBlurJob(job)}
          >
            <div class="card-header">
              <div class="company-logo">
                {#if !failedLogos.has(job._id)}
                  <img
                    src={job.logo || generateCompanyIcon(job.company)}
                    alt={`${job.company} logo`}
                    on:error={(e) => handleImageError(e, job._id)}
                    loading="lazy"
                  />
                {:else}
                  <div 
                    class="company-initials"
                    style="background-color: {getLogoBackground(job.company)}"
                  >
                    {getCompanyInitials(job.company)}
                  </div>
                {/if}
              </div>
              <div class="rate-badge">
                <span class="currency">$</span>{job.hourlyRate}
                <span class="rate-period">/hr</span>
              </div>
            </div>

            {#if job.imageUrl}
              <div class="demo-image-container">
                <img 
                  src={job.imageUrl} 
                  alt="Job demonstration" 
                  class="demo-image"
                  loading="lazy"
                />
              </div>
            {/if}

            <div class="card-content">
              <h3 class="job-title">{job.title}</h3>
              
              <div class="company-info">
                <span class="company-name">
                  <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                  </svg>
                  {job.company}
                </span>
                <div class="location">
                  <svg viewBox="0 0 24 24" width="16" height="16" class="icon">
                    <path fill="#6B7280" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>
                    {job.address.city}
                    {#if job.address.state}
                      , {job.address.state}
                    {/if}
                    {#if job.address.zipCode}
                      <span class="zip-code">{job.address.zipCode}</span>
                    {/if}
                  </span>
                </div>
              </div>

              <div class="tags-wrapper">
                <div class="tags">
                  {#if job.isUrgent}
                    <span class="tag urgent">
                      <svg class="icon" viewBox="0 0 24 24" width="14" height="14">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      Urgently hiring
                    </span>
                  {/if}
                  {#each job.tags || [] as tag}
                    <span 
                      class="tag" 
                      style="background-color: {getTagColor(tag).bg}; color: {getTagColor(tag).text};"
                    >
                      {formatTag(tag)}
                    </span>
                  {/each}
                </div>
              </div>
            </div>

            <div class="action-row">
              <button class="apply-button">
                <svg class="icon" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
                Easy Apply
              </button>
              <button 
                class="favorite-button" 
                class:active={savedJobs.has(job._id)}
                on:click={(e) => toggleSaveJob(job._id, e)}
                title={savedJobs.has(job._id) ? "Remove from saved" : "Save job"}
              >
                <svg class="heart-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    d={savedJobs.has(job._id) 
                      ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      : "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  }
                />
              </svg>
            </button>
            </div>

            <!-- Preview Overlay -->
            {#if !$subscription?.isPaid && !job._id}
              <div class="preview-overlay">
                <button class="unlock-button" on:click={handleUpgradeClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Unlock All Jobs
                </button>
              </div>
            {/if}

            <!-- Blur Overlay -->
            {#if shouldBlurJob(job)}
              <div class="blur-overlay">
                <!-- Remove the button from here -->
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if showSubscriptionModal}
    <SubscriptionModal
      on:subscribed={() => {
        showSubscriptionModal = false;
        fetchJobs(); // Refresh jobs data
      }}
      on:close={() => showSubscriptionModal = false}
    />
  {/if}

  {#if showEditModal}
    <EditJobModal 
      job={selectedJob} 
      on:jobUpdated={handleJobUpdated} 
      on:close={() => showEditModal = false} 
    />
  {/if}

  <!-- Add this container for the single centered upgrade button -->
  {#if shouldShowPremiumOverlay()}
    <div class="center-upgrade-button-container">
      <button class="center-upgrade-button" on:click={handleUpgradeClick}>
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.92c0 4.54-3.2 8.79-7 9.78-3.8-.99-7-5.24-7-9.78V6.3l7-3.12z"/>
        </svg>
        Upgrade to Premium
      </button>
    </div>
  {/if}
</div>

<style>
  .jobs-container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 24px;
    position: relative;
  }

  .jobs-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    gap: 1rem;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-content h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  .scroll-buttons {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .scroll-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: white;
    border: 1px solid #E5E7EB;
    color: #4B5563;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .scroll-button:hover {
    background: #F9FAFB;
    color: #111827;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .scroll-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .jobs-grid {
    display: flex;
    gap: 24px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 8px 0;
  }

  .jobs-grid::-webkit-scrollbar {
    display: none;
  }

  .job-card {
    flex: 0 0 calc(25% - 18px);
    min-width: 300px;
    max-width: 350px;
    background: white;
    border-radius: 24px;
    padding: 0;
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.06);
    overflow: hidden;
  }

  .job-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    border-color: rgba(0,0,0,0.12);
  }

  .demo-image-container {
    width: 100%;
    height: 240px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(to bottom, rgba(0,0,0,0.02), rgba(0,0,0,0.05));
  }

  .demo-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }

  .job-card:hover .demo-image {
    transform: scale(1.05);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.98));
    border-bottom: 1px solid rgba(0,0,0,0.06);
    position: relative;
    z-index: 3;
  }

  .company-logo {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 2px solid rgba(0,0,0,0.04);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: relative;
  }

  .company-logo::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .job-card:hover .company-logo::after {
    opacity: 1;
  }

  .company-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 10px;
    transition: transform 0.3s ease;
  }

  .job-card:hover .company-logo img {
    transform: scale(1.05);
  }

  .rate-badge {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background: linear-gradient(135deg, #10B981, #059669);
    color: white;
    padding: 10px 20px;
    border-radius: 100px;
    font-weight: 600;
    font-size: 0.9375rem;
    border: 1px solid #059669;
    box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .rate-badge::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  .job-card:hover .rate-badge {
    border-color: #047857;
    box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
    transform: translateY(-1px);
  }

  .rate-badge .currency {
    font-weight: 500;
    opacity: 0.9;
    margin-right: 1px;
  }

  .rate-badge .rate-period {
    font-weight: 500;
    opacity: 0.9;
    margin-left: 1px;
  }

  .company-initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  }

  .card-content {
    padding: 28px;
    background: white;
    position: relative;
    z-index: 2;
    margin-top: -24px;
    border-radius: 24px 24px 0 0;
    border-top: 1px solid rgba(0,0,0,0.04);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.03);
  }

  .job-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
    line-height: 1.3;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    height: calc(1.5rem * 1.3 * 2);
  }

  .company-info {
    padding: 20px 0;
    margin: 0 -4px;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .company-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 4px;
  }

  .company-name:hover {
    color: #2563EB;
  }

  .company-name .icon {
    color: #6B7280;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4B5563;
    font-size: 0.9375rem;
    padding: 0 4px;
  }

  .location .icon {
    color: #6B7280;
    flex-shrink: 0;
  }

  .tags-wrapper {
    margin: 20px -4px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 0.8125rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border: 1px solid rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    gap: 6px;
    background: white;
  }

  .tag:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: rgba(0,0,0,0.12);
  }

  .tag.urgent {
    background: linear-gradient(to right, #FEF2F2, #FEE2E2);
    color: #DC2626;
    border-color: #FECACA;
    font-weight: 600;
  }

  .tag.urgent:hover {
    background: linear-gradient(to right, #FEE2E2, #FECACA);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
  }

  .action-row {
    padding: 16px 20px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    background: linear-gradient(to bottom, #F9FAFB, #F3F4F6);
    border-top: 1px solid rgba(0,0,0,0.06);
    margin-top: auto;
  }

  .apply-button {
    padding: 12px 24px;
    background: linear-gradient(135deg, #2563EB, #4F46E5);
    color: white;
    border: none;
    border-radius: 100px;
    font-weight: 600;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  }

  .apply-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
    background: linear-gradient(135deg, #1D4ED8, #4338CA);
  }

  .favorite-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    border: 1px solid rgba(0,0,0,0.1);
    color: #6B7280;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  }

  .favorite-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: rgba(236, 72, 153, 0.3);
    color: #EC4899;
  }

  .favorite-button.active {
    background: #FDF2F8;
    color: #EC4899;
    border-color: #EC4899;
  }

  @media (max-width: 768px) {
    .demo-image-container {
      height: 200px;
    }

    .card-header {
      padding: 20px;
    }

    .company-logo {
      width: 56px;
      height: 56px;
      border-radius: 16px;
    }

    .rate-badge {
      padding: 8px 16px;
      font-size: 0.875rem;
    }

    .card-content {
      padding: 24px;
      margin-top: -20px;
    }

    .job-title {
      font-size: 1.25rem;
      height: calc(1.25rem * 1.3 * 2);
    }

    .company-info {
      padding: 16px 0;
      gap: 10px;
    }

    .company-name {
      font-size: 1rem;
    }

    .location {
      font-size: 0.875rem;
    }

    .tags-wrapper {
      margin: 16px -2px 0;
    }

    .action-row {
      padding: 16px 24px;
      gap: 12px;
    }
  }

  .preview {
    filter: blur(0px);
  }

  .preview-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    backdrop-filter: blur(4px);
  }

  .unlock-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #6355FF;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 100px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .unlock-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(99, 85, 255, 0.3);
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 48px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .loading-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .loading-subtext {
    font-size: 0.875rem;
    color: #6B7280;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #6355FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 48px;
    text-align: center;
    background: white;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .error-icon {
    color: #DC2626;
  }

  .retry-button {
    padding: 8px 16px;
    background: #EEF2FF;
    color: #4F46E5;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .retry-button:hover {
    background: #E0E7FF;
  }

  .no-jobs {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 48px;
    text-align: center;
    background: white;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .empty-icon {
    margin-bottom: 8px;
  }

  .check-back {
    color: #6B7280;
    font-size: 0.875rem;
  }

  .clear-search {
    padding: 8px 16px;
    background: #F3F4F6;
    color: #374151;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-search:hover {
    background: #E5E7EB;
  }

  .upgrade-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, #6355FF 0%, #5346E0 100%);
    color: white;
    border: none;
    border-radius: 100px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .upgrade-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(99, 85, 255, 0.3);
  }

  .premium-badge {
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .blurred-job-card {
    position: relative;
  }
  
  .blurred-job-card .card-header {
    filter: blur(0px) !important;
    opacity: 1 !important;
    position: relative;
    z-index: 10;
    background: white;
    isolation: isolate;
  }
  
  .blurred-job-card .company-logo,
  .blurred-job-card .rate-badge {
    filter: blur(0px) !important;
    opacity: 1 !important;
    position: relative;
    z-index: 10;
    isolation: isolate;
  }
  
  .blurred-job-card .rate-badge {
    background: linear-gradient(135deg, #10B981, #059669);
    color: white;
    border: 1px solid #059669;
    box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
  }
  
  .blurred-job-card:hover .rate-badge {
    border-color: #047857;
    box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
  }
  
  .blurred-job-card .company-logo img {
    filter: blur(0px) !important;
    opacity: 1 !important;
  }
  
  .blurred-job-card .demo-image-container,
  .blurred-job-card .card-content,
  .blurred-job-card .action-row {
    filter: blur(8px);
    opacity: 0.6;
  }
  
  .blur-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.3);
    z-index: 1;
    pointer-events: none;
    margin-top: 92px;
  }
  
  .center-upgrade-button-container {
    position: absolute;
    top: 50%;
    left: calc(25% + 250px); /* Significantly increased space from the left */
    transform: translate(-50%, -50%);
    width: 100%;
    pointer-events: none;
    padding: 0 1rem;
    max-width: 300px;
    z-index: 10;
  }
  
  .center-upgrade-button {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.75rem;
    background: linear-gradient(135deg, #6355FF 0%, #5346E0 100%);
    color: white;
    border: none;
    border-radius: 100px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 8px 16px rgba(99, 85, 255, 0.3);
    transition: all 0.2s ease;
    white-space: nowrap;
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    .center-upgrade-button-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
      transform: none;
      margin: 0;
      padding: 0;
      max-width: none;
      background: white;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    }
    
    .center-upgrade-button {
      width: 100%;
      max-width: none;
      margin: 0;
      height: 56px;
      border-radius: 0;
      padding: 0.75rem 1.5rem;
      font-size: 0.9375rem;
      box-shadow: none;
    }
  }
  
  .center-upgrade-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 20px rgba(99, 85, 255, 0.4);
  }
  
  .center-upgrade-button:active {
    transform: translateY(0);
    box-shadow: 0 6px 12px rgba(99, 85, 255, 0.3);
  }

  .desktop-job-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
  }
  
  .job-list-container {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 1rem 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
    gap: 1rem;
  }
  
  .job-list-container::-webkit-scrollbar {
    display: none;
  }
  
  .desktop-scroll-controls {
    display: flex;
    justify-content: space-between;
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    pointer-events: none;
    padding: 0 1rem;
  }
  
  .scroll-button {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
  
  .scroll-button:hover {
    background: #f9fafb;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .scroll-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .mobile-job-slider {
    width: 100%;
    position: relative;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .mobile-job-slider::-webkit-scrollbar {
    display: none;
  }
  
  .slider-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .mobile-job-slider .job-card {
    width: 100%;
    max-width: 100%;
    margin: 0;
    display: block;
  }

  @media (min-width: 769px) {
    .mobile-job-slider {
      display: none;
    }
    
    .desktop-job-list {
      display: flex;
    }
    
    .desktop-scroll-controls {
      display: flex;
    }
  }
  
  @media (max-width: 768px) {
    .desktop-job-list {
      display: none;
    }
    
    .mobile-job-slider {
      display: block;
      padding: 0;
      height: calc(100vh - 120px); /* Adjust based on your header height */
    }
    
    .desktop-scroll-controls {
      display: none !important;
    }
    
    .jobs-header .scroll-buttons {
      display: none !important;
    }
    
    .slider-container {
      padding: 0;
    }
    
    .job-card:active {
      transform: scale(0.98);
    }
  }
</style> 