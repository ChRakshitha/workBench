import { categoryRepository } from '../repositories/category.repository.js';
import { isUniqueViolation } from '../utils/dbErrors.js';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validation/category.schema.js';

export class CategoryNameConflictError extends Error {}
export class CategoryNotFoundError extends Error {}

// Business rules live here: what counts as a conflict, what counts as "not found".
// Routes don't know about any of this — they just call these functions and
// translate whichever error comes back into the right HTTP status.
export const categoryService = {
  list() {
    return categoryRepository.findAll();
  },

  async create(input: CreateCategoryInput) {
    try {
      return await categoryRepository.create(input);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new CategoryNameConflictError('Category name already exists');
      }
      throw err;
    }
  },

  async update(id: string, input: UpdateCategoryInput) {
    try {
      const category = await categoryRepository.update(id, input);
      if (!category) {
        throw new CategoryNotFoundError('Category not found');
      }
      return category;
    } catch (err) {
      if (err instanceof CategoryNotFoundError) throw err;
      if (isUniqueViolation(err)) {
        throw new CategoryNameConflictError('Category name already exists');
      }
      throw err;
    }
  },
};
