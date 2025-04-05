<script lang="ts">
  interface JobAlert {
    id: string;
    title: string;
    keywords: string[];
    location: string;
    frequency: 'daily' | 'weekly' | 'instant';
    active: boolean;
    createdAt: string;
  }

  let alerts: JobAlert[] = [
    {
      id: '1',
      title: 'Software Developer Positions',
      keywords: ['React', 'TypeScript', 'Node.js'],
      location: 'San Francisco, CA',
      frequency: 'daily',
      active: true,
      createdAt: '2024-03-15'
    },
    {
      id: '2',
      title: 'UI/UX Designer Jobs',
      keywords: ['Figma', 'UI Design', 'User Research'],
      location: 'Remote',
      frequency: 'weekly',
      active: true,
      createdAt: '2024-03-14'
    }
  ];

  // New alert form data
  let newAlert = {
    title: '',
    keywords: '',
    location: '',
    frequency: 'daily' as const
  };

  function createAlert() {
    const alert: JobAlert = {
      id: Math.random().toString(36).substr(2, 9),
      title: newAlert.title,
      keywords: newAlert.keywords.split(',').map(k => k.trim()),
      location: newAlert.location,
      frequency: newAlert.frequency,
      active: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    alerts = [alert, ...alerts];
    
    // Reset form
    newAlert = {
      title: '',
      keywords: '',
      location: '',
      frequency: 'daily'
    };
  }

  function toggleAlert(id: string) {
    alerts = alerts.map(alert => 
      alert.id === id ? {...alert, active: !alert.active} : alert
    );
  }

  function deleteAlert(id: string) {
    alerts = alerts.filter(alert => alert.id !== id);
  }
</script>

<div class="job-alerts-container">
  <div class="hero-section">
    <span class="subtitle">Stay Updated</span>
    <h1>Job Alerts</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
      </svg>
      <span class="line"></span>
    </div>
    <p class="hero-description">
      Never miss your dream job opportunity
    </p>
  </div>

  <div class="content-section">
    <div class="create-alert-section">
      <h2>Create New Alert</h2>
      <form on:submit|preventDefault={createAlert} class="create-alert-form">
        <div class="form-group">
          <label for="title">Alert Name</label>
          <input
            type="text"
            id="title"
            bind:value={newAlert.title}
            placeholder="e.g., Senior Developer Positions"
            required
          />
        </div>

        <div class="form-group">
          <label for="keywords">Keywords (comma-separated)</label>
          <input
            type="text"
            id="keywords"
            bind:value={newAlert.keywords}
            placeholder="e.g., React, TypeScript, Node.js"
            required
          />
        </div>

        <div class="form-group">
          <label for="location">Location</label>
          <input
            type="text"
            id="location"
            bind:value={newAlert.location}
            placeholder="e.g., New York, Remote"
            required
          />
        </div>

        <div class="form-group">
          <label for="frequency">Alert Frequency</label>
          <select id="frequency" bind:value={newAlert.frequency}>
            <option value="instant">Instant</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <button type="submit" class="create-btn">Create Alert</button>
      </form>
    </div>

    <div class="alerts-section">
      <h2>Your Alerts</h2>
      {#if alerts.length === 0}
        <div class="no-alerts">
          <svg class="no-alerts-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p>No alerts created yet</p>
        </div>
      {:else}
        <div class="alerts-grid">
          {#each alerts as alert}
            <div class="alert-card">
              <div class="alert-header">
                <h3>{alert.title}</h3>
                <div class="alert-actions">
                  <button 
                    class="toggle-btn" 
                    class:active={alert.active}
                    on:click={() => toggleAlert(alert.id)}
                  >
                    {alert.active ? 'Active' : 'Paused'}
                  </button>
                  <button 
                    class="delete-btn"
                    on:click={() => deleteAlert(alert.id)}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="alert-details">
                <div class="keywords">
                  {#each alert.keywords as keyword}
                    <span class="keyword">{keyword}</span>
                  {/each}
                </div>
                <div class="location">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                  {alert.location}
                </div>
                <div class="frequency">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  {alert.frequency.charAt(0).toUpperCase() + alert.frequency.slice(1)} updates
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .job-alerts-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .hero-section {
    text-align: center;
    padding: 4rem 0;
    margin-bottom: 3rem;
  }

  .subtitle {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
    color: #6356FF;
  }

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    color: #1F2937;
  }

  .header-accent {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .line {
    width: 60px;
    height: 2px;
    background: rgba(99, 86, 255, 0.2);
    border-radius: 1px;
  }

  .hero-description {
    font-size: 1.25rem;
    color: #6B7280;
    max-width: 600px;
    margin: 0 auto;
  }

  .content-section {
    display: grid;
    gap: 3rem;
  }

  .create-alert-section {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid #E5E7EB;
  }

  h2 {
    font-size: 1.5rem;
    color: #1F2937;
    margin-bottom: 1.5rem;
  }

  .create-alert-form {
    display: grid;
    gap: 1.5rem;
  }

  .form-group {
    display: grid;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
    color: #4B5563;
  }

  input,
  select {
    padding: 0.75rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #6356FF;
    box-shadow: 0 0 0 3px rgba(99, 86, 255, 0.1);
  }

  .create-btn {
    padding: 0.75rem;
    background: #6356FF;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .create-btn:hover {
    background: #5244E3;
  }

  .alerts-grid {
    display: grid;
    gap: 1.5rem;
  }

  .alert-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid #E5E7EB;
  }

  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .alert-header h3 {
    font-size: 1.25rem;
    color: #1F2937;
  }

  .alert-actions {
    display: flex;
    gap: 0.5rem;
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    background: #EEF2FF;
    color: #6356FF;
    border: none;
  }

  .toggle-btn.active {
    background: #6356FF;
    color: white;
  }

  .delete-btn {
    padding: 0.5rem;
    border-radius: 0.5rem;
    background: #FEE2E2;
    color: #DC2626;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delete-btn:hover {
    background: #FEE2E2;
  }

  .delete-btn svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .alert-details {
    display: grid;
    gap: 1rem;
  }

  .keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .keyword {
    padding: 0.25rem 0.75rem;
    background: #F3F4F6;
    color: #4B5563;
    border-radius: 1rem;
    font-size: 0.875rem;
  }

  .location,
  .frequency {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .location svg,
  .frequency svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .no-alerts {
    text-align: center;
    padding: 4rem 0;
    color: #6B7280;
  }

  .no-alerts-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .job-alerts-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .create-alert-form {
      grid-template-columns: 1fr;
    }
  }
</style> 