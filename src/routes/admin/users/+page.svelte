<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../../stores/userStore';
  import { notifications } from '../../../stores/notificationStore';

  interface Subscription {
    isPaid: boolean;
    plan: string;
    startDate?: string;
    endDate?: string;
  }

  interface User {
    _id: string;
    email: string;
    role: string;
    subscription: Subscription;
    createdAt: string;
  }

  let users: User[] = [];
  let filteredUsers: User[] = [];
  let loading = true;
  let searchQuery = '';
  let filterStatus = 'all';
  let filterPlan = 'all';
  
  // Modal states
  let showUserDetailsModal = false;
  let showCancelModal = false;
  let showUpdateModal = false;
  let showDeleteModal = false;
  let selectedUser: User | null = null;
  
  // Update subscription form data
  let subscriptionData = {
    isPaid: true,
    plan: 'premium',
    months: 1
  };

  onMount(async () => {
    await fetchUsers();
  });

  async function fetchUsers() {
    try {
      loading = true;
      const response = await fetch(`${PUBLIC_API_URL}/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      users = await response.json();
      applyFilters();
    } catch (error) {
      console.error('Error fetching users:', error);
      notifications.add({
        type: 'error',
        message: error.message || 'Failed to fetch users'
      });
    } finally {
      loading = false;
    }
  }

  function applyFilters() {
    filteredUsers = users.filter(user => {
      // Apply search filter
      const matchesSearch = searchQuery === '' || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply subscription status filter
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && user.subscription.isPaid) ||
        (filterStatus === 'inactive' && !user.subscription.isPaid);
      
      // Apply plan filter
      const matchesPlan = filterPlan === 'all' || 
        user.subscription.plan === filterPlan;
      
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }

  function formatDate(dateString: string | undefined) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function viewUserDetails(user: User) {
    selectedUser = user;
    showUserDetailsModal = true;
  }

  function openCancelModal(user: User) {
    selectedUser = user;
    showCancelModal = true;
  }

  function openUpdateModal(user: User) {
    selectedUser = user;
    // Initialize form with current values
    subscriptionData = {
      isPaid: user.subscription.isPaid,
      plan: user.subscription.plan,
      months: 1
    };
    showUpdateModal = true;
  }

  function openDeleteModal(user: User) {
    selectedUser = user;
    showDeleteModal = true;
  }

  function closeModals() {
    showUserDetailsModal = false;
    showCancelModal = false;
    showUpdateModal = false;
    showDeleteModal = false;
    selectedUser = null;
  }

  async function cancelSubscription() {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${PUBLIC_API_URL}/admin/users/${selectedUser._id}/cancel-subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel subscription');
      }

      const data = await response.json();
      
      // Update user in the list
      users = users.map(u => 
        u._id === selectedUser._id 
          ? { ...u, subscription: data.user.subscription } 
          : u
      );
      
      applyFilters();
      closeModals();
      
      notifications.add({
        type: 'success',
        message: 'Subscription cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      notifications.add({
        type: 'error',
        message: error.message || 'Failed to cancel subscription'
      });
    }
  }

  async function updateSubscription() {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${PUBLIC_API_URL}/admin/users/${selectedUser._id}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        },
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subscription');
      }

      const data = await response.json();
      
      // Update user in the list
      users = users.map(u => 
        u._id === selectedUser._id 
          ? { ...u, subscription: data.user.subscription } 
          : u
      );
      
      applyFilters();
      closeModals();
      
      notifications.add({
        type: 'success',
        message: 'Subscription updated successfully'
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      notifications.add({
        type: 'error',
        message: error.message || 'Failed to update subscription'
      });
    }
  }

  async function fetchUserDetails(userId: string) {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/admin/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user details');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching user details:', error);
      notifications.add({
        type: 'error',
        message: error.message || 'Failed to fetch user details'
      });
      return null;
    }
  }

  async function deleteUser() {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${PUBLIC_API_URL}/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      const data = await response.json();
      
      // Remove user from the list
      users = users.filter(u => u._id !== selectedUser._id);
      
      applyFilters();
      closeModals();
      
      notifications.add({
        type: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      notifications.add({
        type: 'error',
        message: error.message || 'Failed to delete user'
      });
    }
  }

  // Watch for filter changes
  $: {
    if (searchQuery !== undefined || filterStatus !== undefined || filterPlan !== undefined) {
      applyFilters();
    }
  }
</script>

<div class="users-container">
  <h1>User Management</h1>
  
  <!-- Search and filters -->
  <div class="filters-container">
    <div class="search-box">
      <input 
        type="text" 
        placeholder="Search by email..." 
        bind:value={searchQuery}
      />
    </div>
    
    <div class="filter-group">
      <label for="status-filter">Status:</label>
      <select id="status-filter" bind:value={filterStatus}>
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label for="plan-filter">Plan:</label>
      <select id="plan-filter" bind:value={filterPlan}>
        <option value="all">All</option>
        <option value="free">Free</option>
        <option value="basic">Basic</option>
        <option value="premium">Premium</option>
      </select>
    </div>
  </div>
  
  <!-- Users table -->
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>
  {:else if filteredUsers.length === 0}
    <div class="empty-state">
      <p>No users found matching your filters.</p>
      <button class="reset-btn" on:click={() => {
        searchQuery = '';
        filterStatus = 'all';
        filterPlan = 'all';
      }}>Reset Filters</button>
    </div>
  {:else}
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Plan</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredUsers as user}
            <tr>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span class="status-badge {user.subscription.isPaid ? 'active' : 'inactive'}">
                  {user.subscription.isPaid ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <span class="plan-badge {user.subscription.plan}">
                  {user.subscription.plan}
                </span>
              </td>
              <td>{formatDate(user.subscription.startDate)}</td>
              <td>{formatDate(user.subscription.endDate)}</td>
              <td class="actions">
                <button class="action-btn view-btn" on:click={() => viewUserDetails(user)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                
                {#if user.subscription.isPaid}
                  <button class="action-btn cancel-btn" on:click={() => openCancelModal(user)}>
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                    </svg>
                    Cancel
                  </button>
                {/if}
                
                <button class="action-btn update-btn" on:click={() => openUpdateModal(user)}>
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Update
                </button>
                
                <button class="action-btn delete-btn" on:click={() => openDeleteModal(user)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- User Details Modal -->
{#if showUserDetailsModal && selectedUser}
  <div class="modal-backdrop" on:click={closeModals}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>User Details</h2>
        <button class="close-btn" on:click={closeModals}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="user-info">
          <div class="info-group">
            <span class="label">Email:</span>
            <span class="value">{selectedUser.email}</span>
          </div>
          
          <div class="info-group">
            <span class="label">Role:</span>
            <span class="value">{selectedUser.role}</span>
          </div>
          
          <div class="info-group">
            <span class="label">Created At:</span>
            <span class="value">{formatDate(selectedUser.createdAt)}</span>
          </div>
        </div>
        
        <div class="subscription-details">
          <h3>Subscription Details</h3>
          
          <div class="info-group">
            <span class="label">Status:</span>
            <span class="value">
              <span class="status-badge {selectedUser.subscription.isPaid ? 'active' : 'inactive'}">
                {selectedUser.subscription.isPaid ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>
          
          <div class="info-group">
            <span class="label">Plan:</span>
            <span class="value">
              <span class="plan-badge {selectedUser.subscription.plan}">
                {selectedUser.subscription.plan}
              </span>
            </span>
          </div>
          
          <div class="info-group">
            <span class="label">Start Date:</span>
            <span class="value">{formatDate(selectedUser.subscription.startDate)}</span>
          </div>
          
          <div class="info-group">
            <span class="label">End Date:</span>
            <span class="value">{formatDate(selectedUser.subscription.endDate)}</span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn cancel-btn" on:click={closeModals}>Close</button>
        {#if selectedUser.subscription.isPaid}
          <button class="btn cancel-subscription-btn" on:click={() => {
            closeModals();
            openCancelModal(selectedUser);
          }}>Cancel Subscription</button>
        {/if}
        <button class="btn update-subscription-btn" on:click={() => {
          closeModals();
          openUpdateModal(selectedUser);
        }}>Update Subscription</button>
        <button class="btn delete-user-btn" on:click={() => {
          closeModals();
          openDeleteModal(selectedUser);
        }}>Delete User</button>
      </div>
    </div>
  </div>
{/if}

<!-- Cancel Subscription Modal -->
{#if showCancelModal && selectedUser}
  <div class="modal-backdrop" on:click={closeModals}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Cancel Subscription</h2>
        <button class="close-btn" on:click={closeModals}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="confirmation-message">
          <p>Are you sure you want to cancel the subscription for <strong>{selectedUser.email}</strong>?</p>
          <p>This will immediately downgrade the user to the free plan.</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn cancel-btn" on:click={closeModals}>No, Keep Subscription</button>
        <button class="btn confirm-btn" on:click={cancelSubscription}>Yes, Cancel Subscription</button>
      </div>
    </div>
  </div>
{/if}

<!-- Update Subscription Modal -->
{#if showUpdateModal && selectedUser}
  <div class="modal-backdrop" on:click={closeModals}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Update Subscription</h2>
        <button class="close-btn" on:click={closeModals}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <p class="modal-subtitle">Update subscription for {selectedUser.email}</p>
        
        <div class="form-group">
          <div class="toggle-container">
            <label class="toggle">
              <input type="checkbox" bind:checked={subscriptionData.isPaid}>
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label">
              {subscriptionData.isPaid ? 'Active Subscription' : 'Inactive Subscription'}
            </span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="plan">Subscription Plan</label>
          <select id="plan" bind:value={subscriptionData.plan}>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        
        {#if subscriptionData.isPaid}
          <div class="form-group">
            <label for="months">Extend Subscription (Months)</label>
            <input 
              type="number" 
              id="months" 
              min="1" 
              max="24" 
              bind:value={subscriptionData.months}
            >
          </div>
        {/if}
      </div>
      
      <div class="modal-footer">
        <button class="btn cancel-btn" on:click={closeModals}>Cancel</button>
        <button class="btn confirm-btn" on:click={updateSubscription}>Update Subscription</button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
  <div class="modal-backdrop" on:click={closeModals}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Delete User</h2>
        <button class="close-btn" on:click={closeModals}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="confirmation-message">
          <p>Are you sure you want to delete the user <strong>{selectedUser?.email}</strong>?</p>
          <p>This action cannot be undone.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn cancel-btn" on:click={closeModals}>Cancel</button>
        <button class="btn delete-btn" on:click={deleteUser}>Delete User</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .users-container {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1.5rem;
  }

  .filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: center;
  }

  .search-box {
    flex: 1;
    min-width: 250px;
  }

  .search-box input {
    width: 100%;
    padding: 0.625rem 1rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-group label {
    font-size: 0.875rem;
    color: #4B5563;
    white-space: nowrap;
  }

  .filter-group select {
    padding: 0.625rem 1rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background-color: white;
  }

  .table-container {
    overflow-x: auto;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #E5E7EB;
  }

  th {
    font-weight: 500;
    color: #4B5563;
    background-color: #F9FAFB;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .status-badge, .plan-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-badge.active {
    background: #ECFDF5;
    color: #065F46;
  }

  .status-badge.inactive {
    background: #F3F4F6;
    color: #4B5563;
  }

  .plan-badge.free {
    background: #F3F4F6;
    color: #4B5563;
  }

  .plan-badge.basic {
    background: #FEF3C7;
    color: #92400E;
  }

  .plan-badge.premium {
    background: #EFF6FF;
    color: #1E40AF;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.5rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .view-btn {
    background-color: #F3F4F6;
    color: #4B5563;
  }

  .cancel-btn {
    background-color: #FEF2F2;
    color: #991B1B;
  }

  .update-btn {
    background-color: #EFF6FF;
    color: #1E40AF;
  }

  .view-btn:hover {
    background-color: #E5E7EB;
  }

  .cancel-btn:hover {
    background-color: #FEE2E2;
  }

  .update-btn:hover {
    background-color: #DBEAFE;
  }

  .loading, .empty-state {
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

  .reset-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #6355FF;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .reset-btn:hover {
    background-color: #5346E0;
  }

  /* Modal styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .modal-content {
    background-color: white;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #E5E7EB;
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  
  .close-btn {
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    color: #6B7280;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-btn:hover {
    color: #111827;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-subtitle {
    color: #6B7280;
    margin-bottom: 1.5rem;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #E5E7EB;
  }
  
  .btn {
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .cancel-btn {
    background-color: #F3F4F6;
    color: #4B5563;
  }
  
  .confirm-btn {
    background-color: #6355FF;
    color: white;
  }
  
  .cancel-subscription-btn {
    background-color: #FEF2F2;
    color: #991B1B;
  }
  
  .update-subscription-btn {
    background-color: #6355FF;
    color: white;
  }
  
  .cancel-btn:hover {
    background-color: #E5E7EB;
  }
  
  .confirm-btn:hover {
    background-color: #5346E0;
  }
  
  .cancel-subscription-btn:hover {
    background-color: #FEE2E2;
  }
  
  .update-subscription-btn:hover {
    background-color: #5346E0;
  }
  
  /* User details styles */
  .user-info, .subscription-details {
    margin-bottom: 1.5rem;
  }
  
  .info-group {
    display: flex;
    margin-bottom: 0.75rem;
    align-items: center;
  }
  
  .label {
    width: 120px;
    font-weight: 500;
    color: #4B5563;
  }
  
  .value {
    color: #111827;
  }
  
  .subscription-details {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #E5E7EB;
  }
  
  .subscription-details h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }
  
  /* Confirmation message */
  .confirmation-message {
    text-align: center;
    color: #4B5563;
  }
  
  .confirmation-message p {
    margin-bottom: 0.75rem;
  }
  
  .confirmation-message strong {
    color: #111827;
  }
  
  /* Form styles */
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4B5563;
  }
  
  .form-group select, .form-group input[type="number"] {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .toggle-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .toggle {
    position: relative;
    display: inline-block;
    width: 3rem;
    height: 1.5rem;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #D1D5DB;
    transition: .4s;
    border-radius: 1.5rem;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 1.25rem;
    width: 1.25rem;
    left: 0.125rem;
    bottom: 0.125rem;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .toggle-slider {
    background-color: #6355FF;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(1.5rem);
  }

  .toggle-label {
    font-size: 0.875rem;
    color: #4B5563;
  }

  /* Add styles for the delete button */
  .delete-btn {
    background-color: #EF4444;
    color: white;
  }
  
  .delete-btn:hover {
    background-color: #DC2626;
  }
  
  .delete-user-btn {
    background-color: #FEF2F2;
    color: #991B1B;
    margin-right: auto; /* Push to the left */
  }
  
  .delete-user-btn:hover {
    background-color: #FEE2E2;
  }
</style>