import { useParams } from 'react-router';
import { ProjectForm } from '@/features/projects/ProjectForm';
import { useProject, useUpdateProject } from '@/features/projects/hooks';
import { toProjectApiPayload, type ProjectFormValues } from '@/features/projects/formSchema';
import { Skeleton } from '@/components/ui/skeleton';

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useProject(id ?? '');
  const updateProject = useUpdateProject(id ?? '');

  function handleSubmit(values: ProjectFormValues) {
    updateProject.mutate(toProjectApiPayload(values));
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return <p className="text-sm text-muted-foreground">Couldn't load this project.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Edit Project</h2>
        <p className="mt-1 text-sm text-muted-foreground">Update {project.title}.</p>
      </div>

      <ProjectForm
        mode="edit"
        project={project}
        onSubmit={handleSubmit}
        isSubmitting={updateProject.isPending}
        submitLabel="Save Changes"
      />

      {updateProject.isError && (
        <p className="mt-3 text-sm text-destructive">Something went wrong saving changes.</p>
      )}
    </div>
  );
}
