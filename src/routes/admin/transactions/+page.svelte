<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../../stores/userStore';

  interface TransactionSummary {
    total_transactions: number;
    successful_payments: number;
    failed_payments: number;
    total_amount: number;
  }

  interface Transaction {
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
    customer: {
      id: string;
      email: string;
      userId: string;
      name: string;
    };
    subscription: {
      id: string;
      status: string;
      plan: string;
    };
    hosted_invoice_url: string;
    pdf_url: string;
  }

  let transactions: Transaction[] = [];
  let summary: TransactionSummary | null = null;
  let loading = true;
  let error: string | null = null;

  async function fetchTransactions() {
    try {
      loading = true;
      error = null;

      const response = await fetch(`${PUBLIC_API_URL}/subscriptions/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      const data = await response.json();
      console.log('Raw data:', data);

      if (data.success && Array.isArray(data.transactions)) {
        // Safely map transactions with fallback values
        transactions = data.transactions.map((t: any) => ({
          id: t.id || t._id || `tx_${Math.random()}`, // Fallback ID if none exists
          type: t.type || 'unknown',
          amount: Number(t.amount) || 0,
          currency: t.currency || 'usd',
          status: t.status || 'unknown',
          date: t.date || new Date().toISOString(),
          customer: {
            id: t.customer?.id || 'unknown',
            email: t.customer?.email || 'no-email',
            userId: t.customer?.userId || 'unknown',
            name: t.customer?.name || 'Unknown User'
          },
          subscription: {
            id: t.subscription?.id || 'unknown',
            status: t.subscription?.status || 'unknown',
            plan: t.subscription?.plan || 'unknown'
          },
          hosted_invoice_url: t.hosted_invoice_url || '',
          pdf_url: t.pdf_url || ''
        }));

        summary = data.summary ? {
          total_transactions: Number(data.summary.total_transactions) || 0,
          successful_payments: Number(data.summary.successful_payments) || 0,
          failed_payments: Number(data.summary.failed_payments) || 0,
          total_amount: Number(data.summary.total_amount) || 0
        } : null;

        console.log('Processed transactions:', transactions);
        console.log('Processed summary:', summary);
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch transactions';
      console.error('Error:', error);
      transactions = [];
      summary = null;
    } finally {
      loading = false;
    }
  }

  onMount(fetchTransactions);

  function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div class="transactions-container">
  <h1>Transactions</h1>

  <pre style="display: none;">
    Loading: {loading}
    Error: {error}
    Transactions: {transactions.length}
    Has Summary: {Boolean(summary)}
  </pre>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading transactions...</p>
    </div>
  {:else if error}
    <div class="error-message">
      {error}
      <button class="retry-btn" on:click={fetchTransactions}>Retry</button>
    </div>
  {:else if transactions.length === 0}
    <div class="empty-state">
      <p>No transactions found</p>
    </div>
  {:else}
    <!-- Summary Cards -->
    {#if summary}
      <div class="summary-grid">
        <div class="summary-card">
          <h3>Total Transactions</h3>
          <p class="number">{summary.total_transactions}</p>
        </div>
        <div class="summary-card success">
          <h3>Successful Payments</h3>
          <p class="number">{summary.successful_payments}</p>
        </div>
        <div class="summary-card error">
          <h3>Failed Payments</h3>
          <p class="number">{summary.failed_payments}</p>
        </div>
        <div class="summary-card total">
          <h3>Total Amount</h3>
          <p class="number">{formatCurrency(summary.total_amount, 'usd')}</p>
        </div>
      </div>
    {/if}

    <!-- Transactions Table -->
    {#if transactions.length > 0}
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each transactions as transaction (transaction.id || Math.random())}
              <tr>
                <td>{formatDate(transaction.date)}</td>
                <td>
                  <div class="customer-info">
                    <span class="customer-name">{transaction.customer.name}</span>
                    <span class="customer-email">{transaction.customer.email}</span>
                  </div>
                </td>
                <td>
                  <span class="amount">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </span>
                </td>
                <td>
                  <span class="status-badge {transaction.status}">
                    {transaction.status}
                  </span>
                </td>
                <td>
                  <span class="plan-badge">
                    {transaction.subscription.plan}
                  </span>
                </td>
                <td class="actions">
                  {#if transaction.hosted_invoice_url}
                    <a 
                      href={transaction.hosted_invoice_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="action-btn view"
                    >
                      View Invoice
                    </a>
                  {/if}
                  {#if transaction.pdf_url}
                    <a 
                      href={transaction.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="action-btn download"
                    >
                      Download PDF
                    </a>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</div>

<style>
  .transactions-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  h1 {
    margin-bottom: 2rem;
    color: #111827;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .summary-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .summary-card h3 {
    color: #6B7280;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .summary-card .number {
    font-size: 1.875rem;
    font-weight: 600;
    color: #111827;
  }

  .summary-card.success .number {
    color: #059669;
  }

  .summary-card.error .number {
    color: #DC2626;
  }

  .summary-card.total .number {
    color: #4F46E5;
  }

  .table-container {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #E5E7EB;
  }

  th {
    background: #F9FAFB;
    font-weight: 600;
    color: #374151;
  }

  .customer-info {
    display: flex;
    flex-direction: column;
  }

  .customer-name {
    font-weight: 500;
    color: #111827;
  }

  .customer-email {
    font-size: 0.875rem;
    color: #6B7280;
  }

  .amount {
    font-weight: 500;
    color: #111827;
  }

  .status-badge {
    display: inline-flex;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-badge.paid {
    background: #ECFDF5;
    color: #059669;
  }

  .status-badge.failed {
    background: #FEF2F2;
    color: #DC2626;
  }

  .plan-badge {
    display: inline-flex;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    background: #F3F4F6;
    color: #374151;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
  }

  .action-btn.view {
    background: #EFF6FF;
    color: #2563EB;
  }

  .action-btn.view:hover {
    background: #DBEAFE;
  }

  .action-btn.download {
    background: #F3F4F6;
    color: #374151;
  }

  .action-btn.download:hover {
    background: #E5E7EB;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid #E5E7EB;
    border-top-color: #6355FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    background: #FEF2F2;
    color: #DC2626;
    border-radius: 0.5rem;
  }

  .retry-btn {
    padding: 0.5rem 1rem;
    background: #DC2626;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
  }

  .retry-btn:hover {
    background: #B91C1C;
  }

  @media (max-width: 768px) {
    .transactions-container {
      padding: 1rem;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .actions {
      flex-direction: column;
    }
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #6B7280;
  }
</style>
