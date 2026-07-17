import { api } from './api-client';
import { Article } from '../types/article';

export const articleService = {
  getPublic: async (): Promise<Article[]> => {
    const response = await api.get<Article[]>('/articles/public');
    return response.data;
  },
  
  getLastUpdate: async (): Promise<{ updated_at: string }> => {
    const response = await api.get<{ updated_at: string }>('/articles/last-update');
    return response.data;
  }
};