import { apiFetch } from '@/lib/api';
import type { Category } from './types';

export function fetchCategories(): Promise<Category[]> {
  return apiFetch('/categories');
}

export function createCategory(name: string): Promise<Category> {
  return apiFetch('/categories', { method: 'POST', body: JSON.stringify({ name }) });
}

export function updateCategory(id: string, name: string): Promise<Category> {
  return apiFetch(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
}
