import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChecklistItem } from '@/features/projects/types';
import { useCreateChecklistItem, useDeleteChecklistItem, useUpdateChecklistItem } from './hooks';

interface ChecklistSectionProps {
  projectId: string;
  items: ChecklistItem[];
  isOwner: boolean;
}

export function ChecklistSection({ projectId, items, isOwner }: ChecklistSectionProps) {
  const [newTitle, setNewTitle] = useState('');
  const createItem = useCreateChecklistItem(projectId);
  const updateItem = useUpdateChecklistItem(projectId);
  const deleteItem = useDeleteChecklistItem(projectId);

  const completed = items.filter((item) => item.isCompleted).length;

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    createItem.mutate({ title }, { onSuccess: () => setNewTitle('') });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Checklist ({completed}/{items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No checklist items yet.</p>
        )}

        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox
              checked={item.isCompleted}
              disabled={!isOwner}
              onCheckedChange={(checked) =>
                updateItem.mutate({ itemId: item.id, input: { isCompleted: Boolean(checked) } })
              }
            />
            <span
              className={cn(
                'flex-1 text-sm text-foreground',
                item.isCompleted && 'text-muted-foreground line-through',
              )}
            >
              {item.title}
            </span>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteItem.mutate(item.id)}
                aria-label="Delete checklist item"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        ))}

        {isOwner && (
          <form onSubmit={handleAdd} className="mt-2 flex gap-2">
            <Input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Add a checklist item..."
            />
            <Button type="submit" size="sm" disabled={createItem.isPending}>
              Add
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
