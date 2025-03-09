<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../stores/userStore';
  import JobList from '../../components/jobs/JobList.svelte';
  import DashboardLayout from '../../components/layouts/DashboardLayout.svelte';

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
</script>

<DashboardLayout>
  <div class="header">
    <h1>Saved Jobs ({savedJobs.length})</h1>
    <p class="subtitle">Jobs you've saved for later</p>
  </div>

  {#if loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <span>Loading saved jobs...</span>
    </div>
  {:else if error}
    <div class="error">
      {error}
    </div>
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
    <JobList jobs={savedJobs} />
  {/if}
</DashboardLayout>

<style>
  .header {
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #6B7280;
    font-size: 1.1rem;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 4rem 0;
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

  .error {
    text-align: center;
    color: #DC2626;
    padding: 2rem;
    background: #FEF2F2;
    border-radius: 8px;
  }

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

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style> 