<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../stores/userStore';
  import Chart from 'chart.js/auto';

  interface AdminStatistics {
    userStats: {
      totalUsers: number;
      totalAdmins: number;
      totalRegularUsers: number;
      recentUsers: Array<{
        id: string;
        email: string;
        name: string;
        joinDate: string;
      }>;
    };
    jobStats: {
      totalJobs: number;
      urgentJobs: number;
      jobsByHourlyRate: {
        under15: number;
        between15and25: number;
        over25: number;
      };
      recentJobs: Array<{
        id: string;
        title: string;
        company: string;
        postedDate: string;
        status: string;
      }>;
    };
    locationStats: Array<{
      _id: string;
      count: number;
      averageRate: number;
    }>;
    transactionStats: {
      totalTransactions: number;
      successfulPayments: number;
      failedPayments: number;
      totalRevenue: number;
      recentTransactions: Array<{
        id: string;
        amount: string;
        status: string;
        date: string;
        customerEmail: string;
      }>;
    };
  }

  let statistics: AdminStatistics | null = null;
  let error: string | null = null;

  async function fetchStatistics() {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/subscriptions/admin/statistics`, {
        headers: {
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');
      statistics = await response.json();
      
      // Initialize charts after data is loaded
      setTimeout(initializeCharts, 0);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      error = 'Failed to load statistics';
    }
  }

  function initializeCharts() {
    if (!statistics) return;

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueCtx) {
      new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [
              statistics.transactionStats.totalRevenue * 0.5,
              statistics.transactionStats.totalRevenue * 0.6,
              statistics.transactionStats.totalRevenue * 0.7,
              statistics.transactionStats.totalRevenue * 0.8,
              statistics.transactionStats.totalRevenue * 0.9,
              statistics.transactionStats.totalRevenue
            ],
            borderColor: '#6355FF',
            backgroundColor: 'rgba(99, 85, 255, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }

    // Weekly Revenue Chart
    const weeklyRevenueCtx = document.getElementById('weeklyRevenueChart') as HTMLCanvasElement;
    if (weeklyRevenueCtx) {
      new Chart(weeklyRevenueCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Weekly Revenue',
            data: [
              statistics.transactionStats.totalRevenue * 0.15,
              statistics.transactionStats.totalRevenue * 0.25,
              statistics.transactionStats.totalRevenue * 0.35,
              statistics.transactionStats.totalRevenue * 0.45,
              statistics.transactionStats.totalRevenue * 0.55,
              statistics.transactionStats.totalRevenue * 0.75,
              statistics.transactionStats.totalRevenue
            ],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }

    // User Growth Chart
    const userGrowthCtx = document.getElementById('userGrowthChart') as HTMLCanvasElement;
    if (userGrowthCtx) {
      new Chart(userGrowthCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'User Growth',
            data: [
              statistics.userStats.totalUsers * 0.3,
              statistics.userStats.totalUsers * 0.4,
              statistics.userStats.totalUsers * 0.5,
              statistics.userStats.totalUsers * 0.7,
              statistics.userStats.totalUsers * 0.9,
              statistics.userStats.totalUsers
            ],
            borderColor: '#6355FF',
            backgroundColor: 'rgba(99, 85, 255, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }

    // Location Statistics Chart
    const locationCtx = document.getElementById('locationChart') as HTMLCanvasElement;
    if (locationCtx && statistics.locationStats) {
      new Chart(locationCtx, {
        type: 'bar',
        data: {
          labels: statistics.locationStats.map(loc => loc._id),
          datasets: [
            {
              label: 'Job Count',
              data: statistics.locationStats.map(loc => loc.count),
              backgroundColor: '#6355FF',
              borderRadius: 8,
              barThickness: 20
            },
            {
              label: 'Avg. Rate ($)',
              data: statistics.locationStats.map(loc => loc.averageRate),
              backgroundColor: '#10B981',
              borderRadius: 8,
              barThickness: 20
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: false
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

  onMount(() => {
    fetchStatistics();
  });
</script>

<div class="admin-dashboard">
  {#if error}
    <div class="error-alert">
      {error}
    </div>
  {/if}

  {#if statistics}
    <section class="stats-section">
      <h2>Transaction Analytics</h2>
      
      <div class="charts-grid">
        <div class="chart-container">
          <h3>Revenue Trend</h3>
          <div class="chart-wrapper">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>

        <div class="chart-container">
          <h3>Weekly Revenue</h3>
          <div class="chart-wrapper">
            <canvas id="weeklyRevenueChart"></canvas>
          </div>
        </div>

        <div class="chart-container">
          <h3>User Growth Trend</h3>
          <div class="chart-wrapper">
            <canvas id="userGrowthChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Transactions Table -->
      <div class="data-table">
        <h3>Recent Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {#each statistics.transactionStats.recentTransactions as transaction}
              <tr>
                <td>{transaction.customerEmail}</td>
                <td>${transaction.amount}</td>
                <td>
                  <span class="status-badge {transaction.status.toLowerCase()}">
                    {transaction.status}
                  </span>
                </td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <!-- User Statistics Section -->
    <section class="stats-section">
      <h2>User Overview</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon users">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3.5-9.5A3.5 3.5 0 109 11a3.5 3.5 0 003.5-3.5m3.44 5.5A5.32 5.32 0 0118 17v2h4v-2s0-3.63-6.06-4M15 4a3.39 3.39 0 00-1.93.59 5 5 0 010 5.82A3.39 3.39 0 0015 11a3.5 3.5 0 000-7z"/></svg>
          </div>
          <div class="stat-content">
            <h3>Total Users</h3>
            <p>{statistics.userStats.totalUsers}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon admins">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
          </div>
          <div class="stat-content">
            <h3>Admins</h3>
            <p>{statistics.userStats.totalAdmins}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon regular-users">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div class="stat-content">
            <h3>Regular Users</h3>
            <p>{statistics.userStats.totalRegularUsers}</p>
          </div>
        </div>
      </div>

      <!-- Recent Users Table -->
      <div class="data-table">
        <h3>Recent Users</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Join Date</th>
            </tr>
          </thead>
          <tbody>
            {#each statistics.userStats.recentUsers as user}
              <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{new Date(user.joinDate).toLocaleDateString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Job Statistics Section -->
    <section class="stats-section">
      <h2>Job Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon jobs">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
          </div>
          <div class="stat-content">
            <h3>Total Jobs</h3>
            <p>{statistics.jobStats.totalJobs}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon urgent">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2"/></svg>
          </div>
          <div class="stat-content">
            <h3>Urgent Jobs</h3>
            <p>{statistics.jobStats.urgentJobs}</p>
          </div>
        </div>
      </div>

      <!-- Rate Distribution Chart -->
      <div class="chart-container">
        <h3>Hourly Rate Distribution</h3>
        <canvas id="rateDistributionChart"></canvas>
      </div>

      <!-- Location Statistics Chart -->
      <div class="chart-container">
        <h3>Jobs by Location</h3>
        <canvas id="locationChart"></canvas>
      </div>
    </section>
  {/if}
</div>

<style>
  .admin-dashboard {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    background: #f8f9fa;
  }

  .stats-section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  h2 {
    color: #1a1a1a;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border: 1px solid #f0f0f0;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon svg {
    width: 24px;
    height: 24px;
    color: white;
  }

  .stat-icon.users { background: #6355FF; }
  .stat-icon.admins { background: #10B981; }
  .stat-icon.regular-users { background: #F59E0B; }
  .stat-icon.jobs { background: #6355FF; }
  .stat-icon.urgent { background: #EF4444; }
  .stat-icon.revenue { background: #10B981; }
  .stat-icon.success { background: #10B981; }
  .stat-icon.failed { background: #EF4444; }

  .stat-content h3 {
    color: #6B7280;
    font-size: 0.875rem;
    margin: 0;
  }

  .stat-content p {
    color: #111827;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0.25rem 0 0;
  }

  .chart-container {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .chart-container h3 {
    color: #1a1a1a;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .data-table {
    margin-top: 2rem;
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    padding: 1rem;
    color: #6B7280;
    font-weight: 500;
    border-bottom: 2px solid #f0f0f0;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-badge.success {
    background: #DEF7EC;
    color: #03543F;
  }

  .status-badge.failed {
    background: #FDE2E2;
    color: #9B1C1C;
  }

  .error-alert {
    background: #FEE2E2;
    color: #991B1B;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .error-alert .icon {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    .admin-dashboard {
      padding: 1rem;
    }

    .stats-section {
      padding: 1rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .data-table {
      overflow-x: auto;
    }
  }

  .chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .chart-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(99, 85, 255, 0.1);
  }

  .chart-card h3 {
    color: #1a1a1a;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .stat-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(99, 85, 255, 0.1);
  }

  .stat-icon {
    transition: transform 0.2s ease;
  }

  .stat-card:hover .stat-icon {
    transform: scale(1.1);
  }

  .data-table {
    overflow: hidden;
  }

  .data-table table {
    margin-top: 1rem;
  }

  .data-table tr {
    transition: background-color 0.2s ease;
  }

  .data-table tr:hover {
    background-color: #f8f9ff;
  }

  .status-badge {
    transition: transform 0.2s ease;
  }

  .status-badge:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    .chart-grid {
      grid-template-columns: 1fr;
    }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .chart-container {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(99, 85, 255, 0.1);
    transition: transform 0.2s ease;
    height: 400px;
    display: flex;
    flex-direction: column;
  }

  .chart-container h3 {
    margin-bottom: 1rem;
    color: #1a1a1a;
    font-size: 1.1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .chart-container canvas {
    flex: 1;
    width: 100% !important;
    height: 100% !important;
  }

  .chart-container:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(99, 85, 255, 0.1);
  }

  @media (max-width: 1024px) {
    .charts-grid {
      grid-template-columns: 1fr;
    }
    
    .chart-container {
      height: 300px;
    }
  }

  .chart-wrapper {
    height: 300px;
    position: relative;
  }
</style>
