import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { fetchMe, login, logout } from './api';

export function useMe() {
  return useQuery({
    queryKey: ['viewer'],
    queryFn: fetchMe,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewer'] });
      navigate('/dashboard');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewer'] });
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
      navigate('/projects');
    },
  });
}
