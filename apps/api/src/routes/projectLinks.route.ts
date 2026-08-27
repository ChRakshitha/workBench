import type { FastifyInstance } from 'fastify';
import { projectLinkService, ProjectLinkNotFoundError } from '../services/projectLink.service.js';
import { ProjectNotFoundError } from '../services/project.service.js';
import { userRepository } from '../repositories/user.repository.js';
import {
  createProjectLinkSchema,
  updateProjectLinkSchema,
} from '../validation/projectLink.schema.js';
import { uuidSchema } from '../validation/common.js';
import { requireOwner } from '../utils/viewer.js';

export async function projectLinkRoutes(app: FastifyInstance) {
  app.post<{ Params: { projectId: string } }>(
    '/',
    { preHandler: requireOwner },
    async (request, reply) => {
    const projectIdResult = uuidSchema.safeParse(request.params.projectId);
    if (!projectIdResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid project id' });
    }

    const parsed = createProjectLinkSchema.safeParse(request.body);
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
      const link = await projectLinkService.create(projectIdResult.data, parsed.data, owner.id);
      return reply.status(201).send(link);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      throw err;
    }
    },
  );

  app.patch<{ Params: { projectId: string; linkId: string } }>(
    '/:linkId',
    { preHandler: requireOwner },
    async (request, reply) => {
      const projectIdResult = uuidSchema.safeParse(request.params.projectId);
      const linkIdResult = uuidSchema.safeParse(request.params.linkId);
      if (!projectIdResult.success || !linkIdResult.success) {
        return reply
          .status(400)
          .send({ error: 'ValidationError', message: 'Invalid project or link id' });
      }

      const parsed = updateProjectLinkSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
      }

      if (Object.keys(parsed.data).length === 0) {
        return reply
          .status(400)
          .send({ error: 'ValidationError', message: 'No fields provided to update' });
      }

      const owner = await userRepository.findOwner();
      if (!owner) {
        return reply
          .status(500)
          .send({ error: 'ServerError', message: 'No owner user seeded — run pnpm db:seed' });
      }

      try {
        return await projectLinkService.update(
          projectIdResult.data,
          linkIdResult.data,
          parsed.data,
          owner.id,
        );
      } catch (err) {
        if (err instanceof ProjectNotFoundError || err instanceof ProjectLinkNotFoundError) {
          return reply.status(404).send({ error: 'NotFound', message: err.message });
        }
        throw err;
      }
    },
  );

  app.delete<{ Params: { projectId: string; linkId: string } }>(
    '/:linkId',
    { preHandler: requireOwner },
    async (request, reply) => {
      const projectIdResult = uuidSchema.safeParse(request.params.projectId);
      const linkIdResult = uuidSchema.safeParse(request.params.linkId);
      if (!projectIdResult.success || !linkIdResult.success) {
        return reply
          .status(400)
          .send({ error: 'ValidationError', message: 'Invalid project or link id' });
      }

      const owner = await userRepository.findOwner();
      if (!owner) {
        return reply
          .status(500)
          .send({ error: 'ServerError', message: 'No owner user seeded — run pnpm db:seed' });
      }

      try {
        return await projectLinkService.remove(projectIdResult.data, linkIdResult.data, owner.id);
      } catch (err) {
        if (err instanceof ProjectNotFoundError || err instanceof ProjectLinkNotFoundError) {
          return reply.status(404).send({ error: 'NotFound', message: err.message });
        }
        throw err;
      }
    },
  );
}
