import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
  type CreateChecklistItemInput,
  type UpdateChecklistItemInput,
} from './api';

export function useCreateChecklistItem(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChecklistItemInput) => createChecklistItem(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
  });
}

export function useUpdateChecklistItem(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateChecklistItemInput }) =>
      updateChecklistItem(projectId, itemId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
  });
}

export function useDeleteChecklistItem(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteChecklistItem(projectId, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
  });
}
