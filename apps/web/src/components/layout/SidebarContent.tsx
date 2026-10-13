import { NavLink } from 'react-router';
import {
  FolderKanban,
  FolderTree,
  LayoutDashboard,
  LogIn,
  LogOut,
  Plus,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMe, useLogout } from '@/features/auth/hooks';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/categories', label: 'Categories & Tags', icon: FolderTree },
];

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { data: viewer } = useMe();
  const logout = useLogout();
  const isOwner = viewer?.isOwner ?? false;

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <div className="mb-6 px-2">
        <h1 className="text-lg font-semibold text-foreground">Project Workbench</h1>
        <p className="text-xs text-muted-foreground">
          {isOwner ? 'Management System' : 'Public View'}
        </p>
      </div>

      {isOwner && (
        <Button asChild className="mb-6 w-full">
          <NavLink to="/projects/new" onClick={onNavigate}>
            <Plus className="size-4" />
            New Project
          </NavLink>
        </Button>
      )}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {navItems
          .filter(({ to }) => isOwner || to === '/projects')
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
        {isOwner && (
          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground opacity-50"
          >
            <Settings className="size-4" />
            Settings
          </button>
        )}
        {isOwner ? (
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              logout.mutate();
            }}
            disabled={logout.isPending}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        ) : (
          <NavLink
            to="/login"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogIn className="size-4" />
            Log In
          </NavLink>
        )}
      </div>
    </div>
  );
}
