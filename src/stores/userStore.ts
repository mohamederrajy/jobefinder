import { writable } from 'svelte/store';

export interface User {
  email: string;
  token: string;
  role?: string;
  isPaid?: boolean;
}

function createUserStore() {
  const { subscribe, set, update } = writable<User | null>(null);

  // Initialize from localStorage
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      set(JSON.parse(savedUser));
    }
  }

  return {
    subscribe,
    login: (userData: User) => {
      localStorage.setItem('user', JSON.stringify(userData));
      set(userData);
    },
    logout: async () => {
      localStorage.removeItem('user');
      set(null);
      // Add any other logout logic
    },
    update: (data: Partial<User>) => {
      update(user => {
        if (!user) return null;
        const updatedUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    },
    // Add method to check if user is logged in
    isLoggedIn: () => {
      return !!localStorage.getItem('user');
    }
  };
}

export const user = createUserStore(); 