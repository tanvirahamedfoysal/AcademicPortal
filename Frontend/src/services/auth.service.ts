import { api } from './api-client';
import { API_CONFIG } from '../config/api.config';
import { LoginCredentials, LoginResponse } from '../types/auth';
import { User } from '../types/user';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post<LoginResponse>(
      API_CONFIG.endpoints.auth.login, 
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
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