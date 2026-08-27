import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { projectLinks } from '../db/schema.js';
import type {
  CreateProjectLinkInput,
  UpdateProjectLinkInput,
} from '../validation/projectLink.schema.js';

export const projectLinkRepository = {
  async create(projectId: string, data: CreateProjectLinkInput) {
    const [link] = await db
      .insert(projectLinks)
      .values({ projectId, ...data })
      .returning();
    return link;
  },

  async update(id: string, projectId: string, data: UpdateProjectLinkInput) {
    const [link] = await db
      .update(projectLinks)
      .set(data)
      .where(and(eq(projectLinks.id, id), eq(projectLinks.projectId, projectId)))
      .returning();
    return link;
  },

  async remove(id: string, projectId: string) {
    const [link] = await db
      .delete(projectLinks)
      .where(and(eq(projectLinks.id, id), eq(projectLinks.projectId, projectId)))
      .returning();
    return link;
  },
};
