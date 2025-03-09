import type { SignupData, LoginData, ApiResponse } from './types';
import { user } from '../stores/userStore';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5001/api';

export async function signup(userData: SignupData): Promise<ApiResponse> {
  try {
    if (!API_URL) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${API_URL}/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

export async function login(credentials: LoginData): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    return {
      token: data.token,
      user: data.user
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const userStore = get(user);
  
  if (!userStore?.token) {
    throw new Error('No authentication token');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${userStore.token}`
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    user.logout();
    goto('/login');
    throw new Error('Session expired');
  }

  return response;
} 