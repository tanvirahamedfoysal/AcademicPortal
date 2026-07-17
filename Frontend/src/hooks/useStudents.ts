import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services/student.service';
import { Student } from '../types/student';

export function usePendingStudents() {
  return useQuery<Student[], Error>({
    queryKey: ['students', 'pending'],
    queryFn: studentService.getPending,
  });
}

export function useVerifyStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentService.verify(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'pending'] });
    },
  });
}

export function useRejectStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'pending'] });
    },
  });
}