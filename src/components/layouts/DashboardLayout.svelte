<script lang="ts">
  import DashboardNav from '../dashboard/DashboardNav.svelte';
  import Footer from '../footer/Footer.svelte';
  import { user } from '../../stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(async () => {
    if (!$user) {
      await goto('/login');
      return;
    }
  });
</script>

<div class="dashboard-layout">
  <DashboardNav />

  <main class="dashboard-container">
    <!-- Dashboard Cards Section -->
    <div class="dashboard-section">
      <div class="dashboard-grid">
        <a href="/interviews" class="dashboard-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#6355FF" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <h2>Interviews</h2>
        </a>

        <a href="/applications" class="dashboard-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#6355FF" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <h2>Applications</h2>
        </a>

        <a href="/saved" class="dashboard-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#6355FF" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h2>Saved jobs</h2>
        </a>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content">
      <slot />
    </div>
  </main>

  <div class="footer-wrapper">
    <Footer />
  </div>
</div>

<style>
  .dashboard-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #F9FAFB;
    padding-top: 72px;
  }

  .dashboard-container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 24px;
    width: 100%;
  }

  .dashboard-section {
    margin-bottom: 2rem;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .dashboard-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    text-decoration: none;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .dashboard-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: #6355FF;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    background: #F3F4F6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h2 {
    color: #111827;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }

  .page-content {
    background: white;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    padding: 2rem;
  }

  .footer-wrapper {
    margin-top: auto;
    width: 100%;
  }
</style> 