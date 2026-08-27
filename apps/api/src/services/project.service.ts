import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { activityLog, projects, projectTags } from '../db/schema.js';
import { projectRepository } from '../repositories/project.repository.js';
import { isForeignKeyViolation } from '../utils/dbErrors.js';
import type { Viewer } from '../utils/viewer.js';
import {
  getAllowedNextStatuses,
  isValidStatusTransition,
  type ProjectStatus,
} from '../domain/projectStatusTransitions.js';
import type {
  CreateProjectInput,
  ProjectQuery,
  UpdateProjectInput,
} from '../validation/project.schema.js';

export class ProjectNotFoundError extends Error {}
export class InvalidReferenceError extends Error {}
export class InvalidStatusTransitionError extends Error {
  constructor(
    message: string,
    public readonly allowed: ProjectStatus[],
  ) {
    super(message);
  }
}

type Project = typeof projects.$inferSelect;

function computeProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

interface ActivityEntry {
  type: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

// Compares the current row against the incoming partial update and produces
// one activity entry per meaningfully-changed field, matching the PRD's
// requirement for specific history entries ("Target date changed") rather
// than a generic "Project updated" line.
function describeFieldChanges(
  current: Project,
  fields: Omit<UpdateProjectInput, 'tagIds'>,
): ActivityEntry[] {
  const entries: ActivityEntry[] = [];

  if (fields.title !== undefined && fields.title !== current.title) {
    entries.push({
      type: 'TITLE_CHANGED',
      summary: `Title changed from "${current.title}" to "${fields.title}"`,
    });
  }
  if (fields.description !== undefined && fields.description !== current.description) {
    entries.push({ type: 'DESCRIPTION_UPDATED', summary: 'Description updated' });
  }
  if (fields.priority !== undefined && fields.priority !== current.priority) {
    entries.push({
      type: 'PRIORITY_CHANGED',
      summary: `Priority changed from ${current.priority} to ${fields.priority}`,
      metadata: { from: current.priority, to: fields.priority },
    });
  }
  if (fields.categoryId !== undefined && fields.categoryId !== current.categoryId) {
    entries.push({ type: 'CATEGORY_CHANGED', summary: 'Category changed' });
  }
  if (fields.startDate !== undefined && fields.startDate !== current.startDate) {
    entries.push({
      type: 'START_DATE_CHANGED',
      summary: fields.startDate
        ? `Start date changed to ${fields.startDate}`
        : 'Start date cleared',
    });
  }
  if (fields.targetDate !== undefined && fields.targetDate !== current.targetDate) {
    entries.push({
      type: 'TARGET_DATE_CHANGED',
      summary: fields.targetDate
        ? `Target date changed to ${fields.targetDate}`
        : 'Target date cleared',
    });
  }
  if (fields.endDate !== undefined && fields.endDate !== current.endDate) {
    entries.push({
      type: 'END_DATE_CHANGED',
      summary: fields.endDate ? `End date changed to ${fields.endDate}` : 'End date cleared',
    });
  }

  return entries;
}

async function assembleDetail(project: Project) {
  const [progressRows, tagRows, checklistItemRows, linkRows] = await Promise.all([
    projectRepository.findProgressByProjectIds([project.id]),
    projectRepository.findTagsByProjectIds([project.id]),
    projectRepository.findChecklistItemsByProjectId(project.id),
    projectRepository.findLinksByProjectId(project.id),
  ]);

  const progress = progressRows[0]
    ? computeProgress(Number(progressRows[0].completed), Number(progressRows[0].total))
    : 0;

  return {
    ...project,
    progress,
    tags: tagRows.map(({ id, name }) => ({ id, name })),
    checklistItems: checklistItemRows,
    links: linkRows,
  };
}

export const projectService = {
  async list(query: ProjectQuery, viewer: Viewer, ownerId: string) {
    const visibility = viewer.isOwner ? eq(projects.ownerId, ownerId) : eq(projects.isPublic, true);
    const { rows, total } = await projectRepository.findMany(query, visibility);

    const ids = rows.map((row) => row.id);
    const [progressRows, tagRows] = await Promise.all([
      projectRepository.findProgressByProjectIds(ids),
      projectRepository.findTagsByProjectIds(ids),
    ]);

    const progressByProject = new Map(progressRows.map((row) => [row.projectId, row]));
    const tagsByProject = new Map<string, { id: string; name: string }[]>();
    for (const row of tagRows) {
      const list = tagsByProject.get(row.projectId) ?? [];
      list.push({ id: row.id, name: row.name });
      tagsByProject.set(row.projectId, list);
    }

    const data = rows.map((project) => {
      const p = progressByProject.get(project.id);
      return {
        ...project,
        progress: p ? computeProgress(Number(p.completed), Number(p.total)) : 0,
        tags: tagsByProject.get(project.id) ?? [],
      };
    });

    return {
      data,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  },

  async getById(id: string, viewer: Viewer, ownerId: string) {
    const project = await projectService.assertVisible(id, viewer, ownerId);
    return assembleDetail(project);
  },

  // Shared guard for resources nested under a project (checklist items,
  // links, comment moderation) that only the owner may mutate.
  async assertOwned(id: string, ownerId: string): Promise<Project> {
    const project = await projectRepository.findById(id);
    if (!project || project.ownerId !== ownerId) {
      throw new ProjectNotFoundError('Project not found');
    }
    return project;
  },

  // Shared guard for resources nested under a project that follow the same
  // visibility rule as the project itself (comments: read/post).
  async assertVisible(id: string, viewer: Viewer, ownerId: string): Promise<Project> {
    const project = await projectRepository.findById(id);
    if (!project) throw new ProjectNotFoundError('Project not found');

    const visible = viewer.isOwner ? project.ownerId === ownerId : project.isPublic;
    if (!visible) throw new ProjectNotFoundError('Project not found');

    return project;
  },

  async create(input: CreateProjectInput, ownerId: string) {
    const { tagIds, ...fields } = input;

    try {
      return await db.transaction(async (tx) => {
        const [project] = await tx
          .insert(projects)
          .values({ ...fields, ownerId })
          .returning();

        if (tagIds && tagIds.length > 0) {
          await tx
            .insert(projectTags)
            .values(tagIds.map((tagId) => ({ projectId: project.id, tagId })));
        }

        await tx.insert(activityLog).values({
          projectId: project.id,
          type: 'PROJECT_CREATED',
          summary: `Project "${project.title}" created`,
        });

        return project;
      });
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw new InvalidReferenceError('categoryId or one of tagIds does not exist');
      }
      throw err;
    }
  },

  async update(id: string, input: UpdateProjectInput, ownerId: string) {
    const { tagIds, ...fields } = input;

    try {
      return await db.transaction(async (tx) => {
        const [current] = await tx
          .select()
          .from(projects)
          .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)));

        if (!current) throw new ProjectNotFoundError('Project not found');

        const [project] = await tx
          .update(projects)
          .set({ ...fields, updatedAt: new Date() })
          .where(eq(projects.id, id))
          .returning();

        const changes = describeFieldChanges(current, fields);
        if (changes.length > 0) {
          await tx.insert(activityLog).values(
            changes.map((change) => ({
              projectId: id,
              type: change.type,
              summary: change.summary,
              metadata: change.metadata,
            })),
          );
        }

        if (tagIds) {
          await tx.delete(projectTags).where(eq(projectTags.projectId, id));
          if (tagIds.length > 0) {
            await tx.insert(projectTags).values(tagIds.map((tagId) => ({ projectId: id, tagId })));
          }
        }

        return project;
      });
    } catch (err) {
      if (err instanceof ProjectNotFoundError) throw err;
      if (isForeignKeyViolation(err)) {
        throw new InvalidReferenceError('categoryId or one of tagIds does not exist');
      }
      throw err;
    }
  },

  async changeStatus(id: string, to: ProjectStatus, ownerId: string) {
    return db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)));

      if (!current) throw new ProjectNotFoundError('Project not found');

      if (!isValidStatusTransition(current.status, to)) {
        throw new InvalidStatusTransitionError(
          `Cannot transition from "${current.status}" to "${to}"`,
          getAllowedNextStatuses(current.status),
        );
      }

      const [updated] = await tx
        .update(projects)
        .set({ status: to, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();

      await tx.insert(activityLog).values({
        projectId: id,
        type: 'STATUS_CHANGED',
        summary: `Status changed from ${current.status} to ${to}`,
        metadata: { from: current.status, to },
      });

      return updated;
    });
  },

  async setArchived(id: string, isArchived: boolean, ownerId: string) {
    return db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)));

      if (!current) throw new ProjectNotFoundError('Project not found');
      if (current.isArchived === isArchived) return current;

      const [updated] = await tx
        .update(projects)
        .set({
          isArchived,
          archivedAt: isArchived ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      await tx.insert(activityLog).values({
        projectId: id,
        type: isArchived ? 'PROJECT_ARCHIVED' : 'PROJECT_UNARCHIVED',
        summary: isArchived ? 'Project archived' : 'Project unarchived',
      });

      return updated;
    });
  },

  // Cascades at the DB level (checklist items, links, comments, tags,
  // activity log all reference projectId with onDelete: 'cascade').
  async remove(id: string, ownerId: string) {
    await projectService.assertOwned(id, ownerId);
    await projectRepository.deleteById(id);
  },
};
