import type { FastifyInstance } from 'fastify';
import { dashboardService } from '../services/dashboard.service.js';
import { userRepository } from '../repositories/user.repository.js';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const owner = await userRepository.findOwner();
    if (!owner) {
      return reply
        .status(500)
        .send({ error: 'ServerError', message: 'No owner user seeded — run pnpm db:seed' });
    }

    return dashboardService.getSummary(owner.id);
  });
}
