import { ProjectForm } from '@/features/projects/ProjectForm';
import { useCreateProject } from '@/features/projects/hooks';
import { toProjectApiPayload, type ProjectFormValues } from '@/features/projects/formSchema';

export function CreateProjectPage() {
  const createProject = useCreateProject();

  function handleSubmit(values: ProjectFormValues) {
    createProject.mutate(toProjectApiPayload(values));
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">New Project</h2>
        <p className="mt-1 text-sm text-muted-foreground">Start tracking something new.</p>
      </div>

      <ProjectForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createProject.isPending}
        submitLabel="Create Project"
      />

      {createProject.isError && (
        <p className="mt-3 text-sm text-destructive">Something went wrong creating the project.</p>
      )}
    </div>
  );
}
