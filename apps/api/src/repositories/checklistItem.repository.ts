import { eq, max } from 'drizzle-orm';
import { db } from '../db/index.js';
import { checklistItems } from '../db/schema.js';

export const checklistItemRepository = {
  async findMaxPosition(projectId: string) {
    const [row] = await db
      .select({ maxPosition: max(checklistItems.position) })
      .from(checklistItems)
      .where(eq(checklistItems.projectId, projectId));
    return row?.maxPosition ?? -1;
  },
};
