import { and, asc, desc, eq, getTableColumns, ilike, inArray, sql, type SQL } from 'drizzle-orm';
import { db } from '../db/index.js';
import { checklistItems, projectLinks, projects, projectTags, tags } from '../db/schema.js';
import type { ProjectQuery } from '../validation/project.schema.js';

const sortColumns = {
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
  startDate: projects.startDate,
  targetDate: projects.targetDate,
  priority: projects.priority,
  title: projects.title,
} as const;

// progress isn't a stored column (it's computed from checklist_items), so
// sorting by it needs an aggregate expression rather than a plain column ref.
const progressExpr = sql<number>`coalesce(round(count(${checklistItems.id}) filter (where ${checklistItems.isCompleted}) * 100.0 / nullif(count(${checklistItems.id}), 0)), 0)`;

export const projectRepository = {
  async findMany(query: ProjectQuery, visibility: SQL) {
    const conditions: SQL[] = [visibility];
    if (query.search) conditions.push(ilike(projects.title, `%${query.search}%`));
    if (query.status) conditions.push(eq(projects.status, query.status));
    if (query.priority) conditions.push(eq(projects.priority, query.priority));
    if (query.categoryId) conditions.push(eq(projects.categoryId, query.categoryId));
    if (query.isArchived !== undefined) conditions.push(eq(projects.isArchived, query.isArchived));
    if (query.tagId) {
      conditions.push(
        inArray(
          projects.id,
          db
            .select({ id: projectTags.projectId })
            .from(projectTags)
            .where(eq(projectTags.tagId, query.tagId)),
        ),
      );
    }

    const where = and(...conditions);
    const orderFn = query.sortOrder === 'asc' ? asc : desc;
    const offset = (query.page - 1) * query.pageSize;
    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(where);

    if (query.sortBy === 'progress') {
      const [rows, totalRows] = await Promise.all([
        db
          .select(getTableColumns(projects))
          .from(projects)
          .leftJoin(checklistItems, eq(checklistItems.projectId, projects.id))
          .where(where)
          .groupBy(projects.id)
          .orderBy(orderFn(progressExpr))
          .limit(query.pageSize)
          .offset(offset),
        totalQuery,
      ]);

      return { rows, total: Number(totalRows[0]?.count ?? 0) };
    }

    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(projects)
        .where(where)
        .orderBy(orderFn(sortColumns[query.sortBy]))
        .limit(query.pageSize)
        .offset(offset),
      totalQuery,
    ]);

    return { rows, total: Number(totalRows[0]?.count ?? 0) };
  },

  async findById(id: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  },

  // Batched (not per-row) progress lookup — one query for however many project
  // ids are being assembled, whether that's a single detail page or a full list page.
  async findProgressByProjectIds(projectIds: string[]) {
    if (projectIds.length === 0) return [];
    return db
      .select({
        projectId: checklistItems.projectId,
        completed: sql<number>`count(*) filter (where ${checklistItems.isCompleted})`,
        total: sql<number>`count(*)`,
      })
      .from(checklistItems)
      .where(inArray(checklistItems.projectId, projectIds))
      .groupBy(checklistItems.projectId);
  },

  async findTagsByProjectIds(projectIds: string[]) {
    if (projectIds.length === 0) return [];
    return db
      .select({ projectId: projectTags.projectId, id: tags.id, name: tags.name })
      .from(projectTags)
      .innerJoin(tags, eq(tags.id, projectTags.tagId))
      .where(inArray(projectTags.projectId, projectIds));
  },

  async findChecklistItemsByProjectId(projectId: string) {
    return db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.projectId, projectId))
      .orderBy(asc(checklistItems.position));
  },

  async findLinksByProjectId(projectId: string) {
    return db.select().from(projectLinks).where(eq(projectLinks.projectId, projectId));
  },

  async deleteById(id: string) {
    const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning();
    return deleted;
  },
};
