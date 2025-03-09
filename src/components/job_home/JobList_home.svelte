<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../stores/userStore';
  import { goto } from '$app/navigation';

  interface Job {
    title: string;
    company: string;
    logo?: string;
    address: {
      city: string;
      state?: string;
    };
    hourlyRate: number;
    _id?: string;
    tags: string[];
    isUrgent: boolean;
  }

  let jobs: Job[] = [];
  let loading = true;
  let error: string | null = null;
  let failedLogos = new Set<string>();

  let currentPage = 0;
  const cardsPerPage = 5;

  $: totalPages = Math.ceil(jobs.length / cardsPerPage);
  $: visibleJobs = jobs.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage);

  // Icon styles for company logos
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
      }
    ]
  };

  const bgColors = [
    { bg: '#4F46E5', text: '#FFFFFF' }, // Indigo
    { bg: '#0EA5E9', text: '#FFFFFF' }, // Sky
    { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
    { bg: '#EC4899', text: '#FFFFFF' }, // Pink
    { bg: '#10B981', text: '#FFFFFF' }, // Emerald
  ];

  function getCompanyInitials(company: string): string {
    return company.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  function getCompanyColor(company: string) {
    const hash = company.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return bgColors[hash % bgColors.length];
  }

  function generateCompanyIcon(company: string) {
    const hash = company.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const styleCategory = company.toLowerCase().includes('tech') ? iconStyles.tech : iconStyles.startup;
    const style = styleCategory[hash % styleCategory.length];
    const color = style.colors[hash % style.colors.length];
    return `${style.url}?seed=${encodeURIComponent(company)}&backgroundColor=${color}&radius=12`;
  }

  function handleImageError(event: Event, jobId: string) {
    const img = event.target as HTMLImageElement;
    const company = jobs.find(j => j._id === jobId)?.company || '';
    failedLogos.add(jobId);
    failedLogos = failedLogos;
  }

  function nextPage() {
    if (currentPage < totalPages - 1) {
      currentPage++;
    }
  }

  function prevPage() {
    if (currentPage > 0) {
      currentPage--;
    }
  }

  let scrollContainer: HTMLElement;
  const scrollAmount = 800; // Adjust this value based on your card width + gap

  function scrollNext() {
    if (scrollContainer) {
      scrollContainer.scrollLeft += scrollAmount;
    }
  }

  function scrollPrev() {
    if (scrollContainer) {
      scrollContainer.scrollLeft -= scrollAmount;
    }
  }

  onMount(async () => {
    try {
      loading = true;
      error = null;

      const response = await fetch(`${PUBLIC_API_URL}/jobs/preview`, {
        headers: {
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      jobs = await response.json();
    } catch (err) {
      console.error('Error fetching jobs:', err);
      error = err instanceof Error ? err.message : 'Failed to fetch jobs';
    } finally {
      loading = false;
    }
  });
</script>

<div class="jobs-container">
  {#if loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <span>Loading jobs...</span>
    </div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if jobs.length === 0}
    <div class="no-jobs">No jobs found</div>
  {:else}
    <div class="scroll-container">
      <button class="scroll-button prev" on:click={scrollPrev}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>

      <div class="jobs-grid" bind:this={scrollContainer}>
        {#each jobs as job}
          <div class="job-card">
            <div class="card-header">
              <div class="company-logo">
                {#if !failedLogos.has(job._id || '')}
                  <img
                    src={job.logo || generateCompanyIcon(job.company)}
                    alt={`${job.company} logo`}
                    on:error={(e) => handleImageError(e, job._id || '')}
                    loading="lazy"
                  />
                {:else}
                  <div class="company-initials" style="background-color: {getCompanyColor(job.company).bg}; color: {getCompanyColor(job.company).text}">
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
              
              <div class="company-info blur-content">
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
                    {job.address.city}, {job.address.state || ''}
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
                    <span class="tag">{tag}</span>
                  {/each}
                </div>
              </div>
            </div>

            <div class="premium-overlay">
              <div class="premium-content">
                <button class="premium-button" on:click={() => goto('/pricing')}>
                  <svg class="lock-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                  Sign up to view details
                  <svg class="arrow-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <button class="scroll-button next" on:click={scrollNext}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
        </svg>
      </button>
    </div>
  {/if}
</div>

<style>
  .jobs-container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 24px;
  }

  .scroll-container {
    position: relative;
    padding: 0 48px;
  }

  .scroll-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    border: 1px solid #E5E7EB;
    color: #4B5563;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .scroll-button:hover {
    background: #F9FAFB;
    color: #111827;
    border-color: #D1D5DB;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .scroll-button.prev {
    left: 0;
  }

  .scroll-button.next {
    right: 0;
  }

  .jobs-grid {
    display: flex;
    gap: 24px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 8px 0;
    scroll-snap-type: x mandatory;
  }

  .job-card {
    scroll-snap-align: start;
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
    overflow: hidden;
  }

  .job-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    border-color: #D1D5DB;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #E5E7EB;
  }

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
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: #4B5563;
    margin-bottom: 12px;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6B7280;
    font-size: 14px;
    font-weight: 500;
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

  .tags-wrapper {
    margin: 12px 0;
    min-height: 32px;
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
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tag.urgent {
    background: #FEF2F2;
    color: #DC2626;
    border-color: #FEE2E2;
    font-weight: 600;
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

  .icon {
    flex-shrink: 0;
  }

  .blur-content {
    filter: blur(4px);
    user-select: none;
  }

  .premium-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70%;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.95) 30%,
      rgba(255, 255, 255, 1) 60%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0 0 20px 20px;
  }

  .premium-content {
    text-align: center;
    padding: 20px;
    margin-top: 40px;
  }

  .premium-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #6355FF 0%, #5346E0 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 100px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .premium-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 85, 255, 0.3);
    background: linear-gradient(135deg, #7367FF 0%, #6355FF 100%);
  }

  .lock-icon, .arrow-icon {
    opacity: 0.9;
    width: 20px;
    height: 20px;
  }

  .arrow-icon {
    transition: transform 0.2s ease;
  }

  .premium-button:hover .arrow-icon {
    transform: translateX(4px);
  }
</style>