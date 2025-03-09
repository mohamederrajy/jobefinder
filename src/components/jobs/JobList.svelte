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
  
  // Watch for subscription changes
  $: if ($subscription?.subscription?.isPaid && mounted) {
    fetchJobs(); // Refetch jobs when subscription becomes paid
  }

  onMount(() => {
    mounted = true;
    if ($user?.token) {
      fetchJobs();
    }
  });

  // Modify the fetchJobs function to set the first job ID
  async function fetchJobs() {
    try {
      loading = true;
      error = null;

      const endpoint = $subscription?.subscription?.isPaid ? '/jobs' : '/jobs/preview';
      
      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'x-auth-token': $user.token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      allJobs = await response.json();
      filteredJobs = allJobs;
      console.log('Loaded jobs:', allJobs.length);
      
      // Set the first job ID for preview (if there are jobs and user doesn't have paid subscription)
      if (allJobs.length > 0 && !$subscription?.subscription?.isPaid) {
        firstJobId = allJobs[0]._id;
      }

    } catch (err) {
      console.error('Error fetching jobs:', err);
      error = 'Failed to load jobs';
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

  function handleUpgradeClick() {
    if (!$subscription?.subscription?.isPaid) {
      showSubscriptionModal = true;
    }
  }

  function handleSubscribed() {
    showSubscriptionModal = false;
    fetchJobs(); // Refresh jobs after subscription
  }

  function handleJobClick(jobId: string) {
    window.location.href = `/dashboard/jobs/${jobId}`;
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

  // Modify the job card rendering to check if it's the first job
  function shouldShowPreview(job: Job): boolean {
    if ($subscription?.subscription?.isPaid) return false;
    if (!job._id) return true;
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

  // Add this function to determine if a job should be blurred
  function shouldBlurJob(job: Job): boolean {
    // Check if this is a preview job and user doesn't have premium
    return shouldShowPreview(job) && !($subscription?.subscription?.isPaid);
  }
  
  // Add this function to handle clicks on blurred jobs
  function handleBlurredJobClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    handleUpgradeClick();
  }

  // Add this function to determine if we should show the premium overlay
  function shouldShowPremiumOverlay(): boolean {
    return !($subscription?.subscription?.isPaid) && filteredJobs.length > 1;
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
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="jobs-container">
  {#if loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <span>Loading jobs...</span>
    </div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if filteredJobs.length === 0}
    <div class="no-jobs">
      {#if searchQuery || searchLocation}
        No jobs found matching your search
      {:else}
        No jobs available
      {/if}
    </div>
  {:else}
  <div class="jobs-header">
      <div class="header-content">
        <h2>Latest Jobs {#if searchQuery || searchLocation}({filteredJobs.length} found){/if}</h2>
        
        {#if !$subscription?.subscription?.isPaid}
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
            {#if !$subscription?.subscription?.isPaid && !job._id}
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

            <!-- Add upgrade button overlay for blurred cards -->
            {#if shouldBlurJob(job)}
              <div class="blur-overlay">
                <button class="blur-upgrade-btn" on:click={handleUpgradeClick}>
                  Upgrade to Premium
                </button>
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
      <div class="slider-container" 
           on:touchstart={handleTouchStart}
           on:touchmove={handleTouchMove}
           on:touchend={handleTouchEnd}>
        {#each filteredJobs as job, i}
          <div class="slider-slide {i === currentSlide ? 'active' : ''}">
            <div 
              class="job-card"
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
              {#if !$subscription?.subscription?.isPaid && !job._id}
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

              <!-- Add upgrade button overlay for blurred cards -->
              {#if shouldBlurJob(job)}
                <div class="blur-overlay">
                  <button class="blur-upgrade-btn" on:click={handleUpgradeClick}>
                    Upgrade to Premium
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      
      <!-- Mobile slider controls -->
      {#if filteredJobs.length > 1}
        <div class="slider-controls">
          <button 
            class="slider-arrow" 
            on:click={prevSlide} 
            disabled={currentSlide === 0}
            aria-label="Previous job"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          
          <div class="slider-dots">
            {#each filteredJobs as _, i}
              <button 
                class="slider-dot {i === currentSlide ? 'active' : ''}" 
                on:click={() => goToSlide(i)}
                aria-label="Go to slide {i + 1}"
              ></button>
            {/each}
          </div>
          
          <button 
            class="slider-arrow" 
            on:click={nextSlide} 
            disabled={currentSlide === filteredJobs.length - 1}
            aria-label="Next job"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      {/if}
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
</div>

<style>
  .jobs-container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 24px;
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
    border-radius: 20px;
    padding: 24px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 
                0 4px 6px rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;
    border: 1px solid #E5E7EB;
    cursor: pointer;
  }

  .job-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    border-color: #D1D5DB;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #E5E7EB;
  }

  .header-content {
    flex: 1;
  }

  .job-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
    line-height: 1.4;
    letter-spacing: -0.01em;
  }

  .company-info {
    padding: 20px 0;
    border-bottom: 1px solid #E5E7EB;
  }

  .company-name {
    font-size: 1rem;
    font-weight: 600;
    color: #4B5563;
    margin-bottom: 12px;
  }

  .meta-info {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 8px;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .rate-badge {
    display: inline-flex;
    align-items: center;
    background: #F0FDF4;
    color: #059669;
    padding: 6px 12px;
    border-radius: 100px;
    font-weight: 600;
    font-size: 0.875rem;
    border: 1px solid #D1FAE5;
  }

  .currency {
    color: #64748B;
    font-weight: 600;
    font-size: 15px;
  }

  .rate-period {
    color: #64748B;
    font-weight: 500;
    font-size: 14px;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6B7280;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    margin-top: 4px;
  }

  .distance {
    color: #111827;
    font-weight: 500;
    margin-left: auto;
  }

  .tags-wrapper {
    margin: 12px 0;
    min-height: 32px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 4px 0;
  }

  .tags-wrapper::-webkit-scrollbar {
    display: none;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background: #F3F4F6;
    color: #4B5563;
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid #E5E7EB;
  }

  .tag.urgent {
    background: #FEF2F2;
    color: #DC2626;
    border-color: #FEE2E2;
    font-weight: 600;
  }

  .action-row {
    display: flex;
    gap: 12px;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid #F3F4F6;
  }

  .apply-button {
    flex: 1;
    padding: 14px 24px;
    background: linear-gradient(135deg, #4F46E5 0%, #6355FF 100%);
    color: white;
    border: none;
    border-radius: 100px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  }

  .apply-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
    background: linear-gradient(135deg, #4338CA 0%, #5145E6 100%);
  }

  .favorite-button {
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    color: #D1D5DB;
    transition: color 0.2s ease;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .favorite-button:hover {
    color: #EC4899;
  }

  .favorite-button.active {
    color: #EC4899;
  }

  .favorite-button.active path {
    fill: currentColor;
  }

  .heart-icon {
    width: 20px;
    height: 20px;
  }

  /* Update responsive styles */
  @media (max-width: 768px) {
    .jobs-header {
      flex-direction: column;
      align-items: stretch;
    }

    .header-content {
      width: auto;
    }

    .scroll-buttons {
      align-self: center;
      margin-top: 1rem;
    }

    .upgrade-btn {
      width: 100%;
      justify-content: center;
    }

    .jobs-container {
      padding: 16px;
    }

    .jobs-grid {
      display: block; /* Change from flex to block */
      overflow: visible;
      padding-bottom: 40px; /* Space for pagination dots */
    }
    
    .job-card {
      width: 100%;
      min-width: 100%;
      margin: 0 auto;
      flex: none;
      display: none; /* Hide all cards by default */
    }
    
    .job-card.active {
      display: block; /* Only show the active card */
    }
    
    /* Improve slider controls */
    .slider-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 24px;
      gap: 16px;
      position: relative;
      z-index: 20;
    }
    
    .slider-arrow {
      background: white;
      border: 1px solid #E5E7EB;
      color: #6B7280;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
    }
    
    .slider-arrow:hover:not(:disabled) {
      background: #F9FAFB;
      color: #4B5563;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .slider-arrow:active:not(:disabled) {
      transform: translateY(0);
    }
    
    .slider-arrow:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    .slider-dots {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .slider-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #E5E7EB;
      border: none;
      padding: 0;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .slider-dot.active {
      background: #6355FF;
      width: 24px;
      border-radius: 4px;
    }
    
    /* Hide the duplicate controls */
    .mobile-controls-top {
      display: none;
    }
    
    /* Job counter for better navigation */
    .job-counter {
      position: absolute;
      top: -40px;
      right: 16px;
      background: rgba(255, 255, 255, 0.9);
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 0.8rem;
      color: #4B5563;
      font-weight: 500;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }
    
    /* Improve swipe experience */
    .jobs-grid {
      touch-action: pan-y;
      position: relative;
    }
    
    /* Add swipe hint animation */
    .swipe-hint {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.9);
      padding: 12px 20px;
      border-radius: 100px;
      font-size: 0.9rem;
      color: #4B5563;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      pointer-events: none;
      animation: fadeOut 3s forwards;
      z-index: 30;
    }
    
    @keyframes fadeOut {
      0% { opacity: 1; }
      70% { opacity: 1; }
      100% { opacity: 0; }
    }
    
    .swipe-icon {
      animation: swipeAnimation 1.5s infinite;
    }
    
    @keyframes swipeAnimation {
      0% { transform: translateX(0); }
      50% { transform: translateX(6px); }
      100% { transform: translateX(0); }
    }
  }
  
  @media (max-width: 480px) {
    .slider-arrow {
    width: 40px;
    height: 40px;
    }
    
    .slider-arrow svg {
      width: 18px;
      height: 18px;
    }
    
    .slider-dot {
      width: 6px;
      height: 6px;
    }
    
    .slider-dot.active {
      width: 20px;
    }
    
    .job-counter {
      font-size: 0.75rem;
      padding: 3px 10px;
    }
  }

  .preview {
    filter: blur(2px);
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
    gap: 12px;
    padding: 40px;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #6355FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    color: #dc2626;
    text-align: center;
    padding: 20px;
  }

  .no-jobs {
    text-align: center;
    padding: 40px;
    color: #6b7280;
  }

  :global(body) {
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* Update company logo styles */
  .company-logo {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border: 1px solid #E5E7EB;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .company-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: white;
    transition: all 0.2s ease;
  }

  .company-initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .zip-code {
    color: #4B5563;
    margin-left: 4px;
    font-weight: 500;
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

  /* Professional card internal styling */
  .job-card {
    padding: 24px;
  }

  /* Card sections with borders */
  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #E5E7EB;
  }

  .header-content {
    flex: 1;
  }

  .job-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
    line-height: 1.4;
    letter-spacing: -0.01em;
  }

  .company-info {
    padding: 20px 0;
    border-bottom: 1px solid #E5E7EB;
  }

  .company-name {
    font-size: 1rem;
    font-weight: 600;
    color: #4B5563;
    margin-bottom: 12px;
  }

  .meta-info {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 8px;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .rate-badge {
    display: inline-flex;
    align-items: center;
    background: #F0FDF4;
    color: #059669;
    padding: 6px 12px;
    border-radius: 100px;
    font-weight: 600;
    font-size: 0.875rem;
    border: 1px solid #D1FAE5;
  }

  /* Tags section */
  .tags-section {
    padding: 20px 0;
    border-bottom: 1px solid #E5E7EB;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background: #F3F4F6;
    color: #4B5563;
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid #E5E7EB;
  }

  .tag.urgent {
    background: #FEF2F2;
    color: #DC2626;
    border-color: #FEE2E2;
    font-weight: 600;
  }

  /* Footer section */
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 20px;
    margin-top: 20px;
    border-top: 1px solid #E5E7EB;
  }

  .posted-date {
    color: #6B7280;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Enhance typography */
  .job-card * {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* Add these styles for enhanced blur effect */
  .blurred-job-card {
    position: relative;
    filter: blur(8px);
    opacity: 0.6;
    pointer-events: none;
  }
  
  .blur-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.3);
    z-index: 10;
    pointer-events: auto;
  }
  
  .blur-upgrade-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #6355FF 0%, #5346E0 100%);
    color: white;
    border: none;
    border-radius: 100px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.4);
    z-index: 20;
  }

  /* Add these styles for the centered upgrade button */
  .jobs-container {
    position: relative;
  }
  
  .center-upgrade-button-container {
    position: absolute;
    top: 400px; /* Position after the first job card on desktop */
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 90%; /* Limit width on larger screens */
    max-width: 320px;
  }
  
  .center-upgrade-button {
    display: flex;
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
    justify-content: center;
  }
  
  .center-upgrade-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 20px rgba(99, 85, 255, 0.4);
  }
  
  .center-upgrade-button:active {
    transform: translateY(0);
    box-shadow: 0 6px 12px rgba(99, 85, 255, 0.3);
  }
  
  .upgrade-message {
    margin-top: 0.75rem;
    color: #4B5563;
    font-size: 0.875rem;
    font-weight: 500;
    background: white;
    padding: 0.5rem 1rem;
    border-radius: 100px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    text-align: center;
    width: 100%;
  }
  
  /* Media queries for responsive design */
  @media (max-width: 768px) {
    .center-upgrade-button-container {
      top: auto;
      bottom: 20px;
      z-index: 50;
    }
    
    .center-upgrade-button {
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
    }
    
    .upgrade-message {
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
    }
  }
  
  @media (max-width: 480px) {
    .center-upgrade-button-container {
      top: 280px; /* Further adjust for smaller screens */
      width: 90%;
      max-width: 240px;
    }
    
    .center-upgrade-button {
      padding: 0.625rem 1.25rem;
      font-size: 0.85rem;
      gap: 0.5rem;
    }
    
    .center-upgrade-button svg {
      width: 18px;
      height: 18px;
    }
    
    .upgrade-message {
      margin-top: 0.5rem;
      font-size: 0.75rem;
    }
  }

  /* Desktop job list styles */
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
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    gap: 1rem;
  }
  
  .job-list-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
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

  /* Mobile slider styles - updated */
  .mobile-job-slider {
    width: 100%;
    position: relative;
  }
  
  .slider-container {
    width: 100%;
    transition: transform 0.3s ease;
    touch-action: pan-x;
  }
  
  .slider-slide {
    width: 100%;
    flex-shrink: 0;
    transition: opacity 0.3s ease;
  }
  
  .slider-slide.active {
    display: block;
  }
  
  .slider-slide:not(.active) {
    display: none;
  }
  
  /* Make sure job cards in mobile view are properly styled */
  .mobile-job-slider .job-card {
    width: 100%;
    max-width: 100%;
    margin: 0;
    display: block;
  }

  /* Media queries to show/hide appropriate controls */
  @media (min-width: 769px) {
    .mobile-job-slider {
      display: none; /* Hide mobile slider on desktop */
    }
    
    .desktop-job-list {
      display: flex; /* Show desktop job list on desktop */
    }
    
    .desktop-scroll-controls {
      display: flex; /* Show desktop scroll controls on desktop */
    }
  }
  
  @media (max-width: 768px) {
    .desktop-job-list {
      display: none; /* Hide desktop job list on mobile */
    }
    
    .mobile-job-slider {
      display: block; /* Show mobile slider on mobile */
    }
    
    .desktop-scroll-controls {
      display: none !important; /* Hide desktop scroll controls on mobile */
    }
    
    /* Hide the scroll buttons in the header on mobile */
    .jobs-header .scroll-buttons {
      display: none !important;
    }

    /* Add momentum scrolling for iOS */
    .slider-container {
      -webkit-overflow-scrolling: touch;
    }
    
    /* Make slider controls more touch-friendly */
    .slider-arrow {
      width: 44px;
      height: 44px;
    }
    
    /* Add visual feedback for touch */
    .job-card:active {
      transform: scale(0.98);
    }
  }
</style> 