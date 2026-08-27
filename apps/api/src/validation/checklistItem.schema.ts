import { z } from 'zod';

export const createChecklistItemSchema = z.object({
  title: z.string().trim().min(1).max(300),
  position: z.number().int().min(0).optional(),
});

export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;

export const updateChecklistItemSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  isCompleted: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;
