import type { FastifyInstance } from 'fastify';
import {
  checklistItemService,
  ChecklistItemNotFoundError,
} from '../services/checklistItem.service.js';
import { ProjectNotFoundError } from '../services/project.service.js';
import { userRepository } from '../repositories/user.repository.js';
import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
} from '../validation/checklistItem.schema.js';
import { uuidSchema } from '../validation/common.js';
import { requireOwner } from '../utils/viewer.js';

export async function checklistItemRoutes(app: FastifyInstance) {
  app.post<{ Params: { projectId: string } }>(
    '/',
    { preHandler: requireOwner },
    async (request, reply) => {
    const projectIdResult = uuidSchema.safeParse(request.params.projectId);
    if (!projectIdResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid project id' });
    }

    const parsed = createChecklistItemSchema.safeParse(request.body);
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
      const item = await checklistItemService.create(projectIdResult.data, parsed.data, owner.id);
      return reply.status(201).send(item);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      throw err;
    }
    },
  );

  app.patch<{ Params: { projectId: string; itemId: string } }>(
    '/:itemId',
    { preHandler: requireOwner },
    async (request, reply) => {
      const projectIdResult = uuidSchema.safeParse(request.params.projectId);
      const itemIdResult = uuidSchema.safeParse(request.params.itemId);
      if (!projectIdResult.success || !itemIdResult.success) {
        return reply
          .status(400)
          .send({ error: 'ValidationError', message: 'Invalid project or item id' });
      }

      const parsed = updateChecklistItemSchema.safeParse(request.body);
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
        return await checklistItemService.update(
          projectIdResult.data,
          itemIdResult.data,
          parsed.data,
          owner.id,
        );
      } catch (err) {
        if (err instanceof ProjectNotFoundError || err instanceof ChecklistItemNotFoundError) {
          return reply.status(404).send({ error: 'NotFound', message: err.message });
        }
        throw err;
      }
    },
  );

  app.delete<{ Params: { projectId: string; itemId: string } }>(
    '/:itemId',
    { preHandler: requireOwner },
    async (request, reply) => {
      const projectIdResult = uuidSchema.safeParse(request.params.projectId);
      const itemIdResult = uuidSchema.safeParse(request.params.itemId);
      if (!projectIdResult.success || !itemIdResult.success) {
        return reply
          .status(400)
          .send({ error: 'ValidationError', message: 'Invalid project or item id' });
      }

      const owner = await userRepository.findOwner();
      if (!owner) {
        return reply
          .status(500)
          .send({ error: 'ServerError', message: 'No owner user seeded — run pnpm db:seed' });
      }

      try {
        return await checklistItemService.remove(projectIdResult.data, itemIdResult.data, owner.id);
      } catch (err) {
        if (err instanceof ProjectNotFoundError || err instanceof ChecklistItemNotFoundError) {
          return reply.status(404).send({ error: 'NotFound', message: err.message });
        }
        throw err;
      }
    },
  );
}
