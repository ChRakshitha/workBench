import { useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { Calendar, Flag, FolderTree, Globe, Lock, Plus, Tag as TagIcon, X } from 'lucide-react';
import { useCategories, useCreateCategory } from '@/features/categories/hooks';
import type { Category } from '@/features/categories/types';
import { useCreateTag, useTags } from '@/features/tags/hooks';
import { priorityLabels, priorityValues } from './statusStyles';
import { projectFormSchema, type ProjectFormValues } from './formSchema';
import type { ProjectDetail } from './types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ProjectFormProps =
  | {
      mode: 'create';
      project?: undefined;
      onSubmit: (values: ProjectFormValues) => void;
      isSubmitting: boolean;
      submitLabel: string;
    }
  | {
      mode: 'edit';
      project: ProjectDetail;
      onSubmit: (values: ProjectFormValues) => void;
      isSubmitting: boolean;
      submitLabel: string;
    };

function toDefaults(project: ProjectDetail | undefined): ProjectFormValues {
  return {
    title: project?.title ?? '',
    description: project?.description ?? '',
    priority: project?.priority ?? 'medium',
    categoryId: project?.categoryId ?? 'none',
    tagIds: project?.tags.map((tag) => tag.id) ?? [],
    isPublic: project?.isPublic ?? true,
    targetDate: project?.targetDate ?? '',
  };
}

function FieldRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

export function ProjectForm({ project, onSubmit, isSubmitting, submitLabel }: ProjectFormProps) {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const createCategory = useCreateCategory();
  const [newTagName, setNewTagName] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [pendingCategories, setPendingCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: toDefaults(project),
  });

  const selectedTagIds = watch('tagIds') ?? [];
  const isPublic = watch('isPublic');
  const categoryOptions = [
    ...(categories ?? []),
    ...pendingCategories.filter((pending) => !(categories ?? []).some((c) => c.id === pending.id)),
  ];

  function toggleTag(tagId: string) {
    const next = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    setValue('tagIds', next, { shouldDirty: true });
  }

  function handleCreateTag() {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    createTag.mutate(trimmed, {
      onSuccess: (tag) => {
        setValue('tagIds', [...selectedTagIds, tag.id], { shouldDirty: true });
        setNewTagName('');
        setIsAddingTag(false);
      },
    });
  }

  function handleCreateCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    createCategory.mutate(trimmed, {
      onSuccess: (category) => {
        setPendingCategories((prev) => [...prev, category]);
        setValue('categoryId', category.id, { shouldDirty: true });
        setNewCategoryName('');
        setIsAddingCategory(false);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FieldRow icon={<Flag className="size-3.5" />} label="Priority">
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityValues.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priorityLabels[priority]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldRow>

            <FieldRow icon={<FolderTree className="size-3.5" />} label="Category">
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (!value) return;
                      if (value === '__new__') {
                        setIsAddingCategory(true);
                        return;
                      }
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__new__">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Plus className="size-3.5" />
                          Add new category
                        </span>
                      </SelectItem>
                      <SelectItem value="none">No category</SelectItem>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {isAddingCategory && (
                <div className="mt-1 flex gap-2">
                  <Input
                    autoFocus
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleCreateCategory();
                      }
                      if (event.key === 'Escape') {
                        setIsAddingCategory(false);
                        setNewCategoryName('');
                      }
                    }}
                    placeholder="New category name"
                    className="h-8"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={createCategory.isPending}
                    onClick={handleCreateCategory}
                    aria-label="Add category"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              )}
            </FieldRow>

            <FieldRow icon={<TagIcon className="size-3.5" />} label="Tags">
              <DropdownMenu
                onOpenChange={(open) => {
                  if (!open) {
                    setIsAddingTag(false);
                    setNewTagName('');
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start">
                    {selectedTagIds.length > 0
                      ? `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? 's' : ''} selected`
                      : 'Select tags'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
                  {!isAddingTag ? (
                    <>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault();
                          setIsAddingTag(true);
                        }}
                      >
                        <Plus className="size-3.5" />
                        Add new tag
                      </DropdownMenuItem>
                      {(tags ?? []).length > 0 && <DropdownMenuSeparator />}
                      {(tags ?? []).map((tag) => (
                        <DropdownMenuCheckboxItem
                          key={tag.id}
                          checked={selectedTagIds.includes(tag.id)}
                          onSelect={(event) => event.preventDefault()}
                          onCheckedChange={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 p-1">
                      <Input
                        autoFocus
                        value={newTagName}
                        onChange={(event) => setNewTagName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleCreateTag();
                          }
                          if (event.key === 'Escape') {
                            setIsAddingTag(false);
                            setNewTagName('');
                          }
                        }}
                        placeholder="New tag name"
                        className="h-8"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={createTag.isPending}
                        onClick={handleCreateTag}
                        aria-label="Add tag"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedTagIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(tags ?? [])
                    .filter((tag) => selectedTagIds.includes(tag.id))
                    .map((tag) => (
                      <Badge key={tag.id} variant="default" className="gap-1 pr-1">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          aria-label={`Remove ${tag.name}`}
                          className="rounded-full p-0.5 hover:bg-primary-foreground/20"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              )}
            </FieldRow>

            <Separator />

            <FieldRow icon={<Calendar className="size-3.5" />} label="Target Date">
              <Input type="date" {...register('targetDate')} />
            </FieldRow>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                {isPublic ? (
                  <Globe className="size-3.5 text-muted-foreground" />
                ) : (
                  <Lock className="size-3.5 text-muted-foreground" />
                )}
                {isPublic ? 'Public' : 'Private'}
              </div>
              <Controller
                control={control}
                name="isPublic"
                render={({ field }) => (
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input {...register('title')} placeholder="Give this project a name" />
                {errors.title && (
                  <p className="text-xs text-destructive">{String(errors.title.message)}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  {...register('description')}
                  rows={8}
                  placeholder="What is this project about?"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" asChild>
          <Link to="/projects">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
