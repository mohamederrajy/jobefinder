import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { PUBLIC_API_URL } from '$env/static/public';

// Define the user type
type UserProfile = {
  firstName?: string;
  lastName?: string;
  professionalTitle?: string;
  location?: string;
  phoneNumber?: string;
  professionalSummary?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
};

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  token: string;
  role?: string;
  profile?: UserProfile;
  subscription?: {
    isPaid: boolean;
    plan: string;
    startDate?: string;
    endDate?: string;
  };
}

function createUserStore() {
  // Initialize the store with data from localStorage if available
  const storedUser = browser ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const { subscribe, set, update } = writable<User | null>(storedUser);

  return {
    subscribe,
    set: (userData: User | null) => {
      if (userData) {
        // Save both token and full user data to localStorage
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // If user is admin, redirect to admin dashboard
        if (userData.isAdmin) {
          goto('/admin');
        }
      }
      set(userData);
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set(null);
      goto('/login');
    },
    // Method to restore session
    restoreSession: async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const response = await fetch(`${PUBLIC_API_URL}/users/me`, {
            headers: {
              'x-auth-token': token
            }
          });

          if (response.ok) {
            const userData = await response.json();
            set({
              ...JSON.parse(storedUser),
              ...userData,
              token
            });
            return true;
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
        }
      }
      return false;
    }
  };
}

export const user = createUserStore();

// Initialize session restoration if in browser
if (browser) {
  user.restoreSession();
}

// Function to login user
export function login(userData: User) {
  user.set(userData);
}

// Function to update user profile
export function updateUserProfile(profileData: UserProfile) {
  user.update(currentUser => {
    if (currentUser) {
      return {
        ...currentUser,
        profile: {
          ...currentUser.profile,
          ...profileData
        }
      };
    }
    return currentUser;
  });
}

// Function to clear user data (logout)
export function clearUser() {
  user.set(null);
} 