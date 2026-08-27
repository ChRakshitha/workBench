import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProjectLink, deleteProjectLink, type CreateProjectLinkInput } from './api';

export function useCreateProjectLink(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectLinkInput) => createProjectLink(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
  });
}

export function useDeleteProjectLink(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => deleteProjectLink(projectId, linkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
  });
}
