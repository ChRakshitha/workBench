import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useProjects } from '@/features/projects/hooks';
import { useCategories } from '@/features/categories/hooks';
import { FiltersSheet, type ProjectFilters } from '@/features/projects/FiltersSheet';
import { SortableHeader } from '@/features/projects/SortableHeader';
import {
  priorityLabels,
  priorityStyles,
  statusLabels,
  statusStyles,
} from '@/features/projects/statusStyles';
import { formatAge, formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const PAGE_SIZE = 10;

type SortableField = 'startDate' | 'targetDate' | 'priority' | 'createdAt' | 'progress';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(search);
  const status = searchParams.get('status') ?? '';
  const priority = searchParams.get('priority') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'updatedAt';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  // Keep the input in sync when the URL changes from elsewhere (back/forward,
  // clearing filters), then debounce edits back out to the URL.
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput === search) return;
      const next = new URLSearchParams(searchParams);
      if (searchInput) next.set('search', searchInput);
      else next.delete('search');
      next.delete('page');
      setSearchParams(next);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data: categories } = useCategories();
  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category.name])),
    [categories],
  );

  const { data, isLoading, isError } = useProjects({
    search: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
    categoryId: categoryId || undefined,
    sortBy,
    sortOrder,
    page,
    pageSize: PAGE_SIZE,
  });

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  }

  function applyFilters(filters: ProjectFilters) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(filters)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete('page');
    setSearchParams(next);
  }

  function handleSort(field: SortableField, defaultOrder: 'asc' | 'desc') {
    const next = new URLSearchParams(searchParams);
    if (sortBy === field) {
      next.set('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      next.set('sortBy', field);
      next.set('sortOrder', defaultOrder);
    }
    next.delete('page');
    setSearchParams(next);
  }

  // "Age" is displayed as the inverse of createdAt: newest project = smallest
  // age, so age-ascending means createdAt-descending under the hood.
  const ageDisplayOrder: 'asc' | 'desc' =
    sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';

  function handleAgeSort() {
    const next = new URLSearchParams(searchParams);
    if (sortBy === 'createdAt') {
      next.set('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      next.set('sortBy', 'createdAt');
      next.set('sortOrder', 'desc');
    }
    next.delete('page');
    setSearchParams(next);
  }

  const activeFilterCount = [status, priority, categoryId].filter(Boolean).length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track all active initiatives.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search projects..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="size-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        status={status}
        priority={priority}
        categoryId={categoryId}
        categories={categories ?? []}
        onApply={applyFilters}
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <SortableHeader
                  label="Priority"
                  active={sortBy === 'priority'}
                  order={sortOrder}
                  onClick={() => handleSort('priority', 'desc')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Start Date"
                  active={sortBy === 'startDate'}
                  order={sortOrder}
                  onClick={() => handleSort('startDate', 'asc')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Target Date"
                  active={sortBy === 'targetDate'}
                  order={sortOrder}
                  onClick={() => handleSort('targetDate', 'asc')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Age"
                  active={sortBy === 'createdAt'}
                  order={ageDisplayOrder}
                  onClick={handleAgeSort}
                />
              </TableHead>
              <TableHead className='text-center'>
                <SortableHeader
                  label="Progress"
                  active={sortBy === 'progress'}
                  order={sortOrder}
                  onClick={() => handleSort('progress', 'desc')}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Couldn't load projects. Is the API running?
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No projects match these filters.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              data?.data.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <TableCell>
                    <div className="font-medium text-foreground">{project.title}</div>
                    {/* {project.description && (
                      <div className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                        {project.description}
                      </div>
                    )} */}
                  </TableCell>
                  <TableCell>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                      {project.categoryId && categoryNameById.get(project.categoryId) && (
                        <Badge variant="secondary">
                          {categoryNameById.get(project.categoryId)}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
                    >
                      {statusLabels[project.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[project.priority]}`}
                    >
                      {priorityLabels[project.priority]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(project.startDate)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(project.targetDate)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatAge(project.createdAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-muted-foreground">{project.progress} %</span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {data && data.pagination.total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(data.pagination.page - 1) * data.pagination.pageSize + 1}–
            {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of{' '}
            {data.pagination.total} projects
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
