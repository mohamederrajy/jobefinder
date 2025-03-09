<script>
  import { Hero } from '../components/hero';
  import { Features } from '../components/features';
  import JobList from '../components/jobs/JobList.svelte';
  
  let searchQuery = '';
  let searchLocation = '';
  
  function handleSearch(event) {
    searchQuery = event.detail.query;
    searchLocation = event.detail.location;
    console.log('Search from hero:', { searchQuery, searchLocation });
  }
</script>

<Hero on:search={handleSearch} />

<JobList {searchQuery} {searchLocation} />

<Features />


