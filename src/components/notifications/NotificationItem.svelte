<script lang="ts">
  import { notifications } from '../../stores/notificationStore';
  import type { Notification } from '../../stores/notificationStore';
  
  export let notification: Notification;

  const icons = {
    success: `<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>`,
    error: `<path fill="currentColor" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>`,
    warning: `<path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>`,
    info: `<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>`
  };

  function handleClose() {
    notifications.remove(notification.id);
  }
</script>

<div 
  class="notification-item {notification.type}"
  role="alert"
  on:click={handleClose}
>
  <div class="icon">
    <svg viewBox="0 0 24 24" width="24" height="24">
      {@html icons[notification.type]}
    </svg>
  </div>
  <div class="content">{notification.message}</div>
  <button class="close-btn" on:click|stopPropagation={handleClose}>
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  </button>
</div>

<style>
  .notification-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
    animation: slideIn 0.3s ease-out;
  }

  .notification-item:hover {
    transform: translateY(-1px);
  }

  .notification-item.success {
    background: #F0FDF4;
    color: #166534;
  }

  .notification-item.error {
    background: #FEF2F2;
    color: #991B1B;
  }

  .notification-item.warning {
    background: #FFFBEB;
    color: #92400E;
  }

  .notification-item.info {
    background: #EFF6FF;
    color: #1E40AF;
  }

  .content {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .close-btn {
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .close-btn:hover {
    opacity: 1;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style> 