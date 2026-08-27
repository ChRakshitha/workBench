import { tagRepository } from '../repositories/tag.repository.js';
import { isUniqueViolation } from '../utils/dbErrors.js';
import type { CreateTagInput, UpdateTagInput } from '../validation/tag.schema.js';

export class TagNameConflictError extends Error {}
export class TagNotFoundError extends Error {}

export const tagService = {
  list() {
    return tagRepository.findAll();
  },

  async create(input: CreateTagInput) {
    try {
      return await tagRepository.create(input);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new TagNameConflictError('Tag name already exists');
      }
      throw err;
    }
  },

  async update(id: string, input: UpdateTagInput) {
    try {
      const tag = await tagRepository.update(id, input);
      if (!tag) throw new TagNotFoundError('Tag not found');
      return tag;
    } catch (err) {
      if (err instanceof TagNotFoundError) throw err;
      if (isUniqueViolation(err)) {
        throw new TagNameConflictError('Tag name already exists');
      }
      throw err;
    }
  },
};
