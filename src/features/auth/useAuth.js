import { useMutation, useQuery } from '@tanstack/react-query';
import { api, setToken } from '../../lib/api.js';

export function useLogin() {
  return useMutation({
    mutationFn: creds => api('/api/auth/login', { method: 'POST', body: creds }),
    onSuccess: ({ token }) => setToken(token),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: creds => api('/api/auth/register', { method: 'POST', body: creds }),
    onSuccess: ({ token }) => setToken(token),
  });
}

export function useAuthStatus() {
  return useQuery({ queryKey: ['authStatus'], queryFn: () => api('/api/auth/status') });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: body => api('/api/auth/forgot', { method: 'POST', body }) });
}

export function useResetPassword() {
  return useMutation({ mutationFn: body => api('/api/auth/reset', { method: 'POST', body }) });
}
