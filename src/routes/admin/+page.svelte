<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../stores/userStore';

  interface MonthlyRevenue {
    month: string;
    revenue: number;
  }

  interface Transaction {
    amount: number;
    status: string;
    date: string;
    customerEmail: string;
  }

  interface Statistics {
    userStats: {
      totalUsers: number;
      totalAdmins: number;
      totalRegularUsers: number;
      recentUsers: Array<{
        email: string;
        createdAt: string;
      }>;
    };
    jobStats: {
      totalJobs: number;
      activeJobs: number;
      urgentJobs: number;
      jobsByStatus: {
        active: number;
        closed: number;
        draft: number;
      };
      recentJobs: Array<{
        title: string;
        company: string;
        createdAt: string;
      }>;
    };
    transactionStats: {
      totalRevenue: number;
      successfulPayments: number;
      failedPayments: number;
      totalTransactions: number;
      monthlyRevenue: MonthlyRevenue[];
      recentTransactions: Transaction[];
    };
  }

  let statistics: Statistics | null = null;
  let error: string | null = null;

  async function fetchStatistics() {
    try {
      console.log('Fetching statistics...');
      const response = await fetch(`${PUBLIC_API_URL}/admin/statistics`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });
      
      console.log('Response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      statistics = data;
      console.log('Processed statistics:', statistics);
      
    } catch (error) {
      console.error('Error fetching statistics:', error);
      error = 'Failed to load statistics';
    }
  }

  onMount(fetchStatistics);
</script>

<div class="statistics-container">
  <!-- Debug section -->
  {#if import.meta.env.DEV}
    <div class="debug-info">
      <pre>API URL: {PUBLIC_API_URL}/admin/statistics</pre>
      <pre>Token: {$user?.token ? 'Present' : 'Missing'}</pre>
      <pre>Statistics: {JSON.stringify(statistics, null, 2)}</pre>
    </div>
  {/if}

  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}

  <!-- User Statistics -->
  {#if statistics?.userStats}
    <div class="stat-section">
      <h2>User Statistics</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p>{statistics.userStats.totalUsers || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Admins</h3>
          <p>{statistics.userStats.totalAdmins || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Regular Users</h3>
          <p>{statistics.userStats.totalRegularUsers || 0}</p>
        </div>
      </div>
      
      {#if statistics.userStats.recentUsers?.length > 0}
        <h3>Recent Users</h3>
        <div class="recent-list">
          {#each statistics.userStats.recentUsers as user}
            <div class="recent-item">
              <p>{user.email}</p>
              <small>{new Date(user.createdAt).toLocaleDateString()}</small>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Job Statistics -->
  {#if statistics?.jobStats}
    <div class="stat-section">
      <h2>Job Statistics</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <h3>Total Jobs</h3>
          <p>{statistics.jobStats.totalJobs || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Active Jobs</h3>
          <p>{statistics.jobStats.activeJobs || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Urgent Jobs</h3>
          <p>{statistics.jobStats.urgentJobs || 0}</p>
        </div>
      </div>

      <h3>Jobs by Status</h3>
      <div class="stat-grid">
        <div class="stat-card">
          <h4>Active</h4>
          <p>{statistics.jobStats.jobsByStatus?.active || 0}</p>
        </div>
        <div class="stat-card">
          <h4>Closed</h4>
          <p>{statistics.jobStats.jobsByStatus?.closed || 0}</p>
        </div>
        <div class="stat-card">
          <h4>Draft</h4>
          <p>{statistics.jobStats.jobsByStatus?.draft || 0}</p>
        </div>
      </div>

      {#if statistics.jobStats.recentJobs?.length > 0}
        <h3>Recent Jobs</h3>
        <div class="recent-list">
          {#each statistics.jobStats.recentJobs as job}
            <div class="recent-item">
              <p>{job.title}</p>
              <small>{job.company}</small>
              <small>{new Date(job.createdAt).toLocaleDateString()}</small>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Transaction Statistics -->
  {#if statistics?.transactionStats}
    <div class="stat-section">
      <h2>Transaction Statistics</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <h3>Total Revenue</h3>
          <p>${(statistics.transactionStats.totalRevenue || 0).toFixed(2)}</p>
        </div>
        <div class="stat-card">
          <h3>Successful Payments</h3>
          <p>{statistics.transactionStats.successfulPayments || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Failed Payments</h3>
          <p>{statistics.transactionStats.failedPayments || 0}</p>
        </div>
        <div class="stat-card">
          <h3>Total Transactions</h3>
          <p>{statistics.transactionStats.totalTransactions || 0}</p>
        </div>
      </div>

      {#if statistics.transactionStats.monthlyRevenue?.length > 0}
        <div class="monthly-revenue">
          <h3>Monthly Revenue</h3>
          <div class="chart">
            {#each statistics.transactionStats.monthlyRevenue as { month, revenue }}
              <div class="bar-container">
                <div class="bar" style="height: {(revenue / Math.max(...statistics.transactionStats.monthlyRevenue.map(m => m.revenue))) * 100}%">
                  <span class="amount">${revenue.toFixed(2)}</span>
                </div>
                <span class="month">{month}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if statistics.transactionStats.recentTransactions?.length > 0}
        <div class="recent-transactions">
          <h3>Recent Transactions</h3>
          <div class="transaction-list">
            {#each statistics.transactionStats.recentTransactions as transaction}
              <div class="transaction-item">
                <div class="transaction-info">
                  <p class="amount">${transaction.amount.toFixed(2)}</p>
                  <p class="status" class:success={transaction.status === 'paid'} class:failed={transaction.status !== 'paid'}>
                    {transaction.status}
                  </p>
                </div>
                <div class="transaction-details">
                  <p class="email">{transaction.customerEmail}</p>
                  <p class="date">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .statistics-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .stat-section {
    margin-bottom: 40px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
  }

  .stat-card {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    text-align: center;
  }

  .stat-card h3, .stat-card h4 {
    margin: 0;
    color: #666;
    font-size: 0.9em;
  }

  .stat-card p {
    margin: 10px 0 0;
    font-size: 1.5em;
    font-weight: bold;
    color: #333;
  }

  .recent-list {
    margin-top: 15px;
  }

  .recent-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
  }

  .recent-item p {
    margin: 0;
    font-weight: 500;
  }

  .recent-item small {
    color: #666;
    display: block;
  }

  h2 {
    color: #333;
    margin: 0 0 20px;
  }

  h3 {
    color: #444;
    margin: 20px 0 10px;
  }

  .monthly-revenue {
    margin-top: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .chart {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 200px;
    padding: 1rem;
    gap: 1rem;
  }

  .bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .bar {
    width: 100%;
    background: #4CAF50;
    border-radius: 4px 4px 0 0;
    min-height: 1px;
    position: relative;
    transition: height 0.3s ease;
  }

  .amount {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
  }

  .month {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    transform: rotate(-45deg);
  }

  .transaction-list {
    margin-top: 1rem;
  }

  .transaction-item {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .transaction-info {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .status.success {
    background: #E8F5E9;
    color: #4CAF50;
  }

  .status.failed {
    background: #FFEBEE;
    color: #F44336;
  }

  .transaction-details {
    text-align: right;
  }

  .email {
    color: #666;
    font-size: 0.9rem;
  }

  .date {
    color: #999;
    font-size: 0.8rem;
  }
</style>
