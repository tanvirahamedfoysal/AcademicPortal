import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCacheSync } from './useCacheSync';
import { api } from '../services/api-client';
import { articleService } from '../services/article.service';
import { Article } from '../types/article';

const getPublicArticles = async () => (await api.get<Article[]>('/articles/public')).data;
const getArticlesLastUpdate = async () => (await api.get<{ updated_at: string }>('/articles/last-update')).data;

export function useArticles() {
  return useCacheSync<Article[]>({
    queryKey: ['articles', 'public'],
    fetchUpdateDate: getArticlesLastUpdate,
    fetchData: getPublicArticles,
    options: {
      staleTime: 10 * 60 * 1000, 
    }
  });
}

export function usePublicArticles() {
  return useCacheSync<Article[]>({
    queryKey: ['articles', 'public'],
    fetchUpdateDate: articleService.getLastUpdate,
    fetchData: articleService.getPublic,
    options: {
      staleTime: 15 * 60 * 1000, 
    }
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newArticle: Partial<Article>) => {
      const response = await api.post<Article>('/articles', newArticle);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}