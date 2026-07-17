import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositoryService } from '../services/repository.service';
import { DocumentRecord } from '../types/repository';

export function useDocuments() {
  return useQuery<DocumentRecord[], Error>({
    queryKey: ['repository', 'documents'],
    queryFn: repositoryService.getDocuments,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => repositoryService.uploadDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repository', 'documents'] });
    },
  });
}