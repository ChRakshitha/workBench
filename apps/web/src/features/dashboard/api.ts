import { apiFetch } from '@/lib/api';
import type { DashboardSummary } from './types';

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch('/dashboard');
}
