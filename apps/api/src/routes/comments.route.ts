import type { FastifyInstance } from 'fastify';
import { commentService, CommentNotFoundError } from '../services/comment.service.js';
import { ProjectNotFoundError } from '../services/project.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { createCommentSchema } from '../validation/comment.schema.js';
import { uuidSchema } from '../validation/common.js';
import { getViewer, requireOwner } from '../utils/viewer.js';

export async function commentRoutes(app: FastifyInstance) {
  app.get<{ Params: { projectId: string } }>('/', async (request, reply) => {
    const projectIdResult = uuidSchema.safeParse(request.params.projectId);
    if (!projectIdResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid project id' });
    }

    const owner = await userRepository.findOwner();
    if (!owner) {
      return reply
        .status(500)
        .send({ error: 'ServerError', message: 'No owner user seeded — run pnpm db:seed' });
    }

    try {
      return await commentService.list(projectIdResult.data, getViewer(request), owner.id);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      throw err;
    }
  });

  app.post<{ Params: { projectId: string } }>('/', async (request, reply) => {
    const projectIdResult = uuidSchema.safeParse(request.params.projectId);
    if (!projectIdResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid project id' });
    }

    const parsed = createCommentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    }

    const owner = await userRepository.findOwner();
    if (!owner) {
      return reply
        .status(500)
        .send({ error: 'ServerError', message: 'No owner user seeded — run pnpm db:seed' });
    }

    try {
      const comment = await commentService.create(
        projectIdResult.data,
        parsed.data,
        getViewer(request),
        owner.id,
      );
      return reply.status(201).send(comment);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      throw err;
    }
  });

  app.delete<{ Params: { projectId: string; commentId: string } }>(
    '/:commentId',
    { preHandler: requireOwner },
    async (request, reply) => {
      const projectIdResult = uuidSchema.safeParse(request.params.projectId);
      const commentIdResult = uuidSchema.safeParse(request.params.commentId);
      if (!projectIdResult.success || !commentIdResult.success) {
        return reply
          .status(400)
          .send({ error: 'ValidationError', message: 'Invalid project or comment id' });
      }

      const owner = await userRepository.findOwner();
      if (!owner) {
        return reply
          .status(500)
          .send({ error: 'ServerError', message: 'No owner user seeded — run pnpm db:seed' });
      }

      try {
        return await commentService.remove(projectIdResult.data, commentIdResult.data, owner.id);
      } catch (err) {
        if (err instanceof ProjectNotFoundError || err instanceof CommentNotFoundError) {
          return reply.status(404).send({ error: 'NotFound', message: err.message });
        }
        throw err;
      }
    },
  );
}
