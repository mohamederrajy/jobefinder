<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../../stores/userStore';
  import { goto } from '$app/navigation';
  import EditJobModal from '../../../components/modals/EditJobModal.svelte';
  import AddJobModal from '../../../components/modals/AddJobModal.svelte';

  const API_URL = 'http://localhost:5001'; // Match your backend port
  const DEFAULT_LOGO = '/images/default-logo.png'; // Make sure this file exists in static/images/

  interface Job {
    _id: string;
    title: string;
    company: string;
    logo?: string;
    hourlyRate: number;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    tags: string[];
    isUrgent: boolean;
    createdAt: string;
    createdBy: {
      email: string;
    };
  }

  let jobs: Job[] = [];
  let loading = true;
  let error: string | null = null;
  let searchQuery = '';
  let filters = {
    city: '',
    minHourlyRate: '',
    maxHourlyRate: '',
    tags: '',
    isUrgent: false
  };

  let editingJob: Job | null = null;
  let failedLogos = new Set<string>();
  let defaultLogoFailed = false;
  let showAddModal = false;

  async function fetchJobs() {
    try {
      loading = true;
      error = null;

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.minHourlyRate) params.append('minHourlyRate', filters.minHourlyRate);
      if (filters.maxHourlyRate) params.append('maxHourlyRate', filters.maxHourlyRate);
      if (filters.tags) params.append('tags', filters.tags);
      if (filters.isUrgent) params.append('isUrgent', 'true');

      const response = await fetch(`${PUBLIC_API_URL}/jobs?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      jobs = await response.json();
      console.log('Jobs fetched:', jobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      error = err instanceof Error ? err.message : 'Failed to fetch jobs';
    } finally {
      loading = false;
    }
  }

  async function deleteJob(jobId: string) {
    try {
      if (!confirm('Are you sure you want to delete this job?')) {
        return;
      }

      const response = await fetch(`${PUBLIC_API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      // Remove the job from the list
      jobs = jobs.filter(job => job._id !== jobId);
      
      // Show success message
      alert('Job deleted successfully');
    } catch (err) {
      console.error('Error deleting job:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete job');
    }
  }

  function handleEdit(job: Job) {
    editingJob = job;
  }

  function handleJobUpdated(event: CustomEvent) {
    const updatedJob = event.detail;
    jobs = jobs.map(job => 
      job._id === updatedJob._id ? updatedJob : job
    );
    editingJob = null;
  }

  function getLogoUrl(logoPath: string | undefined): string {
    if (!logoPath) return DEFAULT_LOGO;
    
    // If it's already a full URL, return as is
    if (logoPath.startsWith('http')) return logoPath;
    
    // If it's a relative path starting with /uploads
    if (logoPath.startsWith('/uploads')) {
      return `${API_URL}${logoPath}`;
    }
    
    // For any other case, return default
    return DEFAULT_LOGO;
  }

  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    
    // If this is the default logo failing, show placeholder instead
    if (img.src.endsWith(DEFAULT_LOGO) || defaultLogoFailed) {
      defaultLogoFailed = true;
      // Replace img with initials placeholder
      const container = img.parentElement;
      if (container) {
        container.innerHTML = `
          <div class="logo-placeholder" style="background-color: #6355FF">
            ${getCompanyInitials(job.company)}
          </div>
        `;
      }
      return;
    }

    console.log('Image failed to load:', img.src);
    img.src = DEFAULT_LOGO;
  }

  function getCompanyInitials(company: string): string {
    return company
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onMount(fetchJobs);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  $: filteredJobs = searchQuery 
    ? jobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : jobs;

  async function handleJobCreated(event: CustomEvent) {
    try {
      const newJob = event.detail;
      if (!newJob) {
        console.error('No job data received');
        return;
      }
      
      jobs = [newJob, ...jobs];
      showAddModal = false;
      await fetchJobs(); // Refresh the jobs list
    } catch (err) {
      console.error('Error handling new job:', err);
    }
  }
</script>

<div class="jobs-page">
  <div class="page-header">
    <h1>Manage Jobs</h1>
    <button class="add-job-btn" on:click={() => showAddModal = true}>
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      Add New Job
    </button>
  </div>

  <div class="filters">
    <div class="search-bar">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
      <input 
        type="text" 
        placeholder="Search jobs..." 
        bind:value={searchQuery}
      >
    </div>

    <div class="filter-group">
      <input 
        type="text" 
        placeholder="Filter by city" 
        bind:value={filters.city}
        on:change={fetchJobs}
      >
      <input 
        type="number" 
        placeholder="Min hourly rate" 
        bind:value={filters.minHourlyRate}
        on:change={fetchJobs}
      >
      <input 
        type="number" 
        placeholder="Max hourly rate" 
        bind:value={filters.maxHourlyRate}
        on:change={fetchJobs}
      >
      <input 
        type="text" 
        placeholder="Tags (comma-separated)" 
        bind:value={filters.tags}
        on:change={fetchJobs}
      >
      <label class="urgent-filter">
        <input 
          type="checkbox" 
          bind:checked={filters.isUrgent}
          on:change={fetchJobs}
        >
        Urgent only
      </label>
    </div>
  </div>

  {#if loading}
    <div class="loading">Loading jobs...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else}
    <div class="jobs-grid">
      {#each filteredJobs as job (job._id)}
        <div class="job-card" class:urgent={job.isUrgent}>
          <div class="status-badge" class:urgent={job.isUrgent}>
            {job.isUrgent ? 'Urgent' : 'Regular'}
          </div>
          
          <div class="job-header">
            <div class="company-logo">
              <img 
                src={getLogoUrl(job.logo)} 
                alt={`${job.company} logo`}
                on:error={handleImageError}
                loading="lazy"
                class="company-logo-img"
              />
            </div>
            
            <div class="job-title-section">
              <h3>{job.title}</h3>
              <div class="company-info">
                <span class="company-name">{job.company}</span>
                <span class="salary">${job.hourlyRate}/hr</span>
              </div>
              
              <div class="job-meta">
                <div class="meta-item">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {job.address.city}, {job.address.state}
                </div>
                <div class="meta-item">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  Posted {formatDate(job.createdAt)}
                </div>
              </div>
            </div>
          </div>

          <div class="job-content">
            <div class="tags">
              {#each job.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>

            <div class="job-footer">
              <div class="creator-info">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>Created by {job.createdBy.email}</span>
              </div>

              <div class="job-actions">
                <button class="action-btn edit" on:click={() => handleEdit(job)}>
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Edit
                </button>
                <button class="action-btn delete" on:click={() => deleteJob(job._id)}>
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if editingJob}
    <EditJobModal 
      job={editingJob}
      on:jobUpdated={handleJobUpdated}
      on:close={() => editingJob = null}
    />
  {/if}

  {#if showAddModal}
    <AddJobModal 
      on:jobCreated={handleJobCreated}
      on:close={() => showAddModal = false}
    />
  {/if}
</div>

<style>
  /* Update font imports for more professional options */
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  .job-title-section h3 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #111827;
    margin: 0 0 0.5rem 0;
    line-height: 1.3;
  }

  .company-name {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: #4B5563;
  }

  .salary {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    background: #ECFDF5;
    color: #059669;
    padding: 0.375rem 1rem;
    border-radius: 100px;
    box-shadow: 0 1px 2px rgba(5, 150, 105, 0.05);
  }

  .job-meta {
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 450;
    color: #6B7280;
    letter-spacing: -0.01em;
  }

  .tag {
    font-family: 'Inter', sans-serif;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    background: #F3F4F6;
    color: #4B5563;
    padding: 0.375rem 0.875rem;
    border-radius: 100px;
    transition: all 0.2s ease;
  }

  .tag:hover {
    background: #E5E7EB;
    color: #374151;
  }

  .status-badge {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .action-btn {
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  /* Enhance job card appearance */
  .job-card {
    background: white;
    border-radius: 16px;
    padding: 1.75rem;
    border: 1px solid #E5E7EB;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05),
                0 1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .job-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1),
                0 4px 8px rgba(0, 0, 0, 0.05);
    border-color: #D1D5DB;
  }

  /* Add subtle animations */
  .job-card * {
    transition: all 0.2s ease;
  }

  .action-btn {
    transform-origin: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .action-btn:hover {
    transform: translateY(-1px) scale(1.02);
  }

  .action-btn:active {
    transform: translateY(0) scale(0.98);
  }

  .jobs-page {
    padding: 2rem;
    max-width: 1440px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #111827;
  }

  .add-job-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #6355FF;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 500;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
  }

  .add-job-btn:hover {
    background: #5346E0;
    transform: translateY(-1px);
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
    margin-bottom: 2rem;
  }

  .search-bar input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1rem;
  }

  .jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .job-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid #E5E7EB;
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .job-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: #D1D5DB;
  }

  .job-card.urgent {
    background: white;
    border: 2px solid #DC2626;
  }

  .status-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 1rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-badge.urgent {
    background: #DC2626;
    color: white;
  }

  .job-header {
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding-right: 4rem;
  }

  .company-logo {
    width: 72px;
    height: 72px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #E5E7EB;
  }

  .job-title-section {
    flex: 1;
    min-width: 0;
  }

  .job-title-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
  }

  .company-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .company-name {
    color: #4B5563;
    font-weight: 500;
    font-size: 0.975rem;
  }

  .salary {
    color: #059669;
    font-weight: 600;
    font-size: 0.925rem;
    background: #ECFDF5;
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
  }

  .job-meta {
    display: flex;
    gap: 1.25rem;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .tag {
    background: #F3F4F6;
    color: #4B5563;
    padding: 0.375rem 0.875rem;
    border-radius: 100px;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: -0.01em;
  }

  .job-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1.25rem;
    border-top: 1px solid #E5E7EB;
  }

  .creator-info {
    font-size: 0.875rem;
    color: #6B7280;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #E5E7EB;
  }

  .job-actions {
    display: flex;
    gap: 0.75rem;
  }

  .action-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn.edit {
    background: #F3F4F6;
    color: #111827;
    border: none;
  }

  .action-btn.delete {
    background: #FEE2E2;
    color: #DC2626;
    border: none;
  }

  .action-btn:hover {
    transform: translateY(-1px);
  }

  .action-btn.edit:hover {
    background: #E5E7EB;
  }

  .action-btn.delete:hover {
    background: #FEF2F2;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #E5E7EB;
    transition: .4s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #6355FF;
  }

  input:checked + .slider:before {
    transform: translateX(24px);
  }

  @media (max-width: 768px) {
    .jobs-grid {
      grid-template-columns: 1fr;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }

  .filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .filter-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .filter-group input[type="text"],
  .filter-group input[type="number"] {
    padding: 0.5rem 1rem;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    font-size: 0.875rem;
  }

  .urgent-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4B5563;
    font-size: 0.875rem;
  }

  .urgent-badge {
    background: #DC2626;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .creator {
    color: #6B7280;
    font-size: 0.75rem;
  }

  .company-logo {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #E5E7EB;
  }

  .company-logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 6px;
    background: white;
    transition: opacity 0.2s ease;
  }

  .company-logo-img:not([src]), 
  .company-logo-img[src=""] {
    opacity: 0;
  }

  .logo-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    background: #6355FF;
  }
</style> 