<script lang="ts">
  import { notifications } from '../../stores/notificationStore';
  import NotificationItem from './NotificationItem.svelte';
</script>

<div class="notifications-container">
  {#each $notifications as notification (notification.id)}
    <NotificationItem {notification} />
  {/each}
</div>

<style>
  .notifications-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    width: 100%;
    max-width: 24rem;
    pointer-events: none;
  }

  .notifications-container :global(.notification-item) {
    pointer-events: all;
  }
</style> 