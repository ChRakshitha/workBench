import { apiFetch } from '@/lib/api';
import type { ProjectLink } from '@/features/projects/types';

export interface CreateProjectLinkInput {
  label: string;
  url: string;
}

export function createProjectLink(
  projectId: string,
  input: CreateProjectLinkInput,
): Promise<ProjectLink> {
  return apiFetch(`/projects/${projectId}/links`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deleteProjectLink(projectId: string, linkId: string): Promise<ProjectLink> {
  return apiFetch(`/projects/${projectId}/links/${linkId}`, { method: 'DELETE' });
}
