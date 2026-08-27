import type { FastifyReply, FastifyRequest } from 'fastify';
import { SESSION_COOKIE_NAME, verifySessionToken } from './authToken.js';

export interface Viewer {
  isOwner: boolean;
}

// isOwner reflects whether the request carries a valid, unexpired session
// cookie for the (single) owner account. No cookie, an expired one, or a
// tampered one all fall back to the public-visitor view.
export function getViewer(request: FastifyRequest): Viewer {
  const token = request.cookies?.[SESSION_COOKIE_NAME];
  return { isOwner: verifySessionToken(token) !== null };
}

// Guard for mutation routes: only the authenticated owner may create, edit,
// or delete anything. Attach as a preHandler on every POST/PATCH/DELETE route.
export async function requireOwner(request: FastifyRequest, reply: FastifyReply) {
  if (!getViewer(request).isOwner) {
    return reply
      .status(401)
      .send({ error: 'Unauthorized', message: 'Sign in as the owner to do that' });
  }
}
