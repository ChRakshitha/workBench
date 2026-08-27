import { useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NamedEntity {
  id: string;
  name: string;
}

interface EntityListProps {
  items: NamedEntity[];
  onRename: (id: string, name: string) => void;
  isRenaming: boolean;
}

export function EntityList({ items, onRename, isRenaming }: EntityListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  function startEdit(item: NamedEntity) {
    setEditingId(item.id);
    setDraftName(item.name);
  }

  function save(id: string) {
    const trimmed = draftName.trim();
    if (trimmed) onRename(id, trimmed);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-2.5">
          {editingId === item.id ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                autoFocus
                className="h-8"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') save(item.id);
                  if (event.key === 'Escape') setEditingId(null);
                }}
              />
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => save(item.id)}
                disabled={isRenaming}
                aria-label="Save"
              >
                <Check className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setEditingId(null)}
                aria-label="Cancel"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <>
              <span className="text-sm text-foreground">{item.name}</span>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => startEdit(item)}
                aria-label={`Rename ${item.name}`}
              >
                <Pencil className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
