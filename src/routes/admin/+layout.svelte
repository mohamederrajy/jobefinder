<script lang="ts">
  import { page } from '$app/stores';
  import { user } from '../../stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';

  let isSidebarCollapsed = false;
  let successfulPayments = 0;
  let isLoading = true;

  async function checkAdminAccess() {
    const userData = $user;
    
    if (!userData || !userData.isAdmin) {
      goto('/login');
      return false;
    }
    
    return true;
  }

  async function fetchTransactionsSummary() {
    try {
      const response = await fetch(`${PUBLIC_API_URL}/subscriptions/transactions`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user?.token || localStorage.getItem('token') || ''
        }
      });
      const data = await response.json();
      if (data.success && data.summary) {
        successfulPayments = data.summary.successful_payments;
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  onMount(async () => {
    const hasAccess = await checkAdminAccess();
    if (hasAccess) {
      await fetchTransactionsSummary();
    }
    isLoading = false;
  });

  const menuItems = [
    {
      label: 'Dashboard',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zM13 4v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z"/>
      </svg>`,
      href: '/admin'
    },
    {
      label: 'Jobs',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8-2h4v2h-4V5zm-2 9H8c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zm6 0h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1z"/>
      </svg>`,
      href: '/admin/jobs'
    },
    {
      label: 'Users',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.76-9.64l-1.68 1.69c.84 1.18.84 2.71 0 3.89l1.68 1.69c2.02-2.02 2.02-5.07 0-7.27zM20.07 2l-1.63 1.63c2.77 3.02 2.77 7.56 0 10.74L20.07 16c3.9-3.89 3.91-9.95 0-14z"/>
      </svg>`,
      href: '/admin/users'
    },
    {
      label: 'Preview',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      </svg>`,
      href: '/admin/Preview'
    },
    {
      label: 'Transactions',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      </svg>`,
      href: '/admin/transactions',
      notifications: successfulPayments
    },
    {
      label: 'Payment',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      </svg>`,
      href: '/admin/Payment'
    }
  ];

  async function handleLogout() {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      // Reset user store
      await user.logout();
      goto('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
</script>

{#if isLoading}
  <div class="loading-screen">
    <div class="spinner"></div>
    <p>Loading...</p>
  </div>
{:else}
  <div class="admin-layout" class:collapsed={isSidebarCollapsed}>
    <aside class="sidebar" class:collapsed={isSidebarCollapsed}>
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path fill="#6355FF" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
          </div>
          <span class="logo-text">JobFinder</span>
          <button class="collapse-btn" on:click={() => isSidebarCollapsed = !isSidebarCollapsed}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d={isSidebarCollapsed ? 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' : 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'}/>
            </svg>
          </button>
        </div>
      </div>

      <nav class="sidebar-nav">
        {#each menuItems as item}
          <a 
            href={item.href} 
            class="nav-item"
            class:active={$page.url.pathname === item.href}
          >
            <div class="nav-icon">
              {@html item.icon}
              {#if item.notifications > 0}
                <span class="notification-badge">
                  {item.notifications}
                </span>
              {/if}
            </div>
            <span class="nav-label">{item.label}</span>
            {#if isSidebarCollapsed}
              <div class="tooltip">
                {item.label}
                {#if item.notifications > 0}
                  ({item.notifications})
                {/if}
              </div>
            {/if}
          </a>
        {/each}
      </nav>

      <div class="sidebar-footer">
        <button class="logout-button" on:click={handleLogout}>
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </div>
          <span class="nav-label">Logout</span>
          {#if isSidebarCollapsed}
            <div class="tooltip">Logout</div>
          {/if}
        </button>
      </div>
    </aside>

    <main class="main-content">
      <slot />
    </main>
  </div>
{/if}

<style>
  .admin-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: 100vh;
    background: #F3F4F6;
    transition: all 0.3s ease;
  }

  .admin-layout.collapsed {
    grid-template-columns: 80px 1fr;
  }

  .sidebar {
    background: white;
    border-right: 1px solid #E5E7EB;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .sidebar-header {
    margin-bottom: 2rem;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    transition: opacity 0.3s ease;
  }

  .collapsed .logo-text {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }

  .collapse-btn {
    background: none;
    border: none;
    color: #6B7280;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .collapse-btn:hover {
    background: #F3F4F6;
    color: #111827;
  }

  .sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    color: #6B7280;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .nav-item:hover {
    background: #F3F4F6;
    color: #111827;
  }

  .nav-item.active {
    background: #6355FF;
    color: white;
  }

  .nav-label {
    font-weight: 500;
    transition: opacity 0.3s ease;
  }

  .collapsed .nav-label {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }

  .sidebar-footer {
    margin-top: auto;
    padding-top: 1.5rem;
    border-top: 1px solid #E5E7EB;
  }

  .logout-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #FEE2E2;
    color: #DC2626;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .logout-button:hover {
    background: #FEE2E2;
    transform: translateY(-1px);
  }

  .main-content {
    padding: 2rem;
    overflow-y: auto;
  }

  .sidebar.collapsed {
    padding: 1.5rem 0.75rem;
    align-items: center;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(99, 85, 255, 0.1);
  }

  .nav-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    transition: all 0.3s ease;
    background: rgba(99, 85, 255, 0.1);
    position: relative;
  }

  .nav-item.active .nav-icon {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .nav-item:hover .nav-icon {
    transform: translateY(-2px) scale(1.05);
    background: rgba(99, 85, 255, 0.15);
  }

  .collapsed .nav-item {
    width: 48px;
    height: 48px;
    justify-content: center;
    position: relative;
    margin: 4px 0;
  }

  .collapsed .nav-icon {
    width: 44px;
    height: 44px;
  }

  .collapsed .nav-item:hover .nav-icon {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.2);
  }

  .collapsed .nav-item.active .nav-icon {
    background: #6355FF;
    color: white;
    box-shadow: 0 4px 12px rgba(99, 85, 255, 0.3);
  }

  .logout-button .nav-icon {
    background: rgba(220, 38, 38, 0.1);
    color: #DC2626;
  }

  .logout-button:hover .nav-icon {
    background: rgba(220, 38, 38, 0.15);
    transform: translateY(-2px) scale(1.05);
  }

  .collapsed .logout-button .nav-icon {
    width: 44px;
    height: 44px;
  }

  .collapsed .logout-button:hover .nav-icon {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
  }

  .tooltip {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    background: #1F2937;
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    margin-left: 0.75rem;
    pointer-events: none;
    z-index: 100;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-style: solid;
    border-width: 4px 4px 4px 0;
    border-color: transparent #1F2937 transparent transparent;
  }

  .nav-item:hover .tooltip,
  .logout-button:hover .tooltip {
    opacity: 1;
    visibility: visible;
  }

  .notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #10B981;
    color: white;
    border-radius: 9999px;
    padding: 2px 6px;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .nav-item.active .notification-badge {
    background: white;
    color: #6355FF;
    border-color: #6355FF;
  }

  .collapsed .notification-badge {
    right: -4px;
  }

  @media (max-width: 1024px) {
    .admin-layout {
      grid-template-columns: 80px 1fr;
    }

    .sidebar {
      padding: 1.5rem 0.75rem;
      align-items: center;
    }

    .nav-item, .logout-button {
      width: 48px;
      height: 48px;
      justify-content: center;
      position: relative;
    }

    .logo-text, .nav-label {
      display: none;
    }

    .collapse-btn {
      display: none;
    }
  }

  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #6355FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style> 