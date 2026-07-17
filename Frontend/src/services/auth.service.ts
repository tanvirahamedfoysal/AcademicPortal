import { api } from './api-client';
import { API_CONFIG } from '../config/api.config';
import { LoginCredentials, LoginResponse } from '../types/auth';
import { User } from '../types/user';

export const authService = {
login: async (credentials: LoginCredentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
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