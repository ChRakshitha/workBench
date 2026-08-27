import { apiFetch } from '@/lib/api';
import type { Viewer } from './types';

export function fetchMe(): Promise<Viewer> {
  return apiFetch('/auth/me');
}

export function login(email: string, password: string): Promise<{ id: string; name: string; email: string }> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return apiFetch('/auth/logout', { method: 'POST' });
}
