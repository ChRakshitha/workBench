import { Bell, HelpCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="ml-auto flex items-center gap-4 text-muted-foreground">
        <Bell className="size-5" />
        <HelpCircle className="size-5" />
        <div className="size-8 rounded-full bg-secondary" />
      </div>
    </header>
  );
}
