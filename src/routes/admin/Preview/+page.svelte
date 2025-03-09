<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../../stores/userStore';
  import { notifications } from '../../../stores/notificationStore';
  import type { Job } from '../../../types/job';

  let allJobs: Job[] = [];
  let previewJobs: Job[] = [];
  let loading = true;
  let saving = false;
  let error: string | null = null;

  onMount(async () => {
    await Promise.all([
      fetchAllJobs(),
      fetchCurrentPreview()
    ]);
  });

  async function fetchAllJobs() {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/jobs`, {
        headers: {
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');
      allJobs = await response.json();
    } catch (err) {
      console.error('Error fetching jobs:', err);
      notifications.add({
        type: 'error',
        message: 'Failed to load jobs'
      });
    } finally {
      loading = false;
    }
  }

  async function fetchCurrentPreview() {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/admin/settings`, {
        headers: {
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) throw new Error('Failed to fetch preview settings');
      const data = await response.json();
      previewJobs = data.previewJobs;
    } catch (err) {
      console.error('Error fetching preview settings:', err);
      notifications.add({
        type: 'error',
        message: 'Failed to load preview settings'
      });
    }
  }

  async function updatePreviewJobs() {
    try {
      saving = true;
      const jobIds = previewJobs.map(job => job._id);

      const response = await fetch(`${PUBLIC_API_URL}/admin/settings/preview-jobs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        },
        body: JSON.stringify({ jobIds })
      });

      if (!response.ok) throw new Error('Failed to update preview jobs');
      
      notifications.add({
        type: 'success',
        message: 'Preview jobs updated successfully'
      });
    } catch (err) {
      console.error('Error updating preview jobs:', err);
      notifications.add({
        type: 'error',
        message: 'Failed to update preview jobs'
      });
    } finally {
      saving = false;
    }
  }

  function handleDragStart(e: DragEvent, job: Job) {
    e.dataTransfer?.setData('text/plain', job._id);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const jobId = e.dataTransfer?.getData('text/plain');
    if (!jobId) return;

    const job = allJobs.find(j => j._id === jobId);
    if (job && !previewJobs.find(p => p._id === job._id)) {
      previewJobs = [...previewJobs, job];
    }
  }

  function removeFromPreview(jobId: string) {
    previewJobs = previewJobs.filter(job => job._id !== jobId);
  }

  // Generate placeholder logo if none exists
  function getLogoPlaceholder(company: string): string {
    const colors = ['#4F46E5', '#0EA5E9', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return company.charAt(0).toUpperCase();
  }

  function formatSalary(hourlyRate: number): string {
    const monthlyRate = hourlyRate * 160; // Assuming 160 hours per month
    return `$${monthlyRate.toLocaleString()}/mo`;
  }
</script>

<div class="preview-page">
  <div class="header">
    <h1>Manage Preview Jobs</h1>
    <p class="subtitle">Drag and drop jobs to customize the preview section (max 4 jobs)</p>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>Loading jobs...</span>
    </div>
  {:else}
    <div class="preview-container">
      <!-- Available Jobs -->
      <div class="jobs-section">
        <h2>Available Jobs</h2>
        <div class="jobs-list">
          {#each allJobs as job}
            <div 
              class="job-card"
              draggable="true"
              on:dragstart={(e) => handleDragStart(e, job)}
            >
              <div class="job-card-header">
                <div class="company-logo">
                  {#if job.logo}
                    <img 
                      src={job.logo} 
                      alt={job.company}
                      on:error={(e) => e.currentTarget.style.display = 'none'}
                    />
                  {:else}
                    <div class="logo-placeholder" style="background: {colors[Math.floor(Math.random() * colors.length)]}">
                      {getLogoPlaceholder(job.company)}
                    </div>
                  {/if}
                </div>
                <div class="job-info">
                  <h3>{job.title}</h3>
                  <p class="company">{job.company}</p>
                </div>
              </div>
              <div class="job-details">
                <div class="location">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
                  </svg>
                  <span>{job.address.city}</span>
                </div>
                <div class="salary">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                  <span>{formatSalary(job.hourlyRate)}</span>
                </div>
              </div>
              <div class="tags">
                {#each job.tags || [] as tag}
                  <span class="tag">{tag}</span>
                {/each}
                {#if job.isUrgent}
                  <span class="tag urgent">Urgent</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Preview Section -->
      <div 
        class="preview-section"
        on:dragover={handleDragOver}
        on:drop={handleDrop}
      >
        <h2>Preview Jobs</h2>
        <p class="help-text">Drop jobs here to add them to the preview section</p>
        
        <div class="preview-list">
          {#each previewJobs as job}
            <div class="preview-card">
              <div class="job-card-header">
                <div class="company-logo">
                  {#if job.logo}
                    <img 
                      src={job.logo} 
                      alt={job.company}
                      on:error={(e) => e.currentTarget.style.display = 'none'}
                    />
                  {:else}
                    <div class="logo-placeholder" style="background: {colors[Math.floor(Math.random() * colors.length)]}">
                      {getLogoPlaceholder(job.company)}
                    </div>
                  {/if}
                </div>
                <div class="job-info">
                  <h3>{job.title}</h3>
                  <p class="company">{job.company}</p>
                </div>
              </div>
              <button 
                class="remove-btn"
                on:click={() => removeFromPreview(job._id)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          {/each}
        </div>

        <button 
          class="save-btn" 
          on:click={updatePreviewJobs}
          disabled={saving || previewJobs.length === 0}
        >
          {#if saving}
            <div class="spinner small"></div>
            <span>Saving...</span>
          {:else}
            <span>Save Preview Jobs</span>
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #E5E7EB;
    border-top-color: #6355FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .spinner.small {
    width: 16px;
    height: 16px;
    border-width: 2px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .preview-page {
    padding: 2rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #6B7280;
  }

  .preview-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .jobs-section, .preview-section {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
  }

  h2 {
    font-size: 1.25rem;
    color: #374151;
    margin-bottom: 1rem;
  }

  .help-text {
    color: #6B7280;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .jobs-list {
    display: grid;
    gap: 1rem;
    max-height: 600px;
    overflow-y: auto;
  }

  .job-card {
    padding: 1rem;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    cursor: move;
    background: white;
    transition: all 0.2s;
  }

  .job-card:hover {
    border-color: #6355FF;
    transform: translateY(-1px);
  }

  .preview-list {
    min-height: 200px;
    border: 2px dashed #E5E7EB;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .preview-card {
    position: relative;
    padding: 1rem;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    background: white;
  }

  .company {
    color: #6B7280;
    font-size: 0.875rem;
  }

  .tags {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .tag {
    padding: 0.25rem 0.5rem;
    background: #F3F4F6;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #374151;
  }

  .remove-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem;
    background: none;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    transition: color 0.2s;
  }

  .remove-btn:hover {
    color: #EF4444;
  }

  .save-btn {
    width: 100%;
    padding: 0.75rem;
    background: #6355FF;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-btn:hover:not(:disabled) {
    background: #5346E0;
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .preview-container {
      grid-template-columns: 1fr;
    }
  }

  .job-card-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .company-logo {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    overflow: hidden;
    background: #F3F4F6;
    flex-shrink: 0;
  }

  .company-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .logo-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .job-info {
    flex: 1;
  }

  .job-details {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .location, .salary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tag.urgent {
    background: #FEF2F2;
    color: #DC2626;
    border: 1px solid #FEE2E2;
    font-weight: 500;
  }
</style>
