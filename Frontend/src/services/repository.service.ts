import { api } from './api-client';
import { DocumentRecord } from '../types/repository';

export const repositoryService = {
  getDocuments: async (): Promise<DocumentRecord[]> => {
    const response = await api.get<{ data: DocumentRecord[] }>('/repository/documents');
    return response.data?.data || [];
  },
  uploadDocument: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>('/repository/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteDocument: async (url: string): Promise<void> => {
    await api.delete('/repository/documents', { data: { urls: [url] } });
  },
};
