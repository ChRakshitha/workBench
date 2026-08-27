import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const SESSION_COOKIE_NAME = 'workbench_session';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface SessionPayload {
  userId: string;
}

export function signSessionToken(userId: string): string {
  return jwt.sign({ userId } satisfies SessionPayload, config.jwtSecret, {
    expiresIn: TOKEN_TTL_SECONDS,
  });
}

// Returns the userId encoded in a valid, unexpired token — or null for any
// missing/expired/tampered token, so callers never need to distinguish cases.
export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as SessionPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: config.isProduction,
  path: '/',
  maxAge: TOKEN_TTL_SECONDS,
};
