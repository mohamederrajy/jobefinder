import { writable } from 'svelte/store';
import { browser } from '$app/environment';

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
  token: string;
  isAdmin: boolean;
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
  const { subscribe, set, update } = writable<User | null>(null);

  return {
    subscribe,
    set,
    update,
    logout: async () => {
      try {
        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Reset store to null
        set(null);
        
        return true;
      } catch (error) {
        console.error('Error during logout:', error);
        throw error;
      }
    },
    // ... other store methods
  };
}

export const user = createUserStore();

// Initialize user from localStorage if available
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      user.set(JSON.parse(storedUser));
    } catch (e) {
      console.error('Error parsing stored user:', e);
      localStorage.removeItem('user');
    }
  }
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