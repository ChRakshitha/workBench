import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  changeProjectStatus,
  createProject,
  deleteProject,
  fetchProject,
  fetchProjects,
  setProjectArchived,
  updateProject,
  type ProjectFormPayload,
  type ProjectListParams,
} from './api';
import type { ProjectStatus } from './types';

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => fetchProjects(params),
    placeholderData: (previous) => previous,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => fetchProject(id),
    enabled: Boolean(id),
  });
}

export function useChangeProjectStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: ProjectStatus) => changeProjectStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
    },
  });
}

export function useSetProjectArchived(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isArchived: boolean) => setProjectArchived(id, isArchived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (input: ProjectFormPayload) => createProject(input),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
      navigate(`/projects/${project.id}`, { replace: true });
    },
  });
}

export function useDeleteProject(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
      navigate('/projects', { replace: true });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (input: Partial<ProjectFormPayload>) => updateProject(id, input),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
      navigate(`/projects/${project.id}`, { replace: true });
    },
  });
}
