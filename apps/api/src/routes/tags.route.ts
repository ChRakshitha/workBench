import type { FastifyInstance } from 'fastify';
import { tagService, TagNameConflictError, TagNotFoundError } from '../services/tag.service.js';
import { createTagSchema, updateTagSchema } from '../validation/tag.schema.js';
import { uuidSchema } from '../validation/common.js';
import { requireOwner } from '../utils/viewer.js';

export async function tagRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return tagService.list();
  });

  app.post('/', { preHandler: requireOwner }, async (request, reply) => {
    const parsed = createTagSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    }

    try {
      const tag = await tagService.create(parsed.data);
      return reply.status(201).send(tag);
    } catch (err) {
      if (err instanceof TagNameConflictError) {
        return reply.status(409).send({ error: 'Conflict', message: err.message });
      }
      throw err;
    }
  });

  app.patch<{ Params: { id: string } }>('/:id', { preHandler: requireOwner }, async (request, reply) => {
    const idResult = uuidSchema.safeParse(request.params.id);
    if (!idResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid tag id' });
    }

    const parsed = updateTagSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    }

    if (Object.keys(parsed.data).length === 0) {
      return reply
        .status(400)
        .send({ error: 'ValidationError', message: 'No fields provided to update' });
    }

    try {
      return await tagService.update(idResult.data, parsed.data);
    } catch (err) {
      if (err instanceof TagNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      if (err instanceof TagNameConflictError) {
        return reply.status(409).send({ error: 'Conflict', message: err.message });
      }
      throw err;
    }
  });
}
