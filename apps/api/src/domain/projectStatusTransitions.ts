import { projectStatusEnum } from '../db/schema.js';

export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];

const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  idea: ['planning', 'dropped'],
  planning: ['planned', 'idea', 'dropped'],
  planned: ['in_progress', 'dropped'],
  in_progress: ['blocked', 'paused', 'completed', 'dropped'],
  blocked: ['in_progress', 'dropped'],
  paused: ['in_progress', 'dropped'],
  completed: ['in_progress'],
  dropped: ['in_progress'],
};

export function isValidStatusTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function getAllowedNextStatuses(from: ProjectStatus): ProjectStatus[] {
  return ALLOWED_TRANSITIONS[from];
}
