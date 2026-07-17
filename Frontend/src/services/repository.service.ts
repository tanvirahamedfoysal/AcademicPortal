import { api } from './api-client';
import { DocumentRecord } from '../types/repository';

export const repositoryService = {
  getDocuments: async (): Promise<DocumentRecord[]> => {
    const response = await api.get<DocumentRecord[]>('/repository/documents');
    return response.data;
  },

  uploadDocument: async (file: File): Promise<DocumentRecord> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<DocumentRecord>('/repository/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/repository/documents/${id}`);
  }
};