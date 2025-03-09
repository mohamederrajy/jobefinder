<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { subscription } from '../../stores/subscriptionStore';
  import { user } from '../../stores/userStore';
  import SubscriptionModal from '../modals/SubscriptionModal.svelte';

  interface Job {
    _id: string;
    title: string;
    company: string;
    hourlyRate: number;
    address: {
      city: string;
      state: string;
      zipCode?: string;
    };
    tags: string[];
    isUrgent: boolean;
    createdAt: string;
    logo?: string;
  }

  let jobs: Job[] = [];
  let loading = true;
  let error: string | null = null;
  let showSubscriptionModal = false;
  let savedJobs = new Set<string>();

  // Company logo generation
  const bgColors = [
    { bg: '#4F46E5', text: '#FFFFFF' }, // Indigo
    { bg: '#0EA5E9', text: '#FFFFFF' }, // Sky
    { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
    { bg: '#EC4899', text: '#FFFFFF' }, // Pink
    { bg: '#10B981', text: '#FFFFFF' }, // Emerald
    { bg: '#F59E0B', text: '#FFFFFF' }, // Amber
    { bg: '#6366F1', text: '#FFFFFF' }  // Blue
  ];

  function getCompanyInitials(company: string): string {
    const words = company.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return company.substring(0, 2).toUpperCase();
  }

  function getCompanyColor(company: string) {
    const hash = company.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return bgColors[hash % bgColors.length];
  }

  const tagColors = {
    'software': { bg: '#EFF6FF', text: '#2563EB' },
    'engineering': { bg: '#F0FDF4', text: '#16A34A' },
    'frontend': { bg: '#FEF3C7', text: '#D97706' },
    'backend': { bg: '#F3E8FF', text: '#7C3AED' },
    'fullstack': { bg: '#ECFDF5', text: '#059669' }
  };

  function getTagColor(tag: string) {
    const normalizedTag = tag.toLowerCase();
    const defaultColor = { bg: '#F3F4F6', text: '#4B5563' };
    return tagColors[normalizedTag] || defaultColor;
  }

  async function toggleSaveJob(jobId: string, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      const endpoint = savedJobs.has(jobId) ? 'unsave' : 'save';
      const response = await fetch(`${PUBLIC_API_URL}/jobs/${jobId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${$user?.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to save job');

      if (savedJobs.has(jobId)) {
        savedJobs.delete(jobId);
      } else {
        savedJobs.add(jobId);
      }
      savedJobs = savedJobs; // Trigger reactivity

      notifications.add({
        type: 'success',
        message: savedJobs.has(jobId) ? 'Job saved successfully' : 'Job removed from saved',
        duration: 3000
      });
    } catch (err) {
      console.error('Error saving job:', err);
      notifications.add({
        type: 'error',
        message: 'Failed to save job. Please try again.',
        duration: 3000
      });
    }
  }

  // Load saved jobs on mount
  onMount(async () => {
    if ($user?.token) {
      try {
        const response = await fetch(`${PUBLIC_API_URL}/users/saved-jobs`, {
          headers: {
            'Authorization': `Bearer ${$user.token}`
          }
        });
        
        if (response.ok) {
          const savedJobsData = await response.json();
          savedJobs = new Set(savedJobsData.map(job => job._id));
        }
      } catch (err) {
        console.error('Error loading saved jobs:', err);
      }
    }
    await fetchJobs();
  });

  async function fetchJobs() {
    try {
      loading = true;
      error = null;

      const endpoint = $subscription?.isPaid ? '/jobs' : '/jobs/preview';
      
      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const allJobs = await response.json();
      jobs = allJobs.sort(() => Math.random() - 0.5).slice(0, 3);

    } catch (err) {
      console.error('Error fetching jobs:', err);
      error = err instanceof Error ? err.message : 'Failed to fetch jobs';
    } finally {
      loading = false;
    }
  }

  function handleUpgradeClick() {
    showSubscriptionModal = true;
  }

  function generateCompanyIcon(company: string): string {
    // Implement your logic to generate a company icon based on the company name
    return `https://via.placeholder.com/56x56?text=${getCompanyInitials(company)}`;
  }

  function handleImageError(e: Event) {
    // Implement your logic to handle image loading error
    console.error('Error loading image');
  }
</script>

<div class="discover-section">
  {#if loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      Loading jobs...
    </div>
  {:else if error}
    <div class="error">
      {error}
    </div>
  {:else if jobs.length === 0}
    <div class="no-jobs">
      No jobs available at the moment
    </div>
  {:else}
    <div class="discover-cards">
      <div class="section-header">
        <h2>Discover Jobs</h2>
      </div>

      <div class="jobs-list">
        {#each jobs as job}
          <div 
            class="job-card"
            class:blurred={!$subscription?.subscription?.isPaid}
          >
            <a href="/dashboard/jobs/{job._id}" class="job-link">
              <div class="company-logo">
                <img 
                  src={job.logo || generateCompanyIcon(job.company)}
                  alt={`${job.company} logo`}
                  on:error={(e) => handleImageError(e)}
                />
              </div>
              <div class="job-info">
                <div class="job-main">
                  <h3 class="job-title">{job.title}</h3>
                  <p class="company-name">{job.company}</p>
                </div>
                <div class="job-meta">
                  <div class="location">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
                    </svg>
                    {job.address.city}, {job.address.state}
                  </div>
                  <div class="salary">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </svg>
                    ${job.hourlyRate}/hr
                  </div>
                  <button 
                    class="favorite-button" 
                    class:active={savedJobs?.has(job._id)}
                    on:click|preventDefault={(e) => toggleSaveJob(job._id, e)}
                    title={savedJobs?.has(job._id) ? "Remove from saved" : "Save job"}
                  >
                    <svg class="heart-icon" viewBox="0 0 24 24" width="16" height="16">
                      <path
                        fill="currentColor"
                        d={savedJobs?.has(job._id) 
                          ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          : "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        }
                      />
                    </svg>
                  </button>
                </div>
                <div class="tags">
                  {#each job.tags.slice(0, 3) as tag}
                    {@const color = getTagColor(tag)}
                    <span class="tag" style="background: {color.bg}; color: {color.text}">
                      {tag}
                    </span>
                  {/each}
                  {#if job.isUrgent}
                    <span class="tag urgent">Urgent</span>
                  {/if}
                </div>
              </div>
            </a>
          </div>
        {/each}
      </div>

      {#if !$subscription?.subscription?.isPaid}
        <div class="upgrade-overlay">
          <button class="upgrade-btn" on:click={() => showSubscriptionModal = true}>
            <span class="premium-badge">PREMIUM</span>
            Unlock All Jobs
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if showSubscriptionModal}
  <SubscriptionModal
    on:subscribed={() => {
      showSubscriptionModal = false;
      fetchJobs();
    }}
    on:close={() => showSubscriptionModal = false}
  />
{/if}

<style>
  .discover-section {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
  }

  .jobs-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
  }

  .job-card {
    position: relative;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .job-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #D1D5DB;
  }

  .job-link {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    color: inherit;
    text-decoration: none;
  }

  .company-logo {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .company-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .job-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .job-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .job-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .company-name {
    font-size: 0.875rem;
    color: #6B7280;
    margin: 0;
  }

  .job-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .location, .salary {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .tag.urgent {
    background: #FEF2F2;
    color: #DC2626;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    color: #6B7280;
  }

  .loading-spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid #E5E7EB;
    border-top-color: #6355FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    padding: 1rem;
    color: #DC2626;
    text-align: center;
  }

  .no-jobs {
    padding: 2rem;
    text-align: center;
    color: #6B7280;
  }

  .header-upgrade-btn {
    background: #6355FF;
    filter: none;
    opacity: 1;
  }

  .overlay-upgrade-btn {
    background: linear-gradient(135deg, #6355FF 0%, #5346E0 100%);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.25);
    filter: none;
    opacity: 1;
  }

  .upgrade-btn {
    background: linear-gradient(135deg, #6355FF 0%, #5346E0 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 100px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    filter: none !important;
    opacity: 1 !important;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.25);
  }

  .upgrade-btn:hover {
    background: #5346E0;
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
    backdrop-filter: none;
  }

  .blurred {
    filter: blur(4px);
    pointer-events: none;
    opacity: 0.7;
  }

  .upgrade-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    z-index: 10;
  }

  @media (max-width: 768px) {
    .discover-section {
      padding: 16px;
    }
    
    .section-header h2 {
      font-size: 1.25rem;
    }
    
    .jobs-list {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    
    .job-card {
      padding: 16px;
    }
    
    .company-logo {
      width: 40px;
      height: 40px;
    }
    
    .job-title {
      font-size: 1rem;
    }
    
    .job-meta {
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .tags {
      margin-top: 8px;
    }
    
    .tag {
      padding: 3px 10px;
      font-size: 0.7rem;
    }
    
    .upgrade-btn {
      padding: 10px 20px;
      font-size: 0.875rem;
    }
  }
  
  @media (max-width: 480px) {
    .discover-section {
      padding: 12px;
    }
    
    .section-header {
      margin-bottom: 12px;
    }
    
    .section-header h2 {
      font-size: 1.125rem;
    }
    
    .jobs-list {
      gap: 12px;
    }
    
    .job-card {
      padding: 14px;
      border-radius: 10px;
    }
    
    .job-header {
      gap: 10px;
    }
    
    .company-logo {
      width: 36px;
      height: 36px;
      border-radius: 6px;
    }
    
    .job-title {
      font-size: 0.9rem;
    }
    
    .company-name {
      font-size: 0.8rem;
    }
    
    .job-meta {
      font-size: 0.8rem;
      gap: 10px;
    }
    
    .location, .salary {
      gap: 4px;
    }
    
    .location svg, .salary svg {
      width: 14px;
      height: 14px;
    }
    
    .tags {
      gap: 6px;
      margin-top: 6px;
    }
    
    .tag {
      padding: 2px 8px;
      font-size: 0.65rem;
    }
    
    .upgrade-btn {
      padding: 8px 16px;
      font-size: 0.8rem;
      gap: 6px;
    }
    
    .premium-badge {
      padding: 0.2rem 0.5rem;
      font-size: 0.65rem;
    }
    
    .favorite-button {
      padding: 0.2rem;
    }
    
    .heart-icon {
      width: 16px;
      height: 16px;
    }
    
    .loading, .error, .no-jobs {
      padding: 1.5rem;
      font-size: 0.875rem;
    }
    
    .loading-spinner {
      width: 1.25rem;
      height: 1.25rem;
    }
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

  .heart-icon {
    width: 18px;
    height: 18px;
  }
</style> 