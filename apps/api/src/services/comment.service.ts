import { db } from '../db/index.js';
import { activityLog, comments } from '../db/schema.js';
import { commentRepository } from '../repositories/comment.repository.js';
import { projectService } from './project.service.js';
import type { Viewer } from '../utils/viewer.js';
import type { CreateCommentInput } from '../validation/comment.schema.js';

export class CommentNotFoundError extends Error {}

export const commentService = {
  async list(projectId: string, viewer: Viewer, ownerId: string) {
    await projectService.assertVisible(projectId, viewer, ownerId);
    return commentRepository.findByProjectId(projectId);
  },

  async create(projectId: string, input: CreateCommentInput, viewer: Viewer, ownerId: string) {
    await projectService.assertVisible(projectId, viewer, ownerId);

    return db.transaction(async (tx) => {
      const [comment] = await tx
        .insert(comments)
        .values({ projectId, ...input })
        .returning();

      await tx.insert(activityLog).values({
        projectId,
        type: 'COMMENT_ADDED',
        summary: `Comment added by ${input.authorName ?? 'Anonymous'}`,
      });

      return comment;
    });
  },

  async remove(projectId: string, commentId: string, ownerId: string) {
    await projectService.assertOwned(projectId, ownerId);
    const comment = await commentRepository.remove(commentId, projectId);
    if (!comment) throw new CommentNotFoundError('Comment not found');
    return comment;
  },
};
