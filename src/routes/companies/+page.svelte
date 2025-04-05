<script lang="ts">
  import { onMount } from 'svelte';

  interface Company {
    id: string;
    name: string;
    logo: string;
    industry: string;
    location: string;
    description: string;
    employeeCount: string;
    openPositions: number;
    rating: number;
  }

  let companies: Company[] = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      logo: '/images/companies/tech-corp.png',
      industry: 'Technology',
      location: 'San Francisco, CA',
      description: 'Leading provider of enterprise software solutions',
      employeeCount: '1000-5000',
      openPositions: 12,
      rating: 4.5
    },
    {
      id: '2',
      name: 'Global Innovations',
      logo: '/images/companies/global-inn.png',
      industry: 'Research & Development',
      location: 'Boston, MA',
      description: 'Pioneering research and development in emerging technologies',
      employeeCount: '500-1000',
      openPositions: 8,
      rating: 4.3
    },
    {
      id: '3',
      name: 'Future Finance',
      logo: '/images/companies/future-finance.png',
      industry: 'Financial Services',
      location: 'New York, NY',
      description: 'Next-generation financial technology solutions',
      employeeCount: '1000-5000',
      openPositions: 15,
      rating: 4.7
    }
  ];

  let searchQuery = '';
  let selectedIndustry = '';
  let selectedLocation = '';

  const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Boston, MA', 'Austin, TX', 'Seattle, WA'];

  $: filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry;
    const matchesLocation = !selectedLocation || company.location === selectedLocation;
    return matchesSearch && matchesIndustry && matchesLocation;
  });
</script>

<div class="companies-container">
  <div class="hero-section">
    <span class="subtitle">Explore Companies</span>
    <h1>Find Your Next Employer</h1>
    <div class="header-accent">
      <span class="line"></span>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="#6356FF">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
      </svg>
      <span class="line"></span>
    </div>
    <p class="hero-description">
      Discover great companies that are hiring now
    </p>
  </div>

  <div class="search-filters">
    <div class="search-box">
      <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
      </svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search companies..."
      />
    </div>
    
    <select bind:value={selectedIndustry}>
      <option value="">All Industries</option>
      {#each industries as industry}
        <option value={industry}>{industry}</option>
      {/each}
    </select>

    <select bind:value={selectedLocation}>
      <option value="">All Locations</option>
      {#each locations as location}
        <option value={location}>{location}</option>
      {/each}
    </select>
  </div>

  <div class="companies-grid">
    {#each filteredCompanies as company}
      <div class="company-card">
        <div class="company-header">
          <img src={company.logo} alt={company.name} class="company-logo" />
          <div class="rating">
            <svg class="star-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            {company.rating}
          </div>
        </div>
        
        <h2>{company.name}</h2>
        <div class="company-meta">
          <span class="industry">{company.industry}</span>
          <span class="location">
            <svg class="location-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
            {company.location}
          </span>
        </div>
        
        <p class="description">{company.description}</p>
        
        <div class="company-stats">
          <div class="stat">
            <span class="label">Employees</span>
            <span class="value">{company.employeeCount}</span>
          </div>
          <div class="stat">
            <span class="label">Open Positions</span>
            <span class="value highlight">{company.openPositions}</span>
          </div>
        </div>

        <button class="view-jobs-btn">View Open Positions</button>
      </div>
    {/each}
  </div>

  {#if filteredCompanies.length === 0}
    <div class="no-results">
      <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>No companies found matching your criteria</p>
      <button class="reset-btn" on:click={() => {
        searchQuery = '';
        selectedIndustry = '';
        selectedLocation = '';
      }}>Reset Filters</button>
    </div>
  {/if}
</div>

<style>
  .companies-container {
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

  .search-filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .search-box {
    flex: 1;
    position: relative;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
    height: 1.25rem;
    color: #6B7280;
  }

  input,
  select {
    width: 100%;
    padding: 0.75rem;
    padding-left: 2.75rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
  }

  select {
    padding-left: 0.75rem;
    width: auto;
    min-width: 200px;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #6356FF;
    box-shadow: 0 0 0 3px rgba(99, 86, 255, 0.1);
  }

  .companies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  .company-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid #E5E7EB;
    transition: all 0.3s ease;
  }

  .company-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(99, 86, 255, 0.1);
  }

  .company-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .company-logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #FFA723;
    font-weight: 600;
  }

  .star-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .company-card h2 {
    font-size: 1.25rem;
    color: #1F2937;
    margin-bottom: 0.75rem;
  }

  .company-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .industry,
  .location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6B7280;
    font-size: 0.875rem;
  }

  .location-icon {
    width: 1rem;
    height: 1rem;
  }

  .description {
    color: #4B5563;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .company-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #F9FAFB;
    border-radius: 0.5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    color: #6B7280;
    font-size: 0.875rem;
  }

  .value {
    color: #1F2937;
    font-weight: 600;
  }

  .highlight {
    color: #6356FF;
  }

  .view-jobs-btn {
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    color: #6356FF;
    border: 2px solid #6356FF;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .view-jobs-btn:hover {
    background: rgba(99, 86, 255, 0.1);
  }

  .no-results {
    text-align: center;
    padding: 4rem 0;
    color: #6B7280;
  }

  .no-results-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
  }

  .reset-btn {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: #6356FF;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: #5244E3;
  }

  @media (max-width: 768px) {
    .companies-container {
      padding: 1rem;
    }

    .hero-section {
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
    }

    .search-filters {
      flex-direction: column;
    }

    select {
      width: 100%;
    }
  }
</style> 