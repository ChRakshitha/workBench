import { apiFetch } from '@/lib/api';
import type { Comment } from './types';

export interface CreateCommentInput {
  authorName?: string;
  authorEmail?: string;
  content: string;
}

export function fetchComments(projectId: string): Promise<Comment[]> {
  return apiFetch(`/projects/${projectId}/comments`);
}

export function createComment(projectId: string, input: CreateCommentInput): Promise<Comment> {
  return apiFetch(`/projects/${projectId}/comments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deleteComment(projectId: string, commentId: string): Promise<Comment> {
  return apiFetch(`/projects/${projectId}/comments/${commentId}`, { method: 'DELETE' });
}
