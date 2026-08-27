import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { activityLog, checklistItems } from '../db/schema.js';
import { checklistItemRepository } from '../repositories/checklistItem.repository.js';
import { projectService } from './project.service.js';
import type {
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from '../validation/checklistItem.schema.js';

export class ChecklistItemNotFoundError extends Error {}

export const checklistItemService = {
  async create(projectId: string, input: CreateChecklistItemInput, ownerId: string) {
    await projectService.assertOwned(projectId, ownerId);

    return db.transaction(async (tx) => {
      const position =
        input.position ?? (await checklistItemRepository.findMaxPosition(projectId)) + 1;

      const [item] = await tx
        .insert(checklistItems)
        .values({ projectId, title: input.title, position })
        .returning();

      await tx.insert(activityLog).values({
        projectId,
        type: 'CHECKLIST_ITEM_ADDED',
        summary: `Checklist item "${item.title}" added`,
      });

      return item;
    });
  },

  async update(
    projectId: string,
    itemId: string,
    input: UpdateChecklistItemInput,
    ownerId: string,
  ) {
    await projectService.assertOwned(projectId, ownerId);

    return db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(checklistItems)
        .where(and(eq(checklistItems.id, itemId), eq(checklistItems.projectId, projectId)));

      if (!current) throw new ChecklistItemNotFoundError('Checklist item not found');

      const [updated] = await tx
        .update(checklistItems)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(checklistItems.id, itemId))
        .returning();

      // Only log the completion edge (false -> true), not every toggle,
      // to keep the activity feed signal-heavy rather than noisy.
      if (input.isCompleted === true && !current.isCompleted) {
        await tx.insert(activityLog).values({
          projectId,
          type: 'CHECKLIST_ITEM_COMPLETED',
          summary: `Checklist item "${current.title}" marked complete`,
        });
      }

      return updated;
    });
  },

  async remove(projectId: string, itemId: string, ownerId: string) {
    await projectService.assertOwned(projectId, ownerId);

    return db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(checklistItems)
        .where(and(eq(checklistItems.id, itemId), eq(checklistItems.projectId, projectId)))
        .returning();

      if (!deleted) throw new ChecklistItemNotFoundError('Checklist item not found');

      await tx.insert(activityLog).values({
        projectId,
        type: 'CHECKLIST_ITEM_REMOVED',
        summary: `Checklist item "${deleted.title}" removed`,
      });

      return deleted;
    });
  },
};
