<script lang="ts">
  import { onMount } from 'svelte';

  let annualSalary = 0;
  let hourlyRate = 0;
  let hoursPerWeek = 40;
  let daysPerWeek = 5;
  let vacationDays = 15;
  let taxRate = 20;

  function calculateMonthly(annual: number): number {
    return annual / 12;
  }

  function calculateWeekly(annual: number): number {
    return annual / 52;
  }

  function calculateDaily(annual: number): number {
    const workingDays = (52 * daysPerWeek) - vacationDays;
    return annual / workingDays;
  }

  function calculateHourly(annual: number): number {
    const workingDays = (52 * daysPerWeek) - vacationDays;
    const workingHours = workingDays * (hoursPerWeek / daysPerWeek);
    return annual / workingHours;
  }

  function calculateTakeHome(annual: number): number {
    return annual * (1 - taxRate / 100);
  }

  $: monthlyGross = calculateMonthly(annualSalary);
  $: weeklyGross = calculateWeekly(annualSalary);
  $: dailyGross = calculateDaily(annualSalary);
  $: calculatedHourlyRate = calculateHourly(annualSalary);
  $: annualTakeHome = calculateTakeHome(annualSalary);
  $: monthlyTakeHome = calculateMonthly(annualTakeHome);
</script>

<div class="calculator-container">
  <div class="calculator-header">
    <h1>Salary Calculator</h1>
    <p>Calculate your salary breakdown and take-home pay</p>
  </div>

  <div class="calculator-grid">
    <div class="input-section">
      <div class="input-group">
        <label for="annual">Annual Salary</label>
        <div class="input-wrapper">
          <span class="currency">$</span>
          <input 
            type="number" 
            id="annual" 
            bind:value={annualSalary} 
            placeholder="Enter annual salary"
            min="0"
          />
        </div>
      </div>

      <div class="input-group">
        <label for="hours">Hours per Week</label>
        <input 
          type="number" 
          id="hours" 
          bind:value={hoursPerWeek} 
          min="1" 
          max="168"
        />
      </div>

      <div class="input-group">
        <label for="days">Days per Week</label>
        <input 
          type="number" 
          id="days" 
          bind:value={daysPerWeek} 
          min="1" 
          max="7"
        />
      </div>

      <div class="input-group">
        <label for="vacation">Vacation Days per Year</label>
        <input 
          type="number" 
          id="vacation" 
          bind:value={vacationDays} 
          min="0"
          max="365"
        />
      </div>

      <div class="input-group">
        <label for="tax">Tax Rate (%)</label>
        <input 
          type="number" 
          id="tax" 
          bind:value={taxRate} 
          min="0"
          max="100"
        />
      </div>
    </div>

    <div class="results-section">
      <h2>Your Salary Breakdown</h2>
      
      <div class="result-card">
        <div class="result-item">
          <span class="label">Monthly Gross</span>
          <span class="value">${monthlyGross.toFixed(2)}</span>
        </div>
        <div class="result-item">
          <span class="label">Weekly Gross</span>
          <span class="value">${weeklyGross.toFixed(2)}</span>
        </div>
        <div class="result-item">
          <span class="label">Daily Rate</span>
          <span class="value">${dailyGross.toFixed(2)}</span>
        </div>
        <div class="result-item">
          <span class="label">Hourly Rate</span>
          <span class="value">${calculatedHourlyRate.toFixed(2)}</span>
        </div>
      </div>

      <div class="take-home-section">
        <h3>Take Home Pay</h3>
        <div class="take-home-card">
          <div class="take-home-item">
            <span class="label">Annual Take Home</span>
            <span class="value highlight">${annualTakeHome.toFixed(2)}</span>
          </div>
          <div class="take-home-item">
            <span class="label">Monthly Take Home</span>
            <span class="value highlight">${monthlyTakeHome.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .calculator-container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .calculator-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .calculator-header h1 {
    font-size: 2.5rem;
    color: #6355FF;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .calculator-header p {
    color: #6B7280;
    font-size: 1.1rem;
  }

  .calculator-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 3rem;
  }

  .input-section {
    background: #F9FAFB;
    padding: 2rem;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label {
    color: #374151;
    font-weight: 500;
    font-size: 0.95rem;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .currency {
    position: absolute;
    left: 1rem;
    color: #6B7280;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
  }

  input[type="number"] {
    padding-left: 2rem;
  }

  input:focus {
    outline: none;
    border-color: #6355FF;
    box-shadow: 0 0 0 3px rgba(99, 85, 255, 0.1);
  }

  .results-section {
    padding: 1rem;
  }

  .results-section h2 {
    color: #111827;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  .result-card {
    background: #F9FAFB;
    border-radius: 16px;
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .result-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label {
    color: #6B7280;
    font-size: 0.9rem;
  }

  .value {
    color: #111827;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .take-home-section {
    margin-top: 2rem;
  }

  .take-home-section h3 {
    color: #111827;
    font-size: 1.25rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .take-home-card {
    background: #6355FF;
    border-radius: 16px;
    padding: 1.5rem;
    color: white;
  }

  .take-home-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .take-home-item .label {
    color: rgba(255, 255, 255, 0.8);
  }

  .take-home-item .value.highlight {
    color: white;
    font-size: 1.5rem;
  }

  @media (max-width: 1024px) {
    .calculator-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  @media (max-width: 640px) {
    .calculator-container {
      padding: 1rem;
      margin: 1rem;
    }

    .calculator-header h1 {
      font-size: 2rem;
    }

    .result-card {
      grid-template-columns: 1fr;
    }
  }
</style> 