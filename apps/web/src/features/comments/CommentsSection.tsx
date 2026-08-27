import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useComments, useCreateComment, useDeleteComment } from './hooks';

interface CommentsSectionProps {
  projectId: string;
  isOwner: boolean;
}

export function CommentsSection({ projectId, isOwner }: CommentsSectionProps) {
  const { data: comments } = useComments(projectId);
  const createComment = useCreateComment(projectId);
  const deleteComment = useDeleteComment(projectId);

  const [content, setContent] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    createComment.mutate(
      { content: content.trim() },
      { onSuccess: () => setContent('') },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments ({comments?.length ?? 0})</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {(comments ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          )}
          {comments?.map((comment) => (
            <div key={comment.id} className="rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-foreground">{comment.content}</p>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteComment.mutate(comment.id)}
                    aria-label="Delete comment"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-border pt-4">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add your thoughts..."
            rows={3}
          />
          <Button type="submit" disabled={createComment.isPending} className="mt-2 self-end">
            Post Comment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
