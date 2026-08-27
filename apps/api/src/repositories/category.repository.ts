import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { categories } from '../db/schema.js';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validation/category.schema.js';

// Pure data access — no validation, no business rules, just queries.
export const categoryRepository = {
  findAll() {
    return db.select().from(categories).orderBy(categories.name);
  },

  async create(data: CreateCategoryInput) {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  },

  async update(id: string, data: UpdateCategoryInput) {
    const [category] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return category;
  },
};
