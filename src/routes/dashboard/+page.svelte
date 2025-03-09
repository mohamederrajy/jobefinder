<script lang="ts">
  import DashboardNav from '../../components/dashboard/DashboardNav.svelte';
  import JobList from '../../components/jobs/JobList.svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { onMount } from 'svelte';
  import { user } from '../../stores/userStore';
  import { subscription } from '../../stores/subscriptionStore';
  import type { SearchEvent } from '../../types/events';
  import DiscoverJobList from '../../components/jobs/DiscoverJobList.svelte';
  import { page } from '$app/stores';
  
  let searchQuery = '';
  let searchLocation = '';
  let discoverJobs: any[] = [];
  let loadingDiscover = false;
  let isFirstJob: boolean | null = null;

  onMount(() => {
    // Get search parameters from URL if they exist
    const urlQuery = $page.url.searchParams.get('query');
    const urlLocation = $page.url.searchParams.get('location');
    
    if (urlQuery) searchQuery = urlQuery;
    if (urlLocation) searchLocation = urlLocation;
    
    console.log('Initialized search from URL:', { searchQuery, searchLocation });
  });

  onMount(async () => {
    await fetchDiscoverJobs();
  });

  async function fetchDiscoverJobs() {
    if (!$user?.token) return;
    
    try {
      loadingDiscover = true;
      const response = await fetch(`${PUBLIC_API_URL}/jobs/discover`, {
        headers: {
          'x-auth-token': $user.token
        }
      });
      if (!response.ok) throw new Error('Failed to fetch discover jobs');
      discoverJobs = await response.json();
    } catch (err) {
      console.error('Error fetching discover jobs:', err);
      discoverJobs = [];
    } finally {
      loadingDiscover = false;
    }
  }

  function handleFirstJobResponse(value: boolean) {
    isFirstJob = value;
  }

  // Handle search events from the nav
  function handleSearch(event: CustomEvent<SearchEvent>) {
    console.log('Search event received:', event.detail);
    searchQuery = event.detail.query;
    searchLocation = event.detail.location;
    
    // Update URL with search parameters (without page reload)
    const url = new URL(window.location.href);
    if (searchQuery) {
      url.searchParams.set('query', searchQuery);
    } else {
      url.searchParams.delete('query');
    }
    
    if (searchLocation) {
      url.searchParams.set('location', searchLocation);
    } else {
      url.searchParams.delete('location');
    }
    
    window.history.pushState({}, '', url);
  }

  // Handle reset search
  function handleResetSearch() {
    searchQuery = '';
    searchLocation = '';
    console.log('Search reset');
  }
</script>

<DashboardNav 
  {searchQuery}
  {searchLocation}
  on:search={handleSearch}
/>

<JobList 
  {searchQuery}
  {searchLocation}
/>

<style>
  .welcome-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
  }
  
  .welcome-text {
    font-size: 1.125rem;
    color: #4B5563;
    margin-bottom: 2rem;
  }
  
  .welcome-section {
    padding: 2rem 1rem;
    max-width: 1440px;
    margin: 0 auto;
  }
</style> 