import { api } from './api-client';
import { Student } from '../types/student';

export const studentService = {
  getPending: async (): Promise<Student[]> => {
    const response = await api.get<{ data: Student[] }>('/students/pending');
    return response.data?.data || [];
  },
  verify: async (id: string): Promise<void> => {
    await api.patch(`/students/pending/${id}/verify`);
  },
  reject: async (id: string): Promise<void> => {
    await api.delete(`/students/pending/${id}`);
  },
};
