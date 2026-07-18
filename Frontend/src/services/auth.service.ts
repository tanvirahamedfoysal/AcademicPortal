import { api } from './api-client';
import { API_CONFIG } from '../config/api.config';
import { LoginCredentials, LoginResponse } from '../types/auth';
import { User } from '../types/user';

export const authService = {
  login: async (credentials: LoginCredentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'Login failed');
  }

  const data = await response.json();
  
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  }

  return data;
},

  getMe: async (): Promise<User> => {
    const response = await api.get<User>(API_CONFIG.endpoints.profile.me);
    return response.data;
  },
  
  validateToken: async (): Promise<boolean> => {
    try {
      await api.get(API_CONFIG.endpoints.auth.validate);
      return true;
    } catch {
      return false;
    }
  }
};