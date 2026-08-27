import { z } from 'zod';

export const createProjectLinkSchema = z.object({
  label: z.string().trim().min(1).max(100),
  url: z.url(),
});

export type CreateProjectLinkInput = z.infer<typeof createProjectLinkSchema>;

export const updateProjectLinkSchema = createProjectLinkSchema.partial();

export type UpdateProjectLinkInput = z.infer<typeof updateProjectLinkSchema>;
