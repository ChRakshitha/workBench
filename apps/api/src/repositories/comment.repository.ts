import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { comments } from '../db/schema.js';
import type { CreateCommentInput } from '../validation/comment.schema.js';

export const commentRepository = {
  findByProjectId(projectId: string) {
    return db
      .select()
      .from(comments)
      .where(eq(comments.projectId, projectId))
      .orderBy(desc(comments.createdAt));
  },

  async create(projectId: string, data: CreateCommentInput) {
    const [comment] = await db
      .insert(comments)
      .values({ projectId, ...data })
      .returning();
    return comment;
  },

  async remove(id: string, projectId: string) {
    const [comment] = await db
      .delete(comments)
      .where(and(eq(comments.id, id), eq(comments.projectId, projectId)))
      .returning();
    return comment;
  },
};
