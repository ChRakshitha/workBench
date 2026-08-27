import { and, asc, desc, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { projects } from '../db/schema.js';

const ACTIVE_STATUSES = ['planning', 'planned', 'in_progress', 'blocked', 'paused'] as const;
const CLOSED_STATUSES = ['completed', 'dropped'] as const;

export const dashboardRepository = {
  async countByStatus(ownerId: string) {
    return db
      .select({ status: projects.status, count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.ownerId, ownerId))
      .groupBy(projects.status);
  },

  async countByPriority(ownerId: string) {
    return db
      .select({ priority: projects.priority, count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.ownerId, ownerId))
      .groupBy(projects.priority);
  },

  async countOverdue(ownerId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(
        and(
          eq(projects.ownerId, ownerId),
          eq(projects.isArchived, false),
          notInArray(projects.status, [...CLOSED_STATUSES]),
          sql`${projects.targetDate} < current_date`,
        ),
      );
    return Number(row?.count ?? 0);
  },

  async findCurrentWork(ownerId: string, limit: number) {
    return db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.ownerId, ownerId),
          eq(projects.isArchived, false),
          inArray(projects.status, [...ACTIVE_STATUSES]),
        ),
      )
      .orderBy(desc(projects.updatedAt))
      .limit(limit);
  },

  async findOverdue(ownerId: string, limit: number) {
    return db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.ownerId, ownerId),
          eq(projects.isArchived, false),
          notInArray(projects.status, [...CLOSED_STATUSES]),
          sql`${projects.targetDate} < current_date`,
        ),
      )
      .orderBy(asc(projects.targetDate))
      .limit(limit);
  },

  async findUpcomingDeadlines(ownerId: string, limit: number) {
    return db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.ownerId, ownerId),
          eq(projects.isArchived, false),
          notInArray(projects.status, [...CLOSED_STATUSES]),
          sql`${projects.targetDate} is not null`,
          sql`${projects.targetDate} >= current_date`,
        ),
      )
      .orderBy(asc(projects.targetDate))
      .limit(limit);
  },
};
