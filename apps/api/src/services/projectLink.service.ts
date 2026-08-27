import { projectLinkRepository } from '../repositories/projectLink.repository.js';
import { projectService } from './project.service.js';
import type {
  CreateProjectLinkInput,
  UpdateProjectLinkInput,
} from '../validation/projectLink.schema.js';

export class ProjectLinkNotFoundError extends Error {}

export const projectLinkService = {
  async create(projectId: string, input: CreateProjectLinkInput, ownerId: string) {
    await projectService.assertOwned(projectId, ownerId);
    return projectLinkRepository.create(projectId, input);
  },

  async update(projectId: string, linkId: string, input: UpdateProjectLinkInput, ownerId: string) {
    await projectService.assertOwned(projectId, ownerId);
    const link = await projectLinkRepository.update(linkId, projectId, input);
    if (!link) throw new ProjectLinkNotFoundError('Link not found');
    return link;
  },

  async remove(projectId: string, linkId: string, ownerId: string) {
    await projectService.assertOwned(projectId, ownerId);
    const link = await projectLinkRepository.remove(linkId, projectId);
    if (!link) throw new ProjectLinkNotFoundError('Link not found');
    return link;
  },
};
