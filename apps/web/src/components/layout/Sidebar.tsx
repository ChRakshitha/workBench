import { SidebarContent } from './SidebarContent';

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex">
      <SidebarContent />
    </aside>
  );
}
