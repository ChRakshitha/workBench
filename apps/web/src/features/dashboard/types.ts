import type { ProjectListItem } from '@/features/projects/types';

export interface DashboardSummary {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdueCount: number;
  currentWork: Omit<ProjectListItem, 'tags'>[];
  upcomingDeadlines: Omit<ProjectListItem, 'tags'>[];
  overdueProjects: Omit<ProjectListItem, 'tags'>[];
}
