import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tags } from '../db/schema.js';
import type { CreateTagInput, UpdateTagInput } from '../validation/tag.schema.js';

export const tagRepository = {
  findAll() {
    return db.select().from(tags).orderBy(tags.name);
  },

  async create(data: CreateTagInput) {
    const [tag] = await db.insert(tags).values(data).returning();
    return tag;
  },

  async update(id: string, data: UpdateTagInput) {
    const [tag] = await db.update(tags).set(data).where(eq(tags.id, id)).returning();
    return tag;
  },
};
