import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';

// Whether we have a valid session. Drives the route Guard; the httpOnly cookie
// itself is invisible to JS, so this is the only way to know we're signed in.
export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => api('/api/auth/me'), retry: false, staleTime: 60_000 });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: creds => api('/api/auth/login', { method: 'POST', body: creds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: creds => api('/api/auth/register', { method: 'POST', body: creds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return async () => {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* clear locally regardless */ }
    qc.clear();
    window.location.href = '/login';
  };
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
