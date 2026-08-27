export interface Comment {
  id: string;
  projectId: string;
  authorName: string | null;
  authorEmail: string | null;
  content: string;
  createdAt: string;
}
