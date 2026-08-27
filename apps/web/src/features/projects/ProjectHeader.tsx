import { Link } from 'react-router';
import { Archive, ArchiveRestore, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ApiError } from '@/lib/api';
import {
  priorityLabels,
  priorityStyles,
  statusLabels,
  statusStyles,
  statusValues,
} from './statusStyles';
import { useMe } from '@/features/auth/hooks';
import { useChangeProjectStatus, useDeleteProject, useSetProjectArchived } from './hooks';
import type { ProjectDetail, ProjectStatus } from './types';

interface ProjectHeaderProps {
  project: ProjectDetail;
  categoryName?: string;
}

export function ProjectHeader({ project, categoryName }: ProjectHeaderProps) {
  const { data: viewer } = useMe();
  const isOwner = viewer?.isOwner ?? false;
  const changeStatus = useChangeProjectStatus(project.id);
  const setArchived = useSetProjectArchived(project.id);
  const deleteProject = useDeleteProject(project.id);

  const statusError = changeStatus.error instanceof ApiError ? changeStatus.error : null;
  const allowed = (statusError?.body as { allowed?: ProjectStatus[] } | undefined)?.allowed;

  return (
    <div className="mb-6">
      <Link
        to="/projects"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Projects
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
            >
              {statusLabels[project.status]}
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[project.priority]}`}
            >
              {priorityLabels[project.priority]} Priority
            </span>
            {project.isArchived && <Badge variant="secondary">Archived</Badge>}
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{project.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {categoryName && <span>{categoryName}</span>}
            {project.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {isOwner && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link to={`/projects/${project.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>

            <Select
              value={project.status}
              onValueChange={(value) => changeStatus.mutate(value as ProjectStatus)}
            >
              <SelectTrigger className="w-40" aria-label="Update status">
                Update Status
              </SelectTrigger>
              <SelectContent>
                {statusValues.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setArchived.mutate(!project.isArchived)}>
              {project.isArchived ? (
                <>
                  <ArchiveRestore className="size-4" />
                  Unarchive
                </>
              ) : (
                <>
                  <Archive className="size-4" />
                  Archive
                </>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={deleteProject.isPending}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{project.title}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes its checklist, links, comments, and history. This
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => deleteProject.mutate()}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {statusError && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>
            {statusError.message}
            {allowed && allowed.length > 0 && (
              <> — allowed: {allowed.map((s) => statusLabels[s]).join(', ')}</>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
