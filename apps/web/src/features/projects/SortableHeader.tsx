import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  active: boolean;
  order: 'asc' | 'desc';
  onClick: () => void;
}

export function SortableHeader({ label, active, order, onClick }: SortableHeaderProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 font-medium text-foreground hover:text-foreground/70"
    >
      {label}
      {active ? (
        order === 'asc' ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <ArrowUpDown className="size-3.5 text-muted-foreground" />
      )}
    </button>
  );
}
