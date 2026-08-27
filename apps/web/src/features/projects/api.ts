import { apiFetch } from '@/lib/api';
import type { ProjectDetail, ProjectListResponse, ProjectPriority, ProjectStatus } from './types';

export interface ProjectFormPayload {
  title: string;
  description?: string;
  priority: ProjectPriority;
  categoryId?: string | null;
  tagIds?: string[];
  isPublic: boolean;
  targetDate?: string | null;
}

export interface ProjectListParams {
  search?: string;
  status?: string;
  priority?: string;
  categoryId?: string;
  tagId?: string;
  isArchived?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export function fetchProjects(params: ProjectListParams): Promise<ProjectListResponse> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  return apiFetch(`/projects${qs ? `?${qs}` : ''}`);
}

export function fetchProject(id: string): Promise<ProjectDetail> {
  return apiFetch(`/projects/${id}`);
}

export function changeProjectStatus(id: string, status: ProjectStatus): Promise<ProjectDetail> {
  return apiFetch(`/projects/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function setProjectArchived(id: string, isArchived: boolean): Promise<ProjectDetail> {
  return apiFetch(`/projects/${id}/archive`, {
    method: 'PATCH',
    body: JSON.stringify({ isArchived }),
  });
}

export function createProject(input: ProjectFormPayload): Promise<ProjectDetail> {
  return apiFetch('/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateProject(
  id: string,
  input: Partial<ProjectFormPayload>,
): Promise<ProjectDetail> {
  return apiFetch(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteProject(id: string): Promise<void> {
  return apiFetch(`/projects/${id}`, { method: 'DELETE' });
}
