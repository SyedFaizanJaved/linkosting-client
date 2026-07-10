import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export function useSettings() {
  return useQuery({ queryKey: qk.settings, queryFn: () => api('/api/settings'), enabled: !!localStorage.getItem('token') });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: body => api('/api/settings', { method: 'PUT', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.settings }),
  });
}
