import { Link } from 'react-router';
import { useDashboardSummary } from '@/features/dashboard/hooks';
import { useCategories } from '@/features/categories/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  priorityLabels,
  priorityStyles,
  statusLabels,
  statusStyles,
} from '@/features/projects/statusStyles';
import { formatDate } from '@/lib/format';

const statTiles = [
  { key: 'total', label: 'Total Projects' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'overdue', label: 'Overdue' },
] as const;

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboardSummary();
  const { data: categories } = useCategories();

  const categoryNameById = new Map(
    (categories ?? []).map((category) => [category.id, category.name]),
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-muted-foreground">Couldn't load the dashboard.</p>;
  }

  const stats: Record<(typeof statTiles)[number]['key'], number> = {
    total: data.total,
    in_progress: data.byStatus.in_progress ?? 0,
    completed: data.byStatus.completed ?? 0,
    blocked: data.byStatus.blocked ?? 0,
    dropped: data.byStatus.dropped ?? 0,
    overdue: data.overdueCount,
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of everything you're tracking.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statTiles.map(({ key, label }) => (
          <Card key={key} className="py-4">
            <CardContent className="px-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{stats[key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Current Work</CardTitle>
            <Link to="/projects" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.currentWork.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing actively in progress right now.
              </p>
            )}
            {data.currentWork.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex flex-col gap-2 rounded-md border border-border p-3 hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {project.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
                      >
                        {statusLabels[project.status]}
                      </span>
                      {project.categoryId && categoryNameById.get(project.categoryId) && (
                        <span className="text-xs text-muted-foreground">
                          {categoryNameById.get(project.categoryId)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(project.targetDate)}
                    </span>
                    <span className="text-sm font-medium tabular-nums text-foreground">
                      {project.progress}%
                    </span>
                  </div>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.upcomingDeadlines.length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              )}
              {data.upcomingDeadlines.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border p-3 hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {project.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDate(project.targetDate)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[project.priority]}`}
                  >
                    {priorityLabels[project.priority]}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overdue</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.overdueProjects.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing overdue.</p>
              )}
              {data.overdueProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 hover:bg-destructive/10"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {project.title}
                    </p>
                    <p className="text-xs text-destructive">
                      Was due {formatDate(project.targetDate)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[project.priority]}`}
                  >
                    {priorityLabels[project.priority]}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
