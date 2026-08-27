import { z } from 'zod';
import { projectPriorityEnum, projectStatusEnum } from '../db/schema.js';
import { dateOnlySchema, paginationQuerySchema, uuidSchema } from './common.js';

// Shared field definitions, no defaults applied here — create and update
// schemas each decide independently whether a field is required/defaulted.
const projectShape = {
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(projectStatusEnum.enumValues),
  priority: z.enum(projectPriorityEnum.enumValues),
  // Nullable (not just optional) because these are nullable DB columns —
  // the update schema needs to be able to express "clear this field",
  // which requires sending an explicit null, not just omitting the key.
  categoryId: uuidSchema.nullable().optional(),
  tagIds: z.array(uuidSchema).optional(),
  isPublic: z.boolean(),
  startDate: dateOnlySchema.nullable().optional(),
  targetDate: dateOnlySchema.nullable().optional(),
  endDate: dateOnlySchema.nullable().optional(),
};

function validateDateOrder(
  data: {
    startDate?: string | null;
    targetDate?: string | null;
    endDate?: string | null;
  },
  ctx: z.RefinementCtx,
) {
  if (data.startDate && data.targetDate && data.targetDate < data.startDate) {
    ctx.addIssue({
      code: 'custom',
      message: 'targetDate must be on or after startDate',
      path: ['targetDate'],
    });
  }
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    ctx.addIssue({
      code: 'custom',
      message: 'endDate must be on or after startDate',
      path: ['endDate'],
    });
  }
}

export const createProjectSchema = z
  .object({
    ...projectShape,
    status: projectShape.status.default('idea'),
    priority: projectShape.priority.default('medium'),
    isPublic: projectShape.isPublic.default(true),
  })
  .superRefine(validateDateOrder);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object(projectShape).partial().superRefine(validateDateOrder);

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectQuerySchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    status: z.enum(projectStatusEnum.enumValues).optional(),
    priority: z.enum(projectPriorityEnum.enumValues).optional(),
    categoryId: uuidSchema.optional(),
    tagId: uuidSchema.optional(),
    isArchived: z.coerce.boolean().optional(),
    sortBy: z
      .enum(['createdAt', 'updatedAt', 'startDate', 'targetDate', 'priority', 'title', 'progress'])
      .default('updatedAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .extend(paginationQuerySchema.shape);

export type ProjectQuery = z.infer<typeof projectQuerySchema>;

export const changeProjectStatusSchema = z.object({
  status: z.enum(projectStatusEnum.enumValues),
});

export type ChangeProjectStatusInput = z.infer<typeof changeProjectStatusSchema>;

export const setProjectArchivedSchema = z.object({
  isArchived: z.boolean(),
});

export type SetProjectArchivedInput = z.infer<typeof setProjectArchivedSchema>;
