import { Navigate, Outlet } from 'react-router';
import { useMe } from '@/features/auth/hooks';
import { Skeleton } from '@/components/ui/skeleton';

export function RequireOwner() {
  const { data: viewer, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!viewer?.isOwner) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
