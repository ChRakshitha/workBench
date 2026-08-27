import { projectPriorityEnum, projectStatusEnum, type projects } from '../db/schema.js';
import { dashboardRepository } from '../repositories/dashboard.repository.js';
import { projectRepository } from '../repositories/project.repository.js';

type Project = typeof projects.$inferSelect;

function computeProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

async function withProgress(rows: Project[]) {
  const ids = rows.map((row) => row.id);
  const progressRows = await projectRepository.findProgressByProjectIds(ids);
  const byId = new Map(progressRows.map((row) => [row.projectId, row]));

  return rows.map((project) => {
    const p = byId.get(project.id);
    return {
      ...project,
      progress: p ? computeProgress(Number(p.completed), Number(p.total)) : 0,
    };
  });
}

export const dashboardService = {
  async getSummary(ownerId: string) {
    const [statusRows, priorityRows, overdueCount, currentWorkRaw, upcomingRaw, overdueRaw] =
      await Promise.all([
        dashboardRepository.countByStatus(ownerId),
        dashboardRepository.countByPriority(ownerId),
        dashboardRepository.countOverdue(ownerId),
        dashboardRepository.findCurrentWork(ownerId, 5),
        dashboardRepository.findUpcomingDeadlines(ownerId, 5),
        dashboardRepository.findOverdue(ownerId, 5),
      ]);

    const byStatus = Object.fromEntries(
      projectStatusEnum.enumValues.map((status) => [status, 0]),
    ) as Record<string, number>;
    for (const row of statusRows) byStatus[row.status] = Number(row.count);

    const byPriority = Object.fromEntries(
      projectPriorityEnum.enumValues.map((priority) => [priority, 0]),
    ) as Record<string, number>;
    for (const row of priorityRows) byPriority[row.priority] = Number(row.count);

    const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);

    const [currentWork, upcomingDeadlines, overdueProjects] = await Promise.all([
      withProgress(currentWorkRaw),
      withProgress(upcomingRaw),
      withProgress(overdueRaw),
    ]);

    return {
      total,
      byStatus,
      byPriority,
      overdueCount,
      currentWork,
      upcomingDeadlines,
      overdueProjects,
    };
  },
};
