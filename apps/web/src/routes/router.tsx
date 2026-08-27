import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { RequireOwner } from '@/components/layout/RequireOwner';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { CreateProjectPage } from '@/pages/CreateProjectPage';
import { EditProjectPage } from '@/pages/EditProjectPage';
import { OrganizePage } from '@/pages/OrganizePage';
import { LoginPage } from '@/pages/LoginPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      {
        element: <RequireOwner />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'projects/new', element: <CreateProjectPage /> },
          { path: 'projects/:id/edit', element: <EditProjectPage /> },
          { path: 'categories', element: <OrganizePage /> },
        ],
      },
      { path: 'tags', element: <Navigate to="/categories" replace /> },
    ],
  },
]);
