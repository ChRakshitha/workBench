import type { ProjectPriority, ProjectStatus } from './types';

// Semantic status/priority colors are a deliberate exception to the
// otherwise-monochrome theme — content carries the color variety here,
// not the UI chrome.
export const statusLabels: Record<ProjectStatus, string> = {
  idea: 'Idea',
  planning: 'Planning',
  planned: 'Planned',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  paused: 'Paused',
  completed: 'Completed',
  dropped: 'Dropped',
};

export const statusStyles: Record<ProjectStatus, string> = {
  idea: 'bg-slate-100 text-slate-700',
  planning: 'bg-blue-100 text-blue-700',
  planned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-amber-100 text-amber-800',
  blocked: 'bg-red-100 text-red-700',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-700',
  dropped: 'bg-zinc-100 text-zinc-600',
};

export const priorityLabels: Record<ProjectPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const priorityStyles: Record<ProjectPriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-red-100 text-red-700',
};

export const statusValues = Object.keys(statusLabels) as ProjectStatus[];
export const priorityValues = Object.keys(priorityLabels) as ProjectPriority[];
