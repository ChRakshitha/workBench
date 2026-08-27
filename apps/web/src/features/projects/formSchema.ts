import { z } from 'zod';
import { priorityValues } from './statusStyles';
import type { ProjectPriority } from './types';

// Create and edit collect the exact same fields now (status is implied
// 'idea' on create, and only targetDate is user-settable), so one schema
// covers both instead of two near-duplicates.
export const projectFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(5000),
  priority: z.enum(priorityValues as [string, ...string[]]),
  categoryId: z.string(),
  tagIds: z.array(z.string()),
  isPublic: z.boolean(),
  targetDate: z.string(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Converts empty-string "unset" sentinels from native form inputs into the
// null/omitted shape the API expects (categoryId: 'none' -> null, empty
// date string -> null).
export function toProjectApiPayload(values: ProjectFormValues) {
  return {
    title: values.title,
    description: values.description || undefined,
    priority: values.priority as ProjectPriority,
    categoryId: values.categoryId === 'none' ? null : values.categoryId,
    tagIds: values.tagIds,
    isPublic: values.isPublic,
    targetDate: values.targetDate || null,
  };
}
