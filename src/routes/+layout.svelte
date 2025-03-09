<script>
  import '../app.css';
  import { APP_NAME } from '$lib/config';
  import { Navbar } from '../components/navbar';
  import { Footer } from '../components/footer';
  import { page } from '$app/stores';
  import NotificationContainer from '../components/notifications/NotificationContainer.svelte';
</script>

<svelte:head>
  <title>{APP_NAME} - Find Your Next Job</title>
</svelte:head>

<NotificationContainer />

{#if $page.url.pathname === '/'}
  <Navbar />
{/if}

<slot />

{#if $page.url.pathname === '/'}
  <Footer />
{/if}

<style>
  :global(body) {
    margin: 0;
    font-family: serif;
  }
</style> 