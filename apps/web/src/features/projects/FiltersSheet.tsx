import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { priorityLabels, priorityValues, statusLabels, statusValues } from './statusStyles';
import type { Category } from '@/features/categories/types';

export interface ProjectFilters {
  status: string;
  priority: string;
  categoryId: string;
}

interface FiltersSheetProps extends ProjectFilters {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onApply: (filters: ProjectFilters) => void;
}

export function FiltersSheet({
  open,
  onOpenChange,
  status,
  priority,
  categoryId,
  categories,
  onApply,
}: FiltersSheetProps) {
  const [draft, setDraft] = useState<ProjectFilters>({ status, priority, categoryId });

  useEffect(() => {
    if (open) setDraft({ status, priority, categoryId });
  }, [open, status, priority, categoryId]);

  function clearAll() {
    const cleared = { status: '', priority: '', categoryId: '' };
    setDraft(cleared);
    onApply(cleared);
    onOpenChange(false);
  }

  function apply() {
    onApply(draft);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="flex-row items-center space-y-0">
          <SheetTitle>Filters</SheetTitle>
          <Button variant="ghost" size="xs" onClick={clearAll}>
            Clear all
          </Button>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select
              value={draft.status || 'all'}
              onValueChange={(v) => setDraft((d) => ({ ...d, status: v === 'all' ? '' : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusValues.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Priority</label>
            <Select
              value={draft.priority || 'all'}
              onValueChange={(v) => setDraft((d) => ({ ...d, priority: v === 'all' ? '' : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {priorityValues.map((p) => (
                  <SelectItem key={p} value={p}>
                    {priorityLabels[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Category</label>
            <Select
              value={draft.categoryId || 'all'}
              onValueChange={(v) => setDraft((d) => ({ ...d, categoryId: v === 'all' ? '' : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={apply} className="w-full">
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
