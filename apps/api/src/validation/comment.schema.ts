import { z } from 'zod';

export const createCommentSchema = z.object({
  authorName: z.string().trim().min(1).max(100).optional(),
  authorEmail: z.email().optional(),
  content: z.string().trim().min(1).max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
