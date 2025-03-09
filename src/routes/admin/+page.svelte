<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import Chart from 'chart.js/auto';
  import AddJobModal from '../../components/modals/AddJobModal.svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../stores/userStore';

  interface UserStats {
    totalUsers: number;
    totalAdmins: number;
    totalRegularUsers: number;
    recentUsers: Array<{
      email: string;
      zipCode: string;
      role: string;
      createdAt: string;
    }>;
  }

  interface JobStats {
    totalJobs: number;
    urgentJobs: number;
    jobsByHourlyRate: {
      under15: number;
      between15and25: number;
      over25: number;
    };
    recentJobs: Array<{
      title: string;
      company: string;
      hourlyRate: number;
      createdBy: {
        email: string;
      };
    }>;
  }

  interface LocationStats {
    _id: string;
    count: number;
    averageRate: number;
  }

  let stats: {
    userStats: UserStats;
    jobStats: JobStats;
    locationStats: LocationStats[];
  } | null = null;

  let error: string | null = null;
  let loading = true;

  let isSidebarCollapsed = false;
  let hourlyRateChart: Chart | null = null;
  let locationChart: Chart | null = null;
  
  let showAddJobModal = false;

  function toggleSidebar() {
    isSidebarCollapsed = !isSidebarCollapsed;
  }

  function initializeCharts() {
    if (!stats) return;

    try {
      // Destroy existing charts if they exist
      if (hourlyRateChart) hourlyRateChart.destroy();
      if (locationChart) locationChart.destroy();

      // Fix TypeScript errors by asserting HTMLCanvasElement type
      const hourlyCanvas = document.getElementById('hourlyRateChart') as HTMLCanvasElement | null;
      const locationCanvas = document.getElementById('locationChart') as HTMLCanvasElement | null;

      if (hourlyCanvas) {
        const ctx = hourlyCanvas.getContext('2d');
        if (ctx) {
          hourlyRateChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Under $15', '$15-$25', 'Over $25'],
              datasets: [{
                data: [
                  stats.jobStats.jobsByHourlyRate.under15,
                  stats.jobStats.jobsByHourlyRate.between15and25,
                  stats.jobStats.jobsByHourlyRate.over25
                ],
                backgroundColor: ['#6355FF', '#10B981', '#F59E0B'],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 20,
                    usePointStyle: true
                  }
                }
              }
            }
          });
        }
      }

      if (locationCanvas) {
        const ctx = locationCanvas.getContext('2d');
        if (ctx) {
          locationChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: stats.locationStats.map(loc => loc._id),
              datasets: [{
                label: 'Number of Jobs',
                data: stats.locationStats.map(loc => loc.count),
                backgroundColor: '#6355FF',
                borderRadius: 6
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    drawBorder: false
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to initialize charts:', err);
    }
  }

  async function fetchStatistics() {
    try {
      loading = true;
      error = null;
      
      if (!$user?.token || $user?.role !== 'admin') {
        console.error('Unauthorized: User is not admin');
        goto('/login');
        return;
      }

      const response = await fetch(`${PUBLIC_API_URL}/admin/statistics`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user.token
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('Authentication failed:', response.status);
          goto('/login');
          return;
        }
        throw new Error(`Failed to fetch statistics: ${response.status}`);
      }
      
      stats = await response.json();
      console.log('Statistics loaded successfully:', stats);
      
      setTimeout(initializeCharts, 300);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      if (err instanceof Error) error = err.message;
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    if (!$user?.token || $user?.role !== 'admin') {
      console.log('No admin access, redirecting to login');
      await goto('/login');
      return;
    }
    await fetchStatistics();
  });

  onDestroy(() => {
    // Cleanup charts when component is destroyed
    if (hourlyRateChart) hourlyRateChart.destroy();
    if (locationChart) locationChart.destroy();
  });

  function handleAddJob() {
    showAddJobModal = true;
  }

  function handleJobCreated(event: CustomEvent) {
    // Refresh statistics after job creation
    fetchStatistics();
    showAddJobModal = false;
  }

  function handleManageUsers() {
    goto('/admin/users');
  }

  function handleManageJobs() {
    goto('/admin/jobs');
  }
</script>

<div class="main-header">
  <div class="header-content">
    <h2>Dashboard Overview</h2>
    <p class="subtitle">Welcome to the admin dashboard</p>
  </div>
  <div class="header-actions">
    <button class="action-button" on:click={handleAddJob}>
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      Add New Job
    </button>
  </div>
</div>

{#if loading}
  <div class="loading">Loading statistics...</div>
{:else if error}
  <div class="error">{error}</div>
{:else if stats}
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon users">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">{stats.userStats.totalUsers}</span>
        <span class="stat-label">Total Users</span>
        <div class="stat-trend positive">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
          </svg>
          <span>12% this month</span>
        </div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon jobs">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">{stats.jobStats.totalJobs}</span>
        <span class="stat-label">Active Jobs</span>
        <div class="stat-trend positive">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
          </svg>
          <span>8% this week</span>
        </div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon urgent">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">{stats.jobStats.urgentJobs}</span>
        <span class="stat-label">Urgent Jobs</span>
        <div class="stat-trend negative">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/>
          </svg>
          <span>3% this week</span>
        </div>
      </div>
    </div>
  </div>

  <div class="charts-grid">
    <div class="chart-card">
      <div class="chart-header">
        <div class="chart-title">
          <h3>Hourly Rate Distribution</h3>
          <p class="chart-subtitle">Distribution of job postings by hourly rate</p>
        </div>
        <div class="chart-actions">
          <button class="chart-filter active">Week</button>
          <button class="chart-filter">Month</button>
          <button class="chart-filter">Year</button>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="hourlyRateChart"></canvas>
        <div class="chart-total">
          <span class="total-value">{stats.jobStats.totalJobs}</span>
          <span class="total-label">Total Jobs</span>
        </div>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-header">
        <div class="chart-title">
          <h3>Jobs by Location</h3>
          <p class="chart-subtitle">Number of jobs in each location</p>
        </div>
        <div class="chart-actions">
          <button class="chart-filter active">All</button>
          <button class="chart-filter">Top 5</button>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="locationChart"></canvas>
      </div>
    </div>
  </div>

  <div class="data-grid">
    <div class="data-card">
      <div class="card-header">
        <h3>Recent Users</h3>
        <button class="view-all">View All</button>
      </div>
      <div class="data-list">
        {#each stats.userStats.recentUsers as user}
          <div class="list-item">
            <div class="user-avatar">
              {user.email[0].toUpperCase()}
            </div>
            <div class="item-main">
              <span class="item-title">{user.email}</span>
              <div class="item-details">
                <span class="badge" class:admin={user.role === 'admin'}>{user.role}</span>
                <span class="separator">•</span>
                <span class="location">{user.zipCode}</span>
              </div>
            </div>
            <div class="item-meta">
              <span class="time-ago">{new Date(user.createdAt).toLocaleDateString()}</span>
              <button class="action-dot">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="12" cy="5" r="2"/>
                  <circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="data-card">
      <div class="card-header">
        <h3>Recent Jobs</h3>
        <button class="view-all">View All</button>
      </div>
      <div class="data-list">
        {#each stats.jobStats.recentJobs as job}
          <div class="list-item">
            <div class="company-logo">
              {job.company[0].toUpperCase()}
            </div>
            <div class="item-main">
              <span class="item-title">{job.title}</span>
              <div class="item-details">
                <span class="company-name">{job.company}</span>
                <span class="separator">•</span>
                <span class="salary">${job.hourlyRate}/hr</span>
              </div>
            </div>
            <button class="view-button">View</button>
          </div>
        {/each}
      </div>
    </div>

    <div class="data-card">
      <div class="card-header">
        <h3>Top Locations</h3>
        <div class="card-actions">
          <select class="period-select">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>
      </div>
      <div class="data-list">
        {#each stats.locationStats as location, i}
          <div class="list-item location-item">
            <div class="rank">#{i + 1}</div>
            <div class="item-main">
              <span class="item-title">{location._id}</span>
              <div class="item-details">
                <span class="job-count">{location.count} jobs</span>
                <div class="trend positive">
                  <svg width="12" height="12" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
                  </svg>
                  <span>12%</span>
                </div>
              </div>
            </div>
            <div class="rate-info">
              <span class="average-rate">${location.averageRate.toFixed(2)}</span>
              <span class="rate-label">avg/hr</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if showAddJobModal}
  <AddJobModal 
    on:close={() => showAddJobModal = false}
    on:jobCreated={handleJobCreated}
  />
{/if}

<style>
  .main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header-content h2 {
    font-size: 1.875rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #6B7280;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #6355FF;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-button:hover {
    background: #5346E0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
    padding: 0.5rem;
  }

  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, #6355FF, #FF6B6B);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .stat-card:hover::before {
    opacity: 1;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon.users {
    background: rgba(99, 85, 255, 0.1);
    color: #6355FF;
  }

  .stat-icon.jobs {
    background: rgba(16, 185, 129, 0.1);
    color: #10B981;
  }

  .stat-icon.urgent {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-value {
    display: block;
    font-size: 2.25rem;
    font-weight: 600;
    color: #111827;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    color: #6B7280;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    margin-top: 0.75rem;
    padding: 0.375rem 0.75rem;
    border-radius: 20px;
    width: fit-content;
  }

  .stat-trend.positive {
    color: #10B981;
    background: rgba(16, 185, 129, 0.1);
  }

  .stat-trend.negative {
    color: #EF4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
    padding: 0.5rem;
  }

  .data-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 0 0.5rem;
  }

  .view-all {
    color: #6355FF;
    background: none;
    border: none;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .view-all:hover {
    background: rgba(99, 85, 255, 0.1);
  }

  .user-avatar, .company-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1rem;
    color: white;
  }

  .user-avatar {
    background: linear-gradient(135deg, #6355FF, #8B7FFF);
  }

  .company-logo {
    background: linear-gradient(135deg, #10B981, #34D399);
  }

  .data-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .list-item {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.25rem;
    background: #f8f9fa;
    border-radius: 12px;
    transition: all 0.2s;
    margin-bottom: 0.5rem;
  }

  .list-item:hover {
    background: #f1f5f9;
    transform: translateX(4px);
  }

  .item-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .badge {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    background: #E5E7EB;
    color: #4B5563;
  }

  .badge.admin {
    background: rgba(99, 85, 255, 0.1);
    color: #6355FF;
  }

  .separator {
    color: #D1D5DB;
  }

  .action-dot {
    padding: 0.5rem;
    border: none;
    background: none;
    color: #6B7280;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .action-dot:hover {
    background: #e5e7eb;
    color: #111827;
  }

  .view-button {
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    color: #6355FF;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .view-button:hover {
    background: #6355FF;
    color: white;
    border-color: #6355FF;
  }

  .period-select {
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    color: #6B7280;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .location-item {
    position: relative;
  }

  .rank {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6B7280;
    min-width: 24px;
  }

  .trend {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
  }

  .trend.positive {
    color: #10B981;
  }

  .trend.negative {
    color: #EF4444;
  }

  .rate-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .average-rate {
    font-weight: 600;
    color: #111827;
  }

  .rate-label {
    font-size: 0.75rem;
    color: #6B7280;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #6B7280;
  }

  .error {
    text-align: center;
    padding: 2rem;
    color: #DC2626;
    background: #FEE2E2;
    border-radius: 8px;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .chart-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .chart-container {
    height: 300px;
    position: relative;
    margin-top: 1.5rem;
    padding: 1rem;
  }

  .chart-title {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .chart-subtitle {
    color: #6B7280;
    font-size: 0.875rem;
  }

  .chart-total {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
  }

  .total-value {
    display: block;
    font-size: 2rem;
    font-weight: 600;
    color: #111827;
  }

  .total-label {
    font-size: 0.875rem;
    color: #6B7280;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .chart-actions {
    display: flex;
    gap: 0.5rem;
  }

  .chart-filter {
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    color: #6B7280;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .chart-filter:hover {
    border-color: #6355FF;
    color: #6355FF;
  }

  .chart-filter.active {
    background: #6355FF;
    color: white;
    border-color: #6355FF;
  }

  @media (max-width: 1280px) {
    .data-grid {
      gap: 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .data-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding: 0;
      margin-top: 2rem;
    }

    .data-card {
      padding: 1.5rem;
    }
  }
</style> 