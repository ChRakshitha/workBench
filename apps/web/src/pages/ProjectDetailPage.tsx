import { useParams } from 'react-router';
import { useProject } from '@/features/projects/hooks';
import { useCategories } from '@/features/categories/hooks';
import { useMe } from '@/features/auth/hooks';
import { ProjectHeader } from '@/features/projects/ProjectHeader';
import { ChecklistSection } from '@/features/checklistItems/ChecklistSection';
import { LinksSection } from '@/features/projectLinks/LinksSection';
import { CommentsSection } from '@/features/comments/CommentsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useProject(id ?? '');
  const { data: categories } = useCategories();
  const { data: viewer } = useMe();
  const isOwner = viewer?.isOwner ?? false;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !project) {
    return <p className="text-sm text-muted-foreground">Couldn't load this project.</p>;
  }

  const categoryName = categories?.find((category) => category.id === project.categoryId)?.name;

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0">
      <ProjectHeader project={project} categoryName={categoryName} />

      <div className="grid grid-cols-1 gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {project.description ? (
                <p className="text-sm text-foreground">{project.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No description yet.</p>
              )}
            </CardContent>
          </Card>

          <ChecklistSection
            projectId={project.id}
            items={project.checklistItems}
            isOwner={isOwner}
          />
          <CommentsSection projectId={project.id} isOwner={isOwner} />
        </div>

        <div className="flex flex-col gap-6 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className='flex justify-between'>
                  <p className="text-muted-foreground">Progress</p>
                  <span className="text-sm text-foreground">{project.progress} %</span>
                </div>
                <div className='flex justify-between'>
                  <p className="text-muted-foreground">Visibility</p>
                  <p className="mt-1 text-foreground">
                    {project.isPublic ? 'Public' : 'Private'}
                  </p>
                </div>
                <div className='flex justify-between'>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="mt-1 text-foreground">{formatDate(project.startDate)}</p>
                </div>
                <div className='flex justify-between'>
                  <p className="text-muted-foreground">Target Date</p>
                  <p className="mt-1 text-foreground">{formatDate(project.targetDate)}</p>
                </div>
                <div className='flex justify-between'>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="mt-1 text-foreground">{formatDate(project.endDate)}</p>
                </div>
                <div className='flex justify-between'>
                  <p className="text-muted-foreground">Created</p>
                  <p className="mt-1 text-foreground">{formatDate(project.createdAt)}</p>
                </div>
                <div className='flex justify-between items-center'>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="mt-1 text-foreground">{formatDate(project.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <LinksSection projectId={project.id} links={project.links} isOwner={isOwner} />
        </div>
      </div>
    </div>
  );
}
