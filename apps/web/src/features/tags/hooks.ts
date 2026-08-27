import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTag, fetchTags, updateTag } from './api';

export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: fetchTags });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateTag(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });
}
