import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

export const updateTagSchema = createTagSchema.partial();

export type UpdateTagInput = z.infer<typeof updateTagSchema>;
