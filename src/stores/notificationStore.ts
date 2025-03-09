import { writable } from 'svelte/store';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([]);

  return {
    subscribe,
    add: (notification: Omit<Notification, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      const duration = notification.duration || 5000; // Default 5 seconds

      update(notifications => [
        ...notifications,
        { ...notification, id }
      ]);

      // Auto-remove notification after duration
      setTimeout(() => {
        update(notifications => notifications.filter(n => n.id !== id));
      }, duration);
    },
    remove: (id: string) => {
      update(notifications => notifications.filter(n => n.id !== id));
    },
    clear: () => {
      update(() => []);
    }
  };
}

export const notifications = createNotificationStore(); 