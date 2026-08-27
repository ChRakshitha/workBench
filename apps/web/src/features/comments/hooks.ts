import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createComment, deleteComment, fetchComments, type CreateCommentInput } from './api';

export function useComments(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'comments'],
    queryFn: () => fetchComments(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateComment(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) => createComment(projectId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'comments'] }),
  });
}

export function useDeleteComment(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(projectId, commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'comments'] }),
  });
}
