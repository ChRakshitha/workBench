import { apiFetch } from '@/lib/api';
import type { Tag } from './types';

export function fetchTags(): Promise<Tag[]> {
  return apiFetch('/tags');
}

export function createTag(name: string): Promise<Tag> {
  return apiFetch('/tags', { method: 'POST', body: JSON.stringify({ name }) });
}

export function updateTag(id: string, name: string): Promise<Tag> {
  return apiFetch(`/tags/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
}
