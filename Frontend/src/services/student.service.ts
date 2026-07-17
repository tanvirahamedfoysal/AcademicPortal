import { api } from './api-client';
import { Student } from '../types/student';

export const studentService = {
  getPending: async (): Promise<Student[]> => {
    const response = await api.get<Student[]>('/students/pending');
    return response.data;
  },

  verify: async (id: string): Promise<void> => {
    await api.patch(`/students/${id}/verify`);
  },

  reject: async (id: string): Promise<void> => {
    await api.patch(`/students/${id}`, { status: 'rejected' });
  }
};