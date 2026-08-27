import type { FastifyInstance } from 'fastify';
import {
  InvalidReferenceError,
  InvalidStatusTransitionError,
  ProjectNotFoundError,
  projectService,
} from '../services/project.service.js';
import { userRepository } from '../repositories/user.repository.js';
import {
  changeProjectStatusSchema,
  createProjectSchema,
  projectQuerySchema,
  setProjectArchivedSchema,
  updateProjectSchema,
} from '../validation/project.schema.js';
import { uuidSchema } from '../validation/common.js';
import { getViewer, requireOwner } from '../utils/viewer.js';

export async function projectRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const parsed = projectQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    }

    const owner = await userRepository.findOwner();
    if (!owner) {
      return reply
        .status(500)
        .send({ error: 'ServerError', message: 'No owner user seeded — run pnpm db:seed' });
    }

    return projectService.list(parsed.data, getViewer(request), owner.id);
  });

  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const idResult = uuidSchema.safeParse(request.params.id);
    if (!idResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid project id' });
    }

    const owner = await userRepository.findOwner();
    if (!owner) {
      return reply
        .status(500)
        .send({ error: 'ServerError', message: 'No owner user seeded — run pnpm db:seed' });
    }

    try {
      return await projectService.getById(idResult.data, getViewer(request), owner.id);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      throw err;
    }
  });

  app.post('/', { preHandler: requireOwner }, async (request, reply) => {
    const parsed = createProjectSchema.safeParse(request.body);
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
      const project = await projectService.create(parsed.data, owner.id);
      return reply.status(201).send(project);
    } catch (err) {
      if (err instanceof InvalidReferenceError) {
        return reply.status(400).send({ error: 'ValidationError', message: err.message });
      }
      throw err;
    }
  });

  app.patch<{ Params: { id: string } }>('/:id', { preHandler: requireOwner }, async (request, reply) => {
    const idResult = uuidSchema.safeParse(request.params.id);
    if (!idResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid project id' });
    }

    const parsed = updateProjectSchema.safeParse(request.body);
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
      return await projectService.update(idResult.data, parsed.data, owner.id);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      if (err instanceof InvalidReferenceError) {
        return reply.status(400).send({ error: 'ValidationError', message: err.message });
      }
      throw err;
    }
  });

  app.patch<{ Params: { id: string } }>(
    '/:id/status',
    { preHandler: requireOwner },
    async (request, reply) => {
    const idResult = uuidSchema.safeParse(request.params.id);
    if (!idResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid project id' });
    }

    const parsed = changeProjectStatusSchema.safeParse(request.body);
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
      return await projectService.changeStatus(idResult.data, parsed.data.status, owner.id);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      if (err instanceof InvalidStatusTransitionError) {
        return reply
          .status(409)
          .send({ error: 'InvalidTransition', message: err.message, allowed: err.allowed });
      }
      throw err;
    }
    },
  );

  app.patch<{ Params: { id: string } }>(
    '/:id/archive',
    { preHandler: requireOwner },
    async (request, reply) => {
    const idResult = uuidSchema.safeParse(request.params.id);
    if (!idResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid project id' });
    }

    const parsed = setProjectArchivedSchema.safeParse(request.body);
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
      return await projectService.setArchived(idResult.data, parsed.data.isArchived, owner.id);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      throw err;
    }
    },
  );

  app.delete<{ Params: { id: string } }>('/:id', { preHandler: requireOwner }, async (request, reply) => {
    const idResult = uuidSchema.safeParse(request.params.id);
    if (!idResult.success) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Invalid project id' });
    }

    const owner = await userRepository.findOwner();
    if (!owner) {
      return reply
        .status(500)
        .send({ error: 'ServerError', message: 'No owner user seeded — run pnpm db:seed' });
    }

    try {
      await projectService.remove(idResult.data, owner.id);
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return reply.status(404).send({ error: 'NotFound', message: err.message });
      }
      throw err;
    }
  });
}
