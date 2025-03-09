<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../../stores/userStore';

  let savedJobs: any[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    await loadSavedJobs();
  });

  async function loadSavedJobs() {
    try {
      loading = true;
      error = null;

      const response = await fetch(`${PUBLIC_API_URL}/users/saved-jobs`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) throw new Error('Failed to load saved jobs');
      savedJobs = await response.json();
    } catch (err) {
      console.error('Error loading saved jobs:', err);
      error = 'Failed to load saved jobs';
    } finally {
      loading = false;
    }
  }

  function handleJobClick(jobId: string) {
    window.location.href = `/dashboard/jobs/${jobId}`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffInDays}d ago`;
  }
</script>

<div class="saved-jobs">
  <div class="page-header">
    <button class="back-button" on:click={() => window.location.href = '/dashboard'}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
      </svg>
      Back to Dashboard
    </button>
  </div>

  {#if loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <span>Loading saved jobs...</span>
    </div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if savedJobs.length === 0}
    <div class="empty-state">
      <svg viewBox="0 0 24 24" width="48" height="48">
        <path fill="#9CA3AF" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <h2>No saved jobs yet</h2>
      <p>Jobs you save will appear here</p>
      <a href="/jobs" class="browse-jobs-btn">Browse Jobs</a>
    </div>
  {:else}
    <div class="saved-jobs-grid">
      {#each savedJobs as job}
        <div class="job-card" on:click={() => handleJobClick(job._id)}>
          <div class="job-header">
            <h3>{job.title}</h3>
            <span class="date">{formatDate(job.createdAt)}</span>
          </div>
          <div class="company-info">
            <span class="company-name">{job.company}</span>
            <span class="location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
              </svg>
              {job.address.city}, {job.address.state}
            </span>
          </div>
          <div class="salary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
            </svg>
            ${job.hourlyRate}/hr
          </div>
          {#if job.tags && job.tags.length > 0}
            <div class="tags">
              {#each job.tags.slice(0, 3) as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .saved-jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
  }

  .job-card {
    background: white;
    border: 1px solid #EAECF0;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .job-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: #6355FF;
  }

  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 1.15rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.02em;
    line-height: 1.4;
  }

  .date {
    font-size: 0.875rem;
    color: #6B7280;
    font-weight: 500;
  }

  .company-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .company-name {
    font-weight: 600;
    color: #374151;
    font-size: 0.95rem;
  }

  .location {
    font-size: 0.875rem;
    color: #6B7280;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .salary {
    font-weight: 600;
    color: #16A34A;
    margin-bottom: 16px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: auto;
  }

  .tag {
    background: rgba(99, 85, 255, 0.08);
    color: #6355FF;
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  /* Loading state styles */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px;
    color: #6B7280;
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

  /* Empty state styles */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .empty-state h2 {
    font-size: 1.5rem;
    color: #374151;
    margin: 1rem 0 0.5rem;
  }

  .empty-state p {
    color: #6B7280;
    margin-bottom: 1.5rem;
  }

  .browse-jobs-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: #6355FF;
    color: white;
    border-radius: 8px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
  }

  .browse-jobs-btn:hover {
    background: #5346E0;
    transform: translateY(-1px);
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    color: #4B5563;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button:hover {
    background: #F9FAFB;
    border-color: #D1D5DB;
    color: #111827;
    transform: translateY(-1px);
  }

  .back-button svg {
    transition: transform 0.2s;
  }

  .back-button:hover svg {
    transform: translateX(-2px);
  }
</style> 