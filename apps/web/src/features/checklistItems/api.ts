import { apiFetch } from '@/lib/api';
import type { ChecklistItem } from '@/features/projects/types';

export interface CreateChecklistItemInput {
  title: string;
  position?: number;
}

export interface UpdateChecklistItemInput {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}

export function createChecklistItem(
  projectId: string,
  input: CreateChecklistItemInput,
): Promise<ChecklistItem> {
  return apiFetch(`/projects/${projectId}/checklist-items`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateChecklistItem(
  projectId: string,
  itemId: string,
  input: UpdateChecklistItemInput,
): Promise<ChecklistItem> {
  return apiFetch(`/projects/${projectId}/checklist-items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteChecklistItem(projectId: string, itemId: string): Promise<ChecklistItem> {
  return apiFetch(`/projects/${projectId}/checklist-items/${itemId}`, { method: 'DELETE' });
}
