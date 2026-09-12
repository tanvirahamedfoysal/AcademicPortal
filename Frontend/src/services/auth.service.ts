import { api } from './api-client';
import { API_CONFIG } from '../config/api.config';
import { LoginCredentials } from '../types/auth';

export interface BackendUserProfile {
  uuid: string;
  email: string;
  status?: string;
  user_role: 'ADMIN' | 'STUDENT' | 'MODERATOR' | 'COLLABORATOR' | 'VISITOR';
  profile_type?: string;
  profile_image?: string;
  student_batch?: string | number;
}

export interface BackendLoginResponse {
  access_token: string;
  token_type: string;
  user: BackendUserProfile;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<BackendLoginResponse> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.detail || 'Login failed');
    if (data.access_token && typeof window !== 'undefined') localStorage.setItem('token', data.access_token);
    return data as BackendLoginResponse;
  },

  getMe: async (): Promise<BackendUserProfile> => {
    const response = await api.get<{ data: BackendUserProfile }>(API_CONFIG.endpoints.profile.me);
    return response.data.data;
  },

  validateToken: async (): Promise<boolean> => {
    try {
      await api.get(API_CONFIG.endpoints.auth.validate);
      return true;
    } catch {
      return false;
    }
  },
};
