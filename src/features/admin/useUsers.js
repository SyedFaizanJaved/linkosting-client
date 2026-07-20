import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

// Admin-only. The server 404s non-admins, so this is never enabled for members.
export function useUsers(enabled) {
  return useQuery({ queryKey: qk.users, queryFn: () => api('/api/admin/users'), enabled });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => api(`/api/admin/users/${id}/status`, { method: 'PUT', body: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users }),
  });
}
