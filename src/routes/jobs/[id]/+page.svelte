<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../../stores/userStore';
  import { goto } from '$app/navigation';
  import DashboardNav from '../../../components/dashboard/DashboardNav.svelte';
  import Footer from '../../../components/footer/Footer.svelte';
  import { subscription } from '../../../stores/subscriptionStore';
  import SubscriptionModal from '../../../components/modals/SubscriptionModal.svelte';
  import JobDescription from '../../../components/jobs/JobDescription.svelte';
  import JobRequirements from '../../../components/jobs/JobRequirements.svelte';
  import JobCompanyInfo from '../../../components/jobs/JobCompanyInfo.svelte';
  import JobSimilar from '../../../components/jobs/JobSimilar.svelte';
  import JobActions from '../../../components/jobs/JobActions.svelte';
  import { formatSalary, formatDate } from '../../../utils/formatters';

  interface Job {
    _id: string;
    title: string;
    company: string;
    logo?: string;
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

  onMount(async () => {
    mounted = true;
    try {
      // Fetch main job
      const response = await fetch(`${PUBLIC_API_URL}/jobs/${$page.params.id}`);
      if (!response.ok) throw new Error('Failed to fetch job');
      job = await response.json();
      
      // Fetch preview jobs and limit to 3
      const previewResponse = await fetch(`${PUBLIC_API_URL}/jobs/preview`);
      if (previewResponse.ok) {
        const previewJobs: Job[] = await previewResponse.json();
        // Filter out the current job and take only 3 jobs
        similarJobs = previewJobs
          .filter((pJob: Job) => pJob._id !== job?._id)
          .slice(0, 3);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        error = error.message;
      } else {
        error = 'An unknown error occurred';
      }
    } finally {
      loading = false;
    }
  });

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
  }

  // Add this function to get a default company image
  function getDefaultCompanyImage(company: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=6355FF&color=fff&size=256&bold=true&font-size=0.33`;
  }

  // Add this function to handle image errors
  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = getDefaultCompanyImage(job?.company || '');
  }

  function getPreviewText(text: string) {
    if (text.length <= MAX_PREVIEW_LENGTH) return text;
    return text.substring(0, text.lastIndexOf(' ', MAX_PREVIEW_LENGTH)) + '...';
  }

  function toggleDescription() {
    showFullDescription = !showFullDescription;
  }

  function getApplyLink() {
    if (!job) return '#';
    
    // Check if there's a direct application URL
    if (job.jobUrl) return job.jobUrl;
    
    // Check if there's an email to apply
    if (job.contactDetails?.email) return `mailto:${job.contactDetails.email}?subject=Application for ${job.title} position`;
    
    // Check if there's a website
    if (job.company && job.company.website) return job.company.website;
    
    // Fallback to company profile if available
    if (job.company && job.company._id) return `/companies/${job.company._id}`;
    
    // No apply link available
    return '#';
  }
</script>

<div class="page-wrapper">
  {#if mounted}
    <DashboardNav />
  {/if}

  <div class="page-content">
    <div class="container">
      <div class="navigation-section">
        <button class="back-button" on:click={() => goto('/dashboard')}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Dashboard
        </button>
      </div>

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
            <div class="header-content">
              <div class="left-section">
                <div class="company-logo">
                  {#if job}
                    <img 
                      src={job.logo || getDefaultCompanyImage(job.company)}
                      alt={`${job.company} logo`}
                      on:error={handleImageError}
                      loading="lazy"
                    />
                  {/if}
                </div>
                <div class="job-info">
                  <div class="title-wrapper">
                    <h1>{job.title}</h1>
                    <div class="job-meta">
                      <span class="company-name">{job.company}</span>
                      <span class="job-location">{job.address.city}, {job.address.state}</span>
                      <a href={getApplyLink()} target="_blank" rel="noopener noreferrer" class="easy-apply-btn">
                        Easy Apply
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M5 12h14"></path>
                          <path d="M12 5l7 7-7 7"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="action-buttons">
                <button class="save-button" aria-label="Save job">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
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

          <!-- After the two-column layout -->
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
            </div>

            <!-- Right column - Empty or for future content -->
            <div class="right-column">
              <div class="similar-jobs-card">
                <h2>You might also like</h2>
                <div class="similar-jobs-list">
                  {#if similarJobs.length > 0}
                    {#each similarJobs as similarJob, i (similarJob._id)}
                      <div class="similar-job-card" class:premium-content-blur={!$subscription?.isPaid && i > 0}>
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
                              <h3>{similarJob.title}</h3>
                              <p class="company-name">{similarJob.company}</p>
                            </div>
                          </div>
                          
                          <div class="job-card-details">
                            <div class="salary-location">
                              <span class="salary">${similarJob.hourlyRate.toFixed(2)}/hr</span>
                              <span class="dot">•</span>
                              <span class="location">{similarJob.address.city}, {similarJob.address.state}</span>
                            </div>
                            
                            <div class="tags">
                              {#each similarJob.tags?.slice(0, 3) || [] as tag}
                                <span class="tag" style="background: {getTagColor(tag).bg}; color: {getTagColor(tag).text}">
                                  {tag}
                                </span>
                              {/each}
                            </div>
                          </div>
                        </div>

                        {#if !$subscription?.isPaid && i > 0}
                          <div class="premium-overlay">
                            <button class="upgrade-button" on:click={handleUpgradeClick}>
                              <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.92c0 4.54-3.2 8.79-7 9.78-3.8-.99-7-5.24-7-9.78V6.3l7-3.12z"/>
                              </svg>
                              Upgrade to Premium
                            </button>
                          </div>
                        {:else}
                          <a href="/jobs/{similarJob._id}" class="view-job-link">
                            View Job
                            <svg viewBox="0 0 24 24" width="16" height="16">
                              <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                            </svg>
                          </a>
                        {/if}
                      </div>
                    {/each}
                  {:else}
                    <div class="no-jobs">
                      <p>No similar jobs found at the moment.</p>
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
                    <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
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

          <!-- New Contact Information section -->
          {#if job.contactDetails || job.jobUrl}
            <div class="contact-information">
              <h2>Contact Information</h2>
              <div class="contact-content">
                {#if job.jobUrl}
                  <div class="contact-item">
                    <div class="contact-icon">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                      </svg>
                    </div>
                    <div class="contact-details">
                      <span class="contact-label">Job URL</span>
                      <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" class="job-url">
                        {job.jobUrl}
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                {/if}
                
                {#if job.contactDetails?.name}
                  <div class="contact-item">
                    <div class="contact-icon">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div class="contact-details">
                      <span class="contact-label">Contact Person</span>
                      <span class="contact-value">{job.contactDetails.name}</span>
                    </div>
                  </div>
                {/if}
                
                {#if job.contactDetails?.email}
                  <div class="contact-item">
                    <div class="contact-icon">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div class="contact-details">
                      <span class="contact-label">Email</span>
                      <a href="mailto:{job.contactDetails.email}" class="contact-value email">{job.contactDetails.email}</a>
                    </div>
                  </div>
                {/if}
                
                {#if job.contactDetails?.phone}
                  <div class="contact-item">
                    <div class="contact-icon">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <div class="contact-details">
                      <span class="contact-label">Phone</span>
                      <a href="tel:{job.contactDetails.phone}" class="contact-value phone">{job.contactDetails.phone}</a>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>

  {#if mounted}
    <Footer />
  {/if}

  {#if showSubscriptionModal}
    <SubscriptionModal 
      on:close={() => showSubscriptionModal = false}
      on:subscribed={handleSubscribed}
    />
  {/if}
</div>

<style>
  .page-wrapper {
    min-height: 100vh;
    background: #F9FAFB;
  }

  .page-content {
    padding-top: 80px;
    padding-bottom: 4rem;
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
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

  .job-details-page {
    flex: 1;
    background: #F9FAFB;
    padding: 2rem 0;
  }

  .job-header {
    background: white;
    border-radius: 16px;
    padding: 1.75rem 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
  }

  .left-section {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    flex: 1;
  }

  .company-logo {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    background: white;
    border: 2px solid #E5E7EB;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .company-logo:hover {
    border-color: #6355FF;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.15);
    transform: translateY(-1px);
  }

  .company-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    padding: 0;
    transition: transform 0.2s ease;
  }

  .job-info {
    flex: 1;
  }

  .title-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .title-wrapper h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1F2937;
    letter-spacing: -0.02em;
    line-height: 1.3;
    margin: 0;
  }

  .job-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    color: #4B5563;
    font-size: 0.95rem;
    align-items: center;
  }

  .company-name {
    color: #111827;
    font-weight: 600;
  }

  .job-location {
    color: #4B5563;
    font-weight: 500;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .save-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: 2px solid #E5E7EB;
    border-radius: 12px;
    background: white;
    color: #6B7280;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .save-button:hover {
    border-color: #6355FF;
    color: #6355FF;
    transform: translateY(-2px);
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
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all 0.2s ease;
  }

  .job-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .job-card.blurred {
    filter: blur(4px);
    pointer-events: none;
  }

  .job-card-header {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
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

  .job-info h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1F2937;
    line-height: 1.4;
    margin: 0 0 0.375rem 0;
  }

  .company-name {
    color: #6B7280;
    font-size: 1rem;
    font-weight: 500;
  }

  .job-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .salary-location {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .salary {
    color: #059669;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.025em;
  }

  .location {
    color: #4B5563;
    font-size: 1rem;
    font-weight: 500;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    padding: 0.375rem 1rem;
    border-radius: 100px;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.025em;
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
    .job-details-page {
      padding: 5rem 1rem 1rem;
    }

    .container {
      padding: 0 1rem;
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .action-buttons {
      width: 100%;
      margin-top: 1.5rem;
    }

    .apply-button {
      flex: 1;
    }

    .similar-jobs-grid {
      grid-template-columns: 1fr;
    }

    .upgrade-section {
      padding: 1.5rem;
    }

    .title-wrapper {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .title-wrapper h1 {
      font-size: 1.875rem;
    }

    .now-hiring {
      font-size: 0.875rem;
      padding: 0.375rem 0.75rem;
    }

    .pay-header h2,
    .at-glance-section h2,
    .about-card h2,
    .similar-jobs-card h2 {
      font-size: 1.625rem;
    }

    .pay-estimate,
    .glance-value {
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
    font-size: 1rem;
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
</style> 