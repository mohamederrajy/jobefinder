<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { subscription } from '../../stores/subscriptionStore';
  import { user } from '../../stores/userStore';
  import SubscriptionModal from '../modals/SubscriptionModal.svelte';
  import { notifications } from '../../stores/notificationStore';

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

  type TagColorMap = {
    [key: string]: { bg: string; text: string };
  };

  const tagColors: TagColorMap = {
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

      const response = await fetch(`${PUBLIC_API_URL}/jobs`, {
        headers: {
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const allJobs = await response.json();
      // Always show only 3 jobs
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

  // Add new animation function
  function animateNumber(node: HTMLElement, { duration = 1000 }) {
    const final = parseInt(node.textContent || '0');
    return {
      duration,
      tick: (t: number) => {
        node.textContent = Math.floor(t * final).toString();
      }
    };
  }
</script>

<section class="discover-section">
  {#if loading}
    <div class="loader" />
  {:else if error}
    <div class="error">{error}</div>
  {:else}
    <div class="jobs-grid">
      {#each jobs as job (job._id)}
        <a href="/dashboard/jobs/{job._id}" class="job-card">
          <div class="card-content">
            <div class="card-left">
              <div class="company-logo" style="background: {getCompanyColor(job.company).bg}">
                {#if job.logo}
                  <img src={job.logo} alt={job.company} on:error={handleImageError} />
                {:else}
                  <span>{getCompanyInitials(job.company)}</span>
                {/if}
              </div>
            </div>

            <div class="card-middle">
              <div class="title-row">
                <h3>{job.title}</h3>
                {#if job.isUrgent}
                  <span class="urgent-tag">Featured</span>
                {/if}
              </div>
              <p class="company-name">{job.company}</p>
              <div class="job-meta">
                <span class="location">{job.address.city}, {job.address.state}</span>
                <span class="divider">•</span>
                <span class="salary">${job.hourlyRate}/hr</span>
              </div>
            </div>

            <div class="card-right">
              <button 
                class="save-btn" 
                class:saved={savedJobs?.has(job._id)}
                on:click|preventDefault={(e) => toggleSaveJob(job._id, e)}
              >
                <svg viewBox="0 0 24 24" fill={savedJobs?.has(job._id) ? "currentColor" : "none"}>
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                </svg>
              </button>
              <div class="tags">
                {#each job.tags.slice(0, 2) as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</section>

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
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .jobs-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .job-card {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 0.75rem;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
  }

  .job-card:hover {
    border-color: #8B5CF6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.08);
  }

  .card-content {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1.5rem;
    padding: 1.25rem;
    align-items: center;
  }

  .company-logo {
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .company-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.5rem;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .title-row h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .urgent-tag {
    background: #FEF3C7;
    color: #D97706;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .company-name {
    color: #6B7280;
    font-size: 0.875rem;
    margin: 0 0 0.5rem;
  }

  .job-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4B5563;
    font-size: 0.75rem;
  }

  .divider {
    color: #9CA3AF;
  }

  .card-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
  }

  .save-btn {
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    color: #9CA3AF;
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
  }

  .save-btn:hover, .save-btn.saved {
    color: #8B5CF6;
    border-color: #8B5CF6;
    background: #F5F3FF;
  }

  .save-btn svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke: currentColor;
    stroke-width: 2;
  }

  .tags {
    display: flex;
    gap: 0.375rem;
  }

  .tag {
    background: #F3F4F6;
    color: #4B5563;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .loader {
    width: 2rem;
    height: 2rem;
    border: 2px solid #E5E7EB;
    border-top-color: #8B5CF6;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin: 2rem auto;
  }

  .error {
    text-align: center;
    color: #DC2626;
    padding: 1rem;
    background: #FEF2F2;
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 640px) {
    .discover-section {
      padding: 1rem;
    }

    .card-content {
      grid-template-columns: auto 1fr;
      gap: 1rem;
      padding: 1rem;
    }

    .card-right {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    .job-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .divider {
      display: none;
    }
  }
</style> 