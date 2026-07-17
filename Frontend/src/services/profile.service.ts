import { api } from './api-client';
import { User } from '../types/user';

export const profileService = {
  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/profile/me', data);
    return response.data;
  }
};