import type { FastifyInstance } from 'fastify';
import { authService, InvalidCredentialsError } from '../services/auth.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { loginSchema } from '../validation/auth.schema.js';
import { SESSION_COOKIE_NAME, sessionCookieOptions, signSessionToken } from '../utils/authToken.js';
import { getViewer } from '../utils/viewer.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    }

    try {
      const user = await authService.login(parsed.data);
      const token = signSessionToken(user.id);
      reply.setCookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);
      return { id: user.id, name: user.name, email: user.email };
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return reply.status(401).send({ error: 'InvalidCredentials', message: err.message });
      }
      throw err;
    }
  });

  app.post('/logout', async (request, reply) => {
    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    return { ok: true };
  });

  app.get('/me', async (request) => {
    const viewer = getViewer(request);
    if (!viewer.isOwner) {
      return { isOwner: false };
    }

    const owner = await userRepository.findOwner();
    return { isOwner: true, name: owner?.name, email: owner?.email };
  });
}
