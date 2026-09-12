import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCacheSync } from './useCacheSync';
import { api } from '../services/api-client';
import { articleService } from '../services/article.service';
import { Article } from '../types/article';

export function useArticles() {
  return useCacheSync<Article[]>({
    queryKey: ['articles', 'public'],
    fetchUpdateDate: articleService.getLastUpdate,
    fetchData: articleService.getPublic,
    options: { staleTime: 10 * 60 * 1000 },
  });
}

export function usePublicArticles() {
  return useCacheSync<Article[]>({
    queryKey: ['articles', 'public'],
    fetchUpdateDate: articleService.getLastUpdate,
    fetchData: articleService.getPublic,
    options: { staleTime: 15 * 60 * 1000 },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newArticle: Partial<Article>) => {
      const body = newArticle.body || [newArticle.abstract, newArticle.content].filter(Boolean).join('\n\n');
      const response = await api.post<{ data: { id: string; title: string; status: string; created_at: string } }>('/articles', {
        title: newArticle.title,
        body,
      });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articles'] }),
  });
}
