<script lang="ts">
  import '../app.css';
  import { APP_NAME } from '$lib/config';
  import { Navbar } from '../components/navbar';
  import { Footer } from '../components/footer';
  import { page } from '$app/stores';
  import NotificationContainer from '../components/notifications/NotificationContainer.svelte';
  import { onMount } from 'svelte';
  import { user } from '../stores/userStore';
  import { subscription, checkStatus } from '../stores/subscriptionStore';

  // Update publicPages array to include job-alerts
  const publicPages = ['/', '/about', '/contact', '/privacy', '/terms', '/help', '/pricing', '/resources', '/talent-solutions', '/contact-sales', '/companies', '/career-advice', '/job-alerts'];

  onMount(async () => {
    if ($user?.token) {
      await checkStatus($user.token);
    }
  });

  $: if ($user?.token) {
    checkStatus($user.token);
  }
</script>

<svelte:head>
  <title>{APP_NAME}</title>
</svelte:head>

<div class="app-wrapper">
  <NotificationContainer />
  
  <!-- Always show Navbar -->
  <Navbar />

  <!-- Main content -->
  <main class="main-content">
    <slot />
  </main>

  <!-- Always show Footer -->
  <Footer />
</div>

<style>
  .app-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
</style> 