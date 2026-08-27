export type ProjectStatus =
  'idea' | 'planning' | 'planned' | 'in_progress' | 'blocked' | 'paused' | 'completed' | 'dropped';

export type ProjectPriority = 'low' | 'medium' | 'high';

export interface ProjectTag {
  id: string;
  name: string;
}

export interface ChecklistItem {
  id: string;
  projectId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectLink {
  id: string;
  projectId: string;
  label: string;
  url: string;
}

export interface ProjectListItem {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  categoryId: string | null;
  ownerId: string;
  isArchived: boolean;
  archivedAt: string | null;
  isPublic: boolean;
  startDate: string | null;
  targetDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  progress: number;
  tags: ProjectTag[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProjectListResponse {
  data: ProjectListItem[];
  pagination: Pagination;
}

export interface ProjectDetail extends ProjectListItem {
  checklistItems: ChecklistItem[];
  links: ProjectLink[];
}
