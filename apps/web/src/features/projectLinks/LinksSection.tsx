import { useState, type FormEvent } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ProjectLink } from '@/features/projects/types';
import { useCreateProjectLink, useDeleteProjectLink } from './hooks';

interface LinksSectionProps {
  projectId: string;
  links: ProjectLink[];
  isOwner: boolean;
}

export function LinksSection({ projectId, links, isOwner }: LinksSectionProps) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const createLink = useCreateProjectLink(projectId);
  const deleteLink = useDeleteProjectLink(projectId);

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!label.trim() || !url.trim()) return;
    createLink.mutate(
      { label: label.trim(), url: url.trim() },
      {
        onSuccess: () => {
          setLabel('');
          setUrl('');
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {links.length === 0 && <p className="text-sm text-muted-foreground">No links yet.</p>}

        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-2">
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center gap-1.5 text-sm text-foreground hover:underline"
            >
              <ExternalLink className="size-3.5 text-muted-foreground" />
              <span className="font-medium">{link.label}</span>
              <span className="truncate text-muted-foreground">{link.url}</span>
            </a>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteLink.mutate(link.id)}
                aria-label="Delete link"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        ))}

        {isOwner && (
          <form onSubmit={handleAdd} className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Label (e.g. Repository)"
              className="sm:w-40"
            />
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
            />
            <Button type="submit" size="sm" disabled={createLink.isPending}>
              Add
            </Button>
          </form>
        )}
        {createLink.isError && (
          <p className="text-xs text-destructive">Couldn't add link — check the URL is valid.</p>
        )}
      </CardContent>
    </Card>
  );
}
