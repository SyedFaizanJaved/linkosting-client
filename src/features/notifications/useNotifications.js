import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export function useNotifications() {
  return useQuery({ queryKey: qk.notifications, queryFn: () => api('/api/notifications'), refetchInterval: 60_000, enabled: !!localStorage.getItem('token') });
}
