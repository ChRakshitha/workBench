import { useState, type FormEvent } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory } from '@/features/categories/hooks';
import { useCreateTag, useTags, useUpdateTag } from '@/features/tags/hooks';
import { EntityList } from '@/components/EntityList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function OrganizePage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Categories & Tags</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize how projects are grouped and filtered.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CategoriesCard />
        <TagsCard />
      </div>
    </div>
  );
}

function CategoriesCard() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const [name, setName] = useState('');

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createCategory.mutate(trimmed, { onSuccess: () => setName('') });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="mb-4 flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New category name"
          />
          <Button type="submit" disabled={createCategory.isPending}>
            Add
          </Button>
        </form>
        {createCategory.isError && (
          <p className="mb-2 text-xs text-destructive">That name might already be in use.</p>
        )}

        {isLoading && <Skeleton className="h-24 w-full" />}
        {!isLoading && (categories ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        )}
        {!isLoading && categories && categories.length > 0 && (
          <EntityList
            items={categories}
            onRename={(id, newName) => updateCategory.mutate({ id, name: newName })}
            isRenaming={updateCategory.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}

function TagsCard() {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const [name, setName] = useState('');

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createTag.mutate(trimmed, { onSuccess: () => setName('') });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="mb-4 flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New tag name"
          />
          <Button type="submit" disabled={createTag.isPending}>
            Add
          </Button>
        </form>
        {createTag.isError && (
          <p className="mb-2 text-xs text-destructive">That name might already be in use.</p>
        )}

        {isLoading && <Skeleton className="h-24 w-full" />}
        {!isLoading && (tags ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No tags yet.</p>
        )}
        {!isLoading && tags && tags.length > 0 && (
          <EntityList
            items={tags}
            onRename={(id, newName) => updateTag.mutate({ id, name: newName })}
            isRenaming={updateTag.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}
