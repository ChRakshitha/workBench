import type { FastifyInstance } from 'fastify';
import {
  categoryService,
  CategoryNameConflictError,
  CategoryNotFoundError,
} from '../services/category.service.js';
import { createCategorySchema, updateCategorySchema } from '../validation/category.schema.js';
import { uuidSchema } from '../validation/common.js';
import { requireOwner } from '../utils/viewer.js';

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return categoryService.list();
  });

  app.post('/', { preHandler: requireOwner }, async (request, reply) => {
    const parsed = createCategorySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    }

    try {
      const category = await categoryService.create(parsed.data);
      return reply.status(201).send(category);
    } catch (err) {
      if (err instanceof CategoryNameConflictError) {
        return reply.status(409).send({ error: 'Conflict', message: err.message });
      }
      throw err;
    }
  });

  app.patch<{ Params: { id: string } }>('/:id', { preHandler: requireOwner }, async (request, reply) => {
    const idResult = uuidSchema.safeParse(request.params.id);
    if (!idResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid category id' });
    }

    const parsed = updateCategorySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    }

    if (Object.keys(parsed.data).length === 0) {
      return reply
        .status(400)
        .send({ error: 'ValidationError', message: 'No fields provided to update' });
    }

    try {
      return await categoryService.update(idResult.data, parsed.data);
    } catch (err) {
      if (err instanceof CategoryNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      if (err instanceof CategoryNameConflictError) {
        return reply.status(409).send({ error: 'Conflict', message: err.message });
      }
      throw err;
    }
  });
}
