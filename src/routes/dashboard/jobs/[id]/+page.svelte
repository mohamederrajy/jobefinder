<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { page } from '$app/stores';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../../../stores/userStore';
  import { goto } from '$app/navigation';
  import DashboardNav from '../../../../components/dashboard/DashboardNav.svelte';
  import Footer from '../../../../components/footer/Footer.svelte';
  import { subscription } from '../../../../stores/subscriptionStore';
  import SubscriptionModal from '../../../../components/modals/SubscriptionModal.svelte';
  import DiscoverJobList from '../../../../components/jobs/JobList.svelte';

  interface Job {
    _id: string;
    id: string;
    title: string;
    company: {
      name: string;
      website?: string;
      _id?: string;
    logo?: string;
    };
    logo?: string; // Keep this for backward compatibility
    about: string;
    jobUrl?: string;
    contactDetails?: {
      name: string;
      email: string;
      phone: string;
    };
    hourlyRate: number;
    address: {
      street?: string;
      city: string;
      state?: string;
      zipCode?: string;
    };
    tags: string[];
    isUrgent: boolean;
    createdAt: string;
    createdBy?: {
      email: string;
    };
    _addedToRecent?: boolean;
    salary?: number;
    compensation?: number;
    salaryRange?: number;
    jobType?: string;
    employmentType?: string;
    type?: string;
    description?: string;
    location?: string;
    applicationUrl?: string;
    contactEmail?: string;
  }

  // Define type for tag colors
  type TagColorType = {
    [key in 'software' | 'engineering' | 'frontend' | 'backend' | 'fullstack']: {
      bg: string;
      text: string;
    };
  };

  let job: Job | null = null;
  let loading = true;
  let error: string | null = null;
  let similarJobs: Job[] = [];
  let showSubscriptionModal = false;
  let mounted = false;
  let showFullDescription = false;
  const MAX_PREVIEW_LENGTH = 300; // Characters to show in preview
  let jobId: string;

  // Function to get user identifier
  function getUserIdentifier() {
    if ($user && $user.id) return $user.id;
    if ($user && $user.email) return $user.email; // Use email as fallback
    return null;
  }

  onMount(async () => {
    jobId = $page.params.id;
    if (jobId) {
      await Promise.all([
        fetchJob(jobId),
        fetchSimilarJobs(jobId)
      ]);
    }
    mounted = true;
    
    // After job details are loaded, add this job to recently viewed
    if (job && $user) {
      console.log("Adding job to recently viewed:", job.id);
      addToRecentlyViewed(job);
    } else {
      console.log("Not adding to recently viewed. Job:", !!job, "User:", !!$user);
    }
  });

  // Move fetchSimilarJobs outside onMount
  async function fetchSimilarJobs(jobId: string) {
    try {
      if (!jobId) return;
      
      const response = await fetch(`${PUBLIC_API_URL}/jobs/preview`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${$user?.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch similar jobs');

      const data = await response.json();
      // Filter out current job and get 3 random jobs as similar
      const otherJobs = data.filter((j: Job) => j._id !== jobId);
      // Shuffle array to get random jobs
      const shuffled = otherJobs.sort(() => 0.5 - Math.random());
      // Get first 3 jobs
      similarJobs = shuffled.slice(0, 3);
      console.log('Fetched similar jobs:', similarJobs);
    } catch (err) {
      console.error('Error fetching similar jobs:', err);
      similarJobs = [];
    }
  }

  async function fetchJob(id: string) {
    try {
      loading = true;
      error = null;
      
      // Make sure we're sending the proper authorization header
      const response = await fetch(`${PUBLIC_API_URL}/jobs/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''  // Make sure to use the correct header name
        }
      });

      if (!response.ok) throw new Error('Failed to fetch job');
      
      job = await response.json();
      
      console.log('Job data received:', job);
      if (job) {
      console.log('Has contactDetails:', !!job.contactDetails);
      console.log('Has jobUrl:', !!job.jobUrl);
      }
    } catch (err) {
      console.error('Error fetching job:', err);
      error = 'Failed to load job details';
    } finally {
      loading = false;
    }
  }

  // Add handleApply function
  async function handleApply() {
    if (!$subscription?.subscription?.isPaid) {
      showSubscriptionModal = true;
      return;
    }
    
    try {
      const response = await fetch(`${PUBLIC_API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'x-auth-token': $user?.token || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply for job');
      }
      
      // Handle successful application
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying for job:', err);
      alert('Failed to submit application. Please try again.');
    }
  }

  // Add getPreviewText function
  function getPreviewText(text: string) {
    if (!text) return '';
    return text.length > MAX_PREVIEW_LENGTH 
      ? text.substring(0, MAX_PREVIEW_LENGTH) + '...' 
      : text;
  }

  // Add toggleDescription function
  function toggleDescription() {
    showFullDescription = !showFullDescription;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatSalary(hourlyRate: number) {
    return `Starting at $${hourlyRate.toFixed(2)}`;
  }

  function formatDaysAgo(dateString: string) {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days ago`;
  }

  function handleUpgradeClick() {
    showSubscriptionModal = true;
  }

  // Add these helper functions for company colors and tags
  function getCompanyInitials(company: string): string {
    const words = company.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return company.substring(0, 2).toUpperCase();
  }

  const bgColors = [
    { bg: '#4F46E5', text: '#FFFFFF' }, // Indigo
    { bg: '#0EA5E9', text: '#FFFFFF' }, // Sky
    { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
    { bg: '#EC4899', text: '#FFFFFF' }, // Pink
    { bg: '#10B981', text: '#FFFFFF' }  // Emerald
  ];

  function getCompanyColor(company: string) {
    const hash = company.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return bgColors[hash % bgColors.length];
  }

  const tagColors: TagColorType = {
    'software': { bg: '#EFF6FF', text: '#2563EB' },
    'engineering': { bg: '#F0FDF4', text: '#16A34A' },
    'frontend': { bg: '#FEF3C7', text: '#D97706' },
    'backend': { bg: '#F3E8FF', text: '#7C3AED' },
    'fullstack': { bg: '#ECFDF5', text: '#059669' }
  };

  function getTagColor(tag: string) {
    const normalizedTag = tag.toLowerCase() as keyof TagColorType;
    return tagColors[normalizedTag] || { bg: '#F3F4F6', text: '#4B5563' };
  }

  // Remove the fetchSimilarJobs reference since we're not using it
  function handleSubscribed() {
    showSubscriptionModal = false;
    console.log('Subscription updated - Modal closed');
    
    // Refresh subscription status
    fetch(`${PUBLIC_API_URL}/users/subscription`, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': $user?.token || ''
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log('Updated subscription data:', data);
      subscription.set(data);
    })
    .catch(err => console.error('Error updating subscription:', err));
  }

  // Add this function to get a default company image
  function getDefaultCompanyImage(company: { name: string } | null | undefined): string {
    const companyName = company?.name || 'Company';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=6355FF&color=fff&size=256&bold=true&font-size=0.33`;
  }

  // Add this function to handle image errors
  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (job && job.company) {
      img.src = getDefaultCompanyImage(job.company);
    }
  }

  // Add this function to check if user is a paid subscriber
  function isPaidSubscriber() {
    // For debugging
    console.log("Subscription data:", $subscription);
    
    // Check if the user is an admin (they should always see contact info)
    if ($user?.isAdmin) {
      console.log("User is admin, showing contact info");
      return true;
    }
    
    // Check if the user has a paid subscription
    // The structure might be different than what we expected
    const hasPaidSubscription = 
      $subscription?.isPaid === true || 
      $subscription?.subscription?.isPaid === true;
    
    console.log("User has paid subscription:", hasPaidSubscription);
    return hasPaidSubscription;
  }
  
  // Add this reactive statement to log when job data changes
  $: if (job) {
    console.log("Job data updated:", job);
    console.log("Has contact details:", !!job.contactDetails);
    console.log("Has job URL:", !!job.jobUrl);
    console.log("Is paid subscriber:", isPaidSubscriber());
  }

  function addToRecentlyViewed(job: Job) {
    try {
      if (!job) return;
      
      const recentJobsJson = localStorage.getItem('recentlyViewedJobs');
      let recentJobs = recentJobsJson ? JSON.parse(recentJobsJson) : [];
      
      const recentJob = {
        id: job._id,
        title: job.title,
        companyName: job.company?.name || '',
        companyLogo: job.logo,
        location: job.location || `${job.address?.city || ''}, ${job.address?.state || ''}`,
        salary: job.salary || job.compensation || job.salaryRange || "$50,000 - $70,000",
        jobType: job.jobType || job.employmentType || job.type || "Full-time",
        description: job.description,
        userId: getUserIdentifier(),
        viewedAt: new Date().toISOString()
      };
      
      recentJobs = recentJobs.filter((item: any) => !(item.id === recentJob.id && item.userId === getUserIdentifier()));
      recentJobs.unshift(recentJob);
      
      if (recentJobs.length > 20) {
        recentJobs = recentJobs.slice(0, 20);
      }
      
      localStorage.setItem('recentlyViewedJobs', JSON.stringify(recentJobs));
      
      const event = new CustomEvent('recentlyViewedJobsUpdated', {
        detail: { count: recentJobs.filter((job: any) => job.userId === getUserIdentifier()).length }
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Error saving recently viewed job:', err);
    }
  }

  // Use afterUpdate to ensure job is loaded
  afterUpdate(() => {
    const userId = getUserIdentifier();
    if (job && userId && !job._addedToRecent) {
      console.log("Job loaded and ready to add to recently viewed:", job);
      job._addedToRecent = true;
      addToRecentlyViewed(job);
    }
  });

  // Test function
  function testAddDummyJob() {
    const userId = getUserIdentifier();
    if (!userId) {
      alert("No user identifier available!");
      return;
    }
    
    const dummyJob = {
      id: "test-job-" + Date.now(),
      title: "Test Job Title",
      companyName: "Test Company",
      companyLogo: null,
      location: "Test Location",
      salary: "$100,000",
      jobType: "Full-time",
      description: "This is a test job description to verify the recently viewed jobs functionality.",
      userId: userId,
      viewedAt: new Date().toISOString()
    };
    
    // Get existing recently viewed jobs
    const recentJobsJson = localStorage.getItem('recentlyViewedJobs');
    let recentJobs = recentJobsJson ? JSON.parse(recentJobsJson) : [];
    
    // Add the job to the beginning of the array
    recentJobs.unshift(dummyJob);
    
    // Save back to localStorage
    localStorage.setItem('recentlyViewedJobs', JSON.stringify(recentJobs));
    console.log("Added dummy job to recently viewed:", dummyJob);
    
    alert("Dummy job added to recently viewed jobs!");
  }

  // Add this function to your script section
  function getApplyLink() {
    if (!job) return '#';
    
    if (job.applicationUrl) return job.applicationUrl;
    if (job.contactEmail) return `mailto:${job.contactEmail}?subject=Application for ${job.title} position`;
    if (job.company.website) return job.company.website;
    if (job.company._id) return `/companies/${job.company._id}`;
    
    return '#';
  }

  // Function to check if we should show blur overlay
  function shouldShowBlurOverlay() {
    return !$subscription?.isPaid && similarJobs.length > 2;
  }

  // Function to get displayed jobs based on subscription status
  $: displayedJobs = $subscription?.isPaid ? similarJobs : similarJobs.slice(0, 2);
</script>

<div class="page-wrapper">
  {#if mounted}
    <DashboardNav />
  {/if}

  <div class="page-content">
    <div class="container">
      

      <div class="job-details-page">
        {#if loading}
          <div class="loading">
            <div class="loading-spinner"></div>
            <span>Loading job details...</span>
          </div>
        {:else if error}
          <div class="error">
            <p>{error}</p>
            <button class="back-button" on:click={() => goto('/jobs')}>
              Back to Jobs
            </button>
          </div>
        {:else if job}
          <!-- Full width job header -->
          <div class="job-header">
            <div class="header-accent"></div>
            <div class="container">
              <div class="job-header-content">
                <div class="job-header-main">
                  <!-- Left section - Company branding -->
                  <div class="header-left">
                  <div class="company-branding">
                    <div class="company-logo-wrapper">
                        <div class="logo-background"></div>
                      <img  
                        src={job?.logo || getDefaultCompanyImage(job?.company || '')}
                          alt={`${job?.company?.name} logo`}
                        on:error={(e) => handleImageError(e)}
                        class="company-logo-img"
                      />
                        <div class="logo-shine"></div>
                    </div>
                      {#if job?.isUrgent}
                        <div class="status-badge">
                          <div class="badge-content">
                          <div class="pulse-dot"></div>
                            <span>Actively Hiring</span>
                          </div>
                        </div>
                      {/if}
                    </div>
                    </div>
                    
                  <!-- Middle section - Job details -->
                  <div class="header-middle">
                    <div class="title-section">
                      <h1 class="job-title">
                        <span class="title-text">{job?.title}</span>
                        {#if job?.isUrgent}
                          <span class="featured-tag">Featured</span>
                        {/if}
                      </h1>
                      
                      <div class="company-info">
                        <a href="/companies/{job?.company?._id}" class="company-name">
                          <span>{job?.company?.name}</span>
                          <svg class="company-link-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M10 6v2H5v11h11v-5h2v6c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h6zm11-3v8h-2V6.41l-7.29 7.3-1.42-1.42L17.59 5H13V3h8z"/>
                          </svg>
                        </a>
                        <div class="company-rating">
                          <div class="stars">
                            {#each Array(5) as _, i}
                              <svg class={i < 4 ? 'star filled' : 'star'} viewBox="0 0 24 24" width="16" height="16">
                                <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            {/each}
                          </div>
                          <span class="rating-count">(128 reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div class="meta-section">
                      <div class="meta-tags">
                        <div class="meta-tag location" title="Location">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
                        </svg>
                          <span>{job?.address?.city}, {job?.address?.state}</span>
                      </div>
                      
                        <div class="meta-tag salary" title="Salary">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                        </svg>
                        <span>${job?.hourlyRate.toFixed(2)}/hr</span>
                      </div>
                      
                        <div class="meta-tag job-type" title="Job Type">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                        </svg>
                        <span>{job?.jobType || 'Full-time'}</span>
                      </div>
                      
                        <div class="meta-tag posted" title="Posted Date">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                          <span>{formatDaysAgo(job?.createdAt || '')}</span>
                      </div>
                    </div>
                    
                    {#if job?.tags && job?.tags.length > 0}
                        <div class="skills-section">
                          <div class="skills-wrapper">
                        {#each job?.tags.slice(0, 5) as tag}
                              <span class="skill-tag">
                                <span class="skill-dot"></span>
                                {tag}
                              </span>
                        {/each}
                        {#if job?.tags.length > 5}
                              <button class="more-skills">
                                +{job?.tags.length - 5} more
                                <div class="skills-tooltip">
                                  {#each job?.tags.slice(5) as tag}
                                    <span class="tooltip-tag">{tag}</span>
                                  {/each}
                                </div>
                              </button>
                        {/if}
                          </div>
                      </div>
                    {/if}
                    </div>
                  </div>
                  
                  <!-- Right section - Actions -->
                  <div class="header-right">
                    <div class="actions-wrapper">
                      <div class="action-buttons">
                        {#if job.jobUrl}
                          <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" class="apply-button">
                            Apply Now
                            <svg viewBox="0 0 24 24" width="20" height="20">
                              <path fill="currentColor" d="M5 5v14h14v-7h2v7c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h7v2H5zm9 0V3h7v7h-2V6.41l-7.29 7.29-1.41-1.41L17.59 5H14z"/>
                            </svg>
                          </a>
                        {:else}
                          <button 
                            class="apply-button"
                            on:click={() => {
                              const contactSection = document.querySelector('#contact-info');
                              if (contactSection) {
                                contactSection.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                          >
                            Apply Now
                      <svg viewBox="0 0 24 24" width="20" height="20">
                              <path fill="currentColor" d="M5 5v14h14v-7h2v7c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h7v2H5zm9 0V3h7v7h-2V6.41l-7.29 7.29-1.41-1.41L17.59 5H14z"/>
                      </svg>
                    </button>
                        {/if}
                      </div>
                      
                      <div class="secondary-actions">
                        <button class="action-btn save-btn" title="Save Job">
                          <div class="btn-content">
                            <svg viewBox="0 0 24 24" width="22" height="22">
                          <path fill="currentColor" d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
                        </svg>
                        <span>Save</span>
                          </div>
                          <div class="btn-background"></div>
                      </button>
                      
                        <button class="action-btn share-btn" title="Share Job">
                          <div class="btn-content">
                            <svg viewBox="0 0 24 24" width="22" height="22">
                          <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                        </svg>
                        <span>Share</span>
                          </div>
                          <div class="btn-background"></div>
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Two column layout -->
          <div class="two-column-layout">
            <!-- Left column - Compare Pay -->
            <div class="pay-comparison-section">
              <div class="pay-header">
                <h2>Compare Pay</h2>
                <div class="estimated-pay">
                  Estimated Pay 
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
                  </svg>
                </div>
              </div>

              <p class="pay-estimate">We estimate that this job pays <span class="highlight">${job.hourlyRate}</span> per hour based on our data.</p>

              <div class="pay-chart">
                <div class="chart-bars">
                  {#each [11.00, 11.42, 11.84, 12.26, job.hourlyRate, 13.10, 13.52, 13.94, 14.12] as rate, i}
                    <div class="bar-container">
                      <div class="bar" class:active={i === 4} style="height: {40 + (i * 7.5)}%">
                        <div class="bar-value">${rate.toFixed(2)}</div>
                      </div>
                    </div>
                  {/each}
                </div>
                <div class="chart-range">
                  <span>$11.00</span>
                  <span>$14.12</span>
                </div>
              </div>
            </div>

            <!-- Right column - At a glance -->
            <div class="job-overview">
              <div class="at-glance-section">
                <h2>At a glance</h2>
                <div class="glance-items">
                  <div class="glance-item">
                    <div class="glance-label">
                      Estimated Pay 
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
                      </svg>
                    </div>
                    <div class="glance-value">${job.hourlyRate} per hour</div>
                  </div>

                  <div class="glance-item">
                    <div class="glance-label">Hours</div>
                    <div class="glance-value">Full-time, Part-time</div>
                  </div>

                  <div class="glance-item">
                    <div class="glance-label">Location</div>
                    <div class="glance-value location-value">
                      {job.address.street}
                      <br />
                      {job.address.city}, {job.address.state}
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M10 6v2H5v11h11v-5h2v6c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h6zm11-3v8h-2V6.41l-7.29 7.3-1.42-1.42L17.59 5H13V3h8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- About this job section -->
          <div class="two-column-layout">
            <!-- Left column - About section -->
            <div class="about-section">
              <div class="about-card">
                <h2>About this job</h2>
                <div class="about-content">
                  {#if showFullDescription}
                    {@html job.about}
                    <button class="show-less-btn" on:click={toggleDescription}>
                      Show Less
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                      </svg>
                    </button>
                  {:else}
                    {@html getPreviewText(job.about)}
                    <button class="show-more-btn" on:click={toggleDescription}>
                      Show More
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
                      </svg>
                    </button>
                  {/if}
                </div>
              </div>
              
              <!-- Contact Information section -->
              {#if job?.contactDetails || job?.jobUrl}
                <div id="contact-info" class="job-section">
                  <div class="section-header">
                    <div class="section-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <h2>Contact Information</h2>
                  </div>
                  <div class="section-content">
                    {#if job.contactDetails}
                      <div class="contact-details">
                      <div class="contact-item">
                          <span class="label">Name:</span>
                          <span class="value">{job.contactDetails.name}</span>
                        </div>
                      <div class="contact-item">
                          <span class="label">Email:</span>
                          <span class="value">{job.contactDetails.email}</span>
                        </div>
                      <div class="contact-item">
                          <span class="label">Phone:</span>
                          <span class="value">{job.contactDetails.phone}</span>
                        </div>
                        </div>
                    {:else}
                      <p class="no-contact">No contact information available</p>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>

            <!-- Right column - Similar Jobs -->
            <div class="right-column">
              <div class="similar-jobs-card">
                <h2>You might also like</h2>
                <div class="similar-jobs-container">
                  <div class="similar-jobs-list">
                    {#if similarJobs.length > 0}
                      {#each similarJobs.slice(0, 3) as similarJob, i}
                        <!-- Remove the blur condition from the card class -->
                        <div class="similar-job-card">
                          <div class="job-content">
                            <div class="job-card-header">
                              <div class="company-logo">
                                <img 
                                  src={similarJob.logo || getDefaultCompanyImage(similarJob.company)}
                                  alt={`${similarJob.company} logo`}
                                  on:error={(e) => handleImageError(e)}
                                  loading="lazy"
                                />
                              </div>
                              <div class="job-card-info">
                                <div class="title-section">
                                  <h3>{similarJob.title}</h3>
                                  <span class="company-name">{similarJob.company.name}</span>
                                </div>
                                <div class="job-meta">
                                  <div class="meta-item">
                                    <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                                      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
                                    </svg>
                                    <span class="salary">${similarJob.hourlyRate.toFixed(2)}/hr</span>
                                  </div>
                                  <div class="meta-item">
                                    <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                                      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
                                    </svg>
                                    <span class="location">{similarJob.address.city}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Only show blur overlay if user is not subscribed -->
                          {#if !$subscription?.isPaid && i > 0}
                            <div class="blur-overlay">
                              <button class="blur-upgrade-btn" on:click={handleUpgradeClick}>
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                  <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.92c0 4.54-3.2 8.79-7 9.78-3.8-.99-7-5.24-7-9.78V6.3l7-3.12z"/>
                                </svg>
                                Upgrade to Premium
                              </button>
                            </div>
                          {/if}
                        </div>
                      {/each}
                    {/if}
                  </div>

                  <!-- Only show upgrade overlay if user is not subscribed -->
                  {#if !$subscription?.isPaid}
                    <div class="upgrade-overlay">
                      <div class="upgrade-content">
                        <h3>Unlock Similar Jobs</h3>
                        <p>Get access to more job recommendations</p>
                        <button class="upgrade-btn" on:click={handleUpgradeClick}>
                          Upgrade to Premium
                        </button>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <!-- After the two-column layout with About and Similar Jobs -->
          <div class="insights-section">
            <h2>Job Insights</h2>
            <div class="insights-grid">
              <!-- Market Demand -->
              <div class="insight-card">
                <div class="insight-header">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                  </svg>
                  <h3>Market Demand</h3>
                </div>
                <div class="insight-content">
                  <div class="demand-meter">
                    <div class="demand-bar" style="width: 85%"></div>
                  </div>
                  <p>High demand in {job.address.city}</p>
                  <span class="insight-detail">85% more openings than average</span>
                </div>
              </div>

              <!-- Compensation Analysis -->
              <div class="insight-card">
                <div class="insight-header">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                  <h3>Compensation</h3>
                </div>
                <div class="insight-content">
                  <div class="compensation-stats">
                    <div class="stat">
                      <span class="stat-label">Industry Average</span>
                      <span class="stat-value">$11.50/hr</span>
                    </div>
                    <div class="stat highlight">
                      <span class="stat-label">This Position</span>
                      <span class="stat-value">${job.hourlyRate}/hr</span>
                    </div>
                  </div>
                  <span class="insight-detail">
                    {job.hourlyRate > 11.50 ? 'Above' : 'Below'} industry average for this role
                  </span>
                </div>
              </div>

              <!-- Application Competition -->
              <div class="insight-card">
                <div class="insight-header">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                  </svg>
                  <h3>Competition</h3>
                </div>
                <div class="insight-content">
                  <div class="competition-meter">
                    <span class="meter-label">Low Competition</span>
                    <div class="meter-bar">
                      <div class="meter-fill" style="width: 30%"></div>
                    </div>
                  </div>
                  <span class="insight-detail">12 applications in the last 24 hours</span>
                </div>
              </div>

              <!-- Skills Match -->
              <div class="insight-card">
                <div class="insight-header">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <h3>Skills Match</h3>
                </div>
                <div class="insight-content">
                  <div class="skills-list">
                    {#each job.tags?.slice(0, 3) || [] as skill}
                      <div class="skill-item">
                        <div class="skill-check">✓</div>
                        <span>{skill}</span>
                      </div>
                    {/each}
                  </div>
                  <span class="insight-detail">Your profile matches 80% of requirements</span>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if showSubscriptionModal}
    <SubscriptionModal 
      on:close={() => showSubscriptionModal = false}
      on:subscribed={handleSubscribed}
    />
  {/if}
</div>

<style>
/* Update page wrapper and content styles */
  .page-wrapper {
    min-height: 100vh;
    background: #F9FAFB;
  width: 100%;
  margin: 0;
  padding: 0;
  }

  .page-content {
  padding-top: 1rem;
  padding-bottom: 2rem;
  width: 100%;
  }

  .container {
  max-width: 100%;
  margin: 0;
  padding: 0 1rem;
}

.job-details-page {
  width: 100%;
  padding: 0;
}

.job-header {
  margin: 0 0 1.5rem 0;
  border-radius: 0;
  padding: 2rem 1.5rem;
}

.two-column-layout {
  margin: 1.5rem 0;
  padding: 0 1rem;
  gap: 1.5rem;
}

/* Update responsive styles */
@media (min-width: 1024px) {
  .container {
    padding: 0 2rem;
  }

  .job-header {
    border-radius: 20px;
    margin: 0 1rem 1.5rem 1rem;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding-top: 0.5rem;
  }

  .container {
    padding: 0 0.75rem;
  }

  .job-header {
    padding: 1.5rem 1rem;
  }

  .two-column-layout {
    padding: 0 0.75rem;
    gap: 1rem;
  }
}

/* Keep existing styles below */
.job-header {
  position: relative;
    background: white;
  padding: 2.5rem 2rem;
  border-radius: 24px;
    margin-bottom: 2rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04),
              0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(229, 231, 235, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.header-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    #6355FF, 
    #5346E0,
    #6355FF,
    #5346E0);
  background-size: 200% 100%;
  animation: shimmer 3s infinite linear;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.job-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(99, 85, 255, 0.15);
  }

  .job-header-main {
    display: grid;
    grid-template-columns: auto 1fr auto;
  gap: 2.5rem;
    align-items: start;
  }

/* Company Logo Styles */
  .company-logo-wrapper {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 20px;
  background: white;
    overflow: hidden;
  transition: all 0.3s ease;
}

.logo-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%);
  opacity: 0.8;
  }

  .company-logo-img {
  position: relative;
    width: 100%;
    height: 100%;
    object-fit: contain;
  padding: 1rem;
  transition: transform 0.3s ease;
}

.logo-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 30%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0.1) 70%,
    transparent 100%
  );
  transform: rotate(45deg);
  animation: shine 3s infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.company-logo-wrapper:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(99, 85, 255, 0.15);
}

.company-logo-wrapper:hover .logo-shine {
  opacity: 1;
}

@keyframes shine {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(100%) rotate(45deg); }
}

/* Status Badge */
.status-badge {
  margin-top: 1rem;
  text-align: center;
}

.badge-content {
  display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
    border-radius: 100px;
  color: #991B1B;
  font-size: 0.875rem;
    font-weight: 600;
  box-shadow: 0 2px 4px rgba(153, 27, 27, 0.1);
  transition: all 0.3s ease;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
  background: linear-gradient(135deg, #EF4444, #DC2626);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

/* Title Section */
.title-section {
  margin-bottom: 1.5rem;
}

.job-title {
    display: flex;
  align-items: center;
    gap: 1rem;
  margin: 0;
  font-size: 2.25rem;
  font-weight: 700;
  color: #1F2937;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.title-text {
  background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.featured-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 1rem;
  background: linear-gradient(135deg, rgba(99, 85, 255, 0.1), rgba(83, 70, 224, 0.1));
  color: #6355FF;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 100px;
  letter-spacing: 0.02em;
}

/* Company Info */
.company-info {
    display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.75rem;
}

.company-name {
  display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  font-size: 1.25rem;
    color: #4B5563;
  text-decoration: none;
  transition: all 0.2s ease;
}

.company-name:hover {
  color: #6355FF;
}

.company-link-icon {
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}

.company-name:hover .company-link-icon {
  opacity: 1;
  transform: translateX(0);
}

/* Rating Stars */
.company-rating {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  color: #D1D5DB;
  transition: all 0.2s ease;
}

.star.filled {
  color: #FBBF24;
}

.rating-count {
    font-size: 0.875rem;
  color: #6B7280;
}

/* Meta Section */
.meta-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.meta-tags {
    display: flex;
    flex-wrap: wrap;
  gap: 0.75rem;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
    gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(243, 244, 246, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  color: #4B5563;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.meta-tag:hover {
  background: white;
  border-color: #6355FF;
  color: #6355FF;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 85, 255, 0.1);
}

/* Skills Section */
.skills-section {
    margin-top: 0.5rem;
  }

.skills-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

  .skill-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(99, 85, 255, 0.05);
  color: #6355FF;
  border: 1px solid rgba(99, 85, 255, 0.2);
  border-radius: 10px;
  font-size: 0.9375rem;
    font-weight: 500;
  transition: all 0.2s ease;
}

.skill-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.5;
}

.skill-tag:hover {
  background: rgba(99, 85, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 85, 255, 0.1);
  }

  .more-skills {
  position: relative;
  padding: 0.625rem 1.25rem;
  background: transparent;
    color: #6B7280;
  border: 1px dashed #D1D5DB;
  border-radius: 10px;
  font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
  transition: all 0.2s ease;
}

.more-skills:hover {
  color: #6355FF;
  border-color: #6355FF;
}

.skills-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  z-index: 10;
}

.more-skills:hover .skills-tooltip {
  display: flex;
}

.tooltip-tag {
  padding: 0.5rem;
  background: #F9FAFB;
  border-radius: 6px;
  color: #4B5563;
  font-size: 0.875rem;
}

/* Action Buttons */
.header-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.actions-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  align-items: flex-end;
  }

  .apply-now-btn {
  position: relative;
  display: inline-flex;
    align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6355FF, #5346E0);
    color: white;
    border: none;
  border-radius: 14px;
    font-weight: 600;
  font-size: 1.125rem;
    cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 85, 255, 0.25);
}

.button-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 30%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0.1) 70%,
    transparent 100%
  );
  transform: rotate(45deg);
  transition: 0.5s;
  opacity: 0;
  }

  .apply-now-btn:hover {
    transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 85, 255, 0.3);
  background: linear-gradient(135deg, #5346E0, #4335D0);
}

.apply-now-btn:hover .button-shine {
  animation: button-shine 1s;
}

@keyframes button-shine {
  0% { transform: translateX(-100%) rotate(45deg); opacity: 1; }
  100% { transform: translateX(100%) rotate(45deg); opacity: 0; }
}

.secondary-actions {
    display: flex;
  gap: 0.75rem;
}

.action-btn {
  position: relative;
  display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: transparent;
    border: 1px solid #E5E7EB;
  border-radius: 12px;
  color: #4B5563;
  font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
}

.btn-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99, 85, 255, 0.1), rgba(83, 70, 224, 0.1));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.action-btn:hover {
  border-color: #6355FF;
  color: #6355FF;
  transform: translateY(-1px);
}

.action-btn:hover .btn-background {
  opacity: 1;
}

/* Responsive Styles */
  @media (max-width: 1024px) {
    .job-header-main {
      grid-template-columns: auto 1fr;
    gap: 2rem;
  }

  .header-right {
    grid-column: 1 / -1;
    grid-row: 2;
    width: 100%;
    align-items: stretch;
    margin-top: 1.5rem;
  }

  .actions-wrapper {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .apply-now-btn {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .job-header {
    padding: 1.5rem;
    border-radius: 16px;
  }

    .job-header-main {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
  .company-logo-wrapper {
    width: 72px;
    height: 72px;
  }

  .job-title {
    font-size: 1.75rem;
  }

  .company-name {
    font-size: 1.125rem;
  }

  .meta-tag {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  .actions-wrapper {
    flex-direction: column;
      gap: 1rem;
    }

  .secondary-actions {
    width: 100%;
    gap: 0.75rem;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .job-header {
    padding: 1.25rem;
    border-radius: 12px;
  }
    
    .company-logo-wrapper {
    width: 64px;
    height: 64px;
  }

  .job-title {
    font-size: 1.5rem;
  }

  .meta-tag {
    padding: 0.5rem 0.875rem;
    font-size: 0.813rem;
  }

  .skill-tag {
    padding: 0.5rem 1rem;
    font-size: 0.813rem;
  }
}

.navigation-section {
  position: sticky;
  top: 80px;
  z-index: 10;
  padding: 1rem 0;
  background: #F9FAFB;
  margin-bottom: 1rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  color: #4B5563;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.back-button:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
  color: #111827;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-button:active {
  transform: translateY(0);
}

.back-button svg {
  transition: transform 0.2s ease;
}

.back-button:hover svg {
  transform: translateX(-2px);
  }

  .job-overview {
    width: 50%;
    min-width: 480px;
    padding-left: 2rem;
  }

  .at-glance-section {
    background: white;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .at-glance-section h2 {
    font-size: 1.875rem;
    font-weight: 800;
    color: #1F2937;
    letter-spacing: -0.025em;
    margin: 0 0 1.75rem 0;
  }

  .glance-items {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glance-item {
    padding: 1rem 0;
    border-bottom: 1px solid #E5E7EB;
  }

  .glance-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .glance-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4B5563;
    font-size: 1.125rem;
    font-weight: 500;
    letter-spacing: 0.025em;
  }

  .glance-value {
    color: #1F2937;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.5;
  }

  .location-value {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .location-value svg {
    margin-top: 0.25rem;
    color: #6355FF;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }

  .main-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .section {
    padding: 2rem;
    border-bottom: 1px solid #E5E7EB;
  }

  .section:last-child {
    border-bottom: none;
  }

  .section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }

  .about-section {
    flex: 1;
    width: 50%;
    min-width: 480px;
  }

  .about-card {
    background: white;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .about-card h2 {
    font-size: 1.875rem;
    font-weight: 800;
    color: #1F2937;
    letter-spacing: -0.025em;
    margin: 0 0 1.75rem 0;
  }

  .about-content {
    position: relative;
    font-size: 1.125rem;
    line-height: 1.75;
    color: #4B5563;
  }

  .show-more-btn,
  .show-less-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    color: #6355FF;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .show-more-btn:hover,
  .show-less-btn:hover {
    color: #4F46E5;
    transform: translateY(-1px);
  }

  .show-more-btn svg,
  .show-less-btn svg {
    transition: transform 0.2s ease;
  }

  .show-more-btn:hover svg {
    transform: translateY(2px);
  }

  .show-less-btn:hover svg {
    transform: translateY(-2px);
  }

  .about-content :global(p) {
    margin-bottom: 1.5rem;
  }

  .about-content :global(p:last-child) {
    margin-bottom: 0;
  }

  .about-content.preview {
    max-height: 200px;
    overflow: hidden;
    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  }

  .right-column {
    flex: 1;
    width: 50%;
    min-width: 480px;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .apply-card {
    background: white;
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .apply-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }

  .similar-jobs-section {
    margin-top: 3rem;
    position: relative;
  }

  .similar-jobs-section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #111827;
  }

  .similar-jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(229, 231, 235, 0.5);
  cursor: pointer;
  overflow: hidden;
}

.job-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #6355FF, #4F46E5);
  opacity: 0;
  transition: opacity 0.3s ease;
  }

  .job-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: rgba(99, 85, 255, 0.1);
}

.job-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  position: relative;
}

.company-logo {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid rgba(229, 231, 235, 0.7);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.company-logo:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
  transition: all 0.3s ease;
}

.job-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
  line-height: 1.4;
  letter-spacing: -0.01em;
  background: linear-gradient(90deg, #111827, #374151);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.company-name {
  font-size: 1rem;
  font-weight: 600;
  color: #4B5563;
  margin-bottom: 12px;
  transition: color 0.3s ease;
}

.company-name:hover {
  color: #6355FF;
}

.rate-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #F0FDF4, #DCFCE7);
  color: #059669;
  padding: 8px 16px;
  border-radius: 100px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid rgba(5, 150, 105, 0.1);
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.05);
  transition: all 0.3s ease;
}

.rate-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(5, 150, 105, 0.1);
}

.tag {
  background: #F3F4F6;
  color: #4B5563;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(229, 231, 235, 0.7);
  transition: all 0.2s ease;
}

.tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tag.urgent {
  background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
  color: #DC2626;
  border-color: rgba(220, 38, 38, 0.1);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  padding-right: 16px;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
}

.action-row-secondary {
  display: flex;
  gap: 8px;
}

.apply-button {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #6355FF 0%, #4F46E5 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  position: relative;
  overflow: hidden;
  height: 40px;
}

.favorite-button,
.share-button {
  flex: 1;
  background: white;
  border: 1px solid rgba(229, 231, 235, 0.7);
  padding: 8px;
  height: 40px;
  cursor: pointer;
  color: #D1D5DB;
  transition: all 0.3s ease;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Update mobile styles */
@media (max-width: 768px) {
  .action-row {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .action-row-secondary {
    gap: 6px;
  }

  .apply-button,
  .favorite-button,
  .share-button {
    padding: 8px;
    font-size: 14px;
  }

  .apply-button .icon,
  .favorite-button .icon,
  .share-button .icon {
    width: 16px;
    height: 16px;
  }
}

.apply-button::before {
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

.apply-button:hover::before {
  left: 100%;
}

.apply-button:hover {
    transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
  background: linear-gradient(135deg, #5346E0 0%, #4338CA 100%);
}

.favorite-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #EC4899;
  color: #EC4899;
}

.favorite-button.active {
  background: linear-gradient(135deg, #FDF2F8, #FCE7F3);
  color: #EC4899;
  border-color: rgba(236, 72, 153, 0.2);
}

.location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  background: rgba(243, 244, 246, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.location:hover {
  background: rgba(243, 244, 246, 0.8);
}

.blur-overlay {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0.95) 100%
  );
  backdrop-filter: blur(4px);
  }

  .job-card.blurred {
    filter: blur(3px);
    opacity: 0.7;
    pointer-events: none;
  }

  .job-card-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: flex-start;
  }

  .company-logo {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid #E5E7EB;
    background: white;
  }

  .company-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .job-card-info {
    flex: 1;
  }

  .title-section {
    margin-bottom: 0.5rem;
  }

  .title-section h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
    line-height: 1.4;
  }

  .company-name {
    font-size: 0.875rem;
    color: #4B5563;
    display: block;
  }

  .job-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .icon {
    color: #9CA3AF;
  }

  .salary {
    color: #059669;
    font-weight: 500;
  }

  .location {
    color: #6B7280;
  }

  .view-job-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
    background: #F9FAFB;
    color: #374151;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
    margin-top: auto;
  }

  .view-job-btn:hover {
    background: #F3F4F6;
    color: #111827;
  }

  .upgrade-section {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    text-align: center;
    z-index: 10;
    background: linear-gradient(to top, white 40%, transparent);
  }

  .blur-overlay {
    position: absolute;
    inset: 0;
    backdrop-filter: blur(4px);
    z-index: -1;
  }

  .upgrade-button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: #6355FF;
    color: white;
    border: none;
    border-radius: 100px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px rgba(99, 85, 255, 0.2);
  }

  .upgrade-button:hover {
    background: #5346E0;
    transform: translateY(-1px);
    box-shadow: 0 6px 8px rgba(99, 85, 255, 0.3);
  }

  .premium-badge {
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  @media (max-width: 768px) {
  .job-title {
    font-size: 1.5rem;
    line-height: 1.3;
    margin-bottom: 8px;
  }

  .company-name {
    font-size: 1.125rem;
  }

  .meta-tag {
    font-size: 1rem;
  }

  .job-meta-tags {
    gap: 12px;
  }

  .skill-tag {
    font-size: 0.875rem;
    padding: 6px 12px;
  }

  .pay-header h2,
  .about-card h2,
  .similar-jobs-card h2,
  .insights-section h2 {
    font-size: 1.375rem;
    margin-bottom: 16px;
  }

  .pay-estimate {
    font-size: 1.125rem;
    line-height: 1.5;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 1rem;
  }

  .glance-label {
    font-size: 1rem;
  }

  .glance-value {
    font-size: 1.125rem;
  }

  .about-content {
    font-size: 1rem;
    line-height: 1.6;
  }

  .contact-label {
      font-size: 0.875rem;
  }

  .contact-value {
    font-size: 1.125rem;
  }

  .insight-header h3 {
    font-size: 1.25rem;
  }

  .insight-detail {
    font-size: 0.875rem;
    line-height: 1.5;
  }
}

@media (max-width: 480px) {
  .job-title {
    font-size: 1.25rem;
  }

  .company-name {
    font-size: 1rem;
  }

  .meta-tag {
    font-size: 0.875rem;
  }

  .skill-tag {
    font-size: 0.813rem;
    padding: 4px 10px;
    }

    .pay-header h2,
    .about-card h2,
  .similar-jobs-card h2,
  .insights-section h2 {
    font-size: 1.25rem;
  }

  .pay-estimate {
    font-size: 1rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .stat-label {
    font-size: 0.875rem;
  }

    .glance-value {
    font-size: 1rem;
  }

  .about-content {
    font-size: 0.938rem;
  }

  .contact-value {
    font-size: 1rem;
  }

  .insight-header h3 {
      font-size: 1.125rem;
    }
  }

  .chat-preview {
    position: relative;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .chat-message {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .chat-bubble {
    max-width: 80%;
    padding: 0.75rem 1rem;
    border-radius: 16px;
    position: relative;
  }

  .chat-bubble.employer {
    background: #6355FF;
    color: white;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }

  .chat-bubble.candidate {
    background: white;
    color: #333;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .chat-bubble p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .preview .chat-preview {
    filter: blur(3px);
    pointer-events: none;
  }

  .pay-comparison-section {
    background: white;
    border-radius: 16px;
    padding: 2.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    width: 50%;
    min-width: 480px;
    align-self: flex-start;
  }

  .pay-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .pay-header h2 {
    font-size: 1.875rem;
    font-weight: 800;
    color: #1F2937;
    letter-spacing: -0.025em;
    margin: 0;
  }

  .estimated-pay {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6355FF;
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: 0.025em;
  }

  .pay-estimate {
    font-size: 1.25rem;
    line-height: 1.6;
    color: #4B5563;
    margin-bottom: 3rem;
  }

  .highlight {
    font-weight: 700;
    color: #1F2937;
  }

  .pay-chart {
    margin-top: 2rem;
    padding: 0 1rem;
  }

  .chart-bars {
    display: flex;
    align-items: flex-end;
    height: 200px;
    gap: 8px;
    margin-bottom: 1.5rem;
    padding-top: 2.5rem;
  }

  .bar-container {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: flex-end;
  }

  .bar {
    width: 100%;
    min-height: 45px;
    background: #F3F4F6;
    border-radius: 100px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bar.active {
    background: #6355FF;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.25);
  }

  .bar-value {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.9375rem;
    font-weight: 600;
    color: #6B7280;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .bar.active .bar-value {
    color: #6355FF;
    font-weight: 600;
    font-size: 1rem;
  }

  .chart-range {
    display: flex;
    justify-content: space-between;
    color: #6B7280;
    font-size: 0.9375rem;
    font-weight: 500;
    padding: 0 0.75rem;
    margin-top: 0.5rem;
  }

  /* Add smooth hover effects */
  .bar:hover {
    transform: translateY(-2px);
  }

  .bar.active:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(99, 85, 255, 0.3);
  }

  @media (max-width: 1024px) {
    .pay-comparison-section {
      width: 100%;
      min-width: auto;
    }

    .job-overview {
      width: 100%;
      min-width: auto;
      padding-left: 0;
    }
  }

  .two-column-layout {
    display: flex;
    gap: 2rem;
    margin: 2rem 0;
  }

  .pay-comparison-section {
    flex: 1;
    width: 50%;
    min-width: 480px;
    background: white;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .job-overview {
    flex: 1;
    width: 50%;
    min-width: 480px;
  }

  @media (max-width: 1024px) {
    .two-column-layout {
      flex-direction: column;
    }

    .pay-comparison-section,
    .job-overview {
      width: 100%;
      min-width: auto;
    }
  }

  .loading, .error {
    text-align: center;
    padding: 2rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #6355FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .similar-jobs-card {
    background: white;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .similar-jobs-card h2 {
    font-size: 1.875rem;
    font-weight: 800;
    color: #1F2937;
    letter-spacing: -0.025em;
    margin: 0 0 1.75rem 0;
  }

  .similar-jobs-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .similar-job-card {
    position: relative;
    padding: 1.5rem;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    transition: all 0.2s ease;
    background: white;
  }

  .job-content {
    transition: all 0.2s ease;
  }

  .premium-content-blur .job-content {
    filter: blur(4px);
    pointer-events: none;
  }

  .premium-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    pointer-events: auto;
  }

  .upgrade-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #6355FF;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 100px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.25);
    z-index: 10;
    pointer-events: auto;
  }

  .upgrade-button:hover {
    background: #5346E5;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 85, 255, 0.35);
  }

  .similar-job-card:not(.premium-content-blur):hover {
    border-color: #6355FF;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.1);
    transform: translateY(-2px);
  }

  .job-card-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .company-logo {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    overflow: hidden;
  }

  .company-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .job-card-info h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1F2937;
    line-height: 1.4;
    margin: 0 0 0.375rem 0;
  }

  .job-card-info .company-name {
    font-size: 1rem;
    color: #6B7280;
    font-weight: 500;
  }

  .job-card-details {
    margin-bottom: 1rem;
  }

  .salary-location {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .salary {
    color: #059669;
    font-weight: 700;
    font-size: 1rem;
  }

  .location {
    color: #4B5563;
    font-size: 1rem;
    font-weight: 500;
  }

  .tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tag {
    background: #F3F4F6;
    color: #4B5563;
    padding: 0.375rem 1rem;
    border-radius: 100px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .view-job-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6355FF;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    padding: 0.5rem 0;
    letter-spacing: 0.025em;
  }

  .view-job-link:hover {
    text-decoration: underline;
  }

  .no-jobs {
    text-align: center;
    padding: 2rem;
    color: #6B7280;
    background: #F9FAFB;
    border-radius: 12px;
    border: 1px dashed #E5E7EB;
  }

  /* Base typography */
  :global(body) {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .insights-section {
    margin: 2rem 0;
    padding: 0 1rem;
  }

  .insights-section h2 {
    font-size: 1.875rem;
    font-weight: 800;
    color: #1F2937;
    letter-spacing: -0.025em;
    margin: 0 0 1.75rem 0;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .insight-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .insight-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    color: #6355FF;
  }

  .insight-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1F2937;
    margin: 0;
  }

  .insight-content {
    color: #4B5563;
  }

  .demand-meter {
    height: 8px;
    background: #E5E7EB;
    border-radius: 100px;
    margin-bottom: 1rem;
    overflow: hidden;
  }

  .demand-bar {
    height: 100%;
    background: #6355FF;
    border-radius: 100px;
    transition: width 1s ease-out;
  }

  .compensation-stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat.highlight .stat-value {
    color: #6355FF;
    font-weight: 700;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6B7280;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1F2937;
  }

  .competition-meter {
    margin-bottom: 1rem;
  }

  .meter-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: #059669;
    font-weight: 600;
  }

  .meter-bar {
    height: 8px;
    background: #E5E7EB;
    border-radius: 100px;
    overflow: hidden;
  }

  .meter-fill {
    height: 100%;
    background: #059669;
    border-radius: 100px;
    transition: width 1s ease-out;
  }

  .skills-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .skill-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .skill-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #F0FDF4;
    color: #059669;
    border-radius: 100px;
    font-size: 0.875rem;
    font-weight: 700;
  }

  .insight-detail {
    display: block;
    font-size: 0.875rem;
    color: #6B7280;
    margin-top: 0.5rem;
  }

  @media (max-width: 768px) {
    .insights-grid {
      grid-template-columns: 1fr;
    }
  }

  .similar-jobs-container {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
  }

  .similar-jobs-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .similar-job-card {
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 1rem;
    background: white;
  }

  .blurred {
    filter: blur(3px);
    opacity: 0.7;
  }

  .upgrade-overlay {
    position: absolute;
    inset: 0;
    top: 33%;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.9) 30%,
      rgba(255, 255, 255, 0.95) 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    pointer-events: all;
    text-align: center;
  }

  .upgrade-content {
    padding: 2rem;
    text-align: center;
  }

  .upgrade-content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .upgrade-content p {
    color: #6B7280;
    margin-bottom: 1.5rem;
  }

  .upgrade-btn {
    background: #6355FF;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .upgrade-btn:hover {
    background: #5346E0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.25);
  }

  /* Add these new styles for the contact information section */
  .contact-information {
    margin-top: 2rem;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .contact-information h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 1.5rem 0;
  }
  
  .contact-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .contact-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(99, 85, 255, 0.1);
    color: #6355FF;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .contact-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .contact-label {
    font-size: 0.875rem;
    color: #6B7280;
  }
  
  .contact-value {
    font-size: 1rem;
    color: #111827;
    font-weight: 500;
  }
  
  .contact-value.email,
  .contact-value.phone,
  .job-url {
    color: #6355FF;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .contact-value.email:hover,
  .contact-value.phone:hover,
  .job-url:hover {
    text-decoration: underline;
  }
  
  .job-url {
    word-break: break-all;
  }

  /* Add styles for the upgrade prompt */
  .contact-upgrade-prompt {
    margin-top: 2rem;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .contact-upgrade-prompt h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 1.5rem 0;
  }
  
  .upgrade-message {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #F9FAFB;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px dashed #D1D5DB;
  }
  
  .upgrade-message svg {
    color: #6355FF;
    flex-shrink: 0;
  }
  
  .upgrade-message p {
    margin: 0 0 1rem 0;
    color: #4B5563;
  }

  /* Add this CSS to your style section */
  .easy-apply-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #6355FF;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
  }

  .easy-apply-btn:hover {
    background: #5346E0;
    transform: translateY(-1px);
  }

  /* Job Insights Section - Complete CSS */
  .job-insights {
    margin: 2rem 0;
    padding: 0 1rem;
  }

  .job-insights h2 {
    font-size: 1.875rem;
    font-weight: 800;
    color: #1F2937;
    letter-spacing: -0.025em;
    margin: 0 0 1.75rem 0;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .insight-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .insight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .insight-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    color: #6355FF;
  }

  .insight-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1F2937;
    margin: 0;
  }

  .insight-content {
    color: #4B5563;
  }

  .demand-meter {
    height: 8px;
    background: #E5E7EB;
    border-radius: 100px;
    margin-bottom: 1rem;
    overflow: hidden;
  }

  .demand-bar {
    height: 100%;
    background: #6355FF;
    border-radius: 100px;
    transition: width 1s ease-out;
  }

  .compensation-stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat.highlight .stat-value {
    color: #6355FF;
    font-weight: 700;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6B7280;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1F2937;
  }

  .competition-meter {
    margin-bottom: 1rem;
  }

  .meter-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: #059669;
    font-weight: 600;
  }

  .meter-bar {
    height: 8px;
    background: #E5E7EB;
    border-radius: 100px;
    overflow: hidden;
  }

  .meter-fill {
    height: 100%;
    background: #059669;
    border-radius: 100px;
    transition: width 1s ease-out;
  }

  .skills-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .skill-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .skill-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #F0FDF4;
    color: #059669;
    border-radius: 100px;
    font-size: 0.875rem;
    font-weight: 700;
  }

  .insight-detail {
    display: block;
    font-size: 0.875rem;
    color: #6B7280;
    margin-top: 0.5rem;
  }

  /* Responsive Styles */
  @media (max-width: 768px) {
    .insights-grid {
      grid-template-columns: 1fr;
    }

    .job-insights h2 {
      font-size: 1.625rem;
    }

    .insight-header h3 {
      font-size: 1.125rem;
    }

    .stat-value {
      font-size: 1.125rem;
    }

    .insight-card {
      padding: 1rem;
    }
  }

  .blurred-job-card {
    position: relative;
    filter: blur(4px);
    opacity: 0.8;
    pointer-events: none;
  }

  .blur-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    z-index: 10;
    pointer-events: auto;
  }

  .blur-upgrade-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #6355FF 0%, #5346E0 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.3);
    transition: all 0.2s ease;
    z-index: 20;
  }

  .blur-upgrade-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 85, 255, 0.4);
  }

  .blur-upgrade-btn:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.3);
  }

  /* Add responsive styles for mobile */
  @media (max-width: 768px) {
    .job-details-container {
      padding: 16px;
      margin: 0;
    }

    .job-header {
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }

    .company-logo {
      width: 64px;
      height: 64px;
    }

    .job-title {
      font-size: 1.5rem;
      line-height: 1.3;
    }

    .job-meta {
      flex-wrap: wrap;
      gap: 12px;
    }

    .job-content {
      padding: 16px;
    }

    .job-description {
      font-size: 0.9rem;
    }

    .job-sidebar {
      position: static;
      width: 100%;
      margin-top: 24px;
      padding: 16px;
    }

    .action-buttons {
      flex-direction: column;
      gap: 12px;
    }

    .action-button {
      width: 100%;
    }

    .company-info {
      padding: 16px;
    }

    .tags-container {
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      font-size: 0.8rem;
      padding: 6px 12px;
    }

    .contact-info {
      padding: 16px;
    }

    .contact-details {
      flex-direction: column;
      gap: 12px;
    }

    .contact-item {
      width: 100%;
    }
  }

  /* Add these comprehensive mobile responsive styles */
  @media (max-width: 768px) {
    .page-wrapper {
      padding: 0;
      width: 100%;
      background: #F9FAFB;
    }

    .page-content {
      padding: 60px 0 0 0;
      width: 100%;
    }

    .container {
      padding: 0;
      width: 100%;
      max-width: 100%;
    }

    .job-details-page {
      padding: 0;
      width: 100%;
    }

    .job-header {
      padding: 20px 0;
      margin-bottom: 16px;
      background: white;
      border-bottom: 1px solid #E5E7EB;
    }

    .job-header-content {
      padding: 0 16px;
    }

    .two-column-layout {
      flex-direction: column;
      gap: 16px;
      width: 100%;
      padding: 0;
      margin: 16px 0;
    }

    .pay-comparison-section,
    .job-overview,
    .about-section,
    .right-column,
    .similar-jobs-card,
    .about-card,
    .contact-information,
    .at-glance-section {
      width: 100%;
      min-width: 100%;
      margin: 0;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .insights-section {
      width: 100%;
      padding: 0;
      margin: 16px 0;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 0;
    }

    .insight-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      margin: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .similar-jobs-list {
      margin: 0;
      padding: 16px;
      width: 100%;
    }

    .similar-job-card {
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .similar-job-card:last-child {
      margin-bottom: 0;
    }

    .pay-comparison-section,
    .job-overview,
    .about-section,
    .right-column {
      padding: 20px;
    }

    .about-card,
    .contact-information,
    .at-glance-section {
      padding: 20px;
      margin-bottom: 16px;
    }

    .about-card:last-child,
    .contact-information:last-child,
    .at-glance-section:last-child {
      margin-bottom: 0;
    }
  }

  @media (max-width: 480px) {
    .pay-comparison-section,
    .job-overview,
    .about-section,
    .right-column,
    .similar-jobs-card,
    .about-card,
    .contact-information,
    .at-glance-section,
    .insight-card {
      padding: 16px;
      border-radius: 12px;
    }

    .similar-jobs-list {
      padding: 12px;
    }

    .similar-job-card {
      padding: 14px;
      margin-bottom: 10px;
    }
  }

  /* Add small mobile specific adjustments */
  @media (max-width: 480px) {
    .job-title {
      font-size: 1.125rem;
    }

    .meta-tag {
      font-size: 0.75rem;
    }

    .skill-tag {
      font-size: 0.75rem;
      padding: 0.25rem 0.625rem;
    }

    .pay-comparison-section,
    .job-overview,
    .about-section,
    .right-column {
      padding: 1rem;
    }

    .chart-bars {
      height: 120px;
    }

    .bar-value {
      display: none;
    }
  }

  .about-card,
  .similar-jobs-card,
  .pay-comparison-section,
  .at-glance-section,
  .contact-information,
  .insight-card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04),
                0 4px 12px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(229, 231, 235, 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .about-card:hover,
  .similar-jobs-card:hover,
  .pay-comparison-section:hover,
  .at-glance-section:hover,
  .contact-information:hover,
  .insight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04),
                0 8px 16px rgba(0, 0, 0, 0.08);
    border-color: rgba(99, 85, 255, 0.1);
  }

  .similar-job-card {
    position: relative;
    padding: 1.75rem;
    background: white;
    border: 1px solid rgba(229, 231, 235, 0.8);
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .similar-job-card:hover {
    transform: translateY(-2px);
    border-color: #6355FF;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.12);
  }

  .similar-job-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 0;
    background: linear-gradient(135deg, #6355FF, #5346E0);
    transition: height 0.3s ease;
  }

  .similar-job-card:hover::before {
    height: 100%;
  }

  .job-card-header {
    display: flex;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .company-logo {
    width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.8);
  background: white;
  padding: 0.5rem;
  transition: all 0.3s ease;
}

  .company-logo:hover {
    transform: scale(1.05);
    border-color: #6355FF;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.12);
  }

  .job-card-info h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1F2937;
    line-height: 1.4;
    margin: 0 0 0.5rem 0;
    transition: color 0.2s ease;
  }

  .similar-job-card:hover .job-card-info h3 {
    color: #6355FF;
  }

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: rgba(243, 244, 246, 0.8);
    border-radius: 8px;
    color: #4B5563;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .meta-item:hover {
    background: rgba(99, 85, 255, 0.1);
    color: #6355FF;
  }

  .meta-item .icon {
    color: #6355FF;
    opacity: 0.8;
  }

  .insight-card {
    position: relative;
    overflow: hidden;
  }

  .insight-card::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, rgba(99, 85, 255, 0.08), transparent);
    border-radius: 0 20px 0 120px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .insight-card:hover::after {
    opacity: 1;
  }

  .insight-header {
    position: relative;
    z-index: 1;
  }

  .demand-bar,
  .meter-fill {
    background: linear-gradient(90deg, #6355FF, #5346E0);
  }

  @media (max-width: 768px) {
    .about-card,
    .similar-jobs-card,
    .pay-comparison-section,
    .at-glance-section,
    .contact-information,
    .insight-card {
      padding: 1.5rem;
      border-radius: 16px;
    }

    .similar-job-card {
      padding: 1.25rem;
    }

    .company-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }
  }

  /* Enhanced Header Card Styles */
  .title-section {
    margin-bottom: 1.25rem;
  }

  .company-name-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: 0.75rem;
  }

  .company-name {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.375rem;
    font-weight: 600;
    color: #4B5563;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .company-name:hover {
    color: #6355FF;
  }

  .company-name svg {
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.2s ease;
  }

  .company-name:hover svg {
    opacity: 1;
    transform: translateX(0);
  }

  .company-rating {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .rating-stars {
    display: flex;
    gap: 0.25rem;
  }

  .rating-stars svg {
    color: #D1D5DB;
  }

  .rating-stars svg.filled {
    color: #FBBF24;
  }

  .rating-count {
    font-size: 0.875rem;
    color: #6B7280;
  }

  .company-status {
    margin-top: 1rem;
  }

  .urgent-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 1.25rem;
    background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
    color: #991B1B;
    border-radius: 100px;
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 4px rgba(153, 27, 27, 0.1);
    transition: all 0.3s ease;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #EF4444, #DC2626);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }

  .skill-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: rgba(99, 85, 255, 0.05);
    color: #6355FF;
    border: 1px solid rgba(99, 85, 255, 0.2);
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: all 0.2s ease;
  }

  .skill-dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    opacity: 0.5;
  }

  .skill-tag:hover {
    background: rgba(99, 85, 255, 0.1);
    border-color: #6355FF;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(99, 85, 255, 0.1);
  }

  .more-skills {
    position: relative;
    padding: 0.625rem 1.25rem;
    background: transparent;
    color: #6B7280;
    border: 1px dashed #D1D5DB;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .more-skills:hover {
    color: #6355FF;
    border-color: #6355FF;
  }

  .tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem;
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: none;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 200px;
    z-index: 10;
  }

  .more-skills:hover .tooltip {
    display: flex;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: white;
    border-right: 1px solid #E5E7EB;
    border-bottom: 1px solid #E5E7EB;
  }

  .save-tooltip,
  .share-tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem 1rem;
    background: #1F2937;
    color: white;
    font-size: 0.875rem;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
  }

  .save-job-btn:hover .save-tooltip,
  .secondary-btn:hover .share-tooltip {
    opacity: 1;
    visibility: visible;
  }

  .save-tooltip::before,
  .share-tooltip::before {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background: #1F2937;
  }

  @media (max-width: 768px) {
    .company-name-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .company-rating {
      margin-left: 0;
    }

    .tooltip,
    .save-tooltip,
    .share-tooltip {
      display: none;
    }
  }

  .job-section {
    background: white;
    border-radius: 16px;
    border: 1px solid #E5E7EB;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 1.5rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #E5E7EB;
    background: linear-gradient(to right, #F9FAFB, #F3F4F6);
  }

  .section-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6355FF;
    box-shadow: 0 2px 4px rgba(99, 85, 255, 0.1);
    border: 1px solid rgba(99, 85, 255, 0.1);
  }

  .section-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .section-content {
    padding: 1.5rem;
  }

  .contact-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .contact-item:hover {
    background: #F9FAFB;
  }

  .contact-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6355FF;
    flex-shrink: 0;
  }

  .contact-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .contact-text .label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6B7280;
  }

  .contact-text .value {
    color: #111827;
    font-weight: 500;
  }

  .no-contact {
    color: #6B7280;
    font-style: italic;
    padding: 1rem;
    text-align: center;
    background: #F9FAFB;
    border-radius: 8px;
    border: 1px dashed #E5E7EB;
  }

  .upgrade-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;  /* Only cover part of the grid */
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.9));
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .similar-jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    position: relative;
    padding-bottom: 2rem;
  }

  /* Make sure job cards are above the overlay when needed */
  .job-card {
    position: relative;
    z-index: 5;
  }

  /* Ensure paid users' content is always visible */
  :global(.paid-user) .upgrade-overlay {
    display: none;
  }

  .similar-jobs-section {
    margin-top: 2rem;
    position: relative;
  }

  .similar-jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    position: relative;
  }

  .premium-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70%;
    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.95));
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 10;
  }

  .premium-content {
    padding: 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }

  .premium-btn {
    background: linear-gradient(135deg, #6355FF 0%, #5346E0 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 100px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .premium-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(99,85,255,0.3);
  }

  .similar-jobs-section {
    margin-top: 3rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1.5rem;
  }

  .loading-spinner {
    text-align: center;
    padding: 2rem;
    color: #6B7280;
  }

  .error-message {
    text-align: center;
    padding: 2rem;
    color: #DC2626;
  }

  .contact-section {
    margin-top: 3rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1.5rem;
  }

  .contact-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .info-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4B5563;
    font-weight: 500;
    min-width: 140px;
  }

  .value {
    color: #111827;
  }

  .email-link, .phone-link {
    color: #2563EB;
    text-decoration: none;
    transition: color 0.2s;
  }

  .email-link:hover, .phone-link:hover {
    color: #1D4ED8;
    text-decoration: underline;
  }

  .no-contact {
    color: #6B7280;
    text-align: center;
    padding: 1rem;
  }

  @media (max-width: 640px) {
    .info-group {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .label {
      min-width: auto;
    }
  }
</style> 

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head> 