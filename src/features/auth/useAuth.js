import { useMutation } from '@tanstack/react-query';
import { api, setToken } from '../../lib/api.js';

export function useLogin() {
  return useMutation({
    mutationFn: creds => api('/api/auth/login', { method: 'POST', body: creds }),
    onSuccess: ({ token }) => setToken(token),
  });
}
