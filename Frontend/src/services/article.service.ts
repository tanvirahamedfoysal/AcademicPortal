import { api } from './api-client';
import { Article } from '../types/article';

type PublicRow = {
  article_uuid: string;
  article_title: string;
  published_at: string | null;
  updated_at: string;
  author_uuid: string | null;
};

const normalize = (row: PublicRow): Article => ({
  id: row.article_uuid,
  title: row.article_title,
  author_uuid: row.author_uuid,
  created_at: row.published_at || row.updated_at,
  updated_at: row.updated_at,
  published_at: row.published_at,
  status: 'PUBLISHED',
});

export const articleService = {
  getPublic: async (): Promise<Article[]> => {
    const response = await api.get<{ data: PublicRow[] }>('/articles/public');
    return (response.data?.data || []).map(normalize);
  },

  getLastUpdate: async (): Promise<{ updated_at: string }> => {
    const rows = await articleService.getPublic();
    const updatedAt = rows.reduce((latest, article) => {
      const candidate = article.updated_at || article.created_at || '';
      return candidate > latest ? candidate : latest;
    }, '');
    return { updated_at: updatedAt || 'empty' };
  },
};
